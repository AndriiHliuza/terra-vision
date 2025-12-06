import type {MarkerData, Shape} from "./types.ts";

export const stubShapes: Shape[] = [
    {
        id: "1",
        type: "polygon",
        coords: [
            [46.11, 34.79],
            [47.07, 37.54],
            [47.84, 39.78],
            [48.80, 39.83],
            [49.59, 40.14],
            [49.88, 39.19],
            [49.98, 38.22],
            [49.90, 38.03],
            [49.85, 38.09],
            [49.51, 37.84],
            [49.23, 37.87],
            [48.77, 36.72],
            [47.87, 36.58],
            [47.48, 34.86],
            [47.46, 34.08],
            [46.33, 31.85],
            [45.96, 33.59],
            [45.39, 32.46],
            [45.09, 33.60],
            [44.53, 33.39],
            [44.39, 34.08],
            [45.01, 36.37],
            [45.42, 36.56],
            [45.61, 35.41],

        ],
    },

    // Complex polygon near marker 1 (expanded)
    {
        id: "2",
        type: "polygon",
        coords: [
            [50.52, 30.82],
            [50.34, 30.84],
            [50.26, 30.83],
            [50.32, 30.69],
            [50.24, 30.30],
            [50.43, 30.46],
        ],
    },
    // Triangle near marker 2 (larger)
    {
        id: "3",
        type: "triangle",
        coords: [
            [50.74, 30.46],
            [50.56, 30.43],
            [50.62, 30.72],
        ],
    },
    // Rectangle near marker 3 (larger)
    {
        id: "4",
        type: "rectangle",
        bounds: [
            [50.94, 30.67],
            [50.67, 31.05],
        ],
    },
    // Circle near marker 1 (larger radius)
    {
        id: "5",
        type: "circle",
        center: [50.46, 31.29],
        radius: 10000, // meters
    }
];

export const stubMarkers: MarkerData[] = [
    { id: "1", position: [50.4, 30.7], tooltip: "Marker 1", popup: "Hello! I am marker 1." },
    { id: "2", position: [50.6, 30.7], tooltip: "Marker 2", popup: "Hello! I am marker 2." },
    { id: "3", position: [50.7, 30.7], tooltip: "Marker 3", popup: "Hello! I am marker 3." },
];