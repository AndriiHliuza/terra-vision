import json
from typing import Dict, Any
from config.application_config import RESOURCES_DIR, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE


class LocalizationLoader:
    def __init__(self):
        self.translations: Dict[str, Dict[str, Any]] = {}
        self._load_translations()

    def _load_translations(self):
        locales_dir = RESOURCES_DIR / "locales"
        for lang in SUPPORTED_LANGUAGES:
            file_path = locales_dir / f"{lang}.json"
            if file_path.exists():
                with open(file_path, "r", encoding="utf-8") as f:
                    self.translations[lang] = json.load(f)

    def get(self, lang: str, key:str, default: Any = None) -> Any:
        """Get translation by key. Key can be dot-separated like 'models.GPT-4.displayName'"""
        if lang not in SUPPORTED_LANGUAGES:
            lang = DEFAULT_LANGUAGE

        keys = key.split(".")
        value = self.translations.get(lang, {})

        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
            else:
                return default

        return value if value is not None else default

localization_loader = LocalizationLoader()