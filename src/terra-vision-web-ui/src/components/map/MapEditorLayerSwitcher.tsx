import "../../styles/components/map/MapEditorLayerSwitcher.css";
import {useState} from "react";
import dropdownBtnImg from "../../assets/arrows/double-down-arrow-2.png";
import {MAP_LAYERS} from "../../configs/settings.ts";
import clsx from "clsx";
import {t} from "i18next";

interface MapEditorLayerSwitcherProps {
    selectedLayer: string;
    onLayerSelected: (layer: string) => void;
}

function MapEditorLayerSwitcher({selectedLayer, onLayerSelected}: MapEditorLayerSwitcherProps) {

    const [isLayersDropDownListOpen, setLayersDropDownListOpen] = useState(false);

    return (
        <>
            <div
                className="map-layer-drop-down-controls"
            >
                <h2>{t("admin-page.map-editor.layers-section.title")}</h2>
                <img
                    src={dropdownBtnImg}
                    alt="Drop down button"
                    className={clsx({active: isLayersDropDownListOpen})}
                    onClick={() => setLayersDropDownListOpen(prev => !prev)}
                />
            </div>
            <div className={clsx("map-layer-switcher", {opened: isLayersDropDownListOpen})}>
                {MAP_LAYERS.map(layer => (
                    <div
                        key={layer.name}
                        className={clsx("map-layer", {active: layer.name === selectedLayer})}
                        onClick={() => onLayerSelected(layer.name)}
                    >
                        <div>{layer.name}</div>
                        <img src={layer.img} alt="Layer Img"/>
                    </div>
                ))}
            </div>
        </>
    )
}

export default MapEditorLayerSwitcher;
