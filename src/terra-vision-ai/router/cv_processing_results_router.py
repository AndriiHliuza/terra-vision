from fastapi import APIRouter, HTTPException
from starlette.responses import StreamingResponse

from service import CV_DATA_STORAGE_SERVICE

router = APIRouter(prefix="/cv/yolo/detections/results")


# ── Zip download endpoints ────────────────────────────────────────────────────

@router.get("/{user_id}/original")
def download_original_zip(user_id: str, cv_processing_job_timestamp: str):
    """Stream a zip of all original images. Each archive is a nested .zip inside."""
    zip_buffer = CV_DATA_STORAGE_SERVICE.get_data_as_zip_from_storage(user_id, cv_processing_job_timestamp, "original")
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=original_{cv_processing_job_timestamp}.zip"},
    )


@router.get("/{user_id}/processed")
def download_processed_zip(user_id: str, cv_processing_job_timestamp: str):
    """Stream a zip of all processed images. Each archive is a nested .zip inside."""
    zip_buffer = CV_DATA_STORAGE_SERVICE.get_data_as_zip_from_storage(user_id, cv_processing_job_timestamp, "processed")
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=processed_{cv_processing_job_timestamp}.zip"},
    )
