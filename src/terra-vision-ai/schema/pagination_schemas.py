from typing import Generic
from pydantic import BaseModel
from config import T


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int