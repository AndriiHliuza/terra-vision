import logging
from logging import Logger
from pathlib import Path
from fastapi import HTTPException
from ultralytics import YOLO

from config.application_config import MODELS_DIR
from schema.model_schemas import Model, ModelDetails
from service import pytorch_service as pts
from repository import model_repository as mr


class YoloService:
    def __init__(self):
        self.__logger: Logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
        self.__cached_models: dict[str, YOLO] = {}

    async def get_model(self, model_id: str) -> Model:
        model_details: ModelDetails = await mr.get_model_details_by_model_id(model_id)
        if not model_details: self.__handle_model_details_not_found(model_id)

        model_path = MODELS_DIR / f"{model_id}.pt"
        if not Path(model_path).exists(): self.__handle_model_path_not_exists(model_id, model_path)

        model: YOLO = self.__load_model(model_id, model_path)
        self.__cache_model(model_id, model)

        return Model(model_details, model_path, model)

    def get_cached_models(self) -> dict[str, YOLO]:
        return self.__cached_models

    def clear_cache(self):
        self.__cached_models.clear()
        self.__logger.debug("Models cache cleared")

    # ------------ private methods ------------

    def __load_model(self, model_id: str, model_path: str) -> YOLO:
        if model_id in self.__cached_models:
            self.__logger.debug(f"Loading model from cache: {model_id}")
            return self.__cached_models.get(model_id)

        self.__logger.debug(f"Loading model... | model_id={model_id}, model_path={model_path}")
        model = YOLO(model_path)
        model.to(pts.get_device())
        return model

    def __cache_model(self, model_id: str, model: YOLO):
        self.__cached_models[model_id] = model
        self.__logger.debug(f"Model with id={model_id} was cached")

    def __handle_model_details_not_found(self, model_id: str) -> str:
        self.__logger.debug(f"Model info for model with id={model_id} not found")
        raise HTTPException(status_code=400, detail=f"Failed to find information about model with id={model_id}")

    def __handle_model_path_not_exists(self, model_id: str, model_path: str):
        self.__logger.debug(f"Model path does not exist | Path: {model_path}")
        raise HTTPException(status_code=400, detail=f"Failed to load model with id={model_id}")


YOLO_SERVICE: YoloService = YoloService()
