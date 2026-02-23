from pydantic import BaseModel, Field, computed_field


class CVClassStats(BaseModel):
    class_name: str # Name of the class
    total_detections: int = 0 # Total detections per class
    images_containing_class: int = 0  # How many images contain this class
    average_confidence: float = 0.0 # Average confidence across all detections
    min_confidence: float = 1.0 # The lowest confidence score recorded for the class across all detections
    max_confidence: float = 0.0 # The highest confidence score recorded for the class across all detections
    confidence_sum: float = Field(default=0.0, exclude=True)


class CVDetectionBox(BaseModel):
    classname: str = ""
    confidence: float = 0.0
    x1: float = 0.0
    y1: float = 0.0
    x2: float = 0.0
    y2: float = 0.0


class CVImageStats(BaseModel):
    filename: str = ""
    num_detections: int = 0
    average_confidence: float = 0.0
    max_confidence: float = 0.0
    detections: list[CVDetectionBox] = []
    is_successfully_processed: bool = False


class CVProcessingStats(BaseModel):
    total_images: int = 0
    successfully_processed_images: int = 0
    failed_images: int = 0
    total_detections: int = 0
    images_with_detections: int = 0
    processing_time_seconds: float = 0.0
    average_confidence: float = 0.0  # Average confidence across all detections
    per_class_stats: dict[str, CVClassStats] = {}  # class_name -> ClassStats
    per_image_stats: list[CVImageStats] = []  # Per-image statistics

    @computed_field
    @property
    def average_detections_per_image(self) -> float:
        return round(
            self.total_detections / self.total_images if self.total_images > 0 else 0,
            2
        )

    @computed_field
    @property
    def percentage_of_images_with_detection(self) -> float:
        """Percentage of images with detections"""
        return round(
            (self.images_with_detections / self.total_images * 100) if self.total_images > 0 else 0,
            2
        )


class CVProcessingSummaryStats(BaseModel):
    overall_stats: CVProcessingStats
    by_archive_stats: dict[str, dict]
    model_id: str
    confidence_threshold: float
    batch_size: int
