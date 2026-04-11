package com.project.terravision.gis.config;

import org.mapstruct.*;

@MapperConfig(
        /*
        * Mappers become spring beans
        * */
        componentModel = MappingConstants.ComponentModel.SPRING,

        /*
        * Inject mappers via constructor
        * */
        injectionStrategy = InjectionStrategy.CONSTRUCTOR,


        // ------------
        // unmappedSourcePolicy = ReportingPolicy.IGNORE, // default is IGNORE
        unmappedTargetPolicy = ReportingPolicy.ERROR, // default is WARN



        // ------------
        // nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL, // default is RETURN_NULL
        // nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL, // default is SET_TO_NULL



        // ------------
        /*
        * When mapping collections, prefer addItem() over setItems() if adder method exists. If addItem() does not exist, use setItems()
        * */
        collectionMappingStrategy = CollectionMappingStrategy.ADDER_PREFERRED // default CollectionMappingStrategy.ACCESSOR_ONLY
)
public interface MappingConfig {}
