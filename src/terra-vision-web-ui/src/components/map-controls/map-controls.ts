import {useMap, useMapEvents} from "react-leaflet";
import L from "leaflet";
import {useEffect} from "react";

type MapEventsHandlerProps = {
    onRightClick: (lat: number, lng: number) => void;
    setPreferredBaseLayer?: (name: string) => void;
}

export function MapEventsHandler({
                                     onRightClick,
                                     setPreferredBaseLayer
                                 }: MapEventsHandlerProps) {
    useMapEvents({
        contextmenu: (e) => {
            onRightClick(e.latlng.lat, e.latlng.lng);
        },
        baselayerchange: (e) => {
            const layerName = e.name;

            // Save to localStorage
            localStorage.setItem("preferredMapLayer", layerName);

            // Call optional callback to update React state
            if (setPreferredBaseLayer) setPreferredBaseLayer(layerName);
        }
    });

    return null;
}

export function MapResizeHandler() {
    const map = useMap();

    useEffect(() => {
        const container = map.getContainer();

        const observer = new ResizeObserver(() => {
            map.invalidateSize();
        });

        observer.observe(container);

        return () => observer.disconnect();
    }, [map]);

    return null;
}

// Helper function to add hover styles
export const getShapeEventHandlers = (defaultStyle: L.PathOptions, hoverStyle: L.PathOptions) => ({
    mouseover: (e: L.LeafletMouseEvent) => {
        e.target.setStyle(hoverStyle);
    },
    mouseout: (e: L.LeafletMouseEvent) => {
        e.target.setStyle(defaultStyle);
    },
});

