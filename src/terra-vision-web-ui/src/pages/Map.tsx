import "../styles/pages/Map.css"
import "../styles/components/header/MapPageHeader.css"
import {
    Circle,
    LayersControl,
    MapContainer,
    Marker,
    Polygon,
    Popup,
    Rectangle,
    TileLayer,
    Tooltip,
    useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header.tsx";
import {useEffect, useState} from "react";
import type {MarkerData, Shape} from "../utils/application-types.ts";
import {stubMarkers, stubShapes} from "../utils/stub-data.ts";
import L from "leaflet";
import LoadingOverlay from "../components/LoadingOverlay.tsx";


export function MapEventsHandler() {
    const map = useMapEvents({
        click: (e) => {
            // Change cursor to crosshair on click
            const mapContainer = map.getContainer();
            const originalCursor = mapContainer.style.cursor;
            mapContainer.style.cursor = "default";

            // Show popup at clicked location
            const {lat, lng} = e.latlng;
            L.popup()
                .setLatLng([lat, lng])
                .setContent(`
                    <div>
                        <strong>Coordinates:</strong><br/>
                        Lat: ${lat.toFixed(6)}<br/>
                        Lng: ${lng.toFixed(6)}
                    </div>
                `).openOn(e.target);

            // Revert cursor back to original after short delay
            setTimeout(() => {
                mapContainer.style.cursor = originalCursor || "";
            }, 300); // 300ms
        },
    });

    return null;
}

// Helper to add hover styles
const getShapeEventHandlers = (defaultStyle: L.PathOptions, hoverStyle: L.PathOptions) => ({
    mouseover: (e: L.LeafletMouseEvent) => {
        e.target.setStyle(hoverStyle);
    },
    mouseout: (e: L.LeafletMouseEvent) => {
        e.target.setStyle(defaultStyle);
    },
});

function Map() {

    const [loading, setLoading] = useState(true);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [markers, setMarkers] = useState<MarkerData[]>([]);

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        setTimeout(() => {
            setShapes(stubShapes);
            setMarkers(stubMarkers);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div id="map-page">
            <LoadingOverlay visible={loading}/>
            <Header/>
            <MapContainer
                center={[48.4, 31]}
                zoomControl={false}
                zoom={6}
                minZoom={2}
                maxBounds={[[-85, -Infinity], [85, Infinity]]}
                maxBoundsViscosity={1.0}
            >
                <LayersControl position="bottomleft">

                    {/* --- OSM FAMILY --- */}
                    {/* Streets Layer (Default) */}
                    <LayersControl.BaseLayer checked name="OSM Streets">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="OSM Humanitarian">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by HOT OSM'
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="OpenTopoMap">
                        <TileLayer
                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                        />
                    </LayersControl.BaseLayer>


                    {/* --- ESRI GLOBAL LAYERS --- */}
                    <LayersControl.BaseLayer name="ESRI Satellite">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, USDA, USGS'
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="ESRI Topographic">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri — Esri, DeLorme, NAVTEQ, TomTom, USGS, FAO, NPS'
                        />
                    </LayersControl.BaseLayer>

                    {/* --- CARTO --- */}
                    <LayersControl.BaseLayer name="Carto Light">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* Render markers */}
                {markers.map(marker => (
                    <Marker key={marker.id} position={marker.position}>
                        <Tooltip>{marker.tooltip}</Tooltip>
                        <Popup>{marker.popup}</Popup>
                    </Marker>
                ))}

                {shapes.map((shape) => {
                    switch (shape.type) {
                        case "polygon":
                        case "triangle": {
                            const polygonDefault = {color: "blue", fillColor: "lightblue", fillOpacity: 0.4};
                            const polygonHover = {color: "darkblue", fillColor: "skyblue", fillOpacity: 0.6};
                            return (
                                <Polygon
                                    key={shape.id}
                                    positions={shape.coords}
                                    pathOptions={polygonDefault}
                                    eventHandlers={getShapeEventHandlers(polygonDefault, polygonHover)}
                                />
                            );
                        }

                        case "rectangle": {
                            const rectDefault = {color: "green", fillColor: "lightgreen", fillOpacity: 0.4};
                            const rectHover = {color: "darkgreen", fillColor: "lime", fillOpacity: 0.6};
                            return (
                                <Rectangle
                                    key={shape.id}
                                    bounds={shape.bounds}
                                    pathOptions={rectDefault}
                                    eventHandlers={getShapeEventHandlers(rectDefault, rectHover)}
                                />
                            );
                        }

                        case "circle": {
                            const circleDefault = {color: "red", fillColor: "pink", fillOpacity: 0.4};
                            const circleHover = {color: "darkred", fillColor: "orange", fillOpacity: 0.6};
                            return (
                                <Circle
                                    key={shape.id}
                                    center={shape.center}
                                    radius={shape.radius}
                                    pathOptions={circleDefault}
                                    eventHandlers={getShapeEventHandlers(circleDefault, circleHover)}
                                />
                            );
                        }

                        default:
                            return null;
                    }
                })}
                <MapEventsHandler/>
            </MapContainer>
        </div>


    )
}

export default Map;
