from typing import List, Optional
from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from repository import CV_MODEL_REPOSITORY
from schema import CVModelDescription, CVModelDescriptionResponse
from config import MONGO_CLIENT, MONGO_CV_MODELS_COLLECTION_NAME


class CVModelService:
    def __init__(self):
        self.__cv_model_repository = CV_MODEL_REPOSITORY
        self.__mongo_db = MONGO_CLIENT
        self.__supported_languages = SUPPORTED_LANGUAGES
        self.__default_language = DEFAULT_LANGUAGE

    async def check_cv_model_exists_by_id(self, model_id: str) -> Optional[dict]:
        return await self.__cv_model_repository.check_cv_model_exists_by_id(model_id)

    async def get_cv_all_models_details_in_specified_language(
            self,
            lang: str = DEFAULT_LANGUAGE) -> CVModelDescriptionResponse:
        localized_cv_models: List[CVModelDescription] = []
        if lang not in self.__supported_languages: lang = self.__default_language

        cursor = self.__mongo_db[MONGO_CV_MODELS_COLLECTION_NAME].find({}, {f"translations.{lang}": 1})
        async for model_document in cursor:
            model_id = model_document["_id"]
            translations = model_document.get("translations", {}).get(lang, {})

            localized_cv_models.append(
                CVModelDescription(
                    id=model_id,
                    name=translations.get("displayName", model_id),
                    description=translations.get("description", model_id),
                )
            )

        return CVModelDescriptionResponse(lang=lang, cv_models=localized_cv_models)


CV_MODEL_SERVICE = CVModelService()