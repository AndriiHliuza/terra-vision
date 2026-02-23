from config import MONGO_CLIENT
from schemas import CVProcessingJob


class CVProcessingJobRepository:
    def __init__(self):
        self.__mongo_db = MONGO_CLIENT

    async def get_cv_processing_job_by_id(self, job_id: str) -> CVProcessingJob | None:
        doc = await self.__mongo_db.cv_processing_jobs.find_one({"_id": job_id})
        if doc is None: return None
        return CVProcessingJob(**doc)


CV_PROCESSING_JOB_REPOSITORY = CVProcessingJobRepository()