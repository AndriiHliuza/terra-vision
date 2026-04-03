import "../styles/pages/MapEditor.css";
import {
    MapContainer,
    Marker,
    Popup
} from "react-leaflet";
import {useEffect, useState} from "react";
import {type Coordinates, DEFAULT_FEATURE_STYLE} from "../commons/schemas/gis-schemas.ts";
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
import L from "leaflet";
import type {Feature, Point} from "geojson";
import GeoManHandler from "../components/map/GeoManHandler.tsx";
import GeoFeaturePopupDetails from "../components/map/GeoFeaturePopupDetails.tsx";
import {fetchStubMapFeatures} from "../commons/stubs/geo-stub.ts";


function MapEditor() {

    const {t} = useTranslation();

    const [isMapLoading, setMapLoading] = useState(true);

    const [positionPopupDetails, setPositionPopupDetails] = useState<Coordinates | null>(null);

    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);

    const [geoFeatures, setGeoFeatures] = useState<Feature[]>([]);
    const [geoFeaturePopupDetails, setGeoFeaturePopupDetails] = useState<{
        feature: Feature;
        latlng: L.LatLng;
    } | null>(null);

    const [borderColor, setBorderColor] = useState(DEFAULT_FEATURE_STYLE.borderColor);
    const [fillColor, setFillColor] = useState(DEFAULT_FEATURE_STYLE.fillColor);
    const [fillOpacity, setFillOpacity] = useState(DEFAULT_FEATURE_STYLE.fillOpacity);
    const [borderWeight, setBorderWeight] = useState(DEFAULT_FEATURE_STYLE.borderWeight);

    const {height, elementRef, onMouseDown} = useElementHeightResizer({storageKey: "adminMapContainerHeight"})

    const onLayerSelected = (mapLayer: string) => {
        setLayer(mapLayer);
        localStorage.setItem("map-layer", mapLayer);
    }

    const handleViewGeoFeatureDetails = (id: string) => {
        console.log(`handleViewGeoFeatureDetails: ${id}`);

        const geoFeature = geoFeatures.find(f => f.properties?.id === id);

        setGeoFeaturePopupDetails(null);
    };

    const handleDeleteGeoFeature = (id: string) => {
        console.log(`handleDeleteGeoFeature: ${id}`);
        setGeoFeatures((prev) => prev.filter((feature) => feature.properties?.id !== id));
    }

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        const loadInitialData = async () => {
            setMapLoading(true);
            try {
                // Simulated backend call
                const data = await fetchStubMapFeatures();

                // This will trigger the GeoManHandler hydration
                setGeoFeatures(data);
            } catch (error) {
                console.error("Stub loading error:", error);
            } finally {
                setMapLoading(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        console.log(geoFeatures)
    }, [geoFeatures]);

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
                        geoFeatures={geoFeatures}
                        setGeoFeatures={setGeoFeatures}
                        onGeoFeatureClick={(
                            feature,
                            latlng
                        ) => setGeoFeaturePopupDetails({
                            feature,
                            latlng
                        })}
                        borderColor={borderColor}
                        fillColor={fillColor}
                        fillOpacity={fillOpacity}
                        borderWeight={borderWeight}
                    />

                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createClusterIcon}
                        maxClusterRadius={80}
                        showCoverageOnHover={false}
                    >
                        {geoFeatures
                            .filter(feature => feature.properties?.type === 'marker')
                            .map(feature => {
                                const pointGeometry = feature.geometry as Point;

                                const position: [number, number] = [
                                    pointGeometry.coordinates[1],
                                    pointGeometry.coordinates[0]
                                ]
                                return (
                                    <Marker
                                        key={feature.properties?.id}
                                        position={position}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            add: (e) => {
                                                const marker = e.target;
                                                marker.options.pmIgnore = true; // Tell Geoman Edit Mode to skip this
                                            },
                                            click: event => setGeoFeaturePopupDetails({
                                                feature: feature,
                                                latlng: event.latlng
                                            })
                                        }}
                                    >
                                        <Popup>{feature.properties?.id}</Popup>
                                    </Marker>
                                )
                            })
                        }
                    </MarkerClusterGroup>

                    {positionPopupDetails && (
                        <Popup position={positionPopupDetails}>
                            <MapPositionPopupDetails coordinates={positionPopupDetails} />
                        </Popup>
                    )}

                    {geoFeaturePopupDetails && (
                        <Popup position={geoFeaturePopupDetails.latlng}>
                            <GeoFeaturePopupDetails
                                feature={geoFeaturePopupDetails.feature}
                                onViewDetails={handleViewGeoFeatureDetails}
                                onDeleteZone={handleDeleteGeoFeature}
                            />
                        </Popup>
                    )}

                    <MapEventsHandler onRightClick={coordinates => setPositionPopupDetails(coordinates)}/>

                    <MapResizeHandler/>
                </MapContainer>

                {/* Draggable resize handle */}
                <div className="resize-handle" onMouseDown={onMouseDown}>
                    <hr/>
                </div>

                <LoadingOverlay visible={isMapLoading}/>
            </div>
            <MapEditorLayerSwitcher selectedLayer={layer} onLayerSelected={onLayerSelected}/>
        </div>

    )
}

export default MapEditor;