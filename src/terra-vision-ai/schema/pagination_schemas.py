from typing import Generic
from pydantic import BaseModel

from config.application_config import T


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total_items: int
    page_number: int
    page_size: int
    total_pages: int
