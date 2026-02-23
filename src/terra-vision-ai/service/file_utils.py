import io
import zipfile
from fastapi import UploadFile


def is_folder(file_name: str) -> bool:
    return file_name.endswith("/")


def is_image(file_name: str) -> bool:
    return file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.webp'))


async def get_images_and_not_images_from_archive(archive: UploadFile):
    archive_bytes = await archive.read()
    image_data_list: list[tuple[str, bytes]] = []
    non_image_files: dict[str, bytes] = {}
    with zipfile.ZipFile(io.BytesIO(archive_bytes), "r") as input_zip:
        for file_name in input_zip.namelist():
            if is_folder(file_name): continue # skip folders

            file_data = input_zip.read(file_name)

            if is_image(file_name):
                image_data_list.append((file_name, file_data))
            else:
                non_image_files[file_name] = file_data  # Store non-image files to pass through

    return image_data_list, non_image_files


def save_files_as_zip_to_result_zip(
        files: dict[str, bytes],
        archive_name: str,
        result_zip: zipfile.ZipFile
):
    processed_zip_archive_buffer = io.BytesIO()
    with zipfile.ZipFile(processed_zip_archive_buffer, "w", zipfile.ZIP_DEFLATED) as processed_zip:
        # Write files data
        for filename, file_data in files.items():
            processed_zip.writestr(filename, file_data)

    processed_zip_archive_buffer.seek(0)
    result_zip.writestr(archive_name, processed_zip_archive_buffer.read())
    return result_zip