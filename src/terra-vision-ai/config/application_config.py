from pathlib import Path

ORIGINS = [
    "http://localhost:5173"
]

RESOURCES_DIR = Path(__file__).resolve().parent.parent / "resources"
SUPPORTED_LANGUAGES = ["en", "ua"]
DEFAULT_LANGUAGE = "en"
MODELS_IDS = ["mgt-yolo11-n", "mgt-yolo11-s", "mgt-yolo11-m", "mgt-yolo11-l", "mgt-yolo11-x"]