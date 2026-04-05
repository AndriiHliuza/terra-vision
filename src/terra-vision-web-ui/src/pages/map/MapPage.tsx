import "../../styles/pages/map/MapPage.css";
import {
    GeoJSON,
    MapContainer,
    Popup, ZoomControl
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../../components/Header.tsx";
import {useCallback, useEffect, useState} from "react";
import {type Coordinates, DEFAULT_FEATURE_STYLE} from "../../commons/schemas/gis-schemas.ts";
import MapLayers from "../../components/map/MapLayers.tsx";
import {Outlet} from "react-router-dom";
import MapPositionPopupDetails from "../../components/map/popups/MapPositionPopupDetails.tsx";
import {MAP_LAYERS} from "../../configs/settings.ts";
import LoadingOverlay from "../../components/LoadingOverlay.tsx";
import MapPageLayerSwitcher from "../../components/map/layer-switchers/MapPageLayerSwitcher.tsx";
import {MapEventsHandler} from "../../components/map/handlers/MapEventsHandler.tsx";
import MarkerClusterGroup from "react-leaflet-cluster";
import {createClusterIcon, markerIcon} from "../../components/map/icons/map-icons.tsx";
import {fetchStubMapData} from "../../commons/stubs/geo-stub.ts";
import type {Feature, FeatureCollection} from "geojson";
import L from "leaflet";
import GeoFeaturePopupDetails from "../../components/map/popups/GeoFeaturePopupDetails.tsx";


function MapPage() {

    const [isMapLoading, setMapLoading] = useState<boolean>(false);
    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);

    const [geoFeatures, setGeoFeatures] = useState<Feature[]>([]);

    const [positionPopupDetails, setPositionPopupDetails] = useState<Coordinates | null>(null);
    const [selectedGeoFeature, setSelectedGeoFeature] = useState<{
        feature: Feature;
        latlng: L.LatLng;
        timestamp: number;
    } | null>(null);

    const onLayerSelected = (mapLayer: string) => {
        setLayer(mapLayer);
        localStorage.setItem("map-layer", mapLayer);
    }

    // Stub backend data
    useEffect(() => {
        setMapLoading(true);
        fetchStubMapData()
            .then((collection: FeatureCollection) => setGeoFeatures(collection.features))
            .catch(err => console.error("Data fetch error:", err))
            .finally(() => setMapLoading(false));
    }, [])

    const filterCirclesAndPolygons = useCallback((geoFeature: Feature) => {
        if (geoFeature.properties?.type === "circle") {
            const radius = geoFeature.properties?.radius;
            return typeof radius === 'number' && radius > 0;
        }
        return geoFeature.properties?.type === "polygon";
    }, []);

    const filterMarkers = useCallback((feature: Feature) => {
        return feature.properties?.type === "marker";
    }, []);

    const getStyle = (geoFeature: Feature | undefined) => {
        if (!geoFeature) return {};
        return  {
            color: geoFeature.properties?.borderColor || DEFAULT_FEATURE_STYLE.borderColor,
            fillColor: geoFeature.properties?.fillColor || DEFAULT_FEATURE_STYLE.fillColor,
            fillOpacity: geoFeature.properties?.fillOpacity || DEFAULT_FEATURE_STYLE.fillOpacity,
            weight: geoFeature.properties?.borderWeight || DEFAULT_FEATURE_STYLE.borderWeight
        }

    };

    const pointToLayer = (geoFeature: Feature, latlng: L.LatLng) => {
        if (geoFeature.properties?.type === "circle") {
            return L.circle(latlng, {
                radius: geoFeature.properties.radius,
                color: geoFeature.properties?.borderColor,
                fillColor: geoFeature.properties?.fillColor,
                fillOpacity: geoFeature.properties?.fillOpacity,
                weight: geoFeature.properties?.borderWeight
            });
        }
        return L.marker(latlng, { icon: markerIcon });
    };

    const onEachGeoFeatureClick = useCallback((feature: Feature, leafletLayer: L.Layer) => {
        leafletLayer.on("click", (e: L.LeafletMouseEvent) => {
            setSelectedGeoFeature({
                feature,
                latlng: e.latlng,
                timestamp: Date.now()
            });
        });
    }, []);

    return (
        <>
            <div className="map-page">
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
                    <MapLayers layer={layer}/>


                    {geoFeatures.length > 0 && (
                        <>
                            <GeoJSON
                                key={`shapes-layer-${geoFeatures.length}`}
                                data={{ type: "FeatureCollection", features: geoFeatures } as FeatureCollection}
                                filter={filterCirclesAndPolygons}
                                style={getStyle}
                                pointToLayer={pointToLayer}
                                onEachFeature={onEachGeoFeatureClick}
                            />

                            <MarkerClusterGroup
                                chunkedLoading
                                iconCreateFunction={createClusterIcon}
                                maxClusterRadius={80}
                                showCoverageOnHover={false}
                            >
                                <GeoJSON
                                    key={`markers-layer-${geoFeatures.length}`}
                                    data={{ type: "FeatureCollection", features: geoFeatures } as FeatureCollection}
                                    filter={filterMarkers}
                                    pointToLayer={pointToLayer}
                                    onEachFeature={onEachGeoFeatureClick}
                                />
                            </MarkerClusterGroup>
                        </>
                    )}

                    {selectedGeoFeature && (
                        <Popup
                            key={`${selectedGeoFeature.feature.properties?.id}-${selectedGeoFeature.timestamp}`}
                            position={selectedGeoFeature.latlng}
                        >
                            <GeoFeaturePopupDetails
                                feature={selectedGeoFeature.feature}
                                setGeoFeatures={setGeoFeatures}
                            />
                        </Popup>
                    )}

                    {positionPopupDetails && (
                        <Popup
                            key={`pos-${positionPopupDetails.lat}-${positionPopupDetails.lng}`}
                            position={positionPopupDetails}
                        >
                            <MapPositionPopupDetails coordinates={positionPopupDetails}/>
                        </Popup>
                    )}

                    <MapEventsHandler onRightClick={coordinates => setPositionPopupDetails(coordinates)}/>
                    <ZoomControl position="bottomright" />
                </MapContainer>
                <MapPageLayerSwitcher selectedLayer={layer} onLayerSelected={onLayerSelected}/>
                <Outlet/>
            </div>
            <LoadingOverlay visible={isMapLoading}/>
        </>

    )
}

export default MapPage;
