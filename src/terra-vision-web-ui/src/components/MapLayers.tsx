import {LayersControl, TileLayer} from "react-leaflet";
import {MAP_LAYERS} from "../configs/settings.ts";

function MapLayers({ selectedLayer }: { selectedLayer: string }) {

    return (
        <LayersControl position="bottomleft">
            {MAP_LAYERS.map(layer => (
                <LayersControl.BaseLayer
                    key={layer.name}
                    checked={layer.name === selectedLayer} // mark selected layer
                    name={layer.name}
                >
                    <TileLayer
                        url={layer.url}
                        attribution={layer.attribution}
                    />
                </LayersControl.BaseLayer>
            ))}
        </LayersControl>
    )
}

export default MapLayers;