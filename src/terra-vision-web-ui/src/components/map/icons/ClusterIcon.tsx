import locationMarker from "../../../assets/location-marker.png";

export function ClusterIcon({count}: { count: number }) {
    return (
        <div style={{position: "relative", width: "30px", height: "30px"}}>
            <img
                src={locationMarker}
                alt="Cluster"
                style={{width: "30px", height: "30px"}}
            />
            <span style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",

                height: "18px",
                width: "18px",

                background: "#2563eb",
                color: "white",

                border: "2px solid white",
                borderRadius: "50%",

                lineHeight: "18px",
                fontSize: "11px",
                fontWeight: "700",

                textAlign: "center",
            }}>
                {count}
            </span>
        </div>
    )
}