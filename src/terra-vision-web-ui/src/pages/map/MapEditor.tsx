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
    type GeoFeatureStyle
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
import GeoFeaturePopupDetails from "../../components/map/popups/GeoFeaturePopupDetails.tsx";
import {toast} from "react-toastify";
import saveBtnImg from "../../assets/save-btn-img.png";
import reloadBtnImg from "../../assets/reload-btn-img.png";
import Swal from "sweetalert2";
import MapEditorStylePanel from "../../components/map/MapEditorStylePanel.tsx";
import {axiosWebClient} from "../../configs/axios-web-client.ts";

function MapEditor() {

    const {t} = useTranslation();
    const [isMapLoading, setMapLoading] = useState(true);
    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);
    const {height, elementRef, onMouseDown} = useElementHeightResizer({storageKey: "adminMapContainerHeight"})

    const [geoFeatures, setGeoFeatures] = useState<Feature<Geometry, FeatureProperties>[]>([]);

    const [geoFeaturePopupDetails, setGeoFeaturePopupDetails] = useState<{
        feature: Feature<Geometry, FeatureProperties>;
        latlng: L.LatLng;
        timestamp: number;
    } | null>(null);
    const [positionPopupDetails, setPositionPopupDetails] = useState<Coordinates | null>(null);

    const [selectedGeoFeature, setSelectedGeoFeature] = useState<Feature<Geometry, FeatureProperties> | null>(null);
    const [geoFeatureStyle, setGeoFeatureStyle] = useState<GeoFeatureStyle>({
        borderColor: DEFAULT_FEATURE_STYLE.borderColor,
        fillColor: DEFAULT_FEATURE_STYLE.fillColor,
        fillOpacity: DEFAULT_FEATURE_STYLE.fillOpacity,
        borderWeight: DEFAULT_FEATURE_STYLE.borderWeight
    });

    const onLayerSelected = (mapLayer: string) => {
        setLayer(mapLayer);
        localStorage.setItem("map-layer", mapLayer);
    }

    const onGeoFeatureClick = useCallback((feature: Feature<Geometry, FeatureProperties>, latlng: L.LatLng) => {
        setSelectedGeoFeature(feature);
        setGeoFeaturePopupDetails({feature, latlng, timestamp: Date.now()});
    }, [])

    const handleUpdateGeoFeatureStyle = useCallback((id: string, updatedGeoFeatureStyle: Partial<GeoFeatureStyle>) => {
        setGeoFeatures(prev =>
            prev.map(f => f.properties.id === id
                ? {...f, properties: {...f.properties, ...updatedGeoFeatureStyle}}
                : f
            )
        );

        setSelectedGeoFeature(f => f?.properties.id === id
            ? {...f, properties: {...f.properties, ...updatedGeoFeatureStyle}}
            : f
        );
    }, []);

    const fetchGeFeatures = () => {
        setMapLoading(true);
        axiosWebClient.get<FeatureCollection<Geometry, FeatureProperties>>(`${API_DOMAIN}/api/gis/features/active`)
            .then(response => setGeoFeatures(response.data.features))
            .catch(() => toast.error(t("pop-ups.error-fetching-geofeatures-pop-up.title")))
            .finally(() => setMapLoading(false))
    }

    const saveGeoChanges = async () => {
        let changedFeatures = geoFeatures.filter(feature =>
            feature.properties.isModified ||
            feature.properties.isNew ||
            feature.properties.isDeleted)

        if (changedFeatures.length === 0) {
            toast.info(t("admin-pages.map-editor.pop-ups.no-changes-to-save-pop-up.title"), {
                position: "bottom-left",
                autoClose: 3000,
                theme: "dark"
            });
            return;
        }

        const confirmationResult = await Swal.fire({
            title: t("admin-pages.map-editor.pop-ups.save-changes-confirmation-pop-up.title"),
            text: t("admin-pages.map-editor.pop-ups.save-changes-confirmation-pop-up.description", {numberOfChanges: changedFeatures.length}),
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

        const performSave = async () => {
            changedFeatures = changedFeatures.map(f => {
                const props = f.properties;

                return {
                    ...f,
                    properties: {
                        id: props.id,
                        parentId: props.parentId ?? null,
                        type: props.type ?? null,

                        title: props.title ?? null,
                        description: props.description ?? null,

                        borderColor: props.borderColor ?? null,
                        fillColor: props.fillColor ?? null,
                        fillOpacity: props.fillOpacity ?? null,
                        borderWeight: props.borderWeight ?? null,

                        radius: props.radius ?? null,

                        validFrom: props.validFrom ?? null,
                        validTo: props.validTo ?? null,
                        lastModified: props.lastModified ?? null,

                        isNew: !!props.isNew,
                        isModified: !!props.isModified,
                        isDeleted: !!props.isDeleted,
                    }
                }
            })

            const collection: FeatureCollection<Geometry, FeatureProperties> = {
                type: "FeatureCollection",
                features: changedFeatures
            };

            await axiosWebClient.post(`${API_DOMAIN}/api/gis/features/sync`, collection);
            fetchGeFeatures();
        };

        await toast.promise(
            performSave(),
            {
                pending: t("admin-pages.map-editor.pop-ups.perform-save-pop-up.pending-text"),
                success: t("admin-pages.map-editor.pop-ups.perform-save-pop-up.success-text"),
                error: t("admin-pages.map-editor.pop-ups.perform-save-pop-up.error-text")
            },
            {
                position: "bottom-left",
                theme: "dark"
            }
        );
    }

    const reloadGeoFeatures = async () => {
        const confirmationResult = await Swal.fire({
            title: t("admin-pages.map-editor.pop-ups.reload-geojson-confirmation-pop-up.title"),
            text: t("admin-pages.map-editor.pop-ups.reload-geojson-confirmation-pop-up.description"),
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

        fetchGeFeatures();
    }

    // Stub backend data
    useEffect(() => {
        fetchGeFeatures();
    }, []);

    useEffect(() => {
        console.log(geoFeatures)
    }, [geoFeatures]);

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
                        features={geoFeatures}
                        setFeatures={setGeoFeatures}
                        onFeatureClick={onGeoFeatureClick}
                        borderColor={geoFeatureStyle.borderColor}
                        fillColor={geoFeatureStyle.fillColor}
                        fillOpacity={geoFeatureStyle.fillOpacity}
                        borderWeight={geoFeatureStyle.borderWeight}
                    />

                    {positionPopupDetails && (
                        <Popup
                            key={`pos-${positionPopupDetails.lat}-${positionPopupDetails.lng}`}
                            position={positionPopupDetails}
                        >
                            <MapPositionPopupDetails coordinates={positionPopupDetails}/>
                        </Popup>
                    )}

                    {geoFeaturePopupDetails && (
                        <Popup
                            key={`${geoFeaturePopupDetails.feature.properties?.id}-${geoFeaturePopupDetails.timestamp}`}
                            position={geoFeaturePopupDetails.latlng}
                            eventHandlers={{
                                remove: () => {
                                    setSelectedGeoFeature(null)
                                }
                            }}
                        >
                            <GeoFeaturePopupDetails
                                geoFeature={geoFeaturePopupDetails.feature}
                                setGeoFeatures={setGeoFeatures}
                            />
                        </Popup>
                    )}

                    <MapEventsHandler onRightClick={coordinates => setPositionPopupDetails(coordinates)}/>

                    <MapResizeHandler/>
                </MapContainer>


                <ResizeHandle onMouseDown={onMouseDown}/>
                <SaveButton onClick={saveGeoChanges}/>
                <ReloadButton onClick={reloadGeoFeatures}/>

                <LoadingOverlay visible={isMapLoading}/>
            </div>
            <MapEditorStylePanel
                style={geoFeatureStyle}
                setStyle={setGeoFeatureStyle}
                selectedGeoFeature={selectedGeoFeature}
                onUpdateGeoFeatureStyle={handleUpdateGeoFeatureStyle}
                onDeselectGeoFeature={() => setSelectedGeoFeature(null)}
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