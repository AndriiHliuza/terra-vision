from motor.motor_asyncio import AsyncIOMotorClient
from config.application_config import MONGO_URL, MONGO_DB

motorClient = AsyncIOMotorClient(MONGO_URL)
db = motorClient[MONGO_DB]
