import type { Feature } from "geojson";
import {useMap} from "react-leaflet";

interface GeoFeaturePopupDetailsProps {
    feature: Feature;
    onViewGeoFeatureDetails: (id: string) => void;
    onDeleteGeoFeature: (id: string) => void;
}

const GeoFeaturePopupDetails = ({
                                    feature,
                                    onViewGeoFeatureDetails,
                                    onDeleteGeoFeature
}: GeoFeaturePopupDetailsProps) => {

    const map = useMap();
    const { id, type, radius, borderColor } = feature.properties || {};

    const handleViewDetails = () => {
        onViewGeoFeatureDetails(id);
    }

    const handleDelete = () => {
        onDeleteGeoFeature(id);
        map.closePopup();
    };
    return (
        <div style={{ minWidth: "160px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: borderColor }}>
                {type === "circle" ? "📍 Explosive Item" : "🚧 Hazard Zone"}
            </h4>
            <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                <p style={{ margin: "2px 0" }}><strong>ID:</strong> {id}</p>
                <p style={{ margin: "2px 0" }}><strong>Type:</strong> {type}</p>
                {radius && (
                    <p style={{ margin: "2px 0" }}>
                        <strong>Radius:</strong> {radius.toFixed(2)}m
                    </p>
                )}
            </div>

            <button
                onClick={handleDelete}
                style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#2196F3", // Professional Blue
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "background 0.2s"
                }}
            >
                DELETE
            </button>
        </div>
    );
};

export default GeoFeaturePopupDetails;