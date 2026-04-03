import type { Feature } from "geojson";

const STUB_MAP_FEATURES: Feature[] = [
    {
        type: "Feature",
        properties: {
            id: "mine-101",
            type: "marker",
            objectType: "TM-62M Anti-tank Mine",
            status: "detected"
        },
        geometry: {
            type: "Point",
            coordinates: [31.1656, 48.3794] // [lng, lat]
        }
    },
    {
        type: "Feature",
        properties: {
            id: "zone-alpha",
            type: "polygon",
            borderColor: "#ff0000",
            fillColor: "#ff4444",
            fillOpacity: 0.4,
            borderWeight: 3
        },
        geometry: {
            type: "Polygon",
            coordinates: [[
                [31.10, 48.35],
                [31.25, 48.35],
                [31.25, 48.45],
                [31.10, 48.45],
                [31.10, 48.35]
            ]]
        }
    },
    {
        type: "Feature",
        properties: {
            id: "danger-circle-1",
            type: "circle",
            radius: 500, // Meters
            borderColor: "#ffa500",
            fillColor: "#ffd700",
            fillOpacity: 0.5
        },
        geometry: {
            type: "Point",
            coordinates: [31.20, 48.40]
        }
    },
    {
        type: "Feature",
        properties: {
            id: "building-rect",
            type: "polygon",
            borderColor: "#0000ff",
            fillColor: "#add8e6"
        },
        geometry: {
            type: "Polygon",
            coordinates: [[
                [31.05, 48.30],
                [31.08, 48.30],
                [31.08, 48.33],
                [31.05, 48.33],
                [31.05, 48.30]
            ]]
        }
    }
];

// Helper to simulate a network delay
export const fetchStubMapFeatures = (): Promise<Feature[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(STUB_MAP_FEATURES);
        }, 800); // 800ms delay to test your LoadingOverlay
    });
};