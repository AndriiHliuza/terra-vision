import {TileLayer} from "react-leaflet";
import {MAP_LAYERS} from "../../configs/settings.ts";

function MapLayers({ layer }: { layer: string }) {

    const selectedLayer = MAP_LAYERS.find(l => l.name === layer);

    if (!selectedLayer) return null;

    return (
        <TileLayer
            url={selectedLayer.url}
            attribution={selectedLayer.attribution}
        />
    )
}

export default MapLayers;