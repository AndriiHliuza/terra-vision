import L from "leaflet";

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

export const DEFAULT_FEATURE_STYLE = {
    borderColor: "#3F51B5",
    fillColor: "#3388ff",
    fillOpacity: 0.5,
    borderWeight: 3
};

export interface FeatureLayer extends L.Layer {
    featureId?: string;
    pm?: { enabled: () => boolean }
}

export interface GeoFeatureStyle {
    borderColor: string;
    fillColor: string;
    fillOpacity: number;
    borderWeight: number;
}