from fastapi import APIRouter, Query
from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from schemas.cv_models import CVModelDescriptionResponse
from service import CV_MODEL_SERVICE


router = APIRouter(prefix="/cv/models")


@router.get("/{model_id}/exists")
async def check_cv_model_exists_by_id(model_id: str):
    exists = await CV_MODEL_SERVICE.check_cv_model_exists_by_id(model_id)
    return { "exists": exists, "model_id": model_id }


@router.get("", response_model=CVModelDescriptionResponse)
async def get_cv_model_details_in_specified_language(
        lang: str = Query(
            default=DEFAULT_LANGUAGE,
            regex=f"^({'|'.join(SUPPORTED_LANGUAGES)})$"
        )
):
    return await CV_MODEL_SERVICE.get_cv_model_details_in_specified_language(lang)