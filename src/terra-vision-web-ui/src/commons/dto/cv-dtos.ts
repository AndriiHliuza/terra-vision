
/* <<<<<<<<<<<< AI DTOs >>>>>>>>>>>> */
export type CVModelDescription = {
    id: string;
    name: string;
    description: string;
}
export type CVModelDescriptionResponse = {
    lang: string;
    cv_models: CVModelDescription[];
}



/* <<<<<<<<<<<< CV object detection statistics DTOs >>>>>>>>>>>> */
export interface CVClassStats {
    class_name: string;
    total_detections: number;
    images_containing_class: number;
    average_confidence: number;
    min_confidence: number;
    max_confidence: number;
}

export interface CVDetectionBox {
    classname: string;
    confidence: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface CVImageStats {
    filename: string;
    num_detections: number;
    average_confidence: number;
    max_confidence: number;
    detections: CVDetectionBox[];
    is_successfully_processed: boolean;
}

export interface CVDataProcessingStats {
    total_images: number;
    successfully_processed_images: number;
    failed_images: number;
    total_detections: number;
    images_with_detections: number;
    processing_time_seconds: number;
    average_confidence: number;
    per_class_stats: Record<string, CVClassStats>;
    per_image_stats: CVImageStats[];
    average_detections_per_image: number;
    percentage_of_images_with_detection: number;
}

export interface CVDataProcessingSummaryStats {
    overall_stats: CVDataProcessingStats;
    by_archive_stats: Record<string, CVDataProcessingStats>;
    model_id: string;
    confidence_threshold: number;
    batch_size: number;
}