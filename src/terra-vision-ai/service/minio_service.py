import io
import logging
import math
import zipfile
from logging import Logger

from fastapi import HTTPException
from starlette.responses import StreamingResponse

from config.minio_config import MINIO_CLIENT, MINIO_BUCKET_NAME
from config.mongo_config import MONGO_CLIENT, MONGO_DB, MONGO_STATS_COLLECTION
from schema.file_schemas import ArchiveDetails, ImageType
from schema.pagination_schemas import PaginatedResponse


class MinioService:
    def __init__(self):
        self.__logger: Logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
        self.__stats_collection = MONGO_CLIENT.get_database(MONGO_DB).get_collection(MONGO_STATS_COLLECTION)

    async def get_archives(
            self,
            stats_id: str,
            user_id: str,
            image_type: ImageType,
            page_number: int,
            page_size: int
    ) -> PaginatedResponse[ArchiveDetails]:
        self.__logger.info(f"Getting archives' details | "
                           f"stats_id: {stats_id}, user_id: {user_id} | "
                           f"image_type: {image_type} | "
                           f"page_number: {page_number}, page_size: {page_size}")
        base_minio_path = await self.__get_base_minio_path(stats_id, user_id)
        prefix = f"{base_minio_path}/{image_type.value}/"

        archives = MINIO_CLIENT.list_objects(MINIO_BUCKET_NAME, prefix=prefix, recursive=True)
        archive_counts: dict[str, int] = {}

        for archive in archives:
            parts = archive.object_name.replace(prefix, "").split("/")
            if len(parts) < 2: continue
            archive_name = parts[0]
            archive_counts[archive_name] = archive_counts.get(archive_name, 0) + 1

        all_archives = sorted([
            ArchiveDetails(archive_name=name, image_count=count)
            for name, count in archive_counts.items()
        ], key=lambda a: a.archive_name)

        total_archives = len(all_archives)
        skip = (page_number - 1) * page_size

        return PaginatedResponse[ArchiveDetails](
            items=all_archives[skip:skip + page_size],
            total_items=total_archives,
            page_number=page_number,
            page_size=page_size,
            total_pages=math.ceil(total_archives / page_size) if total_archives > 0 else 0
        )

    async def get_paginated_archive(
            self,
            stats_id: str,
            user_id: str,
            archive_name: str,
            image_type: ImageType,
            page_number: int,
            page_size: int
    ) -> StreamingResponse:
        self.__logger.info(f"Getting archive | "
                           f"stats_id: {stats_id}, user_id: {user_id} | "
                           f"archive_name: {archive_name} | "
                           f"image_type: {image_type} | "
                           f"page_number: {page_number}, page_size: {page_size}")
        base_minio_path = await self.__get_base_minio_path(stats_id, user_id)
        prefix = f"{base_minio_path}/{image_type.value}/{archive_name}/"

        all_images = sorted(
            MINIO_CLIENT.list_objects(MINIO_BUCKET_NAME, prefix=prefix, recursive=True),
            key=lambda img: img.object_name
        )

        skip = (page_number - 1) * page_size
        paginated_objects = all_images[skip:skip + page_size]

        if not paginated_objects: raise HTTPException(status_code=404, detail=f"No images found for page={page_number} | User: {user_id}")

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for obj in paginated_objects:
                filename = obj.object_name.split("/")[-1]
                response = MINIO_CLIENT.get_object(MINIO_BUCKET_NAME, obj.object_name)
                zip_file.writestr(filename, response.read())

        total_images = len(all_images)
        zip_buffer.seek(0)

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f"attachment; filename={archive_name}_page{page_number}.zip",
                "X-Total-Items": str(total_images),
                "X-Total-Pages": str(math.ceil(total_images / page_size) if total_images > 0 else 0),
                "X-Page-Number": str(page_number),
                "X-Page-Size": str(page_size),
                "Access-Control-Expose-Headers": "X-Total, X-Total-Pages, X-Page, X-Page-Size"
            }
        )

    # ------------ private methods ------------

    async def __get_base_minio_path(self, stats_id: str, user_id: str) -> str:
        item = await self.__stats_collection.find_one(
            {"_id": stats_id},
            {"base_minio_path": True, "user_id": user_id}
        )
        if item is None: raise HTTPException(status_code=404, detail=f"Stats with id={stats_id} not found")

        if item.get("user_id") != user_id: raise HTTPException(status_code=403, detail="Access denied")

        base_minio_path = item.get("base_minio_path")
        if not base_minio_path: raise HTTPException(status_code=404, detail=f"No base MinIO path found for stats with id={stats_id}")

        return base_minio_path

MINIO_SERVICE = MinioService()