import math

from fastapi import APIRouter, Form, UploadFile, File, Query, HTTPException
from schema import CVDataProcessingJob, CVDataProcessingJobPreview, PaginatedResponse
from service import CV_SERVICE, YOLO_SERVICE, CV_PROCESSING_JOB_SERVICE


router = APIRouter(prefix="/cv/yolo/detections")

@router.post("")
async def detect_objects(
        user_id: str = Form(...),
        model_id: str = Form(...),
        archives: list[UploadFile] = File(...),
        confidence: float = Form(0.25),
        batch_size: int = Form(16)
):
    return await CV_SERVICE.detect_objects(user_id, model_id, archives, confidence, batch_size)


# ── Stats endpoints ───────────────────────────────────────────────────────────
@router.get("/{user_id}/cv-jobs", response_model=PaginatedResponse[CVDataProcessingJobPreview])
async def get_cv_processing_jobs_for_user(
    user_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100)
):
    jobs, total = await CV_PROCESSING_JOB_SERVICE.get_cv_processing_jobs_for_user(user_id, page, page_size)
    return PaginatedResponse(
        items=jobs,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size)
    )


@router.get("/{user_id}/cv-jobs/{job_id}", response_model=CVDataProcessingJob)
async def get_cv_processing_job(user_id: str, job_id: str):
    job = await CV_PROCESSING_JOB_SERVICE.get_cv_processing_job_by_id(job_id, user_id)
    if job is None: raise HTTPException(status_code=404, detail="Processing job not found")
    return job