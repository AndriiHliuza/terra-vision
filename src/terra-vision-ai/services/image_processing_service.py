import io
import cv2
import numpy as np
from PIL import Image
from PIL.ImageFile import ImageFile

def preprocess_thermal_image(image_bytes: bytes) -> tuple[np.ndarray, str, tuple]:
    """
    Preprocess thermal (grayscale) image for YOLO inference
    Args: image_bytes: Raw image bytes
    Returns: Tuple of (processed_image_array, original_format, original_size)
    """
    # Load image data (image file, format, size)
    image, original_image_format, original_image_size = _load_image_data(image_bytes)
    # Convert to numpy array
    image_bytes_array = np.array(image)
    # Handle different grayscale formats
    image_bytes_array = _handle_grayscale_formats(image_bytes_array)
    return image_bytes_array, original_image_format, original_image_size


def _load_image_data(image_bytes: bytes) -> tuple[ImageFile, str, tuple[int, int]]:
    pil_image = Image.open(io.BytesIO(image_bytes))
    image_format = pil_image.format if pil_image.format else 'PNG'
    image_size = pil_image.size
    return pil_image, image_format, image_size


def _handle_grayscale_formats(image_bytes_array):
    if len(image_bytes_array.shape) == 2:
        '''
        - Single channel grayscale - convert to 3 channels for YOLO
        - YOLO expects 3 channels (RGB), so we duplicate the grayscale channel
        - Returns image_bytes_array
        '''
        image_bytes_array = cv2.cvtColor(image_bytes_array, cv2.COLOR_GRAY2RGB)
    elif image_bytes_array.shape[2] == 4:
        ''' RGBA - convert to RGB. Returns image_bytes_array '''
        image_bytes_array = cv2.cvtColor(image_bytes_array, cv2.COLOR_RGBA2RGB)
    return image_bytes_array

