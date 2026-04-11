import type {Feature, Geometry} from "geojson";
import type {FeatureProperties} from "../schemas/gis-schemas.ts";

export function prepareFeaturesForSync(features: Feature<Geometry, FeatureProperties>[]): Feature<Geometry, FeatureProperties>[] {
    return features.map((f) => {
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
            },
        };
    });
}