from motor.motor_asyncio import AsyncIOMotorClient
from config.config import MONGO_URL, MONGO_DB

motor_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = motor_client[MONGO_DB]
