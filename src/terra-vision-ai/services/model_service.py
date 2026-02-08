import io
import logging
import zipfile
from typing import List, Optional, Dict

from fastapi import UploadFile, HTTPException
from starlette.responses import StreamingResponse

from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from config import mongo_db
from schemas import CVModelDescription, CVModelDescriptionResponse
from services import utils
from services.yolo_service import get_model, process_images_batch_with_yolo, PYTORCH_DEVICE, PYTORCH_DEVICE_NAME

logger = logging.getLogger(__name__)

async def check_model_exists_by_id(
        display_name: str
) -> Optional[dict]:
    count = await mongo_db.models.count_documents({"_id": display_name}, limit=1)
    return count > 0


async def get_localized_models_info(lang: str = DEFAULT_LANGUAGE) -> CVModelDescriptionResponse:
    localized_models: List[CVModelDescription] = []

    if lang not in SUPPORTED_LANGUAGES:
        lang = DEFAULT_LANGUAGE

    cursor = mongo_db.models.find({}, {f"translations.{lang}": 1})
    async for model_document in cursor:
        model_id = model_document["_id"]
        translations = model_document.get("translations", {}).get(lang, {})

        localized_models.append(
            CVModelDescription(
                id=model_id,
                name=translations.get("displayName", model_id),
                description=translations.get("description", model_id),
            )
        )

    return CVModelDescriptionResponse(lang=lang, models=localized_models)


async def process_archives_and_detect_objects_using_cv(
        model_id: str,
        archives: List[UploadFile],
        confidence: float = 0.25,
        batch_size: int = 16
):
    _log_start_archive_processing_and_cv_detection(model_id, archives, confidence, batch_size)
    await _check_model_exists(model_id)

    result_zip_archive_buffer = io.BytesIO()
    with zipfile.ZipFile(result_zip_archive_buffer, "w", zipfile.ZIP_DEFLATED) as result_zip:
        for archive in archives:
            image_data_list, non_image_files = await _get_images_and_not_images_from_archive(archive)

            # Process all images in batches
            logger.info(f"Processing {len(image_data_list)} images from {archive.filename}")
            processed_images = await process_images_batch_with_yolo(
                image_data_list,
                model_id,
                confidence,
                batch_size
            )

            _write_files_as_zip_archive_to_result_zip_archive(
                {**processed_images, **non_image_files},
                archive.filename,
                result_zip
            )
    result_zip_archive_buffer.seek(0)

    logger.info(f"Processing finished using {model_id}. Sending data back to client.")
    return StreamingResponse(
        result_zip_archive_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=processed_archives.zip"
        }
    )


def _log_start_archive_processing_and_cv_detection(
        model_id: str,
        archives: List[UploadFile],
        confidence: float = 0.25,
        batch_size: int = 16
):
    logger.info(f"Starting processing archives: {[a.filename for a in archives]}")
    logger.info(f"Total number of archives to process: {len(archives)}")
    logger.info(f"Model used: {model_id}")
    logger.info(f"Confidence threshold: {confidence}")
    logger.info(f"Batch size: {batch_size}")
    logger.info(f"Using {PYTORCH_DEVICE} for computations. Processor: {PYTORCH_DEVICE_NAME}")


async def _check_model_exists(model_id: str):
    # Validate model exists before processing
    try:
        await get_model(model_id)
    except HTTPException as e:
        raise e


async def _get_images_and_not_images_from_archive(archive: UploadFile):
    archive_bytes = await archive.read()
    image_data_list = []
    non_image_files = {}
    with zipfile.ZipFile(io.BytesIO(archive_bytes), "r") as input_zip:
        for file_name in input_zip.namelist():
            # skip folders
            if utils.is_folder(file_name): continue

            file_data = input_zip.read(file_name)
            # Check if file is an image
            if utils.is_image(file_name):
                image_data_list.append((file_name, file_data))
            else:
                non_image_files[file_name] = file_data  # Store non-image files to pass through
    return image_data_list, non_image_files


def _write_files_as_zip_archive_to_result_zip_archive(
        files: Dict[str, bytes],
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
