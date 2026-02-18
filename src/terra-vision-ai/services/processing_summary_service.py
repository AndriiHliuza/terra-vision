import asyncio

from config import mongo_db
from models import ProcessingSummaryJobDocument, ProcessingSummaryJobPreviewDocument
from schemas import ProcessingSummary
from repository import processing_summary_repository as proc_sum_repo

async def save_processing_summary(user_id: str, summary: ProcessingSummary):
    doc = ProcessingSummaryJobDocument(user_id=user_id, summary=summary)
    return await mongo_db["cv_processing_summary_jobs"].insert_one(doc.to_mongo())

async def get_processing_summary_jobs_for_user(
    user_id: str,
    page: int = 1,
    page_size: int = 10
) -> tuple[list[ProcessingSummaryJobPreviewDocument], int]:
    skip = (page - 1) * page_size
    query = {"user_id": user_id}

    total, docs = await asyncio.gather(
        mongo_db["cv_processing_summary_jobs"].count_documents(query),
        mongo_db["cv_processing_summary_jobs"]
            .find(query, {"summary": 0})
            .sort("created_at", -1)
            .skip(skip)
            .limit(page_size)
            .to_list(length=page_size)
    )

    return [ProcessingSummaryJobPreviewDocument(**doc) for doc in docs], total


async def get_processing_job_by_id(job_id: str) -> ProcessingSummaryJobDocument | None:
    return await proc_sum_repo.get_processing_job_by_id(job_id)