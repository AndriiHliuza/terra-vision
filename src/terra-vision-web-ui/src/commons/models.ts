/* Files */
export type FileItem = {
    id: string;
    file: File
}

/* Map */
export type PolygonShape = { id: string; type: "polygon" | "triangle"; coords: [number, number][][] };
export type RectangleShape = { id: string; type: "rectangle"; bounds: [[number, number], [number, number]] };
export type CircleShape = { id: string; type: "circle"; center: [number, number]; radius: number };
export type Shape = PolygonShape | RectangleShape | CircleShape;

export type MarkerData = {
    id: string;
    position: [number, number];
    tooltip: string;
    popup: string;
};


/* URL */
export const URL_TYPE = {
    ABSOLUTE: "absolute",
    RELATIVE: "relative",
} as const;

export type UrlType = (typeof URL_TYPE)[keyof typeof URL_TYPE];

export const urlBuilders: Record<UrlType, (u: string) => string> = {
    [URL_TYPE.ABSOLUTE]: (u) => "/" + u,
    [URL_TYPE.RELATIVE]: (u) => u,
};


/* Background */
export interface MatrixBackgroundProps {
    speed?: number;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
}


/* File name per width */
export type TruncateFileNameRule = {
    maxScreenWidth: number;
    startFileNameLength: number;
    endFileNameLength: number;
};

/* AI */
export type CVModelDescription = {
    id: string;
    name: string;
    description: string;
}
export type CVModelDescriptionResponse = {
    lang: string;
    models: CVModelDescription[];
}

/* CV object detection statistics DTOs */
export interface ClassStats {
    class_name: string;
    total_detections: number;
    images_containing_class: number;
    average_confidence: number;
    min_confidence: number;
    max_confidence: number;
}

export interface Detection {
    classname: string;
    confidence: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface ImageStats {
    filename: string;
    num_detections: number;
    average_confidence: number;
    max_confidence: number;
    detections: Detection[];
    is_successfully_processed: boolean;
}

export interface ProcessingStats {
    total_images: number;
    successfully_processed_images: number;
    failed_images: number;
    total_detections: number;
    images_with_detections: number;
    processing_time_seconds: number;
    average_confidence: number;
    per_class_stats: Record<string, ClassStats>;
    per_image_stats: ImageStats[];
    average_detections_per_image: number;
    percentage_of_images_with_detection: number;
}

export interface ProcessingSummary {
    overall: ProcessingStats;
    by_archive: Record<string, ProcessingStats>;
    model_id: string;
    confidence_threshold: number;
    batch_size: number;
}