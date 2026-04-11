package com.project.terravision.gis.mapper;

import com.project.terravision.gis.config.MappingConfig;
import com.project.terravision.gis.dto.FeatureDto;
import com.project.terravision.gis.dto.FeaturePropertiesDto;
import com.project.terravision.gis.enums.FeatureType;
import com.project.terravision.gis.model.Feature;
import org.mapstruct.*;

@Mapper(config = MappingConfig.class)
public interface FeatureMapper {


    @BeanMapping(
            ignoreByDefault = true,
            nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "title", source = "dto.properties.title")
    @Mapping(target = "description", source = "dto.properties.description")
    @Mapping(target = "type", source = "dto.properties.type", qualifiedByName = "stringToFeatureType")
    @Mapping(target = "geometry", source = "dto.geometry")

    @Mapping(target = "fillColor", source = "dto.properties.fillColor")
    @Mapping(target = "borderColor", source = "dto.properties.borderColor")
    @Mapping(target = "fillOpacity", source = "dto.properties.fillOpacity")
    @Mapping(target = "borderWeight", source = "dto.properties.borderWeight")

    @Mapping(target = "radius", source = "dto.properties.radius")
    void updateFeatureFromFeatureDto(@MappingTarget Feature entity, FeatureDto dto);


    @BeanMapping(
            ignoreByDefault = true,
            nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "type", constant = "Feature")
    @Mapping(target = "geometry", source = "geometry")
    @Mapping(target = "properties", source = "entity") // ← MapStruct uses toPropertiesDto automatically
    FeatureDto toDto(Feature entity);

    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "type", source = "type", qualifiedByName = "featureTypeToString")
    @Mapping(target = "isNew", ignore = true)
    @Mapping(target = "isModified", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    FeaturePropertiesDto toPropertiesDto(Feature entity);


    @Named("stringToFeatureType")
    default FeatureType stringToFeatureType(String type) {
        if (type == null) return null;
        return FeatureType.valueOf(type.toUpperCase());
    }

    @Named("featureTypeToString")
    default String featureTypeToString(FeatureType type) {
        if (type == null) return null;
        return type.name().toLowerCase();
    }
}
