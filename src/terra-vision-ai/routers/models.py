from typing import List

from fastapi import APIRouter, Query, UploadFile, Form, File

from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from schemas import CVModelDescriptionResponse
from services import get_localized_models_info, check_model_exists_by_name, process_archives_and_detect_objects_with_ai

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
    return await process_archives_and_detect_objects_with_ai(modelId, archives)

