from config import mongo_db
from models import ProcessingSummaryJobDocument

async def get_processing_job_by_id(job_id: str) -> ProcessingSummaryJobDocument | None:
    doc = await mongo_db["cv_processing_summary_jobs"].find_one({"_id": job_id})
    if doc is None:
        return None
    return ProcessingSummaryJobDocument(**doc)