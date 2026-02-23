from fastapi import APIRouter, Query
from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, MGT_MODELS_DIR, MONGO_CLIENT
from schema import CVModelDescriptionResponse
from service import CV_MODEL_SERVICE, YOLO_SERVICE

router = APIRouter(prefix="/cv/yolo/models")


@router.get("/{model_id}/exists")
async def check_cv_model_exists_by_id(model_id: str):
    exists = await CV_MODEL_SERVICE.check_cv_model_exists_by_id(model_id)
    return { "exists": exists, "model_id": model_id }


@router.get("/details", response_model=CVModelDescriptionResponse)
async def get_cv_all_model_details_in_specified_language(
        lang: str = Query(
            default=DEFAULT_LANGUAGE,
            regex=f"^({'|'.join(SUPPORTED_LANGUAGES)})$"
        )
):
    return await CV_MODEL_SERVICE.get_cv_all_models_details_in_specified_language(lang)

@router.post("/clear-cache")
async def clear_model_cache():
    cleared_models = list(YOLO_SERVICE.get_cached_models().keys())
    YOLO_SERVICE.get_cached_models().clear()
    return {
        "message": "Model cache cleared",
        "cleared_models": cleared_models
    }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_directory": str(MGT_MODELS_DIR),
        "models_directory_exists": MGT_MODELS_DIR.exists(),
        "cached_models": len(YOLO_SERVICE.get_cached_models()),
        "mongodb_connected": MONGO_CLIENT is not None
    }