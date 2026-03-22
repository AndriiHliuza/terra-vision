from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, computed_field, Field


# ------------ Schemas for stats ------------

class ImageStats(BaseModel):
    filename: str
    num_detections: int

    average_confidence: float
    max_confidence: float
    min_confidence: float

    detections: list[DetectionBox]


class DetectionBox(BaseModel):
    cls_name: str
    confidence: float
    x1: float = 0.0
    y1: float = 0.0
    x2: float = 0.0
    y2: float = 0.0


class ClassStats(BaseModel):
    cls_name: str  # Name of the class

    total_detections: int = 0  # Total detections per class
    images_containing_class: int = 0  # How many images contain this class

    average_confidence: float = 0.0  # Average confidence across all detections in class
    min_confidence: float = 0.0  # The lowest confidence score recorded for the class across all detections
    max_confidence: float = 0.0  # The highest confidence score recorded for the class across all detections


class AggregatedStats(BaseModel):
    total_images: int
    total_detections: int = 0
    images_with_detections: int = 0

    processing_time_seconds: float = 0.0

    average_confidence: float = 0.0
    max_confidence: float = 0.0
    min_confidence: float = 0.0

    per_class_stats: dict[str, ClassStats] = {}  # class_name -> ClassStats
    per_image_stats: list[ImageStats] = []  # Per-image statistics

    @computed_field
    @property
    def average_detections_per_image(self) -> float:
        return round(
            self.total_detections / self.total_images if self.total_images > 0 else 0.0,
            2
        )

    @computed_field
    @property
    def percentage_of_images_with_detection(self) -> float:
        """Percentage of images with detections"""
        return round(
            (self.images_with_detections / self.total_images * 100) if self.total_images > 0 else 0.0,
            2
        )


class DetectionStats(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: Optional[str] = None

    model_id: str
    confidence_threshold: float

    overall_stats: AggregatedStats
    per_archive_stats: dict[str, AggregatedStats]

    processed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    base_minio_path: Optional[str] = None


# ------------ Preview DTOs ------------

class AggregatedStatsPreview(BaseModel):
    total_images: int = 0
    total_detections: int = 0
    images_with_detections: int = 0

    processing_time_seconds: float = 0.0

    average_confidence: float = 0.0
    max_confidence: float = 0.0
    min_confidence: float = 0.0

    average_detections_per_image: float = 0.0
    percentage_of_images_with_detection: float = 0.0


class DetectionStatsPreview(BaseModel):
    id: str
    user_id: str

    model_id: str
    confidence_threshold: float

    overall_stats: AggregatedStatsPreview

    processed_at: datetime