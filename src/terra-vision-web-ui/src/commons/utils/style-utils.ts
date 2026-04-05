export const getSafeBorderWeightAndFillOpacity = (
    borderWeight: number,
    fillOpacity: number,
    origin?: "opacity" | "weight"
) => {

    // If the user is dragging the OPACITY to 0, ensure WEIGHT is at least 1
    if (origin === "opacity" && fillOpacity === 0 && borderWeight < 1) {
        return { safeBorderWeight: 1, safeFillOpacity: 0 };
    }

    // If the user is dragging the OPACITY to 0, ensure WEIGHT is at least 1
    if (origin === "weight" && borderWeight === 0 && fillOpacity < 0.5) {
        return { safeBorderWeight: 0, safeFillOpacity: 0.5 };
    }

    // Default safety catch if no origin provided
    if (borderWeight === 0 && fillOpacity < 0.5) {
        return { safeBorderWeight: 0, safeFillOpacity: 0.5 };
    }

    if (borderWeight < 1 && fillOpacity === 0) {
        return { safeBorderWeight: 1, safeFillOpacity: 0 };
    }

    if (borderWeight === 0 && fillOpacity === 0) {
        return { safeBorderWeight: 0, safeFillOpacity: 0.5 };
    }

    return { safeBorderWeight: borderWeight, safeFillOpacity: fillOpacity };
};

export const getSafeFillOpacityForMarker = (fillOpacity: number): number => Math.max(fillOpacity, 0.7);