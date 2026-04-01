import "../styles/pages/MapEditor.css";
import {
    MapContainer,
    Marker,
    Popup
} from "react-leaflet";
import {useEffect, useState} from "react";
import type {Coordinates, MarkerData} from "../commons/schemas/gis-schemas.ts";
import MapLayers from "../components/map/MapLayers.tsx";
import {useTranslation} from "react-i18next";
import {MAP_LAYERS} from "../configs/settings.ts";
import LoadingOverlay from "../components/LoadingOverlay.tsx";
import {useElementHeightResizer} from "../commons/hooks/hooks.ts";
import {MapResizeHandler} from "../components/map/handlers/MapResizeHandler.tsx";
import MarkerClusterGroup from "react-leaflet-cluster";
import {createClusterIcon, markerIcon} from "../components/map/icons/map-icons.tsx";
import {MapEventsHandler} from "../components/map/handlers/MapEventsHandler.tsx";
import MapPositionPopupDetails from "../components/map/MapPositionPopupDetails.tsx";
import MapEditorLayerSwitcher from "../components/map/MapEditorLayerSwitcher.tsx";

function MapEditor() {

    const {t} = useTranslation();

    const [isMapLoading, setMapLoading] = useState(true);

    const [popupPosition, setPopupPosition] = useState<Coordinates | null>(null);

    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);
    const [markers, /*setMarkers*/] = useState<MarkerData[]>([]);

    const { height, elementRef, onMouseDown } = useElementHeightResizer({storageKey: "adminMapContainerHeight"})

    const onLayerSelected = (mapLayer: string) => {
        setLayer(mapLayer);
        localStorage.setItem("map-layer", mapLayer);
    }

    const onAddMarker = () => {
        console.log("ADD MARKER BUTTON")
    }

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        setMapLoading(true)
        const timer = setTimeout(() => {

            setMapLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    /* ---------- MAP EDIT HANDLERS ---------- */

    return (
        <div id="map-editor">
            <h1>{t("admin-page.map-editor.tab-name").toUpperCase()}</h1>
            <div
                className="map-container"
                ref={elementRef}
                style={{height: height}}
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
                    <MapLayers layer={layer}/>

                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createClusterIcon}
                        maxClusterRadius={80}
                        showCoverageOnHover={false}
                    >
                        {markers.map(marker => (
                            <Marker
                                key={marker.id}
                                position={marker.position}
                                icon={markerIcon}
                            >
                                <Popup>{marker.title}</Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>

                    {popupPosition && (
                        <Popup position={popupPosition}>
                            <MapPositionPopupDetails
                                coordinates={popupPosition}
                                onAddClicked={() => onAddMarker()}
                            />
                        </Popup>
                    )}

                    <MapEventsHandler onRightClick={coordinates => setPopupPosition(coordinates)}/>

                    <MapResizeHandler/>
                </MapContainer>

                {/* Draggable resize handle */}
                <div className="resize-handle" onMouseDown={onMouseDown}><hr/></div>

                <LoadingOverlay visible={isMapLoading}/>
            </div>
            <MapEditorLayerSwitcher selectedLayer={layer} onLayerSelected={onLayerSelected} />
        </div>

    )
}

export default MapEditor;