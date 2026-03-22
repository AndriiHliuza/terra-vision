import io
import logging
import zipfile
from logging import Logger

import cv2
import numpy as np
from fastapi import UploadFile, HTTPException

from schema.file_schemas import File, NumpyImage


def get_file_extension(file: File) -> str:
    ext = file.filename.rsplit(".", 1)[-1].lower()
    return f".{ext}"


def if_folder(filename: str) -> bool:
    return filename.endswith("/")


def is_image(filename: str) -> bool:
    return filename.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"))


async def extract_images_from_archive(archive: UploadFile) -> list[File]:
    archive_bytes: bytes = await archive.read()

    images: list[File] = []

    try:
        with zipfile.ZipFile(io.BytesIO(archive_bytes), "r") as input_zip:
            for entry in input_zip.infolist():
                if entry.is_dir(): continue

                filename: str = entry.filename
                file_data: bytes = input_zip.read(filename)
                file = File(filename, file_data)

                if is_image(filename): images.append(file)

        return images

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Not a zip archive")


def convertFileToNumpyImage(file: File) -> NumpyImage:
    return NumpyImage(
        filename=file.filename,
        array=cv2.imdecode(np.frombuffer(file.bytes, np.uint8), cv2.IMREAD_COLOR)
    )


def convertFilesToNumpyImages(files: list[File]) -> list[NumpyImage]:
    return [convertFileToNumpyImage(file) for file in files]
