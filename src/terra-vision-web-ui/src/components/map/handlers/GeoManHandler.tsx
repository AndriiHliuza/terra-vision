import {type Dispatch, type SetStateAction, useCallback, useEffect, useRef} from "react";
import {useMap} from "react-leaflet";
import type {Feature, Point} from "geojson";
import L, {type LeafletMouseEvent} from "leaflet";
import {createClusterIcon, createMarkerIcon} from "../icons/map-icons.tsx";
import {DEFAULT_FEATURE_STYLE, type FeatureLayer} from "../../../commons/schemas/gis-schemas.ts";
import {getSafeBorderWeightAndFillOpacity, getSafeFillOpacityForMarker} from "../../../commons/utils/style-utils.ts";
import "leaflet.markercluster";


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
    const geoFeaturesRef = useRef<Feature[]>(geoFeatures);
    const clusterGroupRef = useRef<L.MarkerClusterGroup>(
        L.markerClusterGroup({
            iconCreateFunction: createClusterIcon,
            maxClusterRadius: 80,
            showCoverageOnHover: false,
            chunkedLoading: true,
            pmIgnore: true,
        })
    )

    useEffect(() => {
        geoFeaturesRef.current = geoFeatures;
    }, [geoFeatures]);

    useEffect(() => {
        if (!map) return;
        const clusterGroup = clusterGroupRef.current;
        map.addLayer(clusterGroup);
        return () => {
            if (map.hasLayer(clusterGroup)) {
                map.removeLayer(clusterGroup);
            }
        };
    }, [map]);

    const onLayerUpdate = useCallback((
        featureId: string,
        layer: L.Layer,
        feature: Feature
    ) => {
        let updatedFeature: Feature | null = null;

        if (layer instanceof L.Marker) {
            const marker = layer as L.Marker;
            updatedFeature = marker.toGeoJSON() as Feature;
            updatedFeature.properties = {...feature.properties};
        } else if (layer instanceof L.Circle) {
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

        map.dragging.enable();

    }, [map, setGeoFeatures])

    const onLayerClick = useCallback((
        event: LeafletMouseEvent,
        feature: Feature
    ) => {
        /*
        * It prevents the click event from reaching parent elements after your layer handles it.
        * Without it, clicking a shape would trigger:
        * - Layer's click handler → opens the popup
        * - The map's click handler → also fires
        *
        * Same as: event.stopPropagation() but expects leaflet event object
        * */
        L.DomEvent.stopPropagation(event);

        const currentFeature = geoFeaturesRef.current.find(
            f => f.properties?.id === feature.properties?.id
        ) ?? feature;
        onGeoFeatureClick(currentFeature, event.latlng);
    }, [onGeoFeatureClick])

    const onPmCreate = useCallback((e: { shape: string; layer: L.Layer }) => {
        const {shape, layer} = e;

        const featureId = crypto.randomUUID();
        (layer as FeatureLayer).featureId = featureId;

        const {safeBorderWeight, safeFillOpacity} = getSafeBorderWeightAndFillOpacity(borderWeight, fillOpacity);

        let feature: Feature | null = null;

        const baseProps = {
            id: featureId,
            type: shape.toLowerCase(), // Automatically "marker", "circle", or "polygon"

            borderColor: borderColor,
            borderWeight: safeBorderWeight,
            fillColor: fillColor,
            fillOpacity: safeFillOpacity,

            isCreated: true,
            createdAt: new Date().toISOString()
        };

        if (layer instanceof L.Marker) {
            layer.options.pmIgnore = false;

            const marker = layer as L.Marker;
            marker.setIcon(createMarkerIcon(
                fillColor,
                borderColor,
                getSafeFillOpacityForMarker(fillOpacity)
            ))
            feature = marker.toGeoJSON() as Feature;

            feature.properties = {
                id: featureId,
                type: "marker",

                borderColor: borderColor,
                fillColor: fillColor,
                fillOpacity: getSafeFillOpacityForMarker(fillOpacity),
                // no borderWeight

                isCreated: true,
                createdAt: new Date().toISOString()
            };

            layer.remove();
            clusterGroupRef.current.addLayer(layer);
        } else if (layer instanceof L.Circle) {
            const circle = layer as L.Circle;
            feature = circle.toGeoJSON() as Feature;
            feature.properties = {...baseProps, radius: circle.getRadius()};
        } else if (layer instanceof L.Polygon) {
            const polygon = layer as L.Polygon;
            feature = polygon.toGeoJSON() as Feature;
            feature.properties = {...baseProps};
        } else return;

        if (!feature) return;

        setGeoFeatures(prev => [...prev, feature]);

        layer.on("pm:update", () => onLayerUpdate(featureId, layer, feature));
        layer.on("pm:dragend", () => onLayerUpdate(featureId, layer, feature));
        layer.on("pm:rotateend", () => onLayerUpdate(featureId, layer, feature));
        layer.on("click", (event: L.LeafletMouseEvent) => onLayerClick(event, feature));

    }, [borderColor, borderWeight, fillColor, fillOpacity, onLayerClick, onLayerUpdate, setGeoFeatures])

    const onLayerAdd = useCallback((e: L.LayerEvent) => {
        if (e.layer instanceof L.Marker) {
            if (e.layer.options.pmIgnore !== false) {
                e.layer.options.pmIgnore = true;
                if (e.layer.pm) e.layer.pm.setOptions({draggable: false})
            }
        }
    }, [])

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
            fillOpacity: safeFillOpacity,
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
            cutPolygon: false,
            removalMode: false,
        });

        map.on("pm:create", onPmCreate)
        map.on("layeradd", onLayerAdd)

        return () => {
            map.pm.removeControls();
            map.off("pm:create");
            map.off("layeradd");
        };
    }, [map, borderColor, borderWeight, fillColor, fillOpacity, onLayerAdd, onPmCreate])


    useEffect(() => {
        if (!map || isInitialLoadComplete.current || geoFeatures.length === 0) return

        geoFeatures.forEach((feature: Feature) => {
            const type = feature.properties?.type;
            const featureId = feature.properties?.id as string;

            if (type === "marker") {
                const point = feature.geometry as Point;
                const layer = L.marker(
                    [point.coordinates[1], point.coordinates[0]],
                    {
                        icon: createMarkerIcon(feature.properties?.fillColor, feature.properties?.borderColor, feature.properties?.fillOpacity),
                        pmIgnore: false
                    }
                );

                (layer as FeatureLayer).featureId = featureId;
                layer.on("click", (event: LeafletMouseEvent) => onLayerClick(event, feature));
                layer.on("pm:update", () => onLayerUpdate(featureId, layer, feature));
                layer.on("pm:dragend", () => onLayerUpdate(featureId, layer, feature));

                clusterGroupRef.current.addLayer(layer);
            } else {
                const {safeBorderWeight, safeFillOpacity} = getSafeBorderWeightAndFillOpacity(
                    feature.properties?.borderWeight ?? DEFAULT_FEATURE_STYLE.borderWeight,
                    feature.properties?.fillOpacity ?? DEFAULT_FEATURE_STYLE.fillOpacity
                );

                const leafletLayer = L.geoJSON(feature, {
                    style: {
                        color: feature.properties?.borderColor ?? DEFAULT_FEATURE_STYLE.borderColor,
                        weight: safeBorderWeight,
                        fillColor: feature.properties?.fillColor || DEFAULT_FEATURE_STYLE.fillColor,
                        fillOpacity: safeFillOpacity
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
                    layer.on("pm:dragend", () => onLayerUpdate(featureId, layer, feature));
                    layer.on("pm:rotateend", () => onLayerUpdate(featureId, layer, feature));
                    layer.addTo(map);
                });
            }
        });

        isInitialLoadComplete.current = true;
    }, [geoFeatures, map, onLayerClick, onLayerUpdate])


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
                    const {safeBorderWeight, safeFillOpacity} = getSafeBorderWeightAndFillOpacity(
                        feature.properties?.borderWeight ?? DEFAULT_FEATURE_STYLE.borderWeight,
                        feature.properties?.fillOpacity ?? DEFAULT_FEATURE_STYLE.fillOpacity
                    );

                    const pathLayer = layer as L.Path;
                    pathLayer.setStyle({
                        color: feature.properties?.borderColor ?? DEFAULT_FEATURE_STYLE.borderColor,
                        weight: safeBorderWeight,
                        fillColor: feature.properties?.fillColor ?? DEFAULT_FEATURE_STYLE.fillColor,
                        fillOpacity: safeFillOpacity
                    });

                    if (layer instanceof L.Circle && feature.properties.radius) {
                        layer.setRadius(feature.properties.radius);
                    }
                }
            }
        });

        clusterGroupRef.current.eachLayer((layer: L.Layer) => {
            const featureLayer = layer as FeatureLayer;
            const feature = geoFeatures.find(f => f.properties?.id === featureLayer.featureId)
            if (!feature) {
                clusterGroupRef.current.removeLayer(layer);
                return;
            }
            (layer as L.Marker).setIcon(createMarkerIcon(
                feature.properties?.fillColor,
                feature.properties?.borderColor,
                getSafeFillOpacityForMarker(feature.properties?.fillOpacity)
            ));
        })
    }, [geoFeatures, map]);

    return null;
};

export default GeoManHandler;