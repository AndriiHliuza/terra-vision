
/* <<<<<<<<<<<< Model DTOs >>>>>>>>>>>> */
export type ModelDetails = {
    id: string;
    name: string;
    description: string;
}


/* <<<<<<<<<<<< Object detection statistics DTOs >>>>>>>>>>>> */
export interface ImageStats {
    filename: string;
    num_detections: number;
    average_confidence: number;
    max_confidence: number;
    min_confidence: number;
    detections: DetectionBox[];
}

export interface DetectionBox {
    class_name: string;
    confidence: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface ClassStats {
    cls_name: string;
    total_detections: number;
    images_containing_class: number;
    average_confidence: number;
    min_confidence: number;
    max_confidence: number;
}

export interface AggregatedStats {
    total_images: number;
    total_detections: number;
    images_with_detections: number;

    processing_time_seconds: number;

    average_confidence: number;
    min_confidence: number;
    max_confidence: number;

    average_detections_per_image: number;
    percentage_of_images_with_detection: number;

    per_class_stats: Record<string, ClassStats>;
    per_image_stats: ImageStats[];
}

export interface DetectionStats {
    id: string;
    user_id: string;
    model_id: string;
    confidence_threshold: number;
    overall_stats: AggregatedStats;
    per_archive_stats: Record<string, AggregatedStats>;
    created_at: string;
}
