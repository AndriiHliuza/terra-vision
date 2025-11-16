import "../styles/pages/Map.css"
import "../styles/components/header/MapPageHeader.css"
import {MapContainer, Marker, Popup, TileLayer, Tooltip, useMapEvents} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../components/Header.tsx";

function MapClickHandler() {
    useMapEvents({
        click: (e) => {
            console.log('Clicked coordinates:', e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function Map() {

    return (
        <div id="map-page">
            <Header />
            <MapContainer
                center={[48.4, 31]}
                zoomControl={false}
                zoom={6}
                minZoom={2}
                maxBounds={[[-85, -Infinity], [85, Infinity]]}
                maxBoundsViscosity={1.0}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Marker */}
                <Marker position={[50.4, 30.7]}>
                    {/* Tooltip on hover */}
                    <Tooltip>
                        Hover me!
                    </Tooltip>

                    {/* Popup on click */}
                    <Popup>
                        Hello! I am a popup.
                    </Popup>
                </Marker>
                <Marker position={[50.6, 30.7]}>
                    {/* Tooltip on hover */}
                    <Tooltip>
                        Hover me!
                    </Tooltip>

                    {/* Popup on click */}
                    <Popup>
                        Hello! I am a popup.
                    </Popup>
                </Marker>
                <Marker position={[50.7, 30.7]}>
                    {/* Tooltip on hover */}
                    <Tooltip>
                        Hover me!
                    </Tooltip>

                    {/* Popup on click */}
                    <Popup>
                        Hello! I am a popup.
                    </Popup>
                </Marker>

                <MapClickHandler />
            </MapContainer>
        </div>


    )
}

export default Map;
