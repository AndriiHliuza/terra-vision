from motor.motor_asyncio import AsyncIOMotorClient
from config.config import MONGO_URL, MONGO_DB

motorClient = AsyncIOMotorClient(MONGO_URL)
db = motorClient[MONGO_DB]
