from typing import List
from fastapi import APIRouter, Query, UploadFile, Form, File
from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, MGT_MODELS_DIR
from config import mongo_db
from schemas import CVModelDescriptionResponse
from services import model_service as ms, cv_service as cvs, yolo_service as ys

router = APIRouter(prefix="/models", tags=["models"])

@router.get("/{model_id}/exists")
async def check_model_exists_by_id(
        model_id: str
):
    """Check if model exists by ID"""
    exists = await ms.check_model_exists_by_id(model_id)
    return {
        "exists": exists,
        "model_id": model_id
    }

@router.get("", response_model=CVModelDescriptionResponse)
async def get_models(
        lang: str = Query(
            default=DEFAULT_LANGUAGE,
            regex=f"^({'|'.join(SUPPORTED_LANGUAGES)})$"
        )
):
    """Get list of AI models with localized information"""
    return await ms.get_models_info_in_specified_language(lang)


@router.post("")
async def detect_objects(
        model_id: str = Form(...),
        archives: List[UploadFile] = File(...),
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