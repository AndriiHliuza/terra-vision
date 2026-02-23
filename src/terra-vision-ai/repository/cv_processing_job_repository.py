from config import MONGO_CLIENT, MONGO_CV_PROCESSING_JOBS_COLLECTION_NAME
from schema import CVDataProcessingJob


class CVProcessingJobRepository:
    def __init__(self):
        self.__mongo_db = MONGO_CLIENT

    async def get_cv_processing_job_by_id(self, job_id: str, user_id: str) -> CVDataProcessingJob | None:
        doc = await self.__mongo_db[MONGO_CV_PROCESSING_JOBS_COLLECTION_NAME].find_one({"_id": job_id, "user_id": user_id})
        if doc is None: return None
        return CVDataProcessingJob(**doc)


CV_PROCESSING_JOB_REPOSITORY = CVProcessingJobRepository()