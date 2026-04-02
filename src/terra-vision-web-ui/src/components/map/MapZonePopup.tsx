import type { Feature } from "geojson";

interface MapZonePopupProps {
    feature: Feature;
    onViewDetails: (id: string | number) => void;
}

const MapZonePopup = ({ feature, onViewDetails }: MapZonePopupProps) => {
    const { id, type, radius, borderColor } = feature.properties || {};

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
                onClick={() => onViewDetails(id)}
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
                SEE DETAILS
            </button>
        </div>
    );
};

export default MapZonePopup;