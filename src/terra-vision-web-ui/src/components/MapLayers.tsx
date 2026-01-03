import {TileLayer} from "react-leaflet";
import {MAP_LAYERS} from "../configs/settings.ts";

function MapLayers({ selectedLayer }: { selectedLayer: string }) {

    const layer = MAP_LAYERS.find(l => l.name === selectedLayer);

    if (!layer) return null;

    return (
        <TileLayer
            url={layer.url}
            attribution={layer.attribution}
        />
    )
}

export default MapLayers;