import "../styles/pages/MapPage.css";
import {
    MapContainer,
    Marker,
    Popup,
    Tooltip
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header.tsx";
import {useEffect, useState} from "react";
import type {MarkerData} from "../commons/schemas/gis-schemas.ts";
import {stubMarkers} from "../commons/stubs/map-stubs.ts";
import {MapEventsHandler} from "../components/map-controls/map-controls.ts";
import MapLayers from "../components/MapLayers.tsx";
import clsx from "clsx";
import mapLayersOpenBtnImg from "../assets/layers.png";
import mapLayersCloseBtnImg from "../assets/close.png";
import {Outlet} from "react-router-dom";
import MapPositionDetailsPopup from "../components/MapPositionDetailsPopup.tsx";
import {MAP_LAYERS} from "../configs/settings.ts";
import LoadingOverlay from "../components/LoadingOverlay.tsx";

function MapPage() {

    const [popupPosition, setPopupPosition] = useState<[number, number] | null>(null);
    const [isMapLoading, setMapLoading] = useState<boolean>(false);

    const [selectedLayer, setSelectedLayer] = useState(
        () => localStorage.getItem("preferredMapLayer") || "OSM Standard"
    );

    useEffect(() => {
        localStorage.setItem("preferredMapLayer", selectedLayer);
    }, [selectedLayer]);

    const [markers, setMarkers] = useState<MarkerData[]>([]);

    const [isLayersMenuOpen, setLayersMenuOpen] = useState(false);

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        setMapLoading(true);
        const timer = setTimeout(() => {
            setMarkers(stubMarkers);
            setMapLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [setMapLoading]);

    return (
        <>
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

                    <MapEventsHandler
                        onRightClick={(lat, lng) => setPopupPosition([lat, lng])}
                        setPreferredBaseLayer={setSelectedLayer}
                    />

                    {/* ⭐ RIGHT CLICK POPUP */}
                    {popupPosition && (
                        <Popup
                            position={popupPosition}
                        >
                            <MapPositionDetailsPopup lat={popupPosition[0]} lng={popupPosition[1]}/>
                        </Popup>
                    )}
                </MapContainer>

                {/* External Layer Switcher */}
                <button
                    className={clsx("map-layer-switcher-btn", {active: isLayersMenuOpen})}
                    onClick={() => setLayersMenuOpen(prev => !prev)}
                >
                    <img src={isLayersMenuOpen ? mapLayersCloseBtnImg : mapLayersOpenBtnImg} alt="Layers"/>
                </button>
                <div className={clsx("map-layer-switcher-container", {opened: isLayersMenuOpen})}>
                    <div className="map-layer-switcher">
                        {MAP_LAYERS.map(layer => (
                            <div
                                key={layer.name}
                                className={clsx("map-layer", {active: layer.name === selectedLayer})}
                                onClick={() => {
                                    setSelectedLayer(layer.name)
                                    setLayersMenuOpen(false);
                                }}
                            >
                                <div>{layer.name}</div>
                                <img src={layer.img} alt="Layer Img"/>
                            </div>
                        ))}
                    </div>
                </div>
                <Outlet/>
            </div>
            <LoadingOverlay visible={isMapLoading}/>
        </>

    )
}

export default MapPage;
