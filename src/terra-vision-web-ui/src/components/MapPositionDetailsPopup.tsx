import "../styles/components/MapPositionDetailsPopup.css";
import {ROUTES} from "../configs/settings.ts";
import {useNavigate} from "react-router-dom";

function MapPositionDetailsPopup({ lat, lng }: LocationProps) {

    const navigate = useNavigate();

    return (
        <div className="map-position-popup">
            <strong>Coordinates:</strong>
            <br/>
            Lat: {lat.toFixed(6)}
            <br/>
            Lng: {lng.toFixed(6)}
            <br/>
            <button
                onClick={() => navigate(ROUTES.MAP_ROUTES.MARKER)}
            >
                ADD
            </button>
        </div>
    )
}

export default MapPositionDetailsPopup;