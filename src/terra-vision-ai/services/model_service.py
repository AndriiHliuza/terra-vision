from typing import List, Optional, Dict
from config import DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES
from config import mongo_db
from repository import models_repository
from schemas import CVModelDescription, CVModelDescriptionResponse

async def check_model_exists_by_id(model_id: str) -> Optional[dict]:
    return await models_repository.exists_by_id(model_id)

async def get_models_info_in_specified_language(lang: str = DEFAULT_LANGUAGE) -> CVModelDescriptionResponse:
    localized_models: List[CVModelDescription] = []
    if lang not in SUPPORTED_LANGUAGES: lang = DEFAULT_LANGUAGE

    cursor = mongo_db.models.find({}, {f"translations.{lang}": 1})
    async for model_document in cursor:
        model_id = model_document["_id"]
        translations = model_document.get("translations", {}).get(lang, {})

        localized_models.append(
            CVModelDescription(
                id=model_id,
                name=translations.get("displayName", model_id),
                description=translations.get("description", model_id),
            )
        )

    return CVModelDescriptionResponse(lang=lang, models=localized_models)

# '''
# Function for computer vision tasks
# '''
# async def process_archives_and_detect_objects_using_cv(
#         model_id: str,
#         archives: List[UploadFile],
#         confidence: float = 0.25,
#         batch_size: int = 16
# ):
#     overall_start = time.time()
#     _log_start__archive_processing_and_cv_detection(model_id, archives, confidence, batch_size)
#     await _check_model_exists_in_db_and_file_system(model_id)
#
#     # Aggregate stats across all archives
#     overall_stats = ProcessingStats()
#     archive_stats = {}
#
#     result_zip_archive_buffer = io.BytesIO()
#     with zipfile.ZipFile(result_zip_archive_buffer, "w", zipfile.ZIP_DEFLATED) as result_zip:
#         for archive in archives:
#             image_data_list, non_image_files = await _get_images_and_not_images_from_archive(archive)
#
#             # Process all images in batches
#             logger.info(f"Processing {len(image_data_list)} images from {archive.filename}")
#             processed_images, batch_stats = await YOLO_SERVICE.process_images_in_batches(
#                 image_data_list,
#                 model_id,
#                 confidence,
#                 batch_size
#             )
#
#             overall_stats, archive_stats = _build_stats(archive, archive_stats, batch_stats, overall_stats)
#
#             _write_files_as_zip_archive_to_result_zip_archive(
#                 {**processed_images, **non_image_files},
#                 archive.filename,
#                 result_zip
#             )
#
#         # Add stats summary file to the zip
#         overall_stats.processing_time_seconds = time.time() - overall_start
#
#         stats_summary = ProcessingSummary(
#             overall=overall_stats,
#             by_archive=archive_stats,
#             model_id=model_id,
#             confidence_threshold=confidence,
#             batch_size=batch_size
#         )
#
#         result_zip.writestr(
#             "processing_stats.json",
#             stats_summary.model_dump_json(indent=2)  # or stats_summary.json(indent=2) for Pydantic v1
#         )
#
#     result_zip_archive_buffer.seek(0)
#
#     _log_end__archive_processing_and_cv_detection(model_id, overall_stats)
#     return StreamingResponse(
#         result_zip_archive_buffer,
#         media_type="application/zip",
#         headers={
#             "Content-Disposition": "attachment; filename=processed_archives.zip"
#         }
#     )
#
# def _build_stats(
#     archive,
#     archive_stats,
#     batch_stats: ProcessingStats,
#     overall_stats: ProcessingStats,
# ):
#     # Store per-archive stats
#     archive_stats[archive.filename] = batch_stats.model_dump()
#
#     # Aggregate overall stats
#     overall_stats.total_images += batch_stats.total_images
#     overall_stats.successfully_processed += batch_stats.successfully_processed
#     overall_stats.failed_images += batch_stats.failed_images
#     overall_stats.total_detections += batch_stats.total_detections
#     overall_stats.images_with_detections += batch_stats.images_with_detections
#
#     # Merge class statistics
#     for class_name, class_stat in batch_stats.class_statistics.items():
#         if class_name not in overall_stats.class_statistics:
#             overall_stats.class_statistics[class_name] = ClassStats(class_name=class_name)
#
#         overall_stats.class_statistics[class_name].total_detections += class_stat.total_detections
#         overall_stats.class_statistics[class_name].images_with_class += class_stat.images_with_class
#
#     return overall_stats, archive_stats
#
# def _log_start__archive_processing_and_cv_detection(
#         model_id: str,
#         archives: List[UploadFile],
#         confidence: float = 0.25,
#         batch_size: int = 16
# ):
#     logger.info(f"Starting processing archives: {[a.filename for a in archives]}")
#     logger.info(f"Total number of archives to process: {len(archives)}")
#     logger.info(f"Model used: {model_id}")
#     logger.info(f"Confidence threshold: {confidence}")
#     logger.info(f"Batch size: {batch_size}")
#     logger.info(f"Using {YOLO_SERVICE.get_pytorch_device()} for computations. Processor: {YOLO_SERVICE.get_pytorch_device_name()}")
#
#
# def _log_end__archive_processing_and_cv_detection(model_id: str, overall_stats: ProcessingStats):
#     class_info = ", ".join([
#         f"{stats.class_name}: {stats.total_detections} detections in {stats.images_with_class} images"
#         for stats in overall_stats.class_statistics.values()
#     ])
#     logger.info(
#         f"Processing finished using {model_id}. "
#         f"Processed {overall_stats.successfully_processed}/{overall_stats.total_images} images "
#         f"with {overall_stats.total_detections} total detections "
#         f"({overall_stats.images_with_detections} images with detections). "
#         f"Class breakdown: {class_info if class_info else 'No detections'}. "
#         "Sending results back to client."
#     )
#
# async def _check_model_exists_in_db_and_file_system(model_id: str):
#     # Validate model exists before processing
#     try:
#         await YOLO_SERVICE.get_model(model_id)
#     except HTTPException as e:
#         raise e
#
#
# async def _get_images_and_not_images_from_archive(archive: UploadFile):
#     archive_bytes = await archive.read()
#     image_data_list = []
#     non_image_files = {}
#     with zipfile.ZipFile(io.BytesIO(archive_bytes), "r") as input_zip:
#         for file_name in input_zip.namelist():
#             # skip folders
#             if utils.is_folder(file_name): continue
#
#             file_data = input_zip.read(file_name)
#             # Check if file is an image
#             if utils.is_image(file_name):
#                 image_data_list.append((file_name, file_data))
#             else:
#                 non_image_files[file_name] = file_data  # Store non-image files to pass through
#     return image_data_list, non_image_files
#
#
# def _write_files_as_zip_archive_to_result_zip_archive(
#         files: Dict[str, bytes],
#         archive_name: str,
#         result_zip: zipfile.ZipFile
# ):
#     processed_zip_archive_buffer = io.BytesIO()
#     with zipfile.ZipFile(processed_zip_archive_buffer, "w", zipfile.ZIP_DEFLATED) as processed_zip:
#         # Write files data
#         for filename, file_data in files.items():
#             processed_zip.writestr(filename, file_data)
#
#     processed_zip_archive_buffer.seek(0)
#     result_zip.writestr(archive_name, processed_zip_archive_buffer.read())
