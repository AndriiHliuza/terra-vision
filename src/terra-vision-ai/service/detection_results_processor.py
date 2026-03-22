import io
import logging
import zipfile
from datetime import datetime
from logging import Logger
from typing import Optional

import cv2
from starlette.responses import StreamingResponse
from ultralytics.engine.results import Results

from config.minio_config import MINIO_BUCKET_NAME, MINIO_CLIENT
from schema.file_schemas import File
from schema.result_schemas import ArchiveProcessingResult, AnnotatedArchive
from schema.stats_schemas import DetectionBox, ImageStats, ClassStats, AggregatedStats, DetectionStats
from utils import file_utils


class DetectionResultsProcessor:
    def __init__(self):
        self.__logger: Logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")

    def build_detection_stats(
            self,
            processing_results: list[ArchiveProcessingResult],
            user_id: Optional[str],
            model_id: str,
            confidence_threshold: float
    ) -> DetectionStats:
        self.__logger.info(f"Building stats for user with id={user_id}")
        per_archive_stats = {
            archive_result.archive_name: DetectionResultsProcessor.__build_aggregated_stats(archive_result.images,
                                                                               archive_result.results)
            for archive_result in processing_results
        }

        all_images: list[File] = [img for archive_result in processing_results for img in archive_result.images]
        all_results: list[Results] = [res for archive_result in processing_results for res in archive_result.results]

        return DetectionStats(
            user_id=user_id,
            model_id=model_id,
            confidence_threshold=confidence_threshold,
            overall_stats=DetectionResultsProcessor.__build_aggregated_stats(all_images, all_results),
            per_archive_stats=per_archive_stats,
        )

    def get_annotated_archives(self, processing_results: list[ArchiveProcessingResult]) -> list[AnnotatedArchive]:
        self.__logger.info(f"Creating annotated images using detection results")
        annotated_archives: list[AnnotatedArchive] = []

        for archive_result in processing_results:
            archive_name = archive_result.archive_name.replace(".zip", "")
            annotated_files: list[File] = []

            for file, result in zip(archive_result.images, archive_result.results):
                annotated_image = result.plot()
                file_extension = file_utils.get_file_extension(file)
                success, encoded = cv2.imencode(file_extension, annotated_image)
                if not success:
                    self.__logger.warning(f"Failed to encode image {file.filename} - skipping")
                    continue
                annotated_files.append(File(file.filename, encoded.tobytes()))

            annotated_archives.append(AnnotatedArchive(archive_name, annotated_files))

        return annotated_archives

    def save_to_minio(
            self,
            user_id: str,
            stats_id: str,
            processed_at: datetime,
            processing_results: list[ArchiveProcessingResult],
            annotated_archives: list[AnnotatedArchive]
    ) -> str:
        timestamp = processed_at.strftime("%Y-%m-%dT%H-%M-%S")
        base_path = f"{user_id}/{timestamp}_{stats_id}"
        annotated_map: dict[str, AnnotatedArchive] = {
            annotated_archive.archive_name: annotated_archive
            for annotated_archive in annotated_archives
        }

        for archive_result in processing_results:
            archive_name = archive_result.archive_name.replace(".zip", "")

            for file in archive_result.images:
                filename_only = file.filename.split("/")[-1]
                object_name = f"{base_path}/original/{archive_name}/{filename_only}"
                file_extension = file.filename.split(".")[-1]
                data = io.BytesIO(file.bytes)
                MINIO_CLIENT.put_object(
                    MINIO_BUCKET_NAME, object_name, data, len(file.bytes),
                    content_type=f"image/{file_extension}"
                )
            self.__logger.info(
                f"Saved original images to Minio | Bucket name: {MINIO_BUCKET_NAME} | path={base_path}/original/{archive_name}")

            for file in annotated_map[archive_name].images:
                filename_only = file.filename.split("/")[-1]
                object_name = f"{base_path}/processed/{archive_name}/{filename_only}"
                ext = file.filename.rsplit(".", 1)[-1].lower()
                data = io.BytesIO(file.bytes)
                MINIO_CLIENT.put_object(
                    MINIO_BUCKET_NAME, object_name, data, len(file.bytes),
                    content_type=f"image/{ext}"
                )
            self.__logger.info(
                f"Saved processed images to Minio | Bucket name: {MINIO_BUCKET_NAME} | path={base_path}/processed/{archive_name}")

        self.__logger.info(f"Saved all original and processed images to Minio | Bucket name: {MINIO_BUCKET_NAME} | path={base_path}/...")

        return base_path

    def build_response_archive(self, processing_results: list[ArchiveProcessingResult]) -> StreamingResponse:
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as result_zip:
            for archive_result in processing_results:
                archive_name = archive_result.archive_name.replace(".zip", "")
                inner_zip_buffer = io.BytesIO()

                with zipfile.ZipFile(inner_zip_buffer, "w", zipfile.ZIP_STORED) as inner_zip:
                    for file, result in zip(archive_result.images, archive_result.results):
                        filename_only = file.filename.split("/")[-1]
                        annotated_image = result.plot()
                        file_extension = file_utils.get_file_extension(file)

                        success, encoded = cv2.imencode(file_extension, annotated_image)
                        if not success:
                            self.__logger.warning(f"Failed to encode image {filename_only} - skipping")
                            continue
                        inner_zip.writestr(filename_only, encoded.tobytes())

                result_zip.writestr(f"{archive_name}.zip", inner_zip_buffer.getvalue())

        zip_buffer.seek(0)
        self.__logger.info(f"Returning composed archive | Archive name: results.zip | Number of archives in composed archive: {len(processing_results)}")
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=results.zip"}
        )

    # ------------ private methods ------------

    @staticmethod
    def __build_aggregated_stats(images: list[File], results: list[Results]) -> AggregatedStats:
        aggregated_stats: AggregatedStats = AggregatedStats(total_images=len(images))
        confidence_sums_per_class: dict[str, float] = {}

        for file, result in zip(images, results):
            image_stats = DetectionResultsProcessor.__build_image_stats(file.filename, result)
            aggregated_stats.per_image_stats.append(image_stats)

            aggregated_stats.total_detections += image_stats.num_detections
            aggregated_stats.processing_time_seconds += sum(result.speed.values())  # in milliseconds

            if image_stats.num_detections > 0:
                aggregated_stats.images_with_detections += 1

            classes_in_image = set()
            for detection in image_stats.detections:
                cls_name = detection.cls_name
                if cls_name not in aggregated_stats.per_class_stats:
                    aggregated_stats.per_class_stats[cls_name] = ClassStats(cls_name=cls_name)
                    confidence_sums_per_class[cls_name] = 0.0

                cls_stats = aggregated_stats.per_class_stats[cls_name]
                cls_stats.total_detections += 1
                confidence_sums_per_class[cls_name] += detection.confidence
                cls_stats.min_confidence = (
                    min(cls_stats.min_confidence, detection.confidence)
                    if cls_stats.min_confidence > 0
                    else detection.confidence
                )
                cls_stats.max_confidence = max(cls_stats.max_confidence, detection.confidence)
                classes_in_image.add(cls_name)

            for cls_name in classes_in_image:
                aggregated_stats.per_class_stats[cls_name].images_containing_class += 1

        for cls_name, cls_stats in aggregated_stats.per_class_stats.items():
            cls_stats.average_confidence = round(confidence_sums_per_class[cls_name] / cls_stats.total_detections, 4)

        all_confidences = [detection.confidence for img in aggregated_stats.per_image_stats for detection in
                           img.detections]
        if all_confidences:
            aggregated_stats.average_confidence = round(sum(all_confidences) / len(all_confidences), 4)
            aggregated_stats.min_confidence = round(min(all_confidences), 4)
            aggregated_stats.max_confidence = round(max(all_confidences), 4)

        return aggregated_stats

    @staticmethod
    def __build_image_stats(filename: str, result: Results) -> ImageStats:
        confidences = result.boxes.conf.tolist()
        classes = result.boxes.cls.tolist()
        coordinates = result.boxes.xyxy.tolist()
        names = result.names

        detections = [
            DetectionBox(
                cls_name=names[int(cls)],
                confidence=round(conf, 4),
                x1=coords[0], y1=coords[1],
                x2=coords[2], y2=coords[3]
            )
            for conf, cls, coords in zip(confidences, classes, coordinates)
        ]

        num_detections = len(detections)
        return ImageStats(
            filename=filename,
            num_detections=num_detections,
            average_confidence=round(sum(confidences) / num_detections, 4) if num_detections > 0 else 0.0,
            max_confidence=round(max(confidences), 4) if num_detections > 0 else 0.0,
            min_confidence=round(min(confidences), 4) if num_detections > 0 else 0.0,
            detections=detections
        )


DETECTION_RESULTS_PROCESSOR = DetectionResultsProcessor()
