import "../../styles/pages/map/MapEditor.css";
import {
    MapContainer,
    Popup
} from "react-leaflet";
import {type MouseEventHandler, useCallback, useEffect, useState} from "react";
import {
    type Coordinates,
    DEFAULT_FEATURE_STYLE,
    type FeatureProperties,
    type FeatureStyle
} from "../../commons/schemas/gis-schemas.ts";
import MapLayers from "../../components/map/MapLayers.tsx";
import {useTranslation} from "react-i18next";
import {API_DOMAIN, MAP_LAYERS} from "../../configs/settings.ts";
import LoadingOverlay from "../../components/LoadingOverlay.tsx";
import {useElementHeightResizer} from "../../commons/hooks/hooks.ts";
import {MapResizeHandler} from "../../components/map/handlers/MapResizeHandler.tsx";
import {MapEventsHandler} from "../../components/map/handlers/MapEventsHandler.tsx";
import MapPositionPopupDetails from "../../components/map/popups/MapPositionPopupDetails.tsx";
import MapEditorLayerSwitcher from "../../components/map/layer-switchers/MapEditorLayerSwitcher.tsx";
import L from "leaflet";
import type {Feature, FeatureCollection, Geometry} from "geojson";
import GeoManHandler from "../../components/map/handlers/GeoManHandler.tsx";
import FeaturePopupDetails from "../../components/map/popups/FeaturePopupDetails.tsx";
import {toast} from "react-toastify";
import saveBtnImg from "../../assets/save-btn-img.png";
import reloadBtnImg from "../../assets/reload-btn-img.png";
import Swal from "sweetalert2";
import MapEditorStylePanel from "../../components/map/MapEditorStylePanel.tsx";
import {axiosWebClient} from "../../configs/axios-web-client.ts";
import {prepareFeatureCollection} from "../../commons/utils/gis-utils.ts";

function MapEditor() {

    const {t} = useTranslation();
    const [isMapLoading, setMapLoading] = useState(true);
    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);
    const {height, elementRef, onMouseDown} = useElementHeightResizer({storageKey: "adminMapContainerHeight"})

    const [features, setFeatures] = useState<Feature<Geometry, FeatureProperties>[]>([]);

    const [featurePopupDetails, setFeaturePopupDetails] = useState<{
        feature: Feature<Geometry, FeatureProperties>;
        latlng: L.LatLng;
        timestamp: number;
    } | null>(null);
    const [positionPopupDetails, setPositionPopupDetails] = useState<Coordinates | null>(null);

    const [selectedFeature, setSelectedFeature] = useState<Feature<Geometry, FeatureProperties> | null>(null);
    const [featureStyle, setFeatureStyle] = useState<FeatureStyle>({
        fillColor: DEFAULT_FEATURE_STYLE.fillColor, borderColor: DEFAULT_FEATURE_STYLE.borderColor,
        fillOpacity: DEFAULT_FEATURE_STYLE.fillOpacity, borderWeight: DEFAULT_FEATURE_STYLE.borderWeight
    });

    const onLayerSelected = (mapLayer: string) => {
        setLayer(mapLayer);
        localStorage.setItem("map-layer", mapLayer);
    }

    const onFeatureClick = useCallback((feature: Feature<Geometry, FeatureProperties>, latlng: L.LatLng) => {
        setSelectedFeature(feature);
        setFeaturePopupDetails({feature, latlng, timestamp: Date.now()});
    }, [])

    const handleUpdateFeatureStyle = useCallback((id: string, updatedFeatureStyle: Partial<FeatureStyle>) => {
        setFeatures(prev =>
            prev.map(f => f.properties.id === id
                ? {...f, properties: {...f.properties, ...updatedFeatureStyle}}
                : f
            )
        );

        setSelectedFeature(f => f?.properties.id === id
            ? {...f, properties: {...f.properties, ...updatedFeatureStyle}}
            : f
        );
    }, []);

    const fetchFeatures = useCallback(() => {
        setMapLoading(true);
        axiosWebClient.get<FeatureCollection<Geometry, FeatureProperties>>(`${API_DOMAIN}/api/gis/features/active`)
            .then(response => setFeatures(response.data.features))
            .catch(() => toast.error(t("pop-ups.error-fetching-geojson-features-pop-up.title")))
            .finally(() => setMapLoading(false))
    }, [t])

    const saveChanges = async () => {
        const featureCollection: FeatureCollection<Geometry, FeatureProperties> = prepareFeatureCollection(
            features.filter(feature =>
            feature.properties.isModified || feature.properties.isNew || feature.properties.isDeleted)
        )
        
        if (featureCollection.features.length === 0) {
            toast.info(t("admin-pages.map-editor.pop-ups.no-changes-to-save-pop-up.title"), {
                position: "bottom-left", autoClose: 3000, theme: "dark"
            });
            return;
        }

        const confirmationResult = await Swal.fire({
            title: t("admin-pages.map-editor.pop-ups.save-changes-confirmation-pop-up.title"),
            text: t("admin-pages.map-editor.pop-ups.save-changes-confirmation-pop-up.description", {numberOfChanges: featureCollection.features.length}),
            icon: "info", showCancelButton: true,
            confirmButtonColor: "#3085d6", cancelButtonColor: "#d33",
            confirmButtonText: t("pop-ups.confirmation-pop-up.confirm-btn-text"),
            cancelButtonText: t("pop-ups.confirmation-pop-up.cancel-btn-text"),
            background: "#1a1a1e", color: "#fff", backdrop: "rgba(0, 0, 0, 0.5)",
        })

        if (!confirmationResult.isConfirmed) return;

        const sync = async () => {
            await axiosWebClient.post(`${API_DOMAIN}/api/gis/features/sync`, featureCollection);
            fetchFeatures();
        };

        await toast.promise(
            sync(),
            {
                pending: t("admin-pages.map-editor.pop-ups.perform-save-pop-up.pending-text"),
                success: t("admin-pages.map-editor.pop-ups.perform-save-pop-up.success-text"),
                error: t("admin-pages.map-editor.pop-ups.perform-save-pop-up.error-text")
            },
            {position: "bottom-left", theme: "dark"}
        );
    }

    const reloadFeatures = async () => {
        const confirmationResult = await Swal.fire({
            title: t("admin-pages.map-editor.pop-ups.reload-geojson-confirmation-pop-up.title"),
            text: t("admin-pages.map-editor.pop-ups.reload-geojson-confirmation-pop-up.description"),
            icon: "info", showCancelButton: true,
            confirmButtonColor: "#3085d6", cancelButtonColor: "#d33",
            confirmButtonText: t("pop-ups.confirmation-pop-up.confirm-btn-text"),
            cancelButtonText: t("pop-ups.confirmation-pop-up.cancel-btn-text"),
            background: "#1a1a1e", color: "#fff", backdrop: "rgba(0, 0, 0, 0.5)",
        })

        if (confirmationResult.isConfirmed) fetchFeatures();
    }

    // Stub backend data
    useEffect(() => {
        fetchFeatures();
    }, [fetchFeatures]);

    useEffect(() => {
        console.log(features)
    }, [features]);

    return (
        <div className="map-editor">
            <h1>{t("admin-pages.map-editor.tab-name").toUpperCase()}</h1>
            <div
                className="map-container"
                ref={elementRef}
                style={{height: height}}
            >
                <MapContainer
                    center={[48.4, 31]}
                    zoomControl={true}
                    zoom={6}
                    minZoom={2}
                    maxBounds={[[-85, -Infinity], [85, Infinity]]}
                    maxBoundsViscosity={1.0}
                    worldCopyJump={true}
                >
                    <MapLayers layer={layer}/>

                    <GeoManHandler
                        features={features}
                        setFeatures={setFeatures}
                        onFeatureClick={onFeatureClick}
                        borderColor={featureStyle.borderColor}
                        fillColor={featureStyle.fillColor}
                        fillOpacity={featureStyle.fillOpacity}
                        borderWeight={featureStyle.borderWeight}
                    />

                    {positionPopupDetails && (
                        <Popup
                            key={`pos-${positionPopupDetails.lat}-${positionPopupDetails.lng}`}
                            position={positionPopupDetails}
                        >
                            <MapPositionPopupDetails coordinates={positionPopupDetails}/>
                        </Popup>
                    )}

                    {featurePopupDetails && (
                        <Popup
                            key={`${featurePopupDetails.feature.properties?.id}-${featurePopupDetails.timestamp}`}
                            position={featurePopupDetails.latlng}
                            eventHandlers={{
                                remove: () => {
                                    setSelectedFeature(null)
                                }
                            }}
                        >
                            <FeaturePopupDetails
                                feature={featurePopupDetails.feature}
                                setFeatures={setFeatures}
                            />
                        </Popup>
                    )}

                    <MapEventsHandler onRightClick={coordinates => setPositionPopupDetails(coordinates)}/>
                    <MapResizeHandler/>

                </MapContainer>

                <ResizeHandle onMouseDown={onMouseDown}/>
                <SaveButton onClick={saveChanges}/>
                <ReloadButton onClick={reloadFeatures}/>

                <LoadingOverlay visible={isMapLoading}/>
            </div>
            <MapEditorStylePanel
                style={featureStyle}
                setStyle={setFeatureStyle}
                selectedFeature={selectedFeature}
                onUpdateFeatureStyle={handleUpdateFeatureStyle}
                onDeselectFeature={() => setSelectedFeature(null)}
            />
            <MapEditorLayerSwitcher selectedLayer={layer} onLayerSelected={onLayerSelected}/>
        </div>

    )
}

/* ------------ Small helper components ------------ */

{/* Draggable resize handle */
}
const ResizeHandle = ({onMouseDown}: { onMouseDown: MouseEventHandler<HTMLDivElement> }) => {
    return (
        <div className="resize-handle" onMouseDown={onMouseDown}>
            <hr/>
        </div>
    );
};

const SaveButton = ({onClick}: { onClick: MouseEventHandler<HTMLImageElement> }) => {
    return (
        <div className="features-action-btn save-btn" title="Save changes">
            <img
                src={saveBtnImg}
                alt="Save changes"
                onClick={onClick}
            />
        </div>
    )
}

const ReloadButton = ({onClick}: { onClick: MouseEventHandler<HTMLImageElement> }) => {
    return (
        <div className="features-action-btn reload-btn" title="Save changes">
            <img
                src={reloadBtnImg}
                alt="Reload map"
                onClick={onClick}
            />
        </div>
    )
}

export default MapEditor;