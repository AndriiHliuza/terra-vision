import logging
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

TERRA_VISION_GLOBAL_ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
TERRA_VISION_DEPLOYMENT_DIR = TERRA_VISION_GLOBAL_ROOT_DIR / "deployment"
MGT_MODELS_DIR = TERRA_VISION_DEPLOYMENT_DIR / "yolo-models" / "mgt-yolo-11-models"
DEPLOYMENT_ENV_FILE = TERRA_VISION_DEPLOYMENT_DIR / "docker" / "dev" / ".env"

load_dotenv(dotenv_path=DEPLOYMENT_ENV_FILE)

SUPPORTED_LANGUAGES = ["en", "ua"]
DEFAULT_LANGUAGE = "en"

MONGO_USER = os.getenv("TERRA_VISION__MONGO__ROOT_USERNAME")
MONGO_PASSWORD= os.getenv("TERRA_VISION__MONGO__ROOT_PASSWORD")
MONGO_HOST = "localhost"
MONGO_PORT="27017"
MONGO_DB="terra-vision-ai-db"

MONGO_URL = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{MONGO_DB}?authSource=admin"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    stream=sys.stdout,
)