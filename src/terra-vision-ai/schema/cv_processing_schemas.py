from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field, field_validator

from schema.cv_stats import CVDataProcessingSummaryStats, CVDataProcessingSummaryStatsPreview


class CVDataProcessingJob(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: str  # UUID string
    summary: CVDataProcessingSummaryStats
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_mongo(self) -> dict:
        """Converts model to a dict with _id for MongoDB"""
        return self.model_dump(by_alias=True, mode="json", exclude_none=True)

    @field_validator("user_id")
    @classmethod
    def strip_user_id(cls, v: str) -> str:
        return v.strip()


class CVDataProcessingJobPreview(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    user_id: str
    summary: CVDataProcessingSummaryStatsPreview
    created_at: datetime