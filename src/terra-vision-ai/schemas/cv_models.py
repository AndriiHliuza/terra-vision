from pydantic import BaseModel, Field


class CVModelDescription(BaseModel):
    id: str = Field(description="Unique identifier for the AI entity")
    name: str = Field(description="Human-readable display name")
    description: str = Field(description="Detailed description of entity capabilities")


class CVModelDescriptionResponse(BaseModel):
    lang: str = Field(description="Language code of the entity")
    cv_models: list[CVModelDescription] = Field(description="List of AI entity")
