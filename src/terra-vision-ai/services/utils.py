def is_folder(file_name: str) -> bool:
    return file_name.endswith("/")

def is_image(file_name: str) -> bool:
    return file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.webp'))
