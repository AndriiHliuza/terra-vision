import io
import logging
import time
import zipfile

from fastapi import UploadFile, HTTPException
from starlette.responses import StreamingResponse
from schemas import CVDataProcessingStats, CVDataProcessingSummaryStats, CVClassStats

from service.yolo_service import YOLO_SERVICE
from service.cv_processing_job_service import CV_PROCESSING_JOB_SERVICE

from service import file_utils


LOGGER = logging.getLogger(__name__)


class CVService:
    def __init__(self):
        self.__logger = LOGGER
        self.__yolo_service = YOLO_SERVICE
        self.__processing_job_service = CV_PROCESSING_JOB_SERVICE

    async def detect_objects(
            self,
            user_id: str,
            model_id: str,
            archives: list[UploadFile],
            confidence: float = 0.25,
            batch_size: int = 16,
    ):
        # Aggregate stats across all archives
        overall_start = time.time()
        overall_stats = CVDataProcessingStats()
        per_archive_stats = {}

        # Log the start of detection
        _log__start_cv_object_detection(model_id, archives, confidence, batch_size)

        # Check if entity exists both in database and file system to load it (entity)
        await _check_model_exists_in_db_and_file_system(model_id)

        result_zip_archive_buffer = io.BytesIO()
        with zipfile.ZipFile(result_zip_archive_buffer, "w", zipfile.ZIP_DEFLATED) as result_zip:
            for archive in archives:
                image_data_list, non_image_files = await file_utils.get_images_and_not_images_from_archive(archive)

                # Process all images in batches
                self.__logger.info(f"Processing {len(image_data_list)} images from {archive.filename}")
                processed_images, batch_stats = await self.__yolo_service.process_images_in_batches(
                    image_data_list,
                    model_id,
                    confidence,
                    batch_size
                )

                overall_stats, per_archive_stats = _update_overall_and__per_archive_stats_after_inner_archive_processing(archive, per_archive_stats, batch_stats, overall_stats)

                files_to_save: dict[str, bytes] = {**processed_images, **non_image_files}
                result_zip = file_utils.save_files_as_zip_to_result_zip(files_to_save, archive.filename, result_zip)

            # Calculate overall average confidence from per_image_stats
            all_image_confidences = [
                img.average_confidence
                for img in overall_stats.per_image_stats
                if img.is_successfully_processed and img.num_detections > 0
            ]
            if all_image_confidences:
                overall_stats.average_confidence = round(
                    sum(all_image_confidences) / len(all_image_confidences),
                    3
                )

            overall_stats.processing_time_seconds = time.time() - overall_start
            stats_summary = CVDataProcessingSummaryStats(
                overall_stats=overall_stats,
                by_archive_stats=per_archive_stats,
                model_id=model_id,
                confidence_threshold=confidence,
                batch_size=batch_size
            )

            if user_id: await self.__processing_job_service.create_and_save_processing_job(user_id, stats_summary)

            # Add stats summary file to the zip
            result_zip.writestr(
                "processing_stats.json",
                stats_summary.model_dump_json(indent=2)  # or stats_summary.json(indent=2) for Pydantic v1
            )

        result_zip_archive_buffer.seek(0)

        _log__end_cv_object_detection(model_id, overall_stats)
        return StreamingResponse(
            result_zip_archive_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=processed_archives.zip"
            }
        )


CV_SERVICE = CVService()


# Helper functions
def _log__start_cv_object_detection(
        model_id: str,
        archives: list[UploadFile],
        confidence: float = 0.25,
        batch_size: int = 16
):
    LOGGER.info(f"Starting processing archives: {[a.filename for a in archives]}")
    LOGGER.info(f"Total number of archives to process: {len(archives)}")
    LOGGER.info(f"Model used: {model_id}")
    LOGGER.info(f"Confidence threshold: {confidence}")
    LOGGER.info(f"Batch size: {batch_size}")
    LOGGER.info(f"Using {YOLO_SERVICE.get_pytorch_device()} for computations. Processor: {YOLO_SERVICE.get_pytorch_device_name()}")


def _log__end_cv_object_detection(
        model_id: str,
        overall_stats: CVDataProcessingStats):
    # Build detailed log message
    class_info = ", ".join([
        f"{stats.class_name}: {stats.total_detections} detections "
        f"(avg conf: {stats.average_confidence:.3f}, "
        f"range: {stats.min_confidence:.3f}-{stats.max_confidence:.3f}) "
        f"in {stats.images_containing_class} images"
        for stats in overall_stats.per_class_stats.values()
    ])
    LOGGER.info(
        f"Processing finished using {model_id}. "
        f"Processed {overall_stats.successfully_processed_images}/{overall_stats.total_images} images "
        f"with {overall_stats.total_detections} total detections, "
        f"({overall_stats.images_with_detections} images with detections). "
        f"(overall avg confidence: {overall_stats.average_confidence:.3f}). "
        f"Average detections per image: {overall_stats.average_detections_per_image}%. "
        f"Percentage of images with detection: {overall_stats.percentage_of_images_with_detection}%. "
        f"Class breakdown: {class_info if class_info else 'No detections'}. "
        "Sending results back to client."
    )


async def _check_model_exists_in_db_and_file_system(model_id: str):
    try:
        await YOLO_SERVICE.get_model(model_id)
    except HTTPException as e:
        raise e


def _update_overall_and__per_archive_stats_after_inner_archive_processing(
    archive,
    per_archive_stats,
    batch_stats: CVDataProcessingStats,
    overall_stats: CVDataProcessingStats,
):
    per_archive_stats[archive.filename] = batch_stats.model_dump() # Store per-archive stats

    # Aggregate overall stats
    overall_stats.total_images += batch_stats.total_images
    overall_stats.successfully_processed_images += batch_stats.successfully_processed_images
    overall_stats.failed_images += batch_stats.failed_images
    overall_stats.total_detections += batch_stats.total_detections
    overall_stats.images_with_detections += batch_stats.images_with_detections
    overall_stats.per_image_stats.extend(batch_stats.per_image_stats)

    # Merge class statistics
    for class_name, class_stat in batch_stats.per_class_stats.items():
        if class_name not in overall_stats.per_class_stats:
            overall_stats.per_class_stats[class_name] = CVClassStats(class_name=class_name)

        overall_stats.per_class_stats[class_name].total_detections += class_stat.total_detections
        overall_stats.per_class_stats[class_name].images_containing_class += class_stat.images_containing_class
        overall_stats.per_class_stats[class_name].confidence_sum += class_stat.confidence_sum
        overall_stats.per_class_stats[class_name].min_confidence = min(
            overall_stats.per_class_stats[class_name].min_confidence,
            class_stat.min_confidence
        )
        overall_stats.per_class_stats[class_name].max_confidence = max(
            overall_stats.per_class_stats[class_name].max_confidence,
            class_stat.max_confidence
        )

    # Calculate average confidence for each class in overall stats
    for class_name, class_stat in overall_stats.per_class_stats.items():
        if class_stat.total_detections > 0:
            class_stat.average_confidence = round(
                class_stat.confidence_sum / class_stat.total_detections,
                3
            )

    return overall_stats, per_archive_stats