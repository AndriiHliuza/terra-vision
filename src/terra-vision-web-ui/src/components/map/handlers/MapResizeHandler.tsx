import {useMap} from "react-leaflet";
import {useEffect} from "react";

export function MapResizeHandler() {
    const map = useMap();

    useEffect(() => {
        const container: HTMLElement = map.getContainer();

        const observer = new ResizeObserver(() => map.invalidateSize());
        observer.observe(container);

        return () => observer.disconnect();
    }, [map]);

    return null;
}