import {type Dispatch, type SetStateAction, useCallback, useEffect, useRef} from "react";
import {useMap} from "react-leaflet";
import type {Feature, Geometry, MultiPolygon, Point, Polygon, Position} from "geojson";
import L, {type LeafletMouseEvent} from "leaflet";
import {createClusterIcon, createMarkerIcon} from "../icons/map-icons.tsx";
import {
    type FeatureLayer,
    type FeatureProperties
} from "../../../commons/schemas/gis-schemas.ts";
import {getSafeBorderWeightAndFillOpacity, getSafeFillOpacityForMarker} from "../../../commons/utils/style-utils.ts";
import "leaflet.markercluster";

type Handlers = {
    onLayerClick: (event: LeafletMouseEvent, feature: Feature<Geometry, FeatureProperties>) => void;
    onLayerUpdate: (feature: Feature<Geometry, FeatureProperties>, layer: L.Layer) => void;
};

interface GeoManHandlerProps {
    features: Feature<Geometry, FeatureProperties>[];
    setFeatures: Dispatch<SetStateAction<Feature<Geometry, FeatureProperties>[]>>;
    onFeatureClick: (feature: Feature<Geometry, FeatureProperties>, latlng: L.LatLng) => void;
    borderColor: string;
    fillColor: string;
    fillOpacity: number;
    borderWeight: number;
}

const GeoManHandler = ({
                           features,
                           setFeatures,
                           onFeatureClick,
                           borderColor,
                           fillColor,
                           fillOpacity,
                           borderWeight
                       }: GeoManHandlerProps) => {

    const map = useMap();

    const featuresRef = useRef<Feature<Geometry, FeatureProperties>[]>(features);

    useEffect(() => {
        featuresRef.current = features;
    }, [features]);

    const markerClusterGroupRef = useRef<L.MarkerClusterGroup>(
        L.markerClusterGroup({
            iconCreateFunction: createClusterIcon,
            maxClusterRadius: 80,
            showCoverageOnHover: false,
            chunkedLoading: true,
            pmIgnore: true,
        })
    )

    useEffect(() => {
        if (!map) return;
        const markerClusterGroup = markerClusterGroupRef.current;
        map.addLayer(markerClusterGroup);
        return () => {
            if (map.hasLayer(markerClusterGroup)) {
                map.removeLayer(markerClusterGroup);
            }
        };
    }, [map]);

    const handlersRef = useRef<Handlers>({
        onLayerClick: () => {},
        onLayerUpdate: () => {}
    });

    /* <<<<<<<<<<<<<<<<<<<<<<<< FUNCTIONS >>>>>>>>>>>>>>>>>>>>>>>>>
    * - attachFeatureListeners
    * - onLayerAdd
    * - onLayerClick
    * - onLayerUpdate
    *  */

    const attachFeatureListeners = useCallback((
        feature: Feature<Geometry, FeatureProperties>,
        layer: L.Layer
    ) => {
        const featureLayer = layer as FeatureLayer;

        // ------------ Only attach listeners if they are not attached yet ------------
        if (featureLayer.hasHandlersAttached) return;

        layer.on("pm:update", () => handlersRef.current.onLayerUpdate(feature, layer));
        layer.on("pm:dragend", () => handlersRef.current.onLayerUpdate(feature, layer));
        layer.on("pm:rotateend", () => handlersRef.current.onLayerUpdate(feature, layer));
        layer.on("click", (event: L.LeafletMouseEvent) => handlersRef.current.onLayerClick(event, feature));

        featureLayer.hasHandlersAttached = true;
    }, [])

    const onLayerAdd = useCallback((e: L.LayerEvent) => {
        if (e.layer instanceof L.Marker) {
            if (e.layer.options.pmIgnore !== false) {
                e.layer.options.pmIgnore = true;
                if (e.layer.pm) e.layer.pm.setOptions({draggable: false})
            }
        }
    }, [])

    const onLayerClick = useCallback((
        event: LeafletMouseEvent,
        feature: Feature<Geometry, FeatureProperties>
    ) => {

        if (map.pm.globalCutModeEnabled()) return;

        /*
        * It prevents the click event from reaching parent elements after your layer handles it.
        * Without it, clicking a shape would trigger:
        * - Layer's click handler → opens the popup
        * - The map's click handler → also fires
        *
        * Same as: event.stopPropagation() but expects leaflet event object
        * */
        L.DomEvent.stopPropagation(event);

        const currentFeature = featuresRef.current.find(
            f => f.properties.id === feature.properties.id
        ) ?? feature;

        onFeatureClick(currentFeature, event.latlng);
    }, [map, onFeatureClick])

    const onLayerUpdate = useCallback((
        originalFeature: Feature<Geometry, FeatureProperties>,
        updatedLayer: L.Layer
    ) => {

        let newGeometry: Geometry | null = null;
        const extraProps: Partial<FeatureProperties> = {};

        if (updatedLayer instanceof L.Marker) {
            newGeometry = (updatedLayer as L.Marker).toGeoJSON().geometry;
        } else if (updatedLayer instanceof L.Circle) {
            newGeometry = (updatedLayer as L.Circle).toGeoJSON().geometry;
            extraProps.radius = (updatedLayer as L.Circle).getRadius();
        } else if (updatedLayer instanceof L.Polygon) {
            newGeometry = (updatedLayer as L.Polygon).toGeoJSON().geometry;
        } else return;
        if (!newGeometry) return;

        const isSameGeometry = JSON.stringify(originalFeature.geometry) === JSON.stringify(newGeometry);
        const isSameRadius = originalFeature.properties.radius === extraProps.radius;
        if (isSameGeometry && isSameRadius) return;

        const timestamp = new Date().toISOString();

        if (updatedLayer instanceof L.Marker) {
            // ------------------------------------------------------------------
            // STRATEGY A: MARKERS
            // ------------------------------------------------------------------
            setFeatures(prev => prev.map(f => {
                if (f.properties.id === originalFeature.properties.id) {
                    return {
                        ...f,
                        geometry: newGeometry as Point,
                        properties: {
                            ...f.properties,
                            isModified: true,
                            lastModified: timestamp,
                        }
                    };
                }
                return f;
            }));
        } else {
            // ------------------------------------------------------------------
            // STRATEGY B: SHAPES (Polygons & Circles)
            // ------------------------------------------------------------------
            const newId = crypto.randomUUID();
            const updatedFeature: Feature<Geometry, FeatureProperties> = {
                type: "Feature",
                geometry: newGeometry,
                properties: {
                    ...originalFeature.properties,
                    id: newId,
                    parentId: originalFeature.properties.isNew
                        ? originalFeature.properties.parentId
                        : (originalFeature.properties.parentId ?? originalFeature.properties.id),
                    ...extraProps,
                    isNew: true,
                    validFrom: timestamp,
                }
            };

            setFeatures(prev => {
                const filteredOldFeatures = prev.reduce((
                    accumulatorBucket: Feature<Geometry, FeatureProperties>[],
                    item: Feature<Geometry, FeatureProperties>
                ) => {
                    if (item.properties.id === originalFeature.properties.id) {
                        if (item.properties.isNew) return accumulatorBucket;
                        accumulatorBucket.push({
                            ...item,
                            properties: { ...item.properties, validTo: timestamp, isDeleted: true }
                        });
                        return accumulatorBucket;
                    }
                    accumulatorBucket.push(item);
                    return accumulatorBucket;
                }, []);
                return [...filteredOldFeatures, updatedFeature];
            });

            map.removeLayer(updatedLayer);
        }

        if (!map.dragging.enabled()) map.dragging.enable();

    }, [map, setFeatures])



    // <<<<<<<<<<<<<<<<<< useEffect (For handlers) >>>>>>>>>>>>>>>>>>

    useEffect(() => {
        handlersRef.current = { onLayerClick, onLayerUpdate };
    }, [onLayerClick, onLayerUpdate]);



    // <<<<<<<<<<<<<<<<<< FUNCTIONS (onPmCreate & onPmCut) >>>>>>>>>>>>>>>>>>

    const onPmCreate = useCallback((e: { shape: string; layer: L.Layer }) => {
        const {shape, layer} = e;

        const featureId = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        (layer as FeatureLayer).featureId = featureId;

        const {safeBorderWeight, safeFillOpacity} = getSafeBorderWeightAndFillOpacity(borderWeight, fillOpacity);

        const baseProps: FeatureProperties = {
            id: featureId,
            type: shape.toLowerCase(),

            borderColor,
            borderWeight: safeBorderWeight,
            fillColor,
            fillOpacity: shape.toLowerCase() === 'marker' ? getSafeFillOpacityForMarker(fillOpacity) : safeFillOpacity,

            isNew: true,
            validFrom: timestamp
        };

        let feature: Feature<Geometry, FeatureProperties> | null = null;

        if (layer instanceof L.Marker) {
            layer.options.pmIgnore = false;

            const marker = layer as L.Marker;
            marker.setIcon(createMarkerIcon(
                fillColor,
                borderColor,
                getSafeFillOpacityForMarker(fillOpacity)
            ))
            feature = marker.toGeoJSON() as Feature<Point, FeatureProperties>;
            feature.properties = {...baseProps, borderWeight: undefined};

            layer.remove();
            markerClusterGroupRef.current.addLayer(layer);
        } else if (layer instanceof L.Circle) {
            const circle = layer as L.Circle;
            feature = circle.toGeoJSON() as Feature<Point, FeatureProperties>;
            feature.properties = {...baseProps, radius: circle.getRadius()};
        } else if (layer instanceof L.Polygon) {
            feature = (layer as L.Polygon).toGeoJSON() as Feature<Polygon, FeatureProperties>;
            feature.properties = baseProps;
        } else return;

        if (!feature) return;

        setFeatures(prev => [...prev, feature]);
        attachFeatureListeners(feature, layer)

    }, [attachFeatureListeners, borderColor, borderWeight, fillColor, fillOpacity, setFeatures])

    const onPmCut = useCallback((e: { layer: L.Layer; originalLayer: L.Layer }) => {
        const { layer: newLayer, originalLayer } = e;

        const originalId = (originalLayer as FeatureLayer).featureId;
        if (!originalId) return;

        const originalFeature = featuresRef.current.find(f => f.properties.id === originalId);
        if (!originalFeature) return;

        const timestamp = new Date().toISOString();
        const cutResultGeoJson = (newLayer as L.Polygon).toGeoJSON() as Feature<Polygon | MultiPolygon>;
        map.removeLayer(newLayer);

        let polygonCoordsList: Position[][][] = [];

        const geometry = cutResultGeoJson.geometry;
        if (geometry.type === "Polygon") {
            polygonCoordsList = [geometry.coordinates];
        } else if (geometry.type === "MultiPolygon") {
            polygonCoordsList = geometry.coordinates;
        }

        setFeatures(prev => {
            const filteredOldFeatures = prev.reduce((
                accumulatorBucket: Feature<Geometry, FeatureProperties>[],
                item: Feature<Geometry, FeatureProperties>
            ) => {
                if (item.properties.id === originalId) {
                    if (item.properties.isNew) return accumulatorBucket;
                    accumulatorBucket.push({
                        ...item,
                        properties: { ...item.properties, validTo: timestamp, isDeleted: true }
                    });
                    return accumulatorBucket;
                }
                accumulatorBucket.push(item);
                return accumulatorBucket;
            }, []);

            const newFeatures = polygonCoordsList.map((coords: Position[][]) => {
                const newId = crypto.randomUUID();
                return {
                    type: "Feature",
                    geometry: { type: "Polygon", coordinates: coords },
                    properties: {
                        ...originalFeature.properties,
                        id: newId,
                        parentId: originalFeature.properties.isNew
                            ? originalFeature.properties.parentId
                            : (originalFeature.properties.parentId ?? originalId),
                        isNew: true,
                        validFrom: timestamp
                    }
                } as Feature<Polygon, FeatureProperties>;
            });
            return [...filteredOldFeatures, ...newFeatures];
        });

    }, [map, setFeatures]);



    /* <<<<<<<<<<<<<<<<<<<<<<<< useEffects >>>>>>>>>>>>>>>>>>>>>>>> */

    /* ------------------------ useEffect to set map settings ------------------------ */

    useEffect(() => {
        if (!map) return;

        const {safeBorderWeight, safeFillOpacity} = getSafeBorderWeightAndFillOpacity(borderWeight, fillOpacity);

        map.pm.setGlobalOptions({
            allowSelfIntersection: false,
            snappable: true,
            snapDistance: 20,
            markerStyle: {
                icon: createMarkerIcon(
                    fillColor,
                    borderColor,
                    getSafeFillOpacityForMarker(fillOpacity)
                )
            },
            templineStyle: {
                color: borderColor,
                weight: safeBorderWeight,
                fillColor: fillColor,
                fillOpacity: safeFillOpacity
            },
            hintlineStyle: {
                color: borderColor,
                weight: safeBorderWeight,
                fillColor: fillColor,
                fillOpacity: safeFillOpacity,
                dashArray: [5, 5]
            }
        });

        map.pm.setPathOptions({
            color: borderColor,
            weight: safeBorderWeight,
            fillColor: fillColor,
            fillOpacity: safeFillOpacity
        });

        map.pm.addControls({
            position: "topright",

            drawMarker: true,
            drawCircle: true,
            drawPolygon: true,
            drawRectangle: false,
            drawCircleMarker: false,
            drawPolyline: false,
            drawText: false,

            editMode: true,
            dragMode: true,
            rotateMode: true,
            cutPolygon: true,
            removalMode: false
        });

        map.on("pm:create", onPmCreate)
        map.on("pm:cut", onPmCut);
        map.on("layeradd", onLayerAdd)

        return () => {
            map.pm.removeControls();
            map.off("pm:create");
            map.off("pm:cut");
            map.off("layeradd");
        };
    }, [borderColor, borderWeight, fillColor, fillOpacity, map, onLayerAdd, onPmCreate, onPmCut])



    /* ------------------------ useEffect to track changes to features ------------------------ */

    useEffect(() => {
        if (!map) return;

        const activeFeatures = features.filter(f => !f.properties.isDeleted);

        // Cleanup
        map.eachLayer((layer: L.Layer) => {
            const featureLayer = layer as FeatureLayer;
            if (featureLayer.featureId && !activeFeatures.some(f => f.properties.id === featureLayer.featureId)) {
                map.removeLayer(featureLayer);
            }
        });

        markerClusterGroupRef.current.eachLayer((layer: L.Layer) => {
            const featureLayer = layer as FeatureLayer;
            if (featureLayer.featureId && !activeFeatures.some(f => f.properties.id === featureLayer.featureId)) {
                markerClusterGroupRef.current.removeLayer(featureLayer);
            }
        });

        activeFeatures.forEach((feature: Feature<Geometry, FeatureProperties>) => {
            const {id: featureId, type} = feature.properties;

            let layerExists = false;

            map.eachLayer((layer: L.Layer) => {
                if ((layer as FeatureLayer).featureId === featureId) layerExists = true;
            });

            markerClusterGroupRef.current.eachLayer((layer: L.Layer) => {
                if ((layer as FeatureLayer).featureId === featureId) layerExists = true;
            });

            if (layerExists) return;

            if (type === "marker") {
                const point = feature.geometry as Point;
                const layer = L.marker(
                    [point.coordinates[1], point.coordinates[0]],
                    {
                        icon: createMarkerIcon(
                            feature.properties.fillColor ?? fillColor,
                            feature.properties.borderColor ?? borderColor,
                            getSafeFillOpacityForMarker(feature.properties.fillOpacity ?? fillOpacity)),
                        pmIgnore: false
                    }
                );

                (layer as FeatureLayer).featureId = featureId;
                attachFeatureListeners(feature, layer)
                markerClusterGroupRef.current.addLayer(layer);
            } else {
                if (type === "circle" && (!feature.properties.radius || feature.properties.radius <= 0)) return;

                const {safeBorderWeight, safeFillOpacity} = getSafeBorderWeightAndFillOpacity(
                    feature.properties.borderWeight ?? borderWeight,
                    feature.properties.fillOpacity ?? fillOpacity
                );

                const leafletLayer = L.geoJSON(feature, {
                    style: {
                        color: feature.properties.borderColor ?? borderColor,
                        weight: safeBorderWeight,
                        fillColor: feature.properties.fillColor ?? fillColor,
                        fillOpacity: safeFillOpacity
                    },
                    pointToLayer: (_, latlng) => {
                        /*
                        * The ! is a TypeScript non-null assertion operator. It tells TypeScript "I know this value is not null or undefined, trust me."
                        * feature.properties.radius!
                        * */
                        if (type === "circle") return L.circle(latlng, {radius: feature.properties.radius!});
                        return L.layerGroup();
                    }
                });

                leafletLayer.eachLayer(layer => {
                    (layer as FeatureLayer).featureId = featureId;
                    attachFeatureListeners(feature, layer)
                    layer.addTo(map);
                });
            }
        });

    }, [attachFeatureListeners, borderColor, borderWeight, features, fillColor, fillOpacity, map])



    /* ------------------------ useEffect to track style changes in features ------------------------ */

    useEffect(() => {
        if (!map) return;

        map.eachLayer((layer: L.Layer) => {
            const featureLayer = layer as FeatureLayer;
            if (!featureLayer.featureId) return;

            const feature = features.find(f => f.properties.id === featureLayer.featureId);
            if (!feature || feature.properties.isDeleted) return;

            if (layer instanceof L.Path) {
                const {safeBorderWeight, safeFillOpacity} = getSafeBorderWeightAndFillOpacity(
                    feature.properties.borderWeight ?? borderWeight,
                    feature.properties.fillOpacity ?? fillOpacity
                );

                layer.setStyle({
                    color: feature.properties.borderColor ?? borderColor,
                    weight: safeBorderWeight,
                    fillColor: feature.properties.fillColor ?? fillColor,
                    fillOpacity: safeFillOpacity
                });

                if (layer instanceof L.Circle && feature.properties.radius !== undefined && feature.properties.radius !== null) {
                    layer.setRadius(feature.properties.radius as number);
                }
            }
        });

        markerClusterGroupRef.current.eachLayer((layer: L.Layer) => {
            const featureLayer = layer as FeatureLayer;
            const feature = features.find(f => f.properties.id === featureLayer.featureId);
            if (feature && layer instanceof L.Marker) {
                (layer as L.Marker).setIcon(createMarkerIcon(
                    feature.properties.fillColor ?? fillColor,
                    feature.properties.borderColor ?? borderColor,
                    getSafeFillOpacityForMarker(feature.properties.fillOpacity ?? fillOpacity),
                ));
            }
        })
    }, [borderColor, borderWeight, features, fillColor, fillOpacity, map]);



    /* ------------------------ useEffect to enforce cursor type when dragging markers ------------------------ */

    useEffect(() => {
        if (!map) return;

        const isDragModeActive = map.pm.globalDragModeEnabled();
        const isEditModeActive = map.pm.globalEditModeEnabled();

        const cursorType = (isDragModeActive || isEditModeActive) ? 'move' : '';

        markerClusterGroupRef.current.eachLayer((layer: L.Layer) => {
            if (layer instanceof L.Marker) {
                requestAnimationFrame(() => {
                    const element = layer.getElement();
                    if (element) element.style.cursor = cursorType;
                });
            }
        });

    }, [map, features, borderColor, fillColor]);

    return null;
};

export default GeoManHandler;