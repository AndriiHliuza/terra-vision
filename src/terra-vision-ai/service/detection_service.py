import logging
from logging import Logger

import numpy as np
from fastapi import UploadFile
from starlette.responses import StreamingResponse
from ultralytics import YOLO
from ultralytics.engine.results import Results

from schema.file_schemas import File, NumpyImage
from schema.model_schemas import Model
from schema.result_schemas import ArchiveProcessingResult
from schema.stats_schemas import DetectionStats
from service.yolo_service import YOLO_SERVICE
from service.stats_service import STATS_SERVICE
from service.detection_results_processor import DETECTION_RESULTS_PROCESSOR as DRP
from utils import file_utils


class DetectionService:
    def __init__(self):
        self.__logger: Logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")

    async def detect_objects(
            self,
            user_id: str,
            model_id: str,
            confidence_threshold: float,
            archives: list[UploadFile]
    ) -> StreamingResponse:
        self.__logger.info(f"---> [DETECTION TASK] | START")
        model: Model = await YOLO_SERVICE.get_model(model_id)

        processing_results: list[ArchiveProcessingResult] = []

        for archive in archives:
            archive_result: ArchiveProcessingResult = await self.__process_archive(archive, model, confidence_threshold)
            processing_results.append(archive_result)

        detection_stats: DetectionStats = DRP.build_detection_stats(
            processing_results=processing_results,
            user_id=user_id,
            model_id=model_id,
            confidence_threshold=confidence_threshold
        )

        if user_id is not None:
            annotated_archives = DRP.get_annotated_archives(processing_results)
            base_minio_path: str = DRP.save_to_minio(
                user_id,
                detection_stats.id,
                detection_stats.processed_at,
                processing_results,
                annotated_archives
            )
            detection_stats.base_minio_path = base_minio_path
            await STATS_SERVICE.save_stats(detection_stats)

        response: StreamingResponse = DRP.build_response_archive(processing_results)
        self.__logger.info(f"<--- [DETECTION TASK] | END")
        return response

    async def __process_archive(
            self,
            archive: UploadFile,
            model: Model,
            confidence_threshold: float,
            batch_size: int = 16
    ) -> ArchiveProcessingResult:
        self.__logger.info(f"Starting to process images in archive | Archive: {archive.filename}")

        archive_results: list[Results] = []
        images: list[File] = await file_utils.extract_images_from_archive(archive)

        for i in range(0, len(images), batch_size):
            batch_images: list[File] = images[i:i + batch_size]
            batch_processing_results: list[Results] = self.__process_batch(i, batch_images, model,
                                                                           confidence_threshold)
            archive_results.extend(batch_processing_results)

        return ArchiveProcessingResult(archive.filename, images, archive_results)

    def __process_batch(
            self,
            batch_idx,
            images: list[File],
            model: Model,
            confidence_threshold: float,
            verbose: bool = False
    ) -> list[Results]:
        self.__logger.info(
            f"Starting to process images in batch | Batch index: {batch_idx} | Number of images: {len(images)}")
        yolo: YOLO = model.yolo
        numpy_images: list[NumpyImage] = file_utils.convertFilesToNumpyImages(images)
        np_arrays: list[np.ndarray] = [image.array for image in numpy_images]

        results: list[Results] = yolo(np_arrays, conf=confidence_threshold, verbose=verbose)
        return results


DETECTION_SERVICE: DetectionService = DetectionService()
