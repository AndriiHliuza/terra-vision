import io
import logging
import zipfile
from typing import List, Optional

from fastapi import UploadFile
from starlette.responses import StreamingResponse

from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from database import db
from schemas import CVModelDescription, CVModelDescriptionResponse


logger = logging.getLogger(__name__)

async def check_model_exists_by_name(
        display_name: str,
        lang: str = DEFAULT_LANGUAGE
) -> Optional[dict]:
    query_field = f"translations.{lang}.displayName"
    count = await db.models.count_documents({query_field: display_name}, limit=1)
    return count > 0

async def get_localized_models_info(lang: str = DEFAULT_LANGUAGE) -> CVModelDescriptionResponse:
    localized_models: List[CVModelDescription] = []

    if lang not in SUPPORTED_LANGUAGES:
        lang = DEFAULT_LANGUAGE

    cursor = db.models.find({}, {"translations."+lang: 1})
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

async def process_archives_and_detect_objects_with_ai(modelId: str, archives: List[UploadFile]):
    logger.info(f"Starting processing archives: {[a.filename for a in archives]}")
    logger.info(f"Total number of archives to process: {len(archives)}")
    logger.info(f"Model used: {modelId}")

    result_zip_archive_buffer = io.BytesIO()

    with zipfile.ZipFile(result_zip_archive_buffer, "w", zipfile.ZIP_DEFLATED) as result_zip:
        for archive in archives:
            archive_bytes = await archive.read()
            processed_zip_archive_buffer = io.BytesIO()

            image_data_list = []
            non_image_files = {}
            with zipfile.ZipFile(io.BytesIO(archive_bytes), "r") as input_zip, \
                    zipfile.ZipFile(processed_zip_archive_buffer, "w", zipfile.ZIP_DEFLATED) as processed_zip:
                for file_name in input_zip.namelist():

                    # skip folders
                    if file_name.endswith("/"):
                        continue

                    file_data = input_zip.read(file_name)

                    # THIS is where YOLO / ML processing goes
                    processed_data = file_data
                    # example: processed_data = run_yolo(file_data)

                    processed_zip.writestr(file_name, processed_data)

            processed_zip_archive_buffer.seek(0)
            result_zip.writestr(archive.filename, processed_zip_archive_buffer.read())

    result_zip_archive_buffer.seek(0)

    logger.info("Processing finished. Sending data back to client.")
    return StreamingResponse(
        result_zip_archive_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=processed_archives.zip"
        }
    )