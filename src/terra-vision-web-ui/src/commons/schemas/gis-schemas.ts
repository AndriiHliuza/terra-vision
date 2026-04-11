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
    hasHandlersAttached?: boolean;
}

export interface FeatureProperties {
    id: string;
    parentId?: string | null;
    type?: string | null;

    // Description
    title?: string | null;
    description?: string | null;

    // UI Styling
    borderColor?: string | null;
    fillColor?: string | null;
    fillOpacity?: number | null;
    borderWeight?: number | null;

    // Radius (for circles)
    radius?: number | null;

    /*
    * ------ Time logic ------
    * - lastModified is just for markers
    * - validFrom and validTo for polygons and circles to keep track of history
    * */
    validFrom?: string | null;
    validTo?: string | null;
    lastModified?: string | null;

    // React Local Flags (For the "Save" button)
    isNew?: boolean;
    isDeleted?: boolean;
    isModified?: boolean;
}

export interface GeoFeatureStyle {
    borderColor: string;
    fillColor: string;
    fillOpacity: number;
    borderWeight: number;
}