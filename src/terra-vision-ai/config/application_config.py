from pathlib import Path
from typing import TypeVar
from dotenv import load_dotenv


# Project directories
TERRA_VISION_GLOBAL_ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
TERRA_VISION_DEPLOYMENT_DIR = TERRA_VISION_GLOBAL_ROOT_DIR / "deployment"
MODELS_DIR = TERRA_VISION_DEPLOYMENT_DIR / "yolo-models" / "mgt-yolo-11-models"

# Environment variables settings
DEPLOYMENT_ENV_FILE = TERRA_VISION_DEPLOYMENT_DIR / "docker" / "local" / ".env"
load_dotenv(dotenv_path=DEPLOYMENT_ENV_FILE)

# Languages settings
SUPPORTED_LANGUAGES = ["en", "uk"]
DEFAULT_LANGUAGE = "en"

T = TypeVar("T")