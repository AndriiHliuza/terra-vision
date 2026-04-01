import {useMapEvents} from "react-leaflet";
import type {Coordinates} from "../../../commons/schemas/gis-schemas.ts";

type MapEventsHandlerProps = {
    onRightClick: (coordinates: Coordinates) => void;
}

export function MapEventsHandler({ onRightClick }: MapEventsHandlerProps) {
    useMapEvents({
        contextmenu: (e) => onRightClick({
            lat: e.latlng.lat,
            lng: e.latlng.lng
        }),
    });

    return null;
}