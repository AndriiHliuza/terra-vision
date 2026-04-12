import "../../styles/pages/map/MapPage.css";
import {
    GeoJSON,
    MapContainer,
    Popup, ZoomControl
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../../components/Header.tsx";
import {useCallback, useEffect, useState} from "react";
import {type Coordinates, DEFAULT_FEATURE_STYLE, type FeatureProperties} from "../../commons/schemas/gis-schemas.ts";
import MapLayers from "../../components/map/MapLayers.tsx";
import {Outlet} from "react-router-dom";
import MapPositionPopupDetails from "../../components/map/popups/MapPositionPopupDetails.tsx";
import {API_DOMAIN, MAP_LAYERS} from "../../configs/settings.ts";
import LoadingOverlay from "../../components/LoadingOverlay.tsx";
import MapPageLayerSwitcher from "../../components/map/layer-switchers/MapPageLayerSwitcher.tsx";
import {MapEventsHandler} from "../../components/map/handlers/MapEventsHandler.tsx";
import MarkerClusterGroup from "react-leaflet-cluster";
import {createClusterIcon, createMapPageMarkerIcon} from "../../components/map/icons/map-icons.tsx";
import type {Feature, FeatureCollection, Geometry} from "geojson";
import L from "leaflet";
import FeaturePopupDetails from "../../components/map/popups/FeaturePopupDetails.tsx";
import {axiosWebClient} from "../../configs/axios-web-client.ts";
import {toast} from "react-toastify";
import {useTranslation} from "react-i18next";


function MapPage() {

    const {t} = useTranslation();

    const [isMapLoading, setMapLoading] = useState<boolean>(false);
    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);

    const [features, setFeatures] = useState<Feature<Geometry, FeatureProperties>[]>([]);

    const [positionPopupDetails, setPositionPopupDetails] = useState<Coordinates | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<{
        feature: Feature<Geometry, FeatureProperties>;
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
        axiosWebClient.get<FeatureCollection<Geometry, FeatureProperties>>(`${API_DOMAIN}/api/gis/features/active`)
            .then(response => setFeatures(response.data.features))
            .catch(() => toast.error(t("pop-ups.error-fetching-geojson-features-pop-up.title")))
            .finally(() => setMapLoading(false))
    }, [t])

    useEffect(() => {
        console.log(features)
    }, [features]);

    const filterCirclesAndPolygons = useCallback((feature: Feature<Geometry, FeatureProperties>) => {
        if (feature.properties?.type === "circle") {
            const radius = feature.properties?.radius;
            return typeof radius === 'number' && radius > 0;
        }
        return feature.properties?.type === "polygon";
    }, []);

    const filterMarkers = useCallback((feature: Feature<Geometry, FeatureProperties>) => {
        return feature.properties?.type === "marker";
    }, []);

    const getStyle = (feature: Feature<Geometry, FeatureProperties> | undefined) => {
        if (!feature) return {};
        return  {
            color: feature.properties.borderColor || DEFAULT_FEATURE_STYLE.borderColor,
            fillColor: feature.properties.fillColor || DEFAULT_FEATURE_STYLE.fillColor,
            fillOpacity: feature.properties.fillOpacity || DEFAULT_FEATURE_STYLE.fillOpacity,
            weight: feature.properties.borderWeight || DEFAULT_FEATURE_STYLE.borderWeight
        }

    };

    const pointToLayer = (feature: Feature<Geometry, FeatureProperties>, latlng: L.LatLng) => {
        const props = feature.properties;
        if (feature.properties?.type === "circle") {
            // If radius is null, undefined, or 0, return an empty layer group (nothing shows)
            if (!props.radius || props.radius <= 0) return L.layerGroup();
            return L.circle(latlng, {
                radius: props.radius,
                color: props.borderColor || DEFAULT_FEATURE_STYLE.borderColor,
                fillColor: props.fillColor || DEFAULT_FEATURE_STYLE.fillColor,
                fillOpacity: props.fillOpacity ?? DEFAULT_FEATURE_STYLE.fillOpacity,
                weight: props.borderWeight ?? DEFAULT_FEATURE_STYLE.borderWeight
            });
        }
        return L.marker(latlng, {
            icon: createMapPageMarkerIcon(
                props?.fillColor || undefined,
                props?.borderColor || undefined,
                props?.fillOpacity ?? undefined
            )
        });
    };

    const onEachFeatureClick = useCallback((feature: Feature<Geometry, FeatureProperties>, leafletLayer: L.Layer) => {
        leafletLayer.on("click", (e: L.LeafletMouseEvent) => {
            setSelectedFeature({
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

                    {features.length > 0 && (
                        <>
                            <GeoJSON
                                key={`shapes-layer-${features.length}`}
                                data={{ type: "FeatureCollection", features: features } as FeatureCollection}
                                filter={filterCirclesAndPolygons}
                                style={getStyle}
                                pointToLayer={pointToLayer}
                                onEachFeature={onEachFeatureClick}
                            />

                            <MarkerClusterGroup
                                chunkedLoading
                                iconCreateFunction={createClusterIcon}
                                maxClusterRadius={80}
                                showCoverageOnHover={false}
                            >
                                <GeoJSON
                                    key={`markers-layer-${features.length}`}
                                    data={{ type: "FeatureCollection", features: features } as FeatureCollection<Geometry, FeatureProperties>}
                                    filter={filterMarkers}
                                    pointToLayer={pointToLayer}
                                    onEachFeature={onEachFeatureClick}
                                />
                            </MarkerClusterGroup>
                        </>
                    )}

                    {selectedFeature && (
                        <Popup
                            key={`${selectedFeature.feature.properties?.id}-${selectedFeature.timestamp}`}
                            position={selectedFeature.latlng}
                        >
                            <FeaturePopupDetails
                                feature={selectedFeature.feature}
                                setFeatures={setFeatures}
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
