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
import type {MarkerData} from "../commons/models.ts";
import {stubMarkers} from "../commons/stub.ts";
import {MAP_LAYERS, ROUTES} from "../configs/settings.ts";
import {MapEventsHandler} from "../commons/map-controls.ts";
import MapLayers from "../components/MapLayers.tsx";
import clsx from "clsx";
import mapLayersOpenBtnImg from "../assets/layers.png";
import mapLayersCloseBtnImg from "../assets/close.png";
import {ApplicationContext, type ApplicationContextSettings} from "../configs/context/contexts.ts";
import {Outlet, useNavigate} from "react-router-dom";

function Map() {

    const navigate = useNavigate();
    const [popupPosition, setPopupPosition] = useState<[number, number] | null>(null);

    const [selectedLayer, setSelectedLayer] = useState(
        () => localStorage.getItem("preferredMapLayer") || "OSM Streets"
    );

    useEffect(() => {
        localStorage.setItem("preferredMapLayer", selectedLayer);
    }, [selectedLayer]);

    const {setLoading} = useContext(ApplicationContext) as ApplicationContextSettings;
    const [markers, setMarkers] = useState<MarkerData[]>([]);

    const [isLayersMenuOpen, setLayersMenuOpen] = useState(false);

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        setLoading(true)
        const timer = setTimeout(() => {
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

                <MapEventsHandler
                    onRightClick={(lat, lng) => setPopupPosition([lat, lng])}
                    setPreferredBaseLayer={setSelectedLayer}
                />

                {/* ⭐ RIGHT CLICK POPUP */}
                {popupPosition && (
                    <Popup
                        position={popupPosition}
                        eventHandlers={{
                            remove: () => setPopupPosition(null)
                        }}
                    >
                        <div>
                            <strong>Coordinates:</strong>
                            <br/>
                            Lat: {popupPosition[0].toFixed(6)}
                            <br/>
                            Lng: {popupPosition[1].toFixed(6)}
                            <br/>
                            <button
                                onClick={() => navigate(ROUTES.MAP_ROUTES.MARKER)}
                            >
                                ADD
                            </button>
                        </div>
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
    )
}

export default Map;
