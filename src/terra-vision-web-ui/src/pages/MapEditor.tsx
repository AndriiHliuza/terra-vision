import "../styles/pages/MapEditor.css";
import {
    MapContainer,
    Marker,
    Popup,
    Tooltip
} from "react-leaflet";
import {useEffect, useState} from "react";
import type {MarkerData, Shape} from "../commons/models.ts";
import {stubMarkers, stubShapes} from "../commons/stub.ts";
import {MapEventsHandler, MapResizeHandler} from "../commons/map-controls.ts";
import MapLayers from "../components/MapLayers.tsx";
import MapShapes from "../components/MapShapes.tsx";
import PartialLoadingOverlay from "../components/PartialLoadingOverlay.tsx";
import {useTranslation} from "react-i18next";

function MapEditor() {

    const {t} = useTranslation();

    const [selectedLayer, setSelectedLayer] = useState(
        () => localStorage.getItem("preferredMapLayer") || "OSM Streets"
    );

    useEffect(() => {
        localStorage.setItem("preferredMapLayer", selectedLayer);
    }, [selectedLayer]);

    const [isMapLoading, setMapLoading] = useState(true);

    const [shapes, setShapes] = useState<Shape[]>([]);
    const [markers, setMarkers] = useState<MarkerData[]>([]);

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        setMapLoading(true)
        const timer = setTimeout(() => {
            setShapes(stubShapes);
            setMarkers(stubMarkers);
            setMapLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    /* ---------- MAP EDIT HANDLERS ---------- */

    return (
        <div className="map-editor">
            <h1>{t("admin-page.map-editor.tab-name").toUpperCase()}</h1>
            <div className="map-container">
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

                    <MapEventsHandler setPreferredBaseLayer={setSelectedLayer}/>
                    <MapResizeHandler/>
                </MapContainer>
                <PartialLoadingOverlay visible={isMapLoading}/>
            </div>
        </div>

    )
}

export default MapEditor;