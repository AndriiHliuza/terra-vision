import "../../styles/components/map/MapEditorStylePanel.css";
import {type Dispatch, type SetStateAction, useCallback, useState} from "react";
import type {FeatureProperties, FeatureStyle} from "../../commons/schemas/gis-schemas.ts";
import {HexColorInput, HexColorPicker} from "react-colorful";
import type {Feature, Geometry} from "geojson";
import {getSafeBorderWeightAndFillOpacity, getSafeFillOpacityForMarker} from "../../commons/utils/style-utils.ts";
import {useTranslation} from "react-i18next";

interface MapEditorStylePanelProps {
    // Default style — used for new shapes
    style: FeatureStyle;
    setStyle: Dispatch<SetStateAction<FeatureStyle>>;

    // Selected feature — if set, panel edits that feature's style
    selectedFeature: Feature<Geometry, FeatureProperties> | null;
    onUpdateFeatureStyle: (id: string, updates: Partial<FeatureStyle>) => void;
    onDeselectFeature: () => void;
}

function MapEditorStylePanel({
                                 style,
                                 setStyle,
                                 selectedFeature,
                                 onUpdateFeatureStyle,
                                 onDeselectFeature,
                             }: MapEditorStylePanelProps) {

    const {t} = useTranslation();

    const [activePicker, setActivePicker] = useState<"border" | "fill" | null>(null);
    const closePickers = useCallback(() => setActivePicker(null), []);

    const isMarkerSelected = selectedFeature?.properties?.type === "marker";

    const activeStyle: FeatureStyle = selectedFeature?.properties
        ? {
            borderColor: selectedFeature.properties.borderColor ?? style.borderColor,
            fillColor: selectedFeature.properties.fillColor ?? style.fillColor,
            fillOpacity: selectedFeature.properties.fillOpacity ?? style.fillOpacity,
            borderWeight: selectedFeature.properties.borderWeight ?? style.borderWeight,
        }
        : style;


    const updateStyle = (
        updatedFeatureStyle: Partial<FeatureStyle>,
        origin?: "weight" | "opacity"
    ) => {
        const borderWeight = updatedFeatureStyle.borderWeight
            ? updatedFeatureStyle.borderWeight
            : activeStyle.borderWeight;

        const fillOpacity = updatedFeatureStyle.fillOpacity
            ? updatedFeatureStyle.fillOpacity
            : activeStyle.fillOpacity;

        const {safeBorderWeight, safeFillOpacity} = getSafeBorderWeightAndFillOpacity(
            borderWeight,
            fillOpacity,
            origin
        );

        updatedFeatureStyle = {
            ...updatedFeatureStyle,
            ...(isMarkerSelected ? {} : {borderWeight: safeBorderWeight}), // ← skip borderWeight for markers
            ...(isMarkerSelected ? {fillOpacity: getSafeFillOpacityForMarker(fillOpacity)} : {fillOpacity: safeFillOpacity})
        };

        if (selectedFeature?.properties.id) {
            const updatedProps = {
                ...updatedFeatureStyle,
                isModified: true,
                lastModified: new Date().toISOString()
            }
            onUpdateFeatureStyle(selectedFeature.properties.id, updatedProps);
        } else {
            setStyle(prev => ({...prev, ...updatedFeatureStyle}));
        }
    };

    return (
        <div className="style-panel">
            <h2>{t("admin-pages.map-editor.styling-section.title")}</h2>

            <p className="style-context">
                {selectedFeature
                    ? `${t("admin-pages.map-editor.styling-section.editing-text")}: ${selectedFeature.properties?.title ?? selectedFeature.properties?.id}`
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

            {selectedFeature && (
                <button className="deselect-btn" onClick={onDeselectFeature}>
                    {t("admin-pages.map-editor.styling-section.stop-editing-btn-text")}
                </button>
            )}
        </div>
    )
}

export default MapEditorStylePanel;