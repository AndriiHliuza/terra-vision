
from fastapi import APIRouter, Query

from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, localization_loader, MODELS_IDS
from schemas import CVModelDescription, CVModelDescriptionResponse

router = APIRouter(prefix="/models", tags=["models"])

@router.get("/", response_model=CVModelDescriptionResponse)
async def get_models(
        lang: str = Query(
            default=DEFAULT_LANGUAGE,
            regex=f"^({'|'.join(SUPPORTED_LANGUAGES)})$"
        )
):
    """Get list of AI models with localized information"""

    localized_models = []

    for model_id in MODELS_IDS:
        localized_models.append(CVModelDescription(
            id=model_id,
            name=localization_loader.get(lang, f"models.{model_id}.displayName", model_id),
            description=localization_loader.get(lang, f"models.{model_id}.description", model_id),
        ))

    return CVModelDescriptionResponse(lang=lang, models=localized_models)
