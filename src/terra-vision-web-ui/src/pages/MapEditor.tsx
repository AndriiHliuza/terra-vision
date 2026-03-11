import "../styles/pages/MapEditor.css";
import {
    MapContainer,
    Marker,
    Popup,
    Tooltip
} from "react-leaflet";
import {useEffect, useRef, useState, type MouseEvent as ReactMouseEvent} from "react";
import type {MarkerData} from "../commons/schemas/gis-schemas.ts";
import {stubMarkers} from "../commons/stubs/map-stubs.ts";
import {MapEventsHandler, MapResizeHandler} from "../commons/utils/map-controls.ts";
import MapLayers from "../components/MapLayers.tsx";
import PartialLoadingOverlay from "../components/PartialLoadingOverlay.tsx";
import {useTranslation} from "react-i18next";
import {MAP_LAYERS, ROUTES} from "../configs/settings.ts";
import clsx from "clsx";
import dropdownBtnImg from "../assets/two-arrows-down.png";
import {useNavigate} from "react-router-dom";

function MapEditor() {

    const {t} = useTranslation();
    const navigate = useNavigate();

    const [isMapLoading, setMapLoading] = useState(true);

    const [markers, setMarkers] = useState<MarkerData[]>([]);

    const [popupPosition, setPopupPosition] = useState<[number, number] | null>(null);

    const [isLayersDropDownListOpen, setLayersDropDownListOpen] = useState(false);

    const MIN_MAP_CONTAINER_HEIGHT = 500;
    const MAX_MAP_CONTAINER_HEIGHT = 1000;

    const [mapContainerHeight, setMapContainerHeight] = useState(() => {
        const storedMapContainerHeight = localStorage.getItem("adminMapContainerHeight");
        const parsedMapContainerHeight = storedMapContainerHeight ? Number(storedMapContainerHeight) : 900; // default height

        if (Number.isNaN(parsedMapContainerHeight)) return 900;

        return Math.min(
            Math.max(parsedMapContainerHeight, MIN_MAP_CONTAINER_HEIGHT),
            MAX_MAP_CONTAINER_HEIGHT
        );
    });

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const isDraggingMapContainerRef = useRef(false);
    const mapContainerHeightRef = useRef(mapContainerHeight);

    const [selectedLayer, setSelectedLayer] = useState(
        () => localStorage.getItem("preferredMapLayer") || "OSM Streets"
    );

    // // ---------- Resize handlers ----------
    const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
        isDraggingMapContainerRef.current = true;
        e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDraggingMapContainerRef.current) return;
        const containerTop = mapContainerRef.current?.getBoundingClientRect().top || 0;
        const newHeight = e.clientY - containerTop;
        if (newHeight >= MIN_MAP_CONTAINER_HEIGHT && newHeight <= MAX_MAP_CONTAINER_HEIGHT) { // min/max height
            setMapContainerHeight(newHeight);
        }

        // ---------- Auto-scroll logic ----------
        const scrollMargin = 50; // px from viewport edge to start scrolling
        const scrollSpeed = 10; // px per frame

        if (e.clientY > window.innerHeight - scrollMargin) {
            // Near bottom, scroll down
            window.scrollBy({top: scrollSpeed, behavior: "auto"});
        }
    };

    const onMouseUp = () => {
        if (isDraggingMapContainerRef.current) {
            localStorage.setItem(
                "adminMapContainerHeight",
                mapContainerHeightRef.current.toString()
            );
        }
        isDraggingMapContainerRef.current = false;
    };

    useEffect(() => {
        localStorage.setItem("preferredMapLayer", selectedLayer);
    }, [selectedLayer]);

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, []);

    useEffect(() => {
        mapContainerHeightRef.current = mapContainerHeight;
    }, [mapContainerHeight]);


    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        setMapLoading(true)
        const timer = setTimeout(() => {
            setMarkers(stubMarkers);
            setMapLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    /* ---------- MAP EDIT HANDLERS ---------- */

    return (
        <div className="map-editor">
            <h1>{t("admin-page.map-editor.tab-name").toUpperCase()}</h1>
            <div
                className="map-container"
                ref={mapContainerRef}
                style={{height: mapContainerHeight}}
            >
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
                    <MapEventsHandler
                        onRightClick={(lat, lng) => setPopupPosition([lat, lng])}
                        setPreferredBaseLayer={setSelectedLayer}
                    />
                    <MapResizeHandler/>
                </MapContainer>

                {/* Draggable resize handle */}
                <div className="resize-handle" onMouseDown={onMouseDown}>
                    <hr/>
                </div>

                <PartialLoadingOverlay visible={isMapLoading}/>
            </div>

            {/* ✅ External Layer Switcher */}
            <div
                className="map-layer-drop-down-controls"
            >
                <h2>{t("admin-page.map-editor.layers-section.title")}</h2>
                <img
                    src={dropdownBtnImg}
                    alt="Drop down button"
                    className={clsx({active: isLayersDropDownListOpen})}
                    onClick={() => setLayersDropDownListOpen(prev => !prev)}
                />
            </div>
            <div className={clsx("map-layer-switcher", {opened: isLayersDropDownListOpen})}>
                {MAP_LAYERS.map(layer => (
                    <div
                        key={layer.name}
                        className={clsx("map-layer", {active: layer.name === selectedLayer})}
                        onClick={() => setSelectedLayer(layer.name)}
                    >
                        <div>{layer.name}</div>
                        <img src={layer.img} alt="Layer Img"/>
                    </div>
                ))}
            </div>

            <div>Controls</div>

        </div>

    )
}

export default MapEditor;