import io
import zipfile

from fastapi import HTTPException

from config import MINIO_BUCKET_NAME, MINIO_CLIENT
from service.minio_service import MINIO_SERVICE


class CVDataStorageService:
    def __init__(self):
        self.__minio_service = MINIO_SERVICE
        self.__minio_client = MINIO_CLIENT

    def save_file(
            self,
            user_id: str,
            cv_processing_job_timestamp: str,
            cv_data_type: str,
            archive_name_no_ext: str,
            filename: str,
            image_bytes: bytes
    ) -> str:
        return self.__minio_service.save_file(
            user_id=user_id,
            cv_processing_job_timestamp=cv_processing_job_timestamp,
            cv_data_type=cv_data_type,
            archive_name=archive_name_no_ext,
            filename=filename,
            data=image_bytes,
        )

    def get_data_as_zip_from_storage(
            self,
            user_id: str,
            cv_processing_job_timestamp: str,
            cv_data_type: str,
            bucket: str = MINIO_BUCKET_NAME,
    ) -> io.BytesIO:
        """
        Builds an in-memory zip where each archive folder becomes a nested .zip:

        result.zip
        ├── archive_one.zip
        │   ├── img1.jpg
        │   └── img2.jpg
        └── archive_two.zip
            └── img3.jpg
        """
        grouped = self.__list_objects_grouped_by_archive(user_id, cv_processing_job_timestamp, cv_data_type, bucket)
        if not grouped: raise HTTPException(status_code=404, detail=f"No {cv_data_type} images found for this request.")

        outer_buffer = io.BytesIO()
        with zipfile.ZipFile(outer_buffer, "w", zipfile.ZIP_DEFLATED) as outer_zip:
            for archive_name, object_names in grouped.items():
                inner_buffer = io.BytesIO()
                with zipfile.ZipFile(inner_buffer, "w", zipfile.ZIP_DEFLATED) as inner_zip:
                    for object_name in object_names:
                        filename = object_name.split("/")[-1]
                        response = self.__minio_client.get_object(bucket, object_name)
                        inner_zip.writestr(filename, response.read())

                inner_buffer.seek(0)
                outer_zip.writestr(f"{archive_name}.zip", inner_buffer.getvalue())

        outer_buffer.seek(0)
        return outer_buffer

    def __list_objects_grouped_by_archive(
            self,
            user_id: str,
            cv_processing_job_timestamp: str,
            cv_data_type: str,
            bucket: str = MINIO_BUCKET_NAME,
    ) -> dict[str, list[str]]:
        """
        Returns all MinIO objects under {user_id}/{request_dt}/{stage}/
        grouped by archive folder:
            { "archive_one": ["user.../archive_one/img1.jpg", ...] }
        """
        prefix = f"{user_id}/{cv_processing_job_timestamp}/{cv_data_type}/"
        objects = self.__minio_client.list_objects(bucket, prefix=prefix, recursive=True)

        grouped: dict[str, list[str]] = {}
        for obj in objects:
            relative = obj.object_name[len(prefix):]
            parts = relative.split("/", 1)
            if len(parts) < 2:
                continue
            archive_name, _ = parts
            grouped.setdefault(archive_name, []).append(obj.object_name)

        return grouped


CV_DATA_STORAGE_SERVICE = CVDataStorageService()