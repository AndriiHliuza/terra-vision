from fastapi import APIRouter, Query
from starlette.responses import StreamingResponse

from schema.file_schemas import ArchiveDetails, ImageType
from schema.pagination_schemas import PaginatedResponse
from service.minio_service import MINIO_SERVICE

router = APIRouter(prefix="/storage")

@router.get("/{stats_id}/original/archives", response_model=PaginatedResponse[ArchiveDetails])
async def get_original_archives(
        stats_id: str,
        user_id: str = Query(...),
        page_number: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100)
) -> PaginatedResponse[ArchiveDetails]:
    return await MINIO_SERVICE.get_archives(stats_id, user_id, ImageType.ORIGINAL, page_number, page_size)

@router.get("/{stats_id}/processed/archives", response_model=PaginatedResponse[ArchiveDetails])
async def get_processed_archives(
        stats_id: str,
        user_id: str = Query(...),
        page_number: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100)
) -> PaginatedResponse[ArchiveDetails]:
    return await MINIO_SERVICE.get_archives(stats_id, user_id, ImageType.PROCESSED, page_number, page_size)

@router.get("/{stats_id}/original/archives/images", response_class=StreamingResponse)
async def get_original_archive_images(
        stats_id: str,
        archive_name: str = Query(...),
        user_id: str = Query(...),
        page_number: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100)
) -> StreamingResponse:
    return await MINIO_SERVICE.get_paginated_archive(
        stats_id, user_id, archive_name, ImageType.ORIGINAL, page_number, page_size
    )


@router.get("/{stats_id}/processed/archives/images", response_class=StreamingResponse)
async def get_processed_archive_images(
        stats_id: str,
        archive_name: str = Query(...),
        user_id: str = Query(...),
        page_number: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100)
) -> StreamingResponse:
    return await MINIO_SERVICE.get_paginated_archive(
        stats_id, user_id, archive_name, ImageType.PROCESSED, page_number, page_size
    )