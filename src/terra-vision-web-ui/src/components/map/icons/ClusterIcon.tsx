import locationMarker from "../../../assets/location-marker.png";

export function ClusterIcon({ count }: { count: number }) {
    return (
        <div style={{ position: "relative", width: "30px", height: "30px" }}>
            <img
                src={locationMarker}
                alt="cluster"
                style={{ width: "30px", height: "30px" }}
            />
            <span style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                background: "#2563eb",
                color: "white",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                fontSize: "11px",
                fontWeight: "700",
                lineHeight: "18px",
                textAlign: "center",
                border: "2px solid white",
            }}>
        {count}
      </span>
        </div>
    )
}