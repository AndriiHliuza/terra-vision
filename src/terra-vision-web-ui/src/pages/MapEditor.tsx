import "../styles/pages/MapEditor.css";
import {
    MapContainer,
    Marker,
    Popup
} from "react-leaflet";
import {type MouseEventHandler, useEffect, useState} from "react";
import {type Coordinates, DEFAULT_FEATURE_STYLE, type GeoFeatureStyle} from "../commons/schemas/gis-schemas.ts";
import MapLayers from "../components/map/MapLayers.tsx";
import {useTranslation} from "react-i18next";
import {MAP_LAYERS} from "../configs/settings.ts";
import LoadingOverlay from "../components/LoadingOverlay.tsx";
import {useElementHeightResizer} from "../commons/hooks/hooks.ts";
import {MapResizeHandler} from "../components/map/handlers/MapResizeHandler.tsx";
import MarkerClusterGroup from "react-leaflet-cluster";
import {createClusterIcon, markerIcon} from "../components/map/icons/map-icons.tsx";
import {MapEventsHandler} from "../components/map/handlers/MapEventsHandler.tsx";
import MapPositionPopupDetails from "../components/map/MapPositionPopupDetails.tsx";
import MapEditorLayerSwitcher from "../components/map/MapEditorLayerSwitcher.tsx";
import L from "leaflet";
import type {Feature, Point} from "geojson";
import GeoManHandler from "../components/map/GeoManHandler.tsx";
import GeoFeaturePopupDetails from "../components/map/GeoFeaturePopupDetails.tsx";
import {fetchStubMapFeatures} from "../commons/stubs/geo-stub.ts";
import {toast} from "react-toastify";
import saveBtnImg from "../assets/save-btn-img.png";
import Swal from "sweetalert2";

function MapEditor() {

    const {t} = useTranslation();
    const [isMapLoading, setMapLoading] = useState(true);
    const [layer, setLayer] = useState(() => localStorage.getItem("map-layer") || MAP_LAYERS[0].name);

    const [geoFeatures, setGeoFeatures] = useState<Feature[]>([]);
    const [geoFeaturePopupDetails, setGeoFeaturePopupDetails] = useState<{
        feature: Feature;
        latlng: L.LatLng;
    } | null>(null);
    const [positionPopupDetails, setPositionPopupDetails] = useState<Coordinates | null>(null);

    const [geoFeatureStyle, setGeoFeatureStyle] = useState<GeoFeatureStyle>({
        borderColor: DEFAULT_FEATURE_STYLE.borderColor,
        fillColor: DEFAULT_FEATURE_STYLE.fillColor,
        fillOpacity: DEFAULT_FEATURE_STYLE.fillOpacity,
        borderWeight: DEFAULT_FEATURE_STYLE.borderWeight
    });

    const {height, elementRef, onMouseDown} = useElementHeightResizer({storageKey: "adminMapContainerHeight"})

    const onLayerSelected = (mapLayer: string) => {
        setLayer(mapLayer);
        localStorage.setItem("map-layer", mapLayer);
    }

    const handleViewGeoFeatureDetails = (id: string) => {
        const geoFeature = geoFeatures.find(f => f.properties?.id === id);
        setGeoFeaturePopupDetails(null);
    };

    const handleDeleteGeoFeature = async (id: string) => {
        console.log(`handleDeleteGeoFeature: ${id}`);
        const confirmationResult = await Swal.fire({
            title: "Are you sure?",
            text: `You are about to delete the selected element.`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            background: "#1a1a1e",
            color: "#fff",
            backdrop: "rgba(0, 0, 0, 0.5)",
        })
        if (!confirmationResult.isConfirmed) return;
        setGeoFeatures((prev) => prev.filter((feature) => feature.properties?.id !== id));
    }

    const saveGeoChanges = async () => {
        const changedFeatures = geoFeatures.filter(feature =>
            feature.properties?.isCreated === true || feature.properties?.isModified === true)

        if (changedFeatures.length === 0) {
            toast.info("No changes to save", {
                position: "bottom-left",
                autoClose: 3000,
                theme: "dark"
            });
            return;
        }

        const confirmationResult = await Swal.fire({
            title: "Save changes?",
            text: `You are about to save ${changedFeatures.length} changes.`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
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
                pending: 'Saving...',
                success: 'Saved successfully!',
                error: 'Failed to save changes.'
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
        const loadInitialData = async () => {
            setMapLoading(true);
            try {
                // Simulated backend call
                const data = await fetchStubMapFeatures();

                // This will trigger the GeoManHandler hydration
                setGeoFeatures(data);
            } catch (error) {
                console.error("Stub loading error:", error);
            } finally {
                setMapLoading(false);
            }
        };
        loadInitialData();
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
                        onGeoFeatureClick={(
                            feature,
                            latlng
                        ) => setGeoFeaturePopupDetails({
                            feature,
                            latlng
                        })}
                        borderColor={geoFeatureStyle.borderColor}
                        fillColor={geoFeatureStyle.fillColor}
                        fillOpacity={geoFeatureStyle.fillOpacity}
                        borderWeight={geoFeatureStyle.borderWeight}
                    />

                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createClusterIcon}
                        maxClusterRadius={80}
                        showCoverageOnHover={false}
                    >
                        {geoFeatures
                            .filter(feature => feature.properties?.type === 'marker')
                            .map(feature => {
                                const pointGeometry = feature.geometry as Point;

                                const position: [number, number] = [
                                    pointGeometry.coordinates[1],
                                    pointGeometry.coordinates[0]
                                ]
                                return (
                                    <Marker
                                        key={feature.properties?.id}
                                        position={position}
                                        icon={markerIcon}
                                        eventHandlers={{
                                            click: event => setGeoFeaturePopupDetails({
                                                feature: feature,
                                                latlng: event.latlng
                                            })
                                        }}
                                    >
                                        <Popup>{feature.properties?.id}</Popup>
                                    </Marker>
                                )
                            })
                        }
                    </MarkerClusterGroup>

                    {positionPopupDetails && (
                        <Popup position={positionPopupDetails}>
                            <MapPositionPopupDetails coordinates={positionPopupDetails}/>
                        </Popup>
                    )}

                    {geoFeaturePopupDetails && (
                        <Popup position={geoFeaturePopupDetails.latlng}>
                            <GeoFeaturePopupDetails
                                feature={geoFeaturePopupDetails.feature}
                                onViewGeoFeatureDetails={handleViewGeoFeatureDetails}
                                onDeleteGeoFeature={handleDeleteGeoFeature}
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
        <div className="save-features-btn">
            <img
                src={saveBtnImg}
                alt="Save changes"
                onClick={onClick}
            />
        </div>
    )
}

export default MapEditor;