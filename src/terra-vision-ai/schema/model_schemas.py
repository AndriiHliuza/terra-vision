from dataclasses import dataclass
from pydantic import BaseModel
from ultralytics import YOLO


class ModelDetails(BaseModel):
    id: str
    name: str
    description: str


@dataclass
class Model:
    details: ModelDetails
    path: str
    yolo: YOLO
