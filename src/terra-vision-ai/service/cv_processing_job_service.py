import asyncio

from config import MONGO_CLIENT, MONGO_CV_PROCESSING_JOBS_COLLECTION_NAME
from schema import CVDataProcessingSummaryStats, CVDataProcessingJob, CVDataProcessingJobPreview
from repository import CV_PROCESSING_JOB_REPOSITORY


class CVProcessingJobService:
    def __init__(self):
        self.__mongo_db = MONGO_CLIENT
        self.__cv_processing_job_repository = CV_PROCESSING_JOB_REPOSITORY

    async def create_and_save_cv_processing_job(self, user_id: str, summary: CVDataProcessingSummaryStats):
        doc = CVDataProcessingJob(user_id=user_id, summary=summary)
        return await self.__mongo_db[MONGO_CV_PROCESSING_JOBS_COLLECTION_NAME].insert_one(doc.to_mongo())

    async def get_cv_processing_jobs_for_user(
            self,
            user_id: str,
            page: int = 1,
            page_size: int = 10
    ) -> tuple[list[CVDataProcessingJobPreview], int]:
        skip = (page - 1) * page_size
        query = {"user_id": user_id}

        total, docs = await asyncio.gather(
            self.__mongo_db[MONGO_CV_PROCESSING_JOBS_COLLECTION_NAME].count_documents(query),
            self.__mongo_db[MONGO_CV_PROCESSING_JOBS_COLLECTION_NAME]
            .find(
                query,
                {
                    "summary.overall_stats.per_class_stats": 0,  # Exclude specific nested field
                    "summary.overall_stats.per_image_stats": 0,  # Exclude specific nested field
                    "summary.by_archive_stats": 0  # Exclude this too if it's heavy
                }
            )
            .sort("created_at", -1)
            .skip(skip)
            .limit(page_size)
            .to_list(length=page_size)
        )
        print(total, docs)

        return [CVDataProcessingJobPreview(**doc) for doc in docs], total

    async def get_cv_processing_job_by_id(self, job_id: str, user_id: str) -> CVDataProcessingJob | None:
        return await self.__cv_processing_job_repository.get_cv_processing_job_by_id(job_id, user_id)


CV_PROCESSING_JOB_SERVICE = CVProcessingJobService()