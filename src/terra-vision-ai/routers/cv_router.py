from fastapi import APIRouter, Form, UploadFile, File, Query
from config import MGT_MODELS_DIR, mongo_db, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from schemas import CVModelDescriptionResponse
from services import cv_service as cvs, cv_model_service as cvms, yolo_service as ys

router = APIRouter(prefix="/cv")

@router.get("/models/{model_id}/exists")
async def check_model_exists_by_id(
        model_id: str
):
    """Check if model exists by ID"""
    exists = await cvms.check_model_exists_by_id(model_id)
    return {
        "exists": exists,
        "model_id": model_id
    }

@router.get("/models", response_model=CVModelDescriptionResponse)
async def get_models(
        lang: str = Query(
            default=DEFAULT_LANGUAGE,
            regex=f"^({'|'.join(SUPPORTED_LANGUAGES)})$"
        )
):
    """Get list of AI models with localized information"""
    return await cvms.get_models_info_in_specified_language(lang)

@router.post("")
async def detect_objects(
        model_id: str = Form(...),
        archives: list[UploadFile] = File(...),
        confidence: float = Form(0.25),
        batch_size: int = Form(16)
):
    return await cvs.CV_MODEL_SERVICE.detect_objects(model_id, archives, confidence, batch_size)

@router.post("/clear-cache")
async def clear_model_cache():
    cleared_models = list(ys.YOLO_SERVICE.get_cached_models().keys())
    ys.YOLO_SERVICE.get_cached_models().clear()
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
        "cached_models": len(ys.YOLO_SERVICE.get_cached_models()),
        "mongodb_connected": mongo_db is not None
    }