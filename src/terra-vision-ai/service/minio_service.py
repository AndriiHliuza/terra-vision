import io
import logging

from minio import S3Error

from config import MINIO_CLIENT
from config.minio_config import MINIO_BUCKET_NAME

LOGGER = logging.getLogger(__name__)

def _build_path(
        user_id: str,
        datetime: str,
        stage: str,  # "original" | "processed"
        archive_name: str,
        filename: str,
) -> str:
    return f"{user_id}/{datetime}/{stage}/{archive_name}/{filename}"

class MinioService:
    def __init__(self, bucket_name: str) -> None:
        self.__logger = LOGGER
        self.__client = MINIO_CLIENT
        self.__ensure_bucket_exists(bucket_name)
        self.__bucket_name = bucket_name

    def __ensure_bucket_exists(self, bucket_name):
        if not self.__client.bucket_exists(bucket_name):
            self.__client.make_bucket(bucket_name)
            self.__logger.info(f"Created MinIO bucket: {bucket_name}")

    def save_file(
            self,
            user_id: str,
            datetime: str,
            stage: str,
            archive_name: str,
            filename: str,
            data: bytes,
            content_type: str = "application/octet-stream",
    ) -> str:
        object_name = _build_path(user_id, datetime, stage, archive_name, filename)
        try:
            self.__client.put_object(
                bucket_name=self.__bucket_name,
                object_name=object_name,
                data=io.BytesIO(data),
                length=len(data),
                content_type=content_type,
            )
            self.__logger.info(f"Saved to MinIO: {object_name}")
        except S3Error as e:
            self.__logger.error(f"Failed to save {object_name} to MinIO: {e}")
            raise
        return object_name

MINIO_SERVICE = MinioService(MINIO_BUCKET_NAME)