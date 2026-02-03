from typing import List, Optional
from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from database import db
from schemas import CVModelDescription, CVModelDescriptionResponse


async def check_model_exists_by_name(
        display_name: str,
        lang: str = DEFAULT_LANGUAGE
) -> Optional[dict]:
    query_field = f"translations.{lang}.displayName"
    count = await db.models.count_documents({query_field: display_name}, limit=1)
    return count > 0

async def get_localized_models_info(lang: str = DEFAULT_LANGUAGE) -> CVModelDescriptionResponse:
    localized_models: List[CVModelDescription] = []

    if lang not in SUPPORTED_LANGUAGES:
        lang = DEFAULT_LANGUAGE

    cursor = db.models.find({}, {"translations."+lang: 1})
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