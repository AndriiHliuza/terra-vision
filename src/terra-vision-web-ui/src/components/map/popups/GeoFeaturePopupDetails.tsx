import "../../../styles/components/map/popups/GeoFeaturePopupDetails.css";
import type {Feature} from "geojson";
import {useMap} from "react-leaflet";
import area from "@turf/area";
import infoBtnImg from "../../../assets/info-btn-img.png";
import deleteBtnImg from "../../../assets/delete-btn-img.png";
import moveLayerDownBtnImg from "../../../assets/move-layer-down-btn-img.png";
import moveLayerUpBtnImg from "../../../assets/move-layer-up-btn-img.png";
import L from "leaflet";
import type {FeatureLayer} from "../../../commons/schemas/gis-schemas.ts";
import {toast} from "react-toastify";
import type {Dispatch, SetStateAction} from "react";
import Swal from "sweetalert2";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";

interface GeoFeaturePopupDetailsProps {
    feature: Feature;
    setGeoFeatures: Dispatch<SetStateAction<Feature[]>>;
}

const GeoFeaturePopupDetails = ({
                                    feature,
                                    setGeoFeatures,
                                }: GeoFeaturePopupDetailsProps) => {

    const {t} = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const {lang} = useParams();
    const map = useMap();
    const {id, type, radius, borderColor, title, details} = feature.properties || {};

    const isMapEditorRoute = location.pathname === `/${lang}/admin/map-editor`;

    const handleViewDetails = () => {
        if (feature.properties?.id) {
            if (isMapEditorRoute) {
                navigate(`/${lang}/admin/map-editor/${feature.properties.id}`)
            } else {
                navigate(`/${lang}/map/${feature.properties.id}`)
            }
        }

        map.closePopup();
    }

    const handleDelete = async () => {
        const confirmationResult = await Swal.fire({
            title: t("pop-ups.delete-geofeature-confirmation-pop-up.title"),
            text: t("pop-ups.delete-geofeature-confirmation-pop-up.description"),
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: t("pop-ups.confirmation-pop-up.confirm-btn-text"),
            cancelButtonText: t("pop-ups.confirmation-pop-up.cancel-btn-text"),
            background: "#1a1a1e",
            color: "#fff",
            backdrop: "rgba(0, 0, 0, 0.5)",
        })
        if (!confirmationResult.isConfirmed) return;

        // perform delete here
        const performDelete = async () => {

        }

        await toast.promise(
            performDelete(),
            {
                pending: t("pop-ups.perform-geofeture-deletion-pop-up.pending-text"),
                success: t("pop-ups.perform-geofeture-deletion-pop-up.success-text"),
                error: t("pop-ups.perform-geofeture-deletion-pop-up.error-text")
            },
            {
                position: "bottom-left",
                theme: "dark"
            }
        );

        setGeoFeatures((prev) => prev.filter((feature) => feature.properties?.id !== id));
        map.closePopup();
    };

    const handleSendToBack = () => {
        map.eachLayer((layer: FeatureLayer) => {
            if (layer.featureId === id) {
                (layer as L.Path).bringToBack();
            }
        });
        map.closePopup();
        toast.info(t("pop-ups.map-layer-moved-down-pop-up.title"), {
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
        toast.info(t("pop-ups.map-layer-moved-up-pop-up.title"), {
            position: "bottom-left",
            autoClose: 3000,
            theme: "dark"
        });
    };

    const formatRadius = (m: number): string => {
        if (m >= 1000) return `${(m / 1000).toLocaleString(undefined, {maximumFractionDigits: 2})} km`;
        return `${m.toLocaleString(undefined, {maximumFractionDigits: 1})} m`;
    };

    const formatArea = (m2: number): string => {
        if (m2 >= 1_000_000) return `${(m2 / 1_000_000).toLocaleString(undefined, {maximumFractionDigits: 2})} km²`;
        return `${m2.toLocaleString(undefined, {maximumFractionDigits: 1})} m²`;
    };

    const getArea = () => {
        if (type === "circle" && radius) return formatArea(Math.PI * Math.pow(radius, 2));
        if (feature.geometry.type === "Polygon") return formatArea(area(feature));

        return null;
    };

    const areaValue = getArea();

    return (
        <div className="geofeature-popup">
            <h4 style={{color: borderColor}}>
                {
                    type === "marker" ?
                        ` ${title ?? t("pop-ups.geofeature-pop-up.item-title")}` :
                        ` ${title ?? t("pop-ups.geofeature-pop-up.zone-title")}`
                }
            </h4>
            <p><strong>ID:</strong> {feature.properties?.id}</p>
            <p>{details || t("pop-ups.geofeature-pop-up.details")}</p>
            {radius && (
                <p><strong>{t("pop-ups.geofeature-pop-up.radius")}:</strong> {formatRadius(radius)}</p>
            )}
            {areaValue && (
                <p><strong>{t("pop-ups.geofeature-pop-up.area")}:</strong> {areaValue}</p>
            )}

            <div className="controls">
                <div>
                    <img src={infoBtnImg}
                         alt="Info button"
                         onClick={handleViewDetails}
                    />
                </div>

                {isMapEditorRoute && (
                    <div>
                        <img src={deleteBtnImg}
                             alt="Delete button"
                             onClick={handleDelete}
                        />
                    </div>
                )}

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