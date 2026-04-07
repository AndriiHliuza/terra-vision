import "../../styles/pages/map/MapEditor.css";
import {
    MapContainer,
    Popup
} from "react-leaflet";
import {type MouseEventHandler, useCallback, useEffect, useState} from "react";
import {type Coordinates, DEFAULT_FEATURE_STYLE, type GeoFeatureStyle} from "../../commons/schemas/gis-schemas.ts";
import MapLayers from "../../components/map/MapLayers.tsx";
import {useTranslation} from "react-i18next";
import {MAP_LAYERS} from "../../configs/settings.ts";
import LoadingOverlay from "../../components/LoadingOverlay.tsx";
import {useElementHeightResizer} from "../../commons/hooks/hooks.ts";
import {MapResizeHandler} from "../../components/map/handlers/MapResizeHandler.tsx";
import {MapEventsHandler} from "../../components/map/handlers/MapEventsHandler.tsx";
import MapPositionPopupDetails from "../../components/map/popups/MapPositionPopupDetails.tsx";
import MapEditorLayerSwitcher from "../../components/map/layer-switchers/MapEditorLayerSwitcher.tsx";
import L from "leaflet";
import type {Feature, FeatureCollection} from "geojson";
import GeoManHandler from "../../components/map/handlers/GeoManHandler.tsx";
import GeoFeaturePopupDetails from "../../components/map/popups/GeoFeaturePopupDetails.tsx";
import {fetchStubMapData} from "../../commons/stubs/geo-stub.ts";
import {toast} from "react-toastify";
import saveBtnImg from "../../assets/save-btn-img.png";
import Swal from "sweetalert2";
import MapEditorStylePanel from "../../components/map/MapEditorStylePanel.tsx";

function MapEditor() {

    const {t} = useTranslation();
    const [isMapLoading, setMapLoading] = useState(true);
    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);
    const {height, elementRef, onMouseDown} = useElementHeightResizer({storageKey: "adminMapContainerHeight"})

    const [geoFeatures, setGeoFeatures] = useState<Feature[]>([]);

    const [geoFeaturePopupDetails, setGeoFeaturePopupDetails] = useState<{
        feature: Feature;
        latlng: L.LatLng;
        timestamp: number;
    } | null>(null);
    const [positionPopupDetails, setPositionPopupDetails] = useState<Coordinates | null>(null);

    const [selectedGeoFeature, setSelectedGeoFeature] = useState<Feature | null>(null);
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

    const onGeoFeatureClick = useCallback((feature: Feature, latlng: L.LatLng) => {
        setSelectedGeoFeature(feature);
        setGeoFeaturePopupDetails({feature, latlng, timestamp: Date.now()});
    }, [])

    const handleUpdateGeoFeatureStyle = useCallback((id: string, updatedGeoFeatureStyle: Partial<GeoFeatureStyle>) => {
        setGeoFeatures(prev =>
            prev.map(f => f.properties?.id === id
                    ? {...f, properties: {...f.properties, ...updatedGeoFeatureStyle}}
                    : f
            )
        );

        setSelectedGeoFeature(f => f?.properties?.id === id
                ? {...f, properties: {...f.properties, ...updatedGeoFeatureStyle}}
                : f
        );
    }, []);

    const saveGeoChanges = async () => {
        const changedFeatures = geoFeatures.filter(feature =>
            feature.properties?.isCreated === true || feature.properties?.isModified === true)

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
            text: t("admin-pages.map-editor.pop-ups.save-changes-confirmation-pop-up.description", { numberOfChanges: changedFeatures.length }),
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
            // Replace with your actual API endpoint:
            // const response = await axios.post<Feature[]>('/api/gis/features/sync', changedFeatures);
            // const savedData = response.data;

            // --- SIMULATED BACKEND BEHAVIOR ---
            await new Promise(res => setTimeout(res, 2000));
            const savedData: Feature[] = changedFeatures.map(f => ({
                ...f,
                properties: {
                    ...f.properties,
                    isCreated: false, // Reset flags on server version
                    isModified: false,
                    lastSynced: new Date().toISOString()
                }
            }));

            setGeoFeatures(prev => prev.map(localGeoFeature => {
                const serverGeoFeature = savedData.find(
                    s => s.properties?.id === localGeoFeature.properties?.id
                );

                // If the server returned this feature, use its version (clears flags)
                // Otherwise, keep the local version (it wasn't part of this save)
                return serverGeoFeature ? serverGeoFeature : localGeoFeature;
            }));
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

    // Stub backend data
    useEffect(() => {
        // Simulate async fetch
        fetchStubMapData()
            .then((collection: FeatureCollection) => setGeoFeatures(collection.features))
            .catch(error => console.error("Stub loading error:", error))
            .finally(() => setMapLoading(false))
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
                        geoFeatures={geoFeatures}
                        setGeoFeatures={setGeoFeatures}
                        onGeoFeatureClick={onGeoFeatureClick}
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
                                feature={geoFeaturePopupDetails.feature}
                                setGeoFeatures={setGeoFeatures}
                            />
                        </Popup>
                    )}

                    <MapEventsHandler onRightClick={coordinates => setPositionPopupDetails(coordinates)}/>

                    <MapResizeHandler/>
                </MapContainer>


                <ResizeHandle onMouseDown={onMouseDown} />
                <SaveButton onClick={saveGeoChanges}/>

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

{/* Draggable resize handle */}
const ResizeHandle = ({onMouseDown}: { onMouseDown: MouseEventHandler<HTMLDivElement> }) => {
    return (
        <div className="resize-handle" onMouseDown={onMouseDown}>
            <hr/>
        </div>
    );
};

const SaveButton = ({onClick}: { onClick: MouseEventHandler<HTMLImageElement> }) => {
    return (
        <div className="save-features-btn" title="Save changes">
            <img
                src={saveBtnImg}
                alt="Save changes"
                onClick={onClick}
            />
        </div>
    )
}

export default MapEditor;