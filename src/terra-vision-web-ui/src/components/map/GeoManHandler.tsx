import {type Dispatch, type SetStateAction, useCallback, useEffect, useRef} from "react";
import {useMap} from "react-leaflet";
import type {Feature} from "geojson";
import L, {type LeafletMouseEvent} from "leaflet";
import {markerIcon} from "./icons/map-icons.tsx";
import {DEFAULT_FEATURE_STYLE, type FeatureLayer} from "../../commons/schemas/gis-schemas.ts";


interface GeoManHandlerProps {
    geoFeatures: Feature[];
    setGeoFeatures: Dispatch<SetStateAction<Feature[]>>;
    onGeoFeatureClick: (feature: Feature, latlng: L.LatLng) => void;
    borderColor?: string;
    fillColor?: string;
    fillOpacity?: number;
    borderWeight?: number;
}

const GeoManHandler = ({
                           geoFeatures,
                           setGeoFeatures,
                           onGeoFeatureClick,
                           borderColor = DEFAULT_FEATURE_STYLE.borderColor,
                           fillColor = DEFAULT_FEATURE_STYLE.fillColor,
                           fillOpacity = DEFAULT_FEATURE_STYLE.fillOpacity,
                           borderWeight = DEFAULT_FEATURE_STYLE.borderWeight
                       }: GeoManHandlerProps) => {
    const map = useMap();
    const isInitialLoadComplete = useRef<boolean>(false);

    const onLayerUpdate = useCallback((
        featureId: string,
        layer: L.Layer,
        feature: Feature
    ) => {
        let updatedFeature: Feature | null = null;

        if (layer instanceof L.Circle) {
            const circle = layer as L.Circle;
            updatedFeature = circle.toGeoJSON() as Feature;
            updatedFeature.properties = {...feature.properties, radius: circle.getRadius()};
        } else if (layer instanceof L.Polygon) {
            updatedFeature = (layer as L.Polygon).toGeoJSON() as Feature;
            updatedFeature.properties = {...feature.properties};
        } else return;

        if (!updatedFeature) return;

        updatedFeature.properties = {
            ...updatedFeature.properties,
            isModified: true,
            lastModified: new Date().toISOString()
        };

        setGeoFeatures(prev =>
            prev.map(f => f.properties?.id === featureId ? updatedFeature : f)
        );
    }, [setGeoFeatures])

    const onLayerClick = useCallback((
        event: LeafletMouseEvent,
        feature: Feature
    ) => {
        L.DomEvent.stopPropagation(event);
        onGeoFeatureClick(feature, event.latlng);
    }, [onGeoFeatureClick])

    const onPmCreate = useCallback((e: { shape: string; layer: L.Layer }) => {
        const {shape, layer} = e;

        const featureId = crypto.randomUUID();
        (layer as FeatureLayer).featureId = featureId;

        let feature: Feature | null = null;

        const baseProps = {
            id: featureId,
            type: shape.toLowerCase(), // Automatically "marker", "circle", or "polygon"
            borderColor, fillColor, fillOpacity, borderWeight,
            isCreated: true,
            createdAt: new Date().toISOString()
        };

        if (layer instanceof L.Marker) {
            const marker = layer as L.Marker;
            feature = marker.toGeoJSON() as Feature;
            feature.properties = {...baseProps};
            layer.remove();
        } else if (layer instanceof L.Circle) {
            const circle = layer as L.Circle;
            feature = circle.toGeoJSON() as Feature;
            feature.properties = {...baseProps, radius: circle.getRadius()};
        } else if (shape === "Polygon") {
            const polygon = layer as L.Polygon;
            feature = polygon.toGeoJSON() as Feature;
            feature.properties = {...baseProps};
        } else return;

        if (!feature) return;

        setGeoFeatures(prev => [...prev, feature]);

        layer.on("pm:update", () => onLayerUpdate(featureId, layer, feature));
        layer.on("click", (event: L.LeafletMouseEvent) => onLayerClick(event, feature));
    }, [borderColor, borderWeight, fillColor, fillOpacity, onLayerClick, onLayerUpdate, setGeoFeatures])

    const onLayerAdd = useCallback((e: L.LayerEvent) => {
        if (e.layer instanceof L.Marker) {
            e.layer.options.pmIgnore = true;
            if (e.layer.pm) e.layer.pm.setOptions({ draggable: false });
        } else if (e.layer instanceof L.Circle) {
            if (e.layer.pm) e.layer.pm.setOptions({ draggable: false });
        }
    }, [])

    useEffect(() => {
        if (!map) return;
        
        map.pm.setGlobalOptions({
            allowSelfIntersection: false,
            snappable: true,
            snapDistance: 20,
            markerStyle: {icon: markerIcon},
            templineStyle: {color: borderColor, weight: borderWeight},
            hintlineStyle: {color: borderColor, weight: borderWeight, dashArray: [5, 5]}
        });

        map.pm.setPathOptions({
            color: borderColor,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            weight: borderWeight,
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
            cutPolygon: false,
            dragMode: false,
            rotateMode: false,
            removalMode: false,
        });
        
        map.on("pm:create", onPmCreate)

        map.on("layeradd", (e) => onLayerAdd(e))

        return () => {
            map.pm.removeControls();
            map.off("pm:create");
            map.off("layeradd");
        };
    }, [borderColor, borderWeight, fillColor, fillOpacity, map, onLayerAdd, onPmCreate])

    
    useEffect(() => {
        if (!map || isInitialLoadComplete.current || geoFeatures.length === 0) return

        geoFeatures.forEach((feature: Feature) => {
            const type = feature.properties?.type;
            if (type === "marker") return;

            const featureId = feature.properties?.id as string;

            const leafletLayer = L.geoJSON(feature, {
                style: {
                    color: feature.properties?.borderColor || borderColor,
                    fillColor: feature.properties?.fillColor || fillColor,
                    fillOpacity: feature.properties?.fillOpacity || fillOpacity,
                    weight: feature.properties?.borderWeight || borderWeight
                },
                pointToLayer: (_, latlng) => {
                    if (type === "circle") return L.circle(latlng, {radius: feature.properties?.radius});
                    return L.layerGroup();
                }
            });

            leafletLayer.eachLayer(layer => {
                (layer as FeatureLayer).featureId = featureId;

                layer.on("click", (event: L.LeafletMouseEvent) => onLayerClick(event, feature));
                layer.on("pm:update", () => onLayerUpdate(featureId, layer, feature));
                layer.addTo(map);
            });
        });

        isInitialLoadComplete.current = true;
    }, [borderColor, borderWeight, fillColor, fillOpacity, geoFeatures, map, onLayerClick, onLayerUpdate])


    useEffect(() => {
        if (!map) return;

        map.eachLayer((layer: FeatureLayer) => {
            const feature = layer.featureId
                ? geoFeatures.find(f => f.properties?.id === layer.featureId)
                : undefined;

            if (layer instanceof L.Polygon || layer instanceof L.Circle) {
                if (!feature) {
                    map.removeLayer(layer);
                    return;
                }
                
                if (feature.properties) {
                    const pathLayer = layer as L.Path;
                    pathLayer.setStyle({
                        color: feature.properties?.borderColor || borderColor,
                        fillColor: feature.properties?.fillColor || fillColor,
                        fillOpacity: feature.properties?.fillOpacity || fillOpacity,
                        weight: feature.properties?.borderWeight || borderWeight
                    });

                    if (layer instanceof L.Circle && feature.properties.radius) {
                        layer.setRadius(feature.properties.radius);
                    }
                }
            }
        });
    }, [borderColor, borderWeight, fillColor, fillOpacity, geoFeatures, map]);
    
    /* ---------------------------------------------------------------------------------- */

    // useEffect(() => {
    //     if (!map) return;
    //
    //     map.eachLayer((layer: FeatureLayer) => {
    //         const geoJson = layer.featureId
    //             ? geoFeatures.find(f => f.properties?.id === layer.featureId)
    //             : undefined;
    //
    //         if (layer instanceof L.Polygon || layer instanceof L.Circle) {
    //             if (!geoJson) {
    //                 map.removeLayer(layer);
    //                 return;
    //             }
    //
    //             const geoJsonProperties = geoJson.properties;
    //             if (geoJsonProperties) {
    //                 const pathLayer = layer as L.Path;
    //                 pathLayer.setStyle({
    //                     color: geoJsonProperties?.borderColor || borderColor,
    //                     fillColor: geoJsonProperties?.fillColor || fillColor,
    //                     fillOpacity: geoJsonProperties?.fillOpacity || fillOpacity,
    //                     weight: geoJsonProperties?.borderWeight || borderWeight
    //                 });
    //
    //                 if (layer instanceof L.Circle && geoJsonProperties.radius) {
    //                     layer.setRadius(geoJsonProperties.radius);
    //                 }
    //             }
    //         }
    //     });
    //
    //     map.pm.setGlobalOptions({
    //         allowSelfIntersection: false,
    //         snappable: true,
    //         snapDistance: 20,
    //         markerStyle: {icon: markerIcon},
    //         templineStyle: {color: borderColor, weight: borderWeight},
    //         hintlineStyle: {color: borderColor, weight: borderWeight, dashArray: [5, 5]}
    //     });
    //
    //     map.pm.setPathOptions({
    //         color: borderColor,
    //         fillColor: fillColor,
    //         fillOpacity: fillOpacity,
    //         weight: borderWeight,
    //     });
    //
    //     map.pm.addControls({
    //         position: "topright",
    //
    //         drawMarker: true,
    //         drawCircle: true,
    //         drawPolygon: true,
    //         drawRectangle: false,
    //         drawCircleMarker: false,
    //         drawPolyline: false,
    //         drawText: false,
    //
    //         editMode: true,
    //         cutPolygon: false,
    //         dragMode: false,
    //         rotateMode: false,
    //         removalMode: false,
    //     });
    //
    //     // ── Initial hydration from backend data ────────────────────────────────
    //     if (!isInitialLoadComplete.current && geoFeatures.length > 0) {
    //         geoFeatures.forEach((feature: Feature) => {
    //             const type = feature.properties?.type;
    //             if (type === "marker") return;
    //
    //             const featureId = feature.properties?.id as string;
    //
    //             const leafletLayer = L.geoJSON(feature, {
    //                 style: {
    //                     color: feature.properties?.borderColor || borderColor,
    //                     fillColor: feature.properties?.fillColor || fillColor,
    //                     fillOpacity: feature.properties?.fillOpacity || fillOpacity,
    //                     weight: feature.properties?.borderWeight || borderWeight
    //                 },
    //                 pointToLayer: (_, latlng) => {
    //                     if (type === "circle") return L.circle(latlng, {radius: feature.properties?.radius});
    //                     return L.layerGroup();
    //                 }
    //             });
    //
    //             leafletLayer.eachLayer(layer => {
    //                 (layer as FeatureLayer).featureId = featureId;
    //
    //                 layer.on("click", (event: L.LeafletMouseEvent) => {
    //                     L.DomEvent.stopPropagation(event);
    //                     onGeoFeatureClick(feature, event.latlng);
    //                 });
    //
    //                 layer.on("pm:update", () => {
    //                     let updatedGeoJson: Feature;
    //
    //                     if (layer instanceof L.Circle) {
    //                         updatedGeoJson = layer.toGeoJSON() as Feature;
    //                         updatedGeoJson.properties = {...feature.properties, radius: layer.getRadius()};
    //                     } else if (layer instanceof L.Polygon) {
    //                         updatedGeoJson = layer.toGeoJSON() as Feature;
    //                         updatedGeoJson.properties = {...feature.properties};
    //                     } else return;
    //
    //                     updatedGeoJson.properties = {
    //                         ...updatedGeoJson.properties,
    //                         isModified: true,
    //                         lastModified: new Date().toISOString()
    //                     };
    //
    //                     setGeoFeatures(prev =>
    //                         prev.map(f => f.properties?.id === featureId ? updatedGeoJson : f)
    //                     );
    //                 });
    //
    //                 layer.addTo(map);
    //             });
    //         });
    //
    //         isInitialLoadComplete.current = true;
    //     }
    //
    //     // ── New shape created by user ──────────────────────────────────────────
    //     map.on("pm:create", (e) => {
    //         const {shape, layer} = e;
    //
    //         const featureId = crypto.randomUUID();
    //         (layer as FeatureLayer).featureId = featureId;
    //
    //         let geoJson: Feature;
    //
    //         const baseProps = {
    //             id: featureId,
    //
    //             borderColor,
    //             fillColor,
    //             fillOpacity,
    //             borderWeight,
    //
    //             isCreated: true,
    //             createdAt: new Date().toISOString()
    //         };
    //
    //         if (shape === "Marker") {
    //             geoJson = (layer as L.Marker).toGeoJSON() as Feature;
    //             geoJson.properties = {...baseProps, type: "marker"};
    //             layer.remove();
    //         } else if (shape === "Circle") {
    //             const circle = layer as L.Circle;
    //             geoJson = circle.toGeoJSON() as Feature;
    //             geoJson.properties = {...baseProps, type: "circle", radius: circle.getRadius()};
    //         } else if (shape === "Polygon") {
    //             geoJson = (layer as L.Polygon).toGeoJSON() as Feature;
    //             geoJson.properties = {...baseProps, type: "polygon"};
    //         } else return;
    //
    //         setGeoFeatures(prev => [...prev, geoJson]);
    //
    //         layer.on("pm:update", () => {
    //             let updatedGeoJson: Feature;
    //
    //             if (layer instanceof L.Circle) {
    //                 const circle = layer as L.Circle;
    //                 updatedGeoJson = circle.toGeoJSON() as Feature;
    //                 updatedGeoJson.properties = {...geoJson.properties, radius: circle.getRadius()};
    //             } else if (layer instanceof L.Polygon) {
    //                 updatedGeoJson = (layer as L.Polygon).toGeoJSON() as Feature;
    //                 updatedGeoJson.properties = {...geoJson.properties};
    //             } else return;
    //
    //             updatedGeoJson.properties = {
    //                 ...updatedGeoJson.properties,
    //                 isModified: true,
    //                 lastModified: new Date().toISOString()
    //             };
    //
    //             setGeoFeatures(prev =>
    //                 prev.map(f => f.properties?.id === featureId ? updatedGeoJson : f)
    //             );
    //         });
    //
    //         layer.on("click", (event) => {
    //             L.DomEvent.stopPropagation(event);
    //             onGeoFeatureClick(geoJson, event.latlng);
    //         });
    //     });
    //
    //     return () => {
    //         map.pm.removeControls();
    //         map.off("pm:create");
    //     };
    // }, [
    //     map,
    //     onGeoFeatureClick,
    //     geoFeatures,
    //     setGeoFeatures,
    //     borderColor,
    //     borderWeight,
    //     fillColor,
    //     fillOpacity
    // ]);

    return null;
};

export default GeoManHandler;