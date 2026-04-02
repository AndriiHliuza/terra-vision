import {useMapEvents} from "react-leaflet";
import type {LeafletMouseEvent} from "leaflet";
import type {Coordinates} from "../../../commons/schemas/gis-schemas.ts";

export function MapEventsHandler({ onRightClick }: {
    onRightClick: (coordinates: Coordinates) => void;
}) {
    useMapEvents({
        contextmenu: (event: LeafletMouseEvent) => onRightClick({
            lat: event.latlng.lat,
            lng: event.latlng.lng
        }),
    });

    return null;
}