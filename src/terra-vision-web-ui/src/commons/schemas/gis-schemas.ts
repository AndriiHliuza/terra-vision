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

export interface LocationProps {
    lat: number;
    lng: number;
}