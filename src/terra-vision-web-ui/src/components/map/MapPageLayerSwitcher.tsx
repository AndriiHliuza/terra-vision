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
            <button className={clsx("map-layer-switcher-btn", {active: isLayersMenuOpen})}
                onClick={() => setLayersMenuOpen(prev => !prev)}
            >
                <img src={isLayersMenuOpen ? mapLayersCloseBtnImg : mapLayersOpenBtnImg} alt="Layers"/>
            </button>
            <div className={clsx("map-layer-switcher-container", {opened: isLayersMenuOpen})}>
                <div className="map-layer-switcher">
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