import math

from fastapi import APIRouter, Form, UploadFile, File, Query, HTTPException
from config import MGT_MODELS_DIR, MONGO_CLIENT
from schemas import CVDataProcessingJob, CVDataProcessingJobPreview, PaginatedResponse
from service import CV_SERVICE, YOLO_SERVICE, CV_PROCESSING_JOB_SERVICE


router = APIRouter(prefix="/cv/processing")

@router.post("")
async def detect_objects(
        user_id: str = Form(...),
        model_id: str = Form(...),
        archives: list[UploadFile] = File(...),
        confidence: float = Form(0.25),
        batch_size: int = Form(16)
):
    return await CV_SERVICE.detect_objects(user_id, model_id, archives, confidence, batch_size)


@router.post("/models/clear-cache")
async def clear_model_cache():
    cleared_models = list(YOLO_SERVICE.get_cached_models().keys())
    YOLO_SERVICE.get_cached_models().clear()
    return {
        "message": "Model cache cleared",
        "cleared_models": cleared_models
    }

@router.get("/models/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_directory": str(MGT_MODELS_DIR),
        "models_directory_exists": MGT_MODELS_DIR.exists(),
        "cached_models": len(YOLO_SERVICE.get_cached_models()),
        "mongodb_connected": MONGO_CLIENT is not None
    }

@router.get("/cv-processing-jobs", response_model=PaginatedResponse[CVDataProcessingJobPreview])
async def get_processing_jobs(
    user_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100)
):
    jobs, total = await CV_PROCESSING_JOB_SERVICE.get_processing_jobs_for_user(user_id, page, page_size)
    return PaginatedResponse(
        items=jobs,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size)
    )

@router.get("/cv-processing-jobs/{job_id}", response_model=CVDataProcessingJob)
async def get_processing_job(job_id: str):
    job = await CV_PROCESSING_JOB_SERVICE.get_processing_job_by_id(job_id)
    if job is None: raise HTTPException(status_code=404, detail="Processing job not found")
    return job