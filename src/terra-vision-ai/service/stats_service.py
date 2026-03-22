import logging
import math
from datetime import datetime
from logging import Logger
from typing import Any

from fastapi import HTTPException

from config.mongo_config import MONGO_CLIENT, MONGO_STATS_COLLECTION, MONGO_DB
from schema.pagination_schemas import PaginatedResponse
from schema.stats_schemas import DetectionStats, DetectionStatsPreview


class StatsService:
    def __init__(self):
        self.__logger: Logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
        self.__stats_collection = MONGO_CLIENT.get_database(MONGO_DB).get_collection(MONGO_STATS_COLLECTION)

    async def save_stats(self, stats: DetectionStats):
        self.__logger.info(f"Saving stats to mongo for user with id={stats.user_id} | stats_id={stats.id}")
        await self.__stats_collection.insert_one(stats.model_dump(by_alias=True, mode="json"))

    async def get_stats(
            self,
            user_id: str,
            model_id: str,
            created_at_from: datetime,
            created_at_to: datetime,
            sort_by: str,
            sort_order: str,
            page_number: int,
            page_size: int
    ) -> PaginatedResponse[DetectionStatsPreview]:
        self.__logger.info(f"Getting stats | "
                           f"user_id={user_id}, model_id={model_id} | "
                           f"created_at_from={created_at_from}, created_at_to={created_at_to} | "
                           f"sort_by={sort_by}, sort_order={sort_order} | "
                           f"page_number={page_number} | page_size={page_size}")
        query: dict[str, Any] = await StatsService.__build_get_stats_query(
            user_id,
            model_id,
            created_at_from,
            created_at_to)

        sort_direction = -1 if sort_order == "desc" else 1
        skip = (page_number - 1) * page_size
        total_items = await self.__stats_collection.count_documents(query)
        cursor = (self.__stats_collection.find(
            query,
            {
                "overall_stats.per_class_stats": False,
                "overall_stats.per_image_stats": False,
                "per_archive_stats": False,
                "base_minio_path": False
            }
        ).sort(sort_by, sort_direction).skip(skip).limit(page_size))
        items = await cursor.to_list(length=page_size)

        for item in items: item["id"] = str(item.pop("_id"))
        total_pages = math.ceil(total_items / page_size) if total_items > 0 else 0

        return PaginatedResponse[DetectionStatsPreview](
            items=items,
            total_items=total_items,
            page_number=page_number,
            page_size=page_size,
            total_pages=total_pages
        )

    async def get_stats_by_id(self, stats_id: str, user_id: str) -> DetectionStats:
        self.__logger.info(f"Getting stats by id={stats_id} | user_id={user_id}")
        item = await self.__stats_collection.find_one({"_id": stats_id})
        if item is None: raise HTTPException(status_code=404, detail=f"Stats with id={stats_id} not found")
        if item.get("user_id") != user_id: raise HTTPException(status_code=403, detail="Access denied")
        return DetectionStats(**item)

    # ------------ private methods ------------

    @staticmethod
    async def __build_get_stats_query(
            user_id: str,
            model_id: str,
            created_at_from: datetime,
            created_at_to: datetime
    ) -> dict[str, Any]:
        query: dict[str, Any] = {"user_id": user_id}
        if model_id: query["model_id"] = model_id
        if created_at_from or created_at_to:
            query["created_at"] = {}
            if created_at_from: query["created_at"]["$gte"] = created_at_from
            if created_at_to: query["created_at"]["$lte"] = created_at_to

        return query


STATS_SERVICE: StatsService = StatsService()
