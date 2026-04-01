import "../../styles/components/map/MapPageLayerSwitcher.css";
import clsx from "clsx";
import mapLayersCloseBtnImg from "../../assets/cross.png";
import mapLayersOpenBtnImg from "../../assets/layers.png";
import {MAP_LAYERS} from "../../configs/settings.ts";
import {useState} from "react";

interface MapPageLayerSwitcherProps {
    selectedLayer: string;
    onLayerSelected: (layer: string) => void;
}

function MapPageLayerSwitcher({selectedLayer, onLayerSelected}: MapPageLayerSwitcherProps) {

    const [isLayersMenuOpen, setLayersMenuOpen] = useState(false);

    const handleLayerSelected = (layer: string) => {
        onLayerSelected(layer);
        setLayersMenuOpen(false);
    };

    return (
        <>
            <button
                id="map-layer-switcher-btn"
                className={clsx({active: isLayersMenuOpen})}
                onClick={() => setLayersMenuOpen(prev => !prev)}
            >
                <img src={isLayersMenuOpen ? mapLayersCloseBtnImg : mapLayersOpenBtnImg} alt="Layers"/>
            </button>
            <div id="map-layer-switcher-container" className={clsx({opened: isLayersMenuOpen})}>
                <div id="map-layer-switcher">
                    {MAP_LAYERS.map(layer => (
                        <div
                            key={layer.name}
                            className={clsx("map-layer", {active: layer.name === selectedLayer})}
                            onClick={() => handleLayerSelected(layer.name)}
                        >
                            <div>{layer.name}</div>
                            <img src={layer.img} alt="Layer Img"/>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default MapPageLayerSwitcher;