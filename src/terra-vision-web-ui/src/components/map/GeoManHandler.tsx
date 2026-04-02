import {type Dispatch, type SetStateAction, useEffect} from "react";
import {useMap} from "react-leaflet";
import type {Feature} from "geojson";
import L from "leaflet";

interface GeoManHandlerProps {
    setGeoFeatures: Dispatch<SetStateAction<Feature[]>>;
    onLayerClick: (feature: Feature, latlng: L.LatLng, layer: L.Layer) => void;
    borderColor: string;
    fillColor: string;
    fillOpacity: number;
    borderWeight: number;
}

const GeoManHandler = ({
                           setGeoFeatures,
                           onLayerClick,
                           borderColor,
                           fillColor,
                           fillOpacity,
                           borderWeight
                       }: GeoManHandlerProps) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        map.pm.setPathOptions({
            color: borderColor,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            weight: borderWeight,
        })

        map.pm.addControls({
            position: "topright",
            drawMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawCircleMarker: false,
            drawText: false,
            drawPolygon: true,
            drawCircle: true,
            editMode: true,
            cutPolygon: false,
            removalMode: true,
        });

        map.pm.setGlobalOptions({
            allowSelfIntersection: false, // Prevents "illegal" polygons
            snappable: true,              // Helps align minefield borders perfectly
            snapDistance: 20,
            templineStyle: {
                color: borderColor,
                weight: borderWeight,
            },
            hintlineStyle: {
                color: borderColor,
                weight: borderWeight,
                dashArray: [5, 5]
            }
        });

        // 3. HANDLE CREATION
        map.on("pm:create", (e) => {
            const {shape, layer} = e;
            const layerId = L.Util.stamp(layer);
            const polyLayer = layer as L.Polygon | L.Circle;
            const geoJson = polyLayer.toGeoJSON() as Feature;

            const visualProperties = {
                id: layerId,
                borderColor: borderColor,
                fillColor: fillColor,
                fillOpacity: fillOpacity,
                borderWeight: borderWeight,
            };

            if (shape === "Circle") {
                const circle = layer as L.Circle;
                geoJson.properties = {
                    ...geoJson.properties,
                    ...visualProperties,
                    type: "circle",
                    radius: circle.getRadius()
                };
            } else if (shape === "Polygon") {
                geoJson.properties = {
                    ...geoJson.properties,
                    ...visualProperties,
                    type: "polygon"
                };
            }

            geoJson.properties = {...geoJson.properties, id: layerId};
            setGeoFeatures(prev => [...prev, geoJson]);

            console.log("Created GeoJson:", geoJson);
            console.log("Created GIS Object. ID:", layerId);

            layer.on("pm:update", () => {
                const updatedGeoJson = polyLayer.toGeoJSON() as Feature;

                if (layer instanceof L.Circle) {
                    updatedGeoJson.properties = {
                        ...geoJson.properties,
                        radius: layer.getRadius()
                    };
                } else {
                    updatedGeoJson.properties = {
                        ...geoJson.properties
                    };
                }

                setGeoFeatures(prev =>
                    prev.map(feature => feature.properties?.id === layerId ? updatedGeoJson : feature)
                );
                console.log("Edited GeoJson:", updatedGeoJson);
                console.log("Edited GIS Object. ID:", layerId);
            });

            layer.on("click", (event) => {
                // Prevent the map click handler from firing (bubbling)
                L.DomEvent.stopPropagation(event);

                onLayerClick(geoJson, event.latlng, layer)
            });
        });

        // 4. HANDLE REMOVAL
        map.on("pm:remove", (e) => {
            const layerId = L.Util.stamp(e.layer);
            setGeoFeatures(prev =>
                prev.filter(f => f.properties?.id !== layerId));
            console.log("Deleted GIS Object. ID:", layerId);
        });

        return () => {
            map.pm.removeControls();
            map.off("pm:create");
            map.off("pm:remove");
        };
    }, [map, setGeoFeatures, onLayerClick, borderColor, borderWeight, fillColor, fillOpacity]);

    return null;
};

export default GeoManHandler;