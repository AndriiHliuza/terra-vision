import logging
import os
import sys
from pathlib import Path
from dotenv import load_dotenv


ENV_FILE = Path(__file__).resolve().parent.parent.parent.parent / "deployment" / "docker" / "dev" / ".env"
load_dotenv(dotenv_path=ENV_FILE)

ORIGINS = [
    "http://localhost:5173"
]

SUPPORTED_LANGUAGES = ["en", "ua"]
DEFAULT_LANGUAGE = "en"

MONGO_USER = os.getenv("TERRA_VISION_AI_MONGO_DB_ROOT_USERNAME")
MONGO_PASSWORD= os.getenv("TERRA_VISION_AI_MONGO_DB_ROOT_PASSWORD")
MONGO_HOST = "localhost"
MONGO_PORT="27017"
MONGO_DB="terra-vision-db"

MONGO_URL = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB}?authSource=admin"


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    stream=sys.stdout,
)