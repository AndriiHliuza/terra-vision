export type MarkerData = {
    id: string;
    position: [number, number];
    title: string;
    description: string;
};

export interface Coordinates {
    lat: number;
    lng: number;
}