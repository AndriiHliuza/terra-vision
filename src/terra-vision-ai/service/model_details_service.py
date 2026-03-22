from config.application_config import SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE
from repository import model_repository as mr
from schema.model_schemas import ModelDetails


async def get_all_models_details(lang: str = DEFAULT_LANGUAGE) -> list[ModelDetails]:
    if lang not in SUPPORTED_LANGUAGES: lang = DEFAULT_LANGUAGE
    return await mr.get_all_models_details(lang)
