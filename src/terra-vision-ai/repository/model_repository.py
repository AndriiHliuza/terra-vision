from config.application_config import DEFAULT_LANGUAGE
from config.mongo_config import MONGO_CLIENT, MONGO_MODELS_COLLECTION, MONGO_DB
from schema.model_schemas import ModelDetails


async def get_all_models_details(lang: str = DEFAULT_LANGUAGE) -> list[ModelDetails]:
    models_collection = (MONGO_CLIENT
                .get_database(MONGO_DB)
                .get_collection(MONGO_MODELS_COLLECTION))

    models_cursor = models_collection.find({}, {
        "name": True,
        f"description.{lang}": True
    })

    return [
        ModelDetails(
            id=model_document.get("_id"),
            name=model_document.get("name"),
            description=model_document.get("description", {}).get(lang, ""),
        )
        async for model_document in models_cursor
    ]

async def get_model_details_by_model_id(model_id: str, lang: str = DEFAULT_LANGUAGE) -> ModelDetails | None:
    models_collection = (MONGO_CLIENT
                         .get_database(MONGO_DB)
                         .get_collection(MONGO_MODELS_COLLECTION))

    model_document = await models_collection.find_one(
        {"_id": model_id},
        {"name": True, f"description.{lang}": True}
    )

    if model_document is None:
        return None

    return ModelDetails(
        id=model_document.get("_id"),
        name=model_document.get("name"),
        description=model_document.get("description", {}).get(lang, ""),
    )