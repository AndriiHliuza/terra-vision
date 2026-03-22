from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query

from schema.pagination_schemas import PaginatedResponse
from schema.stats_schemas import DetectionStats, DetectionStatsPreview
from service.stats_service import STATS_SERVICE

router = APIRouter(prefix="/stats")


@router.get("", response_model=PaginatedResponse[DetectionStatsPreview])
async def get_stats(
        user_id: str = Query(...),
        model_id: Optional[str] = Query(None),
        created_at_from: Optional[datetime] = Query(None),
        created_at_to: Optional[datetime] = Query(None),
        sort_by: Optional[str] = Query("created_at"),
        sort_order: str = Query("desc"),
        page_number: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100),
) -> PaginatedResponse[DetectionStatsPreview]:
    return await STATS_SERVICE.get_stats(
        user_id,
        model_id,
        created_at_from,
        created_at_to,
        sort_by,
        sort_order,
        page_number,
        page_size,
    )

@router.get("/{stats_id}", response_model=DetectionStats)
async  def get_stats_by_id(
        stats_id: str,
        user_id: str = Query(...)
) -> DetectionStats:
    return await STATS_SERVICE.get_stats_by_id(stats_id, user_id)