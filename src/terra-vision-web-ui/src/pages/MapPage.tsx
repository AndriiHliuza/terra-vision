import "../styles/pages/MapPage.css";
import {
    MapContainer,
    Marker,
    Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header.tsx";
import {useEffect, useState} from "react";
import type {Coordinates, MarkerData} from "../commons/schemas/gis-schemas.ts";
import MapLayers from "../components/map/MapLayers.tsx";
import {Outlet} from "react-router-dom";
import MapPositionPopupDetails from "../components/map/MapPositionPopupDetails.tsx";
import {MAP_LAYERS} from "../configs/settings.ts";
import LoadingOverlay from "../components/LoadingOverlay.tsx";
import MapPageLayerSwitcher from "../components/map/MapPageLayerSwitcher.tsx";
import {MapEventsHandler} from "../components/map/handlers/MapEventsHandler.tsx";
import MarkerClusterGroup from "react-leaflet-cluster";
import {createClusterIcon, markerIcon} from "../components/map/icons/map-icons.tsx";


function MapPage() {

    const [isMapLoading, setMapLoading] = useState<boolean>(false);

    const [popupPosition, setPopupPosition] = useState<Coordinates | null>(null);

    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);
    const [markers, /*setMarkers*/] = useState<MarkerData[]>([]);

    const onLayerSelected = (mapLayer: string) => {
        setLayer(mapLayer);
        localStorage.setItem("map-layer", mapLayer);
    }

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        setMapLoading(true);
        const timer = setTimeout(() => {

            setMapLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [setMapLoading]);

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
                            <MapPositionPopupDetails coordinates={popupPosition}/>
                        </Popup>
                    )}

                    <MapEventsHandler onRightClick={coordinates => setPopupPosition(coordinates)}/>

                </MapContainer>
                <MapPageLayerSwitcher selectedLayer={layer} onLayerSelected={onLayerSelected}/>
                <Outlet/>
            </div>
            <LoadingOverlay visible={isMapLoading}/>
        </>

    )
}

export default MapPage;
