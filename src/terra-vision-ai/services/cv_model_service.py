from typing import List, Optional, Dict
from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from config import mongo_db
from repository import cv_repository as cv_repo
from schemas import CVModelDescription, CVModelDescriptionResponse

async def check_model_exists_by_id(model_id: str) -> Optional[dict]:
    return await cv_repo.exists_by_id(model_id)

async def get_models_info_in_specified_language(lang: str = DEFAULT_LANGUAGE) -> CVModelDescriptionResponse:
    localized_models: List[CVModelDescription] = []
    if lang not in SUPPORTED_LANGUAGES: lang = DEFAULT_LANGUAGE

    cursor = mongo_db.models.find({}, {f"translations.{lang}": 1})
    async for model_document in cursor:
        model_id = model_document["_id"]
        translations = model_document.get("translations", {}).get(lang, {})

        localized_models.append(
            CVModelDescription(
                id=model_id,
                name=translations.get("displayName", model_id),
                description=translations.get("description", model_id),
            )
        )

    return CVModelDescriptionResponse(lang=lang, models=localized_models)

