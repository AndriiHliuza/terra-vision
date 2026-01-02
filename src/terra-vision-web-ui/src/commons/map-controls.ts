import {useMap, useMapEvents} from "react-leaflet";
import L from "leaflet";
import {useEffect} from "react";

type MapEventsHandlerProps = {
    setPreferredBaseLayer?: (name: string) => void;
}

export function MapEventsHandler({ setPreferredBaseLayer }: MapEventsHandlerProps) {
    const map = useMapEvents({
        click: (e) => {
            // Change cursor to crosshair on click
            const mapContainer = map.getContainer();
            const originalCursor = mapContainer.style.cursor;
            mapContainer.style.cursor = "crosshair";

            // Show popup at clicked location
            const {lat, lng} = e.latlng;
            L.popup()
                .setLatLng([lat, lng])
                .setContent(`
                    <div>
                        <strong>Coordinates:</strong><br/>
                        Lat: ${lat.toFixed(6)}<br/>
                        Lng: ${lng.toFixed(6)}
                    </div>
                `).openOn(e.target);

            // Revert cursor back to original after short delay
            setTimeout(() => {
                mapContainer.style.cursor = originalCursor || "";
            }, 300); // 300ms
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

// Helper to add hover styles
export const getShapeEventHandlers = (defaultStyle: L.PathOptions, hoverStyle: L.PathOptions) => ({
    mouseover: (e: L.LeafletMouseEvent) => {
        e.target.setStyle(hoverStyle);
    },
    mouseout: (e: L.LeafletMouseEvent) => {
        e.target.setStyle(defaultStyle);
    },
});

