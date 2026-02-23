from typing import Any
from config import MONGO_CLIENT, MONGO_CV_MODELS_COLLECTION_NAME


class CVModelRepository:
    def __init__(self):
        self.__mongo_db = MONGO_CLIENT

    async def check_cv_model_exists_by_id(self, cv_model_id) -> bool:
        count = await self.__mongo_db[MONGO_CV_MODELS_COLLECTION_NAME].count_documents({"_id": cv_model_id}, limit=1)
        return count > 0

    async def get_cv_models(self) -> list[dict[str, Any]]:
        cv_models_collection = self.__mongo_db[MONGO_CV_MODELS_COLLECTION_NAME]
        cv_models_cursor = cv_models_collection.find({})
        return await cv_models_cursor.to_list(length=None)


CV_MODEL_REPOSITORY = CVModelRepository()