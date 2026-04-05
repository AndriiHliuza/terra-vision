import "../../styles/components/map/MapEditorStylePanel.css";
import {type Dispatch, type SetStateAction, useCallback, useState} from "react";
import type {GeoFeatureStyle} from "../../commons/schemas/gis-schemas.ts";
import {HexColorPicker} from "react-colorful";
import type {Feature} from "geojson";
import {getSafeBorderWeightAndFillOpacity} from "../../commons/utils/style-utils.ts";

interface MapEditorStylePanelProps {
    // Default style — used for new shapes
    style: GeoFeatureStyle;
    setStyle: Dispatch<SetStateAction<GeoFeatureStyle>>;

    // Selected feature — if set, panel edits that feature's style
    selectedGeoFeature: Feature | null;
    onUpdateGeoFeatureStyle: (id: string, updates: Partial<GeoFeatureStyle>) => void;
    onDeselectGeoFeature: () => void;
}

function MapEditorStylePanel({
                                 style,
                                 setStyle,
                                 selectedGeoFeature,
                                 onUpdateGeoFeatureStyle,
                                 onDeselectGeoFeature,
                             }: MapEditorStylePanelProps) {
    const [activePicker, setActivePicker] = useState<"border" | "fill" | null>(null);
    const closePickers = useCallback(() => setActivePicker(null), []);

    const isMarkerSelected = selectedGeoFeature?.properties?.type === "marker";
    const geoFeatureToChange = isMarkerSelected ? null : selectedGeoFeature;

    const activeStyle: GeoFeatureStyle = geoFeatureToChange?.properties
        ? {
            borderColor: geoFeatureToChange.properties.borderColor ?? style.borderColor,
            fillColor: geoFeatureToChange.properties.fillColor ?? style.fillColor,
            fillOpacity: geoFeatureToChange.properties.fillOpacity ?? style.fillOpacity,
            borderWeight: geoFeatureToChange.properties.borderWeight ?? style.borderWeight,
        }
        : style;


    const updateStyle = (
        updatedGeoFeatureStyle: Partial<GeoFeatureStyle>,
        origin?: "weight" | "opacity"
    ) => {
        const borderWeight = updatedGeoFeatureStyle.borderWeight !== undefined
            ? updatedGeoFeatureStyle.borderWeight
            : activeStyle.borderWeight;

        const fillOpacity = updatedGeoFeatureStyle.fillOpacity !== undefined
            ? updatedGeoFeatureStyle.fillOpacity
            : activeStyle.fillOpacity;

        const { safeBorderWeight, safeFillOpacity } = getSafeBorderWeightAndFillOpacity(
            borderWeight,
            fillOpacity,
            origin
        );

        updatedGeoFeatureStyle = {
            ...updatedGeoFeatureStyle,
            borderWeight: safeBorderWeight,
            fillOpacity: safeFillOpacity
        }

        if (geoFeatureToChange?.properties?.id) {
            onUpdateGeoFeatureStyle(geoFeatureToChange.properties.id, updatedGeoFeatureStyle);
        } else {
            setStyle(prev => ({...prev, ...updatedGeoFeatureStyle}));
        }
    };

    return (
        <div className="style-panel">
            <h2>LAYER STYLING</h2>

            <p className="style-context">
                {geoFeatureToChange
                    ? `Editing: ${geoFeatureToChange.properties?.title ?? geoFeatureToChange.properties?.id}`
                    : "Default style for new shapes"
                }
            </p>

            {/* Border Color */}
            <div className="style-group">
                <label>Border</label>
                <div className="picker-container">
                    <div
                        className="color-swatch"
                        style={{backgroundColor: activeStyle.borderColor}}
                        onClick={() => setActivePicker("border")}
                    />
                    {activePicker === "border" && (
                        <div className="popover">
                            <div className="popover-overlay" onClick={closePickers}/>
                            <HexColorPicker
                                color={activeStyle.borderColor}
                                onChange={(color) => updateStyle({borderColor: color})}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Fill Color */}
            <div className="style-group">
                <label>Fill</label>
                <div className="picker-container">
                    <div
                        className="color-swatch"
                        style={{backgroundColor: activeStyle.fillColor}}
                        onClick={() => setActivePicker("fill")}
                    />
                    {activePicker === "fill" && (
                        <div className="popover">
                            <div className="popover-overlay" onClick={closePickers}/>
                            <HexColorPicker
                                color={activeStyle.fillColor}
                                onChange={(color) => updateStyle({fillColor: color})}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Opacity */}
            <div className="style-group">
                <label>Opacity ({Math.round(activeStyle.fillOpacity * 100)}%)</label>
                <input
                    type="range" min="0" max="1" step="0.05"
                    value={activeStyle.fillOpacity}
                    onChange={(e) => updateStyle({fillOpacity: parseFloat(e.target.value)}, "opacity")}
                />
            </div>

            {/* Border Weight */}
            <div className="style-group">
                <label>Weight ({activeStyle.borderWeight}px)</label>
                <input
                    type="range" min="0" max="12" step="1"
                    value={activeStyle.borderWeight}
                    onChange={(e) => updateStyle({borderWeight: parseInt(e.target.value)}, "weight")}
                />
            </div>

            {geoFeatureToChange && (
                <button className="deselect-btn" onClick={onDeselectGeoFeature}>
                    ✕ Stop editing this shape
                </button>
            )}
        </div>
    )
}

export default MapEditorStylePanel;