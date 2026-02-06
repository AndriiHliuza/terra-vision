import io
import zipfile
from typing import List

from fastapi import APIRouter, Query, UploadFile, Form, File
from starlette.responses import StreamingResponse

from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from schemas import CVModelDescriptionResponse
from services import get_localized_models_info, check_model_exists_by_name

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/{model_name}/exists")
async def check_model_exists_by_name(
        model_name: str,
        lang: str = Query(
            default=DEFAULT_LANGUAGE,
            regex=f"^({'|'.join(SUPPORTED_LANGUAGES)})$"
        )
):
    """Check if model exists by ID"""
    exists = await check_model_exists_by_name(model_name, lang)
    return {
        "exists": exists,
        "model_id": model_name
    }


@router.get("", response_model=CVModelDescriptionResponse)
async def get_models(
        lang: str = Query(
            default=DEFAULT_LANGUAGE,
            regex=f"^({'|'.join(SUPPORTED_LANGUAGES)})$"
        )
):
    """Get list of AI models with localized information"""
    return await get_localized_models_info(lang)


@router.post("")
async def process_archives(
        modelId: str = Form(...),
        archives: List[UploadFile] = File(...)
):
    print("Received model:", modelId)
    print("Received archives:", [a.filename for a in archives])

    result_zip_archive_buffer = io.BytesIO()

    with zipfile.ZipFile(result_zip_archive_buffer, "w", zipfile.ZIP_DEFLATED) as result_zip:
        for archive in archives:
            archive_bytes = await archive.read()

            processed_zip_archive_buffer = io.BytesIO()
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
    print("Processing...")
    return StreamingResponse(
        result_zip_archive_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=processed_archives.zip"
        }
    )

