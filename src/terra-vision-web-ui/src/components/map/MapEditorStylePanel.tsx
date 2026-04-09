import "../../styles/components/map/MapEditorStylePanel.css";
import {type Dispatch, type SetStateAction, useCallback, useState} from "react";
import type {FeatureProperties, GeoFeatureStyle} from "../../commons/schemas/gis-schemas.ts";
import {HexColorInput, HexColorPicker} from "react-colorful";
import type {Feature, Geometry} from "geojson";
import {getSafeBorderWeightAndFillOpacity, getSafeFillOpacityForMarker} from "../../commons/utils/style-utils.ts";
import {useTranslation} from "react-i18next";

interface MapEditorStylePanelProps {
    // Default style — used for new shapes
    style: GeoFeatureStyle;
    setStyle: Dispatch<SetStateAction<GeoFeatureStyle>>;

    // Selected feature — if set, panel edits that feature's style
    selectedGeoFeature: Feature<Geometry, FeatureProperties> | null;
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

    const {t} = useTranslation();

    const [activePicker, setActivePicker] = useState<"border" | "fill" | null>(null);
    const closePickers = useCallback(() => setActivePicker(null), []);

    const isMarkerSelected = selectedGeoFeature?.properties?.type === "marker";

    const activeStyle: GeoFeatureStyle = selectedGeoFeature?.properties
        ? {
            borderColor: selectedGeoFeature.properties.borderColor ?? style.borderColor,
            fillColor: selectedGeoFeature.properties.fillColor ?? style.fillColor,
            fillOpacity: selectedGeoFeature.properties.fillOpacity ?? style.fillOpacity,
            borderWeight: selectedGeoFeature.properties.borderWeight ?? style.borderWeight,
        }
        : style;


    const updateStyle = (
        updatedGeoFeatureStyle: Partial<GeoFeatureStyle>,
        origin?: "weight" | "opacity"
    ) => {
        const borderWeight = updatedGeoFeatureStyle.borderWeight
            ? updatedGeoFeatureStyle.borderWeight
            : activeStyle.borderWeight;

        const fillOpacity = updatedGeoFeatureStyle.fillOpacity
            ? updatedGeoFeatureStyle.fillOpacity
            : activeStyle.fillOpacity;

        const {safeBorderWeight, safeFillOpacity} = getSafeBorderWeightAndFillOpacity(
            borderWeight,
            fillOpacity,
            origin
        );

        updatedGeoFeatureStyle = {
            ...updatedGeoFeatureStyle,
            ...(isMarkerSelected ? {} : {borderWeight: safeBorderWeight}), // ← skip borderWeight for markers
            ...(isMarkerSelected ? {fillOpacity: getSafeFillOpacityForMarker(fillOpacity)} : {fillOpacity: safeFillOpacity})
        };

        if (selectedGeoFeature?.properties.id) {
            const updatedProps = {
                ...updatedGeoFeatureStyle,
                isModified: true,
                lastModified: new Date().toISOString()
            }
            onUpdateGeoFeatureStyle(selectedGeoFeature.properties.id, updatedProps);
        } else {
            setStyle(prev => ({...prev, ...updatedGeoFeatureStyle}));
        }
    };

    return (
        <div className="style-panel">
            <h2>{t("admin-pages.map-editor.styling-section.title")}</h2>

            <p className="style-context">
                {selectedGeoFeature
                    ? `${t("admin-pages.map-editor.styling-section.editing-text")}: ${selectedGeoFeature.properties?.title ?? selectedGeoFeature.properties?.id}`
                    : "Default style for new shapes"
                }
            </p>

            {/* Border Color */}
            <div className="style-group">
                <label>{t("admin-pages.map-editor.styling-section.border-style-text")}</label>
                <div className="picker-row">
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
                    <HexColorInput
                        className="hex-text-input"
                        color={activeStyle.borderColor}
                        onChange={(color) => updateStyle({borderColor: color})}
                        prefixed // Automatically adds/handles the #
                    />
                </div>
            </div>

            {/* Fill Color */}
            <div className="style-group">
                <label>{t("admin-pages.map-editor.styling-section.fill-style-text")}</label>
                <div className="picker-row">
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
                    <HexColorInput
                        className="hex-text-input"
                        color={activeStyle.fillColor}
                        onChange={(color) => updateStyle({fillColor: color})}
                        prefixed
                    />
                </div>
            </div>

            {/* Opacity */}
            <div className="style-group">
                <label>{t("admin-pages.map-editor.styling-section.opacity-style-text")} ({Math.round(activeStyle.fillOpacity * 100)}%)</label>
                <input
                    type="range" min="0" max="1" step="0.05"
                    value={activeStyle.fillOpacity}
                    onChange={(e) => updateStyle({fillOpacity: parseFloat(e.target.value)}, "opacity")}
                />
            </div>

            {/* Border Weight */}
            {!isMarkerSelected && (
                <div className="style-group">
                    <label>{t("admin-pages.map-editor.styling-section.weight-style-text")} ({activeStyle.borderWeight}px)</label>
                    <input
                        type="range" min="0" max="12" step="1"
                        value={activeStyle.borderWeight}
                        onChange={(e) => updateStyle({borderWeight: parseInt(e.target.value)}, "weight")}
                    />
                </div>
            )}

            {selectedGeoFeature && (
                <button className="deselect-btn" onClick={onDeselectGeoFeature}>
                    {t("admin-pages.map-editor.styling-section.stop-editing-btn-text")}
                </button>
            )}
        </div>
    )
}

export default MapEditorStylePanel;