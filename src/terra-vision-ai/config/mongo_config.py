import os

from motor.motor_asyncio import AsyncIOMotorClient


MONGO_USER = os.getenv("TERRA_VISION__MONGO__ROOT_USERNAME")
MONGO_PASSWORD= os.getenv("TERRA_VISION__MONGO__ROOT_PASSWORD")
MONGO_HOST = "localhost"
MONGO_PORT="27017"
MONGO_DB="terra-vision-ai-db"
MONGO_URL = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB}?authSource=admin"

MOTOR_CLIENT = AsyncIOMotorClient(MONGO_URL)
MONGO_CLIENT = MOTOR_CLIENT[MONGO_DB]

MONGO_CV_MODELS_COLLECTION_NAME = "cv_models_collection"
MONGO_CV_PROCESSING_SUMMARY_JOBS_COLLECTION_NAME = "cv_processing_jobs_collection"


