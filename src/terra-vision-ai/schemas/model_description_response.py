from typing import List

from pydantic import BaseModel, Field

from schemas import CVModelDescription


class CVModelDescriptionResponse(BaseModel):
    lang: str = Field(description="Language code of the model")
    models: List[CVModelDescription] = Field(description="List of AI models")