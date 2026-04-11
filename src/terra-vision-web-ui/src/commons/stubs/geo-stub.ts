import type {FeatureCollection, Geometry, Point, Polygon} from "geojson";
import type {FeatureProperties} from "../schemas/gis-schemas.ts";


/**
 * We define the stub data using your strict project interface.
 * This ensures no 'null' or 'any' leaks into your React state.
 */
const STUB_MAP_DATA: FeatureCollection<Geometry, FeatureProperties> = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: {
                id: "mine-101",
                type: "marker",
                title: "OZM-72 Fragmentation Mine",
                description: "Detected via drone thermal imaging. High priority for clearance.",
                borderColor: "#d32f2f",
                fillColor: "#f44336",
                isNew: false,
                isDeleted: false,
                validFrom: "2026-04-01T10:00:00Z",
                validTo: null, // Active
            },
            geometry: {
                type: "Point",
                coordinates: [32.2623, 48.5079]
            } as Point
        },
        {
            type: "Feature",
            properties: {
                id: "hazard-zone-alpha",
                type: "polygon",
                title: "Confirmed Hazardous Area (CHA)",
                description: "High density of anti-personnel mines reported by local population.",
                borderColor: "#b71c1c",
                fillColor: "#ff5252",
                fillOpacity: 0.3,
                borderWeight: 2,
                isNew: false,
                isDeleted: false,
                validFrom: "2026-03-15T08:30:00Z",
                validTo: null,
            },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [32.2500, 48.5100],
                    [32.2700, 48.5100],
                    [32.2700, 48.5200],
                    [32.2500, 48.5200],
                    [32.2500, 48.5100]
                ]]
            } as Polygon
        },
        {
            type: "Feature",
            properties: {
                id: "danger-circle-radiance",
                type: "circle",
                title: "UXO Safety Perimeter",
                description: "Standard 500m evacuation zone around unexploded aircraft bomb.",
                radius: 500,
                borderColor: "#ef6c00",
                fillColor: "#ff9800",
                fillOpacity: 0.4,
                borderWeight: 3,
                isNew: false,
                isDeleted: false,
                validFrom: "2026-04-08T12:00:00Z",
                validTo: null,
            },
            geometry: {
                type: "Point",
                coordinates: [32.2800, 48.5000]
            } as Point
        },
        {
            type: "Feature",
            properties: {
                id: "cleared-area-01",
                type: "polygon",
                title: "Cleared Sector 4",
                description: "Demining completed by HALO Trust. Safe for agricultural use.",
                borderColor: "#302295",
                fillColor: "#4c59af",
                fillOpacity: 0.9,
                borderWeight: 1,
                isNew: false,
                isDeleted: false, // Marking as deleted/archived to test historical logic
                validFrom: "2026-01-01T09:00:00Z",
                validTo: "2026-04-01T15:00:00Z",
            },
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [32.2400, 48.4900],
                    [32.2450, 48.4900],
                    [32.2450, 48.4950],
                    [32.2400, 48.4950],
                    [32.2400, 48.4900]
                ]]
            } as Polygon
        }
    ]
};

/**
 * Return type is now explicitly typed to match your state.
 * This resolves the TS2345 error in your useEffect.
 */
export const fetchStubMapData = (): Promise<FeatureCollection<Geometry, FeatureProperties>> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(STUB_MAP_DATA);
        }, 800);
    });
};