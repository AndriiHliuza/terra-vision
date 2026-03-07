package com.project.terravision.auth.config;

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
        /*
        * If a target field has no mapping → compilation fails.
        * */
        unmappedTargetPolicy = ReportingPolicy.ERROR,

        /*
        * If a source field is not used in any mapping → silently ignored.
        * Source objects can have extra fields that you don't need in the target.
        * */
        unmappedSourcePolicy = ReportingPolicy.IGNORE,


        // ------------
        /*
        * If the entire source object is null → return null. Caller is responsible for null handling.
        * */
        nullValueMappingStrategy = NullValueMappingStrategy.RETURN_NULL,

        /*
        * If an individual source field is null → skip it, keep the existing target field value.
        * Especially useful with @MappingTarget updates — don't overwrite existing values with null.
        * */
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,

        /*
        * Always generate null checks before every field mapping:
        * */
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,


        // ------------
        /*
        * When mapping collections, prefer addItem() over setItems() if adder method exists
        * */
        collectionMappingStrategy = CollectionMappingStrategy.ADDER_PREFERRED
)
public interface MappingConfig {}
