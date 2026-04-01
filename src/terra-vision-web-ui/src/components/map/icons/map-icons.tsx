import L from "leaflet";
import locationMarker from "../../../assets/location-marker.png";
import {renderToStaticMarkup} from "react-dom/server";
import {ClusterIcon} from "./ClusterIcon.tsx";

export const markerIcon = new L.Icon({
    iconUrl: locationMarker,
    iconSize: [30, 30],   // Total size of the marker
    iconAnchor: [15, 30], // The point that touches the map (center)
    popupAnchor: [0, -30],
});

export const createClusterIcon = (cluster: { getChildCount: () => number }) => {
    const count = cluster.getChildCount();

    return new L.DivIcon({
        className: "",
        html: renderToStaticMarkup(<ClusterIcon count={count}/>),
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
};