import math

from fastapi import APIRouter, Form, UploadFile, File, Query, HTTPException
from config import MGT_MODELS_DIR, mongo_db, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from models import ProcessingSummaryJobPreviewDocument, ProcessingSummaryJobDocument
from schemas import CVModelDescriptionResponse, PaginatedResponse
from services import cv_service as cvs, cv_model_service as cvms, yolo_service as ys, processing_summary_service as pss

router = APIRouter(prefix="/cv")

@router.get("/models/{model_id}/exists")
async def check_model_exists_by_id(
        model_id: str
):
    """Check if AI model exists by ID"""
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
        user_id: str = Form(...),
        model_id: str = Form(...),
        archives: list[UploadFile] = File(...),
        confidence: float = Form(0.25),
        batch_size: int = Form(16)
):
    return await cvs.CV_MODEL_SERVICE.detect_objects(user_id, model_id, archives, confidence, batch_size)

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

@router.get("/processing-summary-jobs", response_model=PaginatedResponse[ProcessingSummaryJobPreviewDocument])
async def get_processing_jobs(
    user_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100)
):
    jobs, total = await pss.get_processing_summary_jobs_for_user(user_id, page, page_size)
    return PaginatedResponse(
        items=jobs,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size)
    )

@router.get("/processing-summary-jobs/{job_id}", response_model=ProcessingSummaryJobDocument)
async def get_processing_job(job_id: str):
    job = await pss.get_processing_job_by_id(job_id)
    if job is None: raise HTTPException(status_code=404, detail="Processing job not found")
    return job