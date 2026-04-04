import "../../styles/components/map/GeoFeaturePopupDetails.css";
import type { Feature } from "geojson";
import {useMap} from "react-leaflet";
import area from "@turf/area";
import infoBtnImg from "../../assets/info-btn-img.png";
import deleteBtnImg from "../../assets/delete-btn-img.png";
import moveLayerDownBtnImg from "../../assets/move-layer-down-btn-img.png";
import moveLayerUpBtnImg from "../../assets/move-layer-up-btn-img.png";
import L from "leaflet";
import type {FeatureLayer} from "../../commons/schemas/gis-schemas.ts";
import {toast} from "react-toastify";

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
    const { id, type, radius, borderColor, title, details } = feature.properties || {};

    const handleViewDetails = () => {
        onViewGeoFeatureDetails(id)
        map.closePopup();
    }

    const handleDelete = () => {
        onDeleteGeoFeature(id);
        map.closePopup();
    };

    const handleSendToBack = () => {
        map.eachLayer((layer: FeatureLayer) => {
            if (layer.featureId === id) {
                (layer as L.Path).bringToBack();
            }
        });
        map.closePopup();
        toast.info("Layer moved down", {
            position: "bottom-left",
            autoClose: 3000,
            theme: "dark"
        });
    };

    const handleBringToFront = () => {
        map.eachLayer((layer: FeatureLayer) => {
            if (layer.featureId === id) {
                (layer as L.Path).bringToFront();
            }
        });
        map.closePopup();
        toast.info("Layer moved up", {
            position: "bottom-left",
            autoClose: 3000,
            theme: "dark"
        });
    };

    const formatRadius = (m: number): string => {
        if (m >= 1000) return `${(m / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
        return `${m.toLocaleString(undefined, { maximumFractionDigits: 1 })} m`;
    };

    const formatArea = (m2: number): string => {
        if (m2 >= 1_000_000) return `${(m2 / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} km²`;
        return `${m2.toLocaleString(undefined, { maximumFractionDigits: 1 })} m²`;
    };

    const getArea = () => {
        if (type === "circle" && radius) return formatArea(Math.PI * Math.pow(radius, 2));
        if (feature.geometry.type === "Polygon") return formatArea(area(feature));

        return null;
    };

    const areaValue = getArea();

    return (
        <div className="geofeature-popup">
            <h4 style={{ color: borderColor }}>
                {
                    type === "marker" ?
                        `📍 ${title ?? "Explosive Item"}` :
                        `🚧 ${title ?? "Hazard Zone"}`
                }
            </h4>
            <p>{details || "No description provided."}</p>
            {radius && (
                <p><strong>Radius:</strong> {formatRadius(radius)}</p>
            )}
            {areaValue && (
                <p><strong>Area:</strong> {areaValue}</p>
            )}

            <div className="controls">
                <div>
                    <img src={infoBtnImg}
                         alt="Info button"
                         onClick={handleViewDetails}
                    />
                </div>

                <div>
                    <img src={deleteBtnImg}
                         alt="Delete button"
                         onClick={handleDelete}
                    />
                </div>

                {type !== "marker" && (
                    <div>
                        <img src={moveLayerDownBtnImg}
                             alt="Send to back button"
                             onClick={handleSendToBack}
                        />
                    </div>
                )}

                {type !== "marker" && (
                    <div>
                        <img src={moveLayerUpBtnImg}
                             alt="Bring to front button"
                             onClick={handleBringToFront}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeoFeaturePopupDetails;