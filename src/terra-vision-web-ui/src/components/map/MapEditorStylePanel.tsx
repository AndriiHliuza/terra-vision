import {type Dispatch, type SetStateAction, useCallback, useState} from "react";
import type {GeoFeatureStyle} from "../../commons/schemas/gis-schemas.ts";


interface MapEditorStylePanelProps {
    style: GeoFeatureStyle;
    setStyle: Dispatch<SetStateAction<GeoFeatureStyle>>;
}

function MapEditorStylePanel({style, setStyle}: MapEditorStylePanelProps) {
    const [activePicker, setActivePicker] = useState<"border" | "fill" | null>(null);

    const updateStyle = (updates: Partial<GeoFeatureStyle>) => {
        setStyle(prev => ({ ...prev, ...updates }));
    };

    const closePickers = useCallback(() => setActivePicker(null), []);

    return (
        <></>
    )
}

export default MapEditorStylePanel;