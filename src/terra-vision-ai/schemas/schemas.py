from typing import List
from pydantic import BaseModel, Field

class CVModelDescription(BaseModel):
    id: str = Field(description="Unique identifier for the AI model")
    name: str = Field(description="Human-readable display name")
    description: str = Field(description="Detailed description of model capabilities")


class CVModelDescriptionResponse(BaseModel):
    lang: str = Field(description="Language code of the model")
    models: List[CVModelDescription] = Field(description="List of AI models")