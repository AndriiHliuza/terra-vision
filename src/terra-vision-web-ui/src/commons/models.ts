export type FileItem = {
    id: string;
    file: File
}

export type PolygonShape = { id: string; type: "polygon" | "triangle"; coords: [number, number][] };
export type RectangleShape = { id: string; type: "rectangle"; bounds: [[number, number], [number, number]] };
export type CircleShape = { id: string; type: "circle"; center: [number, number]; radius: number };
export type Shape = PolygonShape | RectangleShape | CircleShape;

export type MarkerData = {
    id: string;
    position: [number, number];
    tooltip: string;
    popup: string;
};

export const URL_TYPE = {
    ABSOLUTE: "absolute",
    RELATIVE: "relative",
} as const;

export type UrlType = (typeof URL_TYPE)[keyof typeof URL_TYPE];

export const urlBuilders: Record<UrlType, (u: string) => string> = {
    [URL_TYPE.ABSOLUTE]: (u) => "/" + u,
    [URL_TYPE.RELATIVE]: (u) => u,
};

export interface MatrixBackgroundProps {
    speed?: number;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    backgroundOpacity?: number;
}

export type TruncateFileNameRule = {
    maxScreenWidth: number;
    startFileNameLength: number;
    endFileNameLength: number;
};