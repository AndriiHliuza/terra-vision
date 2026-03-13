import "../styles/components/MapPositionDetailsPopup.css";
import {useNavigate, useParams} from "react-router-dom";
import type {LocationProps} from "../commons/schemas/gis-schemas.ts";

function MapPositionDetailsPopup({ lat, lng }: LocationProps) {

    const navigate = useNavigate();
    const { lang } = useParams();

    return (
        <div className="map-position-popup">
            <strong>Coordinates:</strong>
            <br/>
            Lat: {lat.toFixed(6)}
            <br/>
            Lng: {lng.toFixed(6)}
            <br/>
            <button
                onClick={() => navigate(`/${lang}/map/marker`)}
            >
                ADD
            </button>
        </div>
    )
}

export default MapPositionDetailsPopup;