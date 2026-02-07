import io
import logging
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import numpy as np
import torch
from PIL import Image
from fastapi import HTTPException
from ultralytics import YOLO

from config import MGT_MODELS_DIR
from database import mongo_db

device = "cuda" if torch.cuda.is_available() else "cpu"
device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu"
logger = logging.getLogger(__name__)
# Cache for loaded models to avoid reloading
MODEL_CACHE: Dict[str, YOLO] = {}

async def get_available_models() -> Dict[str, str]:
    """
    Fetch available models from MongoDB

    Returns:
        Dictionary mapping model IDs to their .pt file paths
        Example: {"mgt-yolo-11-n": "models/mgt-yolo-11-n.pt"}
    """
    models_collection = mongo_db["models"]

    models_cursor = models_collection.find({})
    models = await models_cursor.to_list(length=None)

    available_models = {}

    for model in models:
        model_id = model.get("_id")
        if model_id:
            model_path = MGT_MODELS_DIR / f"{model_id}.pt"
            available_models[model_id] = str(model_path)

    return available_models

async def get_model(model_id:str) -> YOLO:
    """
    Load and cache YOLO model based on model_id

    Args:
        model_id: Identifier for the model (e.g., 'mgt-yolo-11-n')

    Returns:
        Loaded YOLO model

    Raises:
        HTTPException: If model_id is invalid or model file doesn't exist
    """
    # Get available models from MongoDB
    available_models = await get_available_models()

    if model_id not in available_models:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model ID. Available models: {list(available_models.keys())}"
        )

    # Check if model is already cached
    if model_id in MODEL_CACHE:
        logger.info(f"Using cached model: {model_id}")
        return MODEL_CACHE[model_id]

    # Load new model
    model_path = available_models[model_id]

    if not Path(model_path).exists():
        raise HTTPException(
            status_code=404,
            detail=f"Model file not found: {model_path}. Please ensure the .pt file exists in {MGT_MODELS_DIR}"
        )

    logger.info(f"Loading model: {model_id} from {model_path}")
    model = YOLO(model_path)
    model.to(device)

    # Cache the model
    MODEL_CACHE[model_id] = model

    return model


def preprocess_thermal_image(image_bytes: bytes) -> Tuple[np.ndarray, str, tuple]:
    """
    Preprocess thermal (grayscale) image for YOLO inference

    Args:
        image_bytes: Raw image bytes

    Returns:
        Tuple of (processed_image_array, original_format, original_size)
    """
    # Load image
    pil_image = Image.open(io.BytesIO(image_bytes))
    original_format = pil_image.format if pil_image.format else 'PNG'
    original_size = pil_image.size

    # Convert to numpy array
    image_array = np.array(pil_image)

    # Handle different grayscale formats
    if len(image_array.shape) == 2:
        # Single channel grayscale - convert to 3 channels for YOLO
        # YOLO expects 3 channels (RGB), so we duplicate the grayscale channel
        image_array = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
    elif image_array.shape[2] == 4:
        # RGBA - convert to RGB
        image_array = cv2.cvtColor(image_array, cv2.COLOR_RGBA2RGB)

    return image_array, original_format, original_size


async def process_images_batch_with_yolo(
        image_data_list: List[Tuple[str, bytes]],
        model_id: str,
        confidence_threshold: float = 0.25,
        batch_size: int = 16,
) -> Dict[str, bytes]:
    """
    Process multiple images in batches with YOLO model

    Args:
        image_data_list: List of tuples (filename, image_bytes)
        model_id: Which model to use
        confidence_threshold: Minimum confidence for detections
        batch_size: Number of images to process at once

    Returns:
        Dictionary mapping filenames to processed image bytes
    """
    yolo_model = await get_model(model_id)
    processed_images = {}

    for i in range(0, len(image_data_list), batch_size):
        batch = image_data_list[i:i + batch_size]

        batch_images = []
        batch_filenames = []
        batch_formats = []

        for filename, image_bytes in batch:
            try:
                # Convert bytes to PIL Image
                image_array, original_format, original_size = preprocess_thermal_image(image_bytes)

                batch_images.append(image_array)
                batch_filenames.append(filename)
                batch_formats.append(original_format if original_format else 'PNG')
            except Exception as e:
                logger.error(f"Error loading image {filename}: {e}")
                # Keep original on error
                processed_images[filename] = image_bytes

        if not batch_images:
            continue

        logger.info(f"Processing batch of {len(batch_images)} images with {model_id}")
        results = yolo_model(batch_images, conf=confidence_threshold, verbose=False)

        # Process results
        for idx, result in enumerate(results):
            filename = batch_filenames[idx]
            image_format = batch_formats[idx]

            try:
                # Get annotated image
                annotated_image = result.plot()

                # Convert to bytes
                annotated_pil = Image.fromarray(annotated_image)
                output_buffer = io.BytesIO()
                annotated_pil.save(output_buffer, format=image_format)

                processed_images[filename] = output_buffer.getvalue()

                # Print detection info
                num_detections = len(result.boxes)
                logger.info(f"✓ {filename}: {num_detections} detections")

            except Exception as e:
                logger.info(f"✗ Error processing result for {filename}: {e}")
                # Keep original on error
                processed_images[filename] = batch[idx][1]

    return processed_images