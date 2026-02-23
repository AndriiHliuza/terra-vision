import io
import logging
import time
import numpy as np
import torch

from logging import Logger
from pathlib import Path
from PIL import Image
from fastapi import HTTPException
from ultralytics import YOLO
from config import MGT_MODELS_DIR
from repository import CV_MODEL_REPOSITORY
from schemas import CVDataProcessingStats, CVClassStats, CVImageStats, CVDetectionBox

from service import image_processing_service as ips

class YOLOService:
    def __init__(self):
        self.__pytorch_device: str = "cuda" if torch.cuda.is_available() else "cpu"
        self.__pytorch_device_name: str = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu"
        self.__logger: Logger = logging.getLogger(__name__)
        self.__cached_models: dict[str, YOLO] = {}

        self.__batch_stats = CVDataProcessingStats()

        self.__cv_model_repository = CV_MODEL_REPOSITORY
        self.__mgt_model_dir = MGT_MODELS_DIR

    def get_pytorch_device(self) -> str:
        return self.__pytorch_device

    def get_pytorch_device_name(self) -> str:
        return self.__pytorch_device_name

    def get_cached_models(self) -> dict[str, YOLO]:
        return self.__cached_models

    async def get_model(self, model_id: str) -> YOLO:
        available_models = await self.get_available_models()
        if model_id not in available_models:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid entity ID. Available entity: {list(available_models.keys())}"
            )
        return await self.__load_model_or_cache(model_id)

    async def get_available_models(self) -> dict[str, str]:
        """
        Fetch available entity from MongoDB
        Returns:
            Dictionary mapping entity IDs to their .pt file paths
            Example: {"mgt-yolo-11-n": "path/to/entity/mgt-yolo11-n.pt"}
        """
        models = await self.__cv_model_repository.get_cv_models()
        available_models: dict[str, str] = {}
        for model in models:
            model_id = model.get("_id")
            if model_id:
                model_path = self.__mgt_model_dir / f"{model_id}.pt"
                available_models[model_id] = str(model_path)
        return available_models


    async def __load_model_or_cache(self, model_id: str) -> YOLO:
        available_models = await self.get_available_models()

        if model_id in self.__cached_models: # Check if entity is already cached
            self.__logger.info(f"Using cached entity: {model_id}")
            return self.__cached_models[model_id]

        # Load new entity if entity is not in cache
        model_path = available_models[model_id]

        if not Path(model_path).exists():
            exception_details = f"Model file not found: {model_path}. Please ensure the .pt file exists in {self.__mgt_model_dir}"
            raise HTTPException(status_code=404, detail=exception_details)

        self.__logger.info(f"Loading entity: {model_id} from {model_path}")
        model = YOLO(model_path)
        model.to(self.__pytorch_device)

        # Cache the entity
        self.__cached_models[model_id] = model

        return model

    async def process_images_in_batches(
            self,
            image_data_list: list[tuple[str, bytes]],
            model_id: str,
            confidence_threshold: float = 0.25,
            batch_size: int = 16,
    ) -> tuple[dict[str, bytes], CVDataProcessingStats]:
        """
        Process multiple images in batches with YOLO entity
        Args:
            image_data_list: List of tuples (filename, image_bytes)
            model_id: Which entity to use
            confidence_threshold: Minimum confidence for detections
            batch_size: Number of images to process at once
        Returns:
            Tuple of (Dictionary mapping filenames to processed image bytes, ProcessingStats)
        """
        start_time: float = time.time()
        stats: CVDataProcessingStats = CVDataProcessingStats(total_images=len(image_data_list))
        all_confidences: list[float] = [] # For calculating overall average confidence

        yolo_model = await self.get_model(model_id)
        processed_images: dict[str, bytes] = {}

        for i in range(0, len(image_data_list), batch_size):
            batch: list[tuple[str, bytes]] = image_data_list[i:i + batch_size]

            batch_images: list[np.ndarray] = []
            batch_filenames: list[str] = []
            batch_formats: list[str] = []

            for filename, image_bytes in batch:
                try:
                    # Convert bytes to PIL Image
                    image_array, original_format, original_size = ips.preprocess_thermal_image(image_bytes)

                    batch_images.append(image_array)
                    batch_filenames.append(filename)
                    batch_formats.append(original_format if original_format else 'PNG')
                except Exception as e:
                    self.__logger.error(f"Error loading image {filename}: {e}")
                    processed_images[filename] = image_bytes  # Keep original on error
                    stats.failed_images += 1
                    stats.per_image_stats.append(CVImageStats(filename = filename)) # Adding failed image stats

            if not batch_images: continue

            self.__logger.info(f"Processing batch of {len(batch_images)} images with {model_id}")
            results = yolo_model(batch_images, conf=confidence_threshold, verbose=False)

            self.__update_processed_images_list_and_stats_with_confidences(
                results,
                batch,
                batch_filenames,
                batch_formats,
                processed_images,
                stats,
                all_confidences
            )

        # Calculate overall average confidence
        if all_confidences: stats.average_confidence = round(sum(all_confidences) / len(all_confidences), 3)

        # Calculate average confidence per class
        for class_name, class_stat in stats.per_class_stats.items():
            if class_stat.total_detections > 0:
                class_stat.average_confidence = round(
                    class_stat.confidence_sum / class_stat.total_detections,
                    3
                )

        stats.processing_time_seconds = time.time() - start_time
        return processed_images, stats


    def __update_processed_images_list_and_stats_with_confidences(
            self,
            results,
            batch: list[tuple[str, bytes]],
            batch_filenames: list[str],
            batch_formats: list[str],
            processed_images: dict[str, bytes],
            stats: CVDataProcessingStats,
            all_confidences: list[float]
    ):
        for index, result in enumerate(results):
            filename = batch_filenames[index]
            image_format = batch_formats[index]

            try:
                # Convert annotated image to bytes
                processed_images[filename] = YOLOService.__convert_annotated_image_to_bytes(result, image_format)

                # Print detection info
                num_detections = len(result.boxes)
                self.__logger.info(f"✓ {filename}: {num_detections} detections")

                # Update overall statistics
                self.__update_stats_and_confidences_for_single_image_result(result, filename, num_detections, stats, all_confidences)
            except Exception as e:
                self.__logger.info(f"✗ Error processing result for {filename}: {e}")
                processed_images[filename] = batch[index][1]  # Keep original on error
                stats.failed_images += 1
                stats.per_image_stats.append(CVImageStats(filename = filename)) # Add failed image stats


    @staticmethod
    def __convert_annotated_image_to_bytes(result, image_format: str) -> bytes:
        """
        Converts a result's annotated image into bytes.
        """
        annotated_image = result.plot()
        annotated_pil = Image.fromarray(annotated_image)
        output_buffer = io.BytesIO()
        annotated_pil.save(output_buffer, format=image_format)
        return output_buffer.getvalue()

    def __update_stats_and_confidences_for_single_image_result(
            self,
            result,
            filename: str,
            num_detections: int,
            stats: CVDataProcessingStats,
            all_confidences: list[float],
    ):
        # Collect statistics
        stats.total_detections += num_detections
        stats.successfully_processed_images += 1

        # Collect detections with bounding boxes
        detections = []

        # Get confidences for this image
        image_confidences = []


        if hasattr(result.boxes, 'xyxy') and len(result.boxes.xyxy) > 0:
            for idx_box in range(len(result.boxes.xyxy)):
                # Get bounding box coordinates
                bbox = result.boxes.xyxy[idx_box]
                x1, y1, x2, y2 = float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])

                # Get confidence
                conf = float(result.boxes.conf[idx_box])
                image_confidences.append(conf)

                # Get class name
                cls_id = int(result.boxes.cls[idx_box])
                class_name = result.names[cls_id]

                # Create detection object
                detection = CVDetectionBox(
                    classname=class_name,
                    confidence=round(conf, 3),
                    x1=round(x1, 2),
                    y1=round(y1, 2),
                    x2=round(x2, 2),
                    y2=round(y2, 2)
                )
                detections.append(detection)

                all_confidences.append(conf)

        image_avg_conf = sum(image_confidences) / len(image_confidences) if image_confidences else 0.0
        image_max_conf = max(image_confidences) if image_confidences else 0.0

        # Add per-image stats
        stats.per_image_stats.append(CVImageStats(
            filename=filename,
            num_detections=num_detections,
            average_confidence=round(image_avg_conf, 3),
            max_confidence=round(image_max_conf, 3),
            detections=detections,
            is_successfully_processed=True
        ))

        if num_detections > 0: stats.images_with_detections += 1

        # Track per-class statistics
        classes_in_image = set()
        if hasattr(result.boxes, 'cls') and len(result.boxes.cls) > 0:
            for idx_box, cls_id in enumerate(result.boxes.cls):
                class_name = result.names[int(cls_id)]
                classes_in_image.add(class_name)

                # Initialize class stats if not exists
                if class_name not in stats.per_class_stats:
                    stats.per_class_stats[class_name] = CVClassStats(class_name=class_name)

                # Get confidence for this detection
                conf = float(result.boxes.conf[idx_box])

                # Increment detection count for this class
                stats.per_class_stats[class_name].total_detections += 1
                stats.per_class_stats[class_name].confidence_sum += conf
                stats.per_class_stats[class_name].min_confidence = min(
                    stats.per_class_stats[class_name].min_confidence,
                    conf
                )
                stats.per_class_stats[class_name].max_confidence = max(
                    stats.per_class_stats[class_name].max_confidence,
                    conf
                )

            # Count images containing each class (once per image)
            for class_name in classes_in_image:
                stats.per_class_stats[class_name].images_containing_class += 1

        self.__logger.info(f"✓ {filename}: {num_detections} detections (avg conf: {image_avg_conf:.3f})")


YOLO_SERVICE = YOLOService()