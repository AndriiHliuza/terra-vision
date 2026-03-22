from fastapi import APIRouter, Query, Header
from starlette import status

from config.application_config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from schema.model_schemas import ModelDetails
from service import model_details_service as mds
from service.yolo_service import YOLO_SERVICE

router = APIRouter()


@router.get("/models/details", response_model=list[ModelDetails])
async def get_models(
        lang: str = Header(default=DEFAULT_LANGUAGE, alias="Accept-Language")
) -> list[ModelDetails]:
    lang = lang if lang in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE
    return await mds.get_all_models_details(lang)


# ------------ Internal routes ------------

@router.post("/internal/models/clear-cache", status_code=status.HTTP_204_NO_CONTENT)
async def clear_model_cache():
    YOLO_SERVICE.clear_cache()


@router.get("/internal/cached-models")
async def health_check() -> list[str]:
    return list(YOLO_SERVICE.get_cached_models().keys())
