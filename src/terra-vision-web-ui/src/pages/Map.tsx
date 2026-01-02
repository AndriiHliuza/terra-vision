import "../styles/pages/Map.css";
import {
    MapContainer,
    Marker,
    Popup,
    Tooltip
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header.tsx";
import {useContext, useEffect, useState} from "react";
import type {MarkerData, Shape} from "../commons/models.ts";
import {stubMarkers, stubShapes} from "../commons/stub.ts";
import {ApplicationContext, type ApplicationContextSettings} from "../configs/settings.ts";
import {MapEventsHandler} from "../commons/map-controls.ts";
import MapLayers from "../components/MapLayers.tsx";
import MapShapes from "../components/MapShapes.tsx";

function Map() {

    const [selectedLayer, setSelectedLayer] = useState(
        () => localStorage.getItem("preferredMapLayer") || "OSM Streets"
    );

    useEffect(() => {
        localStorage.setItem("preferredMapLayer", selectedLayer);
    }, [selectedLayer]);

    const {setLoading} = useContext(ApplicationContext) as ApplicationContextSettings;
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [markers, setMarkers] = useState<MarkerData[]>([]);

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        setLoading(true)
        const timer = setTimeout(() => {
            setShapes(stubShapes);
            setMarkers(stubMarkers);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [setLoading]);

    return (
        <div id="map-page">
            <Header/>
            <MapContainer
                center={[48.4, 31]}
                zoomControl={false}
                zoom={6}
                minZoom={2}
                maxBounds={[[-85, -Infinity], [85, Infinity]]}
                maxBoundsViscosity={1.0}
                worldCopyJump={true}
            >
                <MapLayers selectedLayer={selectedLayer}/>
                {/* Render markers */}
                {markers.map(marker => (
                    <Marker key={marker.id} position={marker.position}>
                        <Tooltip>{marker.tooltip}</Tooltip>
                        <Popup>{marker.popup}</Popup>
                    </Marker>
                ))}
                <MapShapes shapes={shapes}/>

                <MapEventsHandler setPreferredBaseLayer={setSelectedLayer} />
            </MapContainer>
        </div>
    )
}

export default Map;
