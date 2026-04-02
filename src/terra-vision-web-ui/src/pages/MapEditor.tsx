import "../styles/pages/MapEditor.css";
import {
    FeatureGroup,
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
import {EditControl} from "react-leaflet-draw";
import L from "leaflet";
import type {Feature} from "geojson";
import GeoManHandler from "../components/map/GeoManHandler.tsx";
import MapZonePopup from "../components/map/MapZonePopup.tsx";


function MapEditor() {

    const {t} = useTranslation();

    const [isMapLoading, setMapLoading] = useState(true);

    const [popupPosition, setPopupPosition] = useState<Coordinates | null>(null);

    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [geoFeatures, setGeoFeatures] = useState<Feature[]>([]);
    const [layerPopup, setLayerPopup] = useState<{
        feature: Feature;
        latlng: L.LatLng;
        layer: L.Layer;
    } | null>(null);

    const [borderColor, setBorderColor] = useState("#ff0000");
    const [fillColor, setFillColor] = useState("#ff4444");
    const [fillOpacity, setFillOpacity] = useState(0.4);
    const [borderWeight, setBorderWeight] = useState(3);

    const { height, elementRef, onMouseDown } = useElementHeightResizer({storageKey: "adminMapContainerHeight"})

    const onLayerSelected = (mapLayer: string) => {
        setLayer(mapLayer);
        localStorage.setItem("map-layer", mapLayer);
    }

    const onAddMarker = () => {
        console.log("ADD MARKER BUTTON")
    }

    const handleViewLayerDetails = (id: string | number) => {
        console.log(`[NAVIGATE] Showing full details for Zone: ${id}`);

        // Find the feature in our state for full data access
        const zoneData = geoFeatures.find(f => f.properties?.id === id);
        alert(`Navigating to accounting details for ID: ${id}\nType: ${zoneData?.properties?.type}`);

        // Close the map popup
        setLayerPopup(null);
    };

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        setMapLoading(true)
        const timer = setTimeout(() => {

            setMapLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // const onShapeCreated = (e: L.DrawEvents.Created) => {
    //     const { layerType, layer } = e;
    //     const drawnLayer = layer as L.Polygon | L.Circle;
    //     const geoJson = drawnLayer.toGeoJSON() as Feature;
    //
    //     const layerId = L.Util.stamp(layer);
    //
    //     if (layerType === "circle") {
    //         const circle = layer as L.Circle;
    //         geoJson.properties = {
    //             ...geoJson.properties,
    //             radius: circle.getRadius(),
    //             type: "circle"
    //         };
    //     } else {
    //         geoJson.properties = { ...geoJson.properties, type: "polygon" };
    //     }
    //
    //     geoJson.properties = { ...geoJson.properties, id: layerId };
    //     console.log("New Feature Created:", geoJson);
    //     console.log("New GIS Object Created. ID:", layerId);
    // };
    //
    // const onShapeEdited = (e: L.DrawEvents.Edited) => {
    //     const editedLayers = e.layers;
    //     editedLayers.eachLayer((layer) => {
    //         const polyLayer = layer as L.Polygon | L.Circle;
    //         const layerId = L.Util.stamp(layer);
    //         const updatedGeoJson = polyLayer.toGeoJSON() as Feature;
    //
    //         // Update radius if it was a circle that moved/resized
    //         if (layer instanceof L.Circle) {
    //             updatedGeoJson.properties = {
    //                 ...updatedGeoJson.properties,
    //                 radius: layer.getRadius(), // Only Circles have this method!
    //                 type: "circle",
    //                 id: layerId
    //             };
    //         } else {
    //             // If it's not a Circle, it's a Polygon in our restricted setup
    //             updatedGeoJson.properties = {
    //                 ...updatedGeoJson.properties,
    //                 type: "polygon",
    //                 id: layerId
    //             };
    //         }
    //
    //         setGeoFeatures((prev) =>
    //             prev.map(feature => feature.properties?.id === layerId ? updatedGeoJson : feature)
    //         );
    //
    //         console.log("Edited GIS Object:", layerId);
    //         console.log("Feature Edited:", updatedGeoJson);
    //         // Logic to update state/backend would go here
    //     });
    // };
    //
    // const onShapeDeleted = (e: L.DrawEvents.Deleted) => {
    //     const deletedLayers = e.layers;
    //     deletedLayers.eachLayer((layer) => {
    //         const layerId = L.Util.stamp(layer);
    //
    //         setGeoFeatures((prev) =>
    //             prev.filter(feature => feature.properties?.id !== layerId)
    //         );
    //         console.log("Deleted GIS Object:", layerId);
    //     });
    // };

    /* ---------- MAP EDIT HANDLERS ---------- */

    return (
        <div className="map-editor">
            <h1>{t("admin-pages.map-editor.tab-name").toUpperCase()}</h1>
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

                    <GeoManHandler
                        setGeoFeatures={setGeoFeatures}
                        onLayerClick={(feature, latlng, layer) => setLayerPopup({
                            feature, latlng, layer
                        })}
                        borderColor={borderColor}
                        fillColor={fillColor}
                        fillOpacity={fillOpacity}
                        borderWeight={borderWeight}
                    />
                    {/*<FeatureGroup>*/}
                    {/*    <EditControl*/}
                    {/*        position="topright"*/}
                    {/*        onCreated={onShapeCreated}*/}
                    {/*        onEdited={onShapeEdited}*/}
                    {/*        onDeleted={onShapeDeleted}*/}
                    {/*        draw={{*/}
                    {/*            polyline: false,*/}
                    {/*            rectangle: false,*/}
                    {/*            marker: false,*/}
                    {/*            circlemarker: false,*/}
                    {/*            polygon: {*/}
                    {/*                allowIntersection: false,*/}
                    {/*                shapeOptions: { color: "#ff7800" }*/}
                    {/*            },*/}
                    {/*            circle: {*/}
                    {/*                shapeOptions: { color: "#ff4444" }*/}
                    {/*            }*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*</FeatureGroup>*/}

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

                    {layerPopup && (
                        <Popup position={layerPopup.latlng}>
                            <MapZonePopup
                                feature={layerPopup.feature}
                                onViewDetails={handleViewLayerDetails}
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