from pydantic import BaseModel, Field, ConfigDict


class CVModelDescription(BaseModel):
    id: str = Field(description="Unique identifier for the AI model")
    name: str = Field(description="Human-readable display name")
    description: str = Field(description="Detailed description of model capabilities")

