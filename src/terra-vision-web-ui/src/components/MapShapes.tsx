import {Circle, Polygon, Rectangle} from "react-leaflet";
import {getShapeEventHandlers} from "../commons/utils/map-controls.ts";
import type {Shape} from "../commons/schemas/gis-schemas.ts";

function MapShapes({ shapes }: { shapes: Shape[] }) {
    return (
        <>
            {shapes.map((shape) => {
                switch (shape.type) {
                    case "rectangle": {
                        const rectDefault = {color: "green", fillColor: "lightgreen", fillOpacity: 0.4};
                        const rectHover = {color: "darkgreen", fillColor: "lime", fillOpacity: 0.6};
                        return (
                            <Rectangle
                                key={shape.id}
                                bounds={shape.bounds}
                                pathOptions={rectDefault}
                                eventHandlers={getShapeEventHandlers(rectDefault, rectHover)}
                            />
                        );
                    }

                    case "circle": {
                        const circleDefault = {color: "red", fillColor: "pink", fillOpacity: 0.4};
                        const circleHover = {color: "darkred", fillColor: "orange", fillOpacity: 0.6};
                        return (
                            <Circle
                                key={shape.id}
                                center={shape.center}
                                radius={shape.radius}
                                pathOptions={circleDefault}
                                eventHandlers={getShapeEventHandlers(circleDefault, circleHover)}
                            />
                        );
                    }

                    case "polygon": {
                        const polygonDefault = {color: "blue", fillColor: "lightblue", fillOpacity: 0.4};
                        const polygonHover = {color: "darkblue", fillColor: "skyblue", fillOpacity: 0.6};
                        return (
                            <Polygon
                                key={shape.id}
                                positions={shape.coords}
                                pathOptions={polygonDefault}
                                eventHandlers={getShapeEventHandlers(polygonDefault, polygonHover)}
                            />
                        );
                    }

                    default:
                        return null;
                }
            })}
        </>
    )
}

export default MapShapes;
