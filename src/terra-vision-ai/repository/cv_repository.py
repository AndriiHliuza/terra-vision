from typing import Any, Optional
from config import mongo_db

async def exists_by_id(model_id: str) -> Optional[dict]:
    count = await mongo_db.models.count_documents({"_id": model_id}, limit=1)
    return count > 0

async def get_models() -> list[dict[str, Any]]:
    models_collection = mongo_db["models"]
    models_cursor = models_collection.find({})
    return await models_cursor.to_list(length=None)

