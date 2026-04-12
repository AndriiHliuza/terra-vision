package com.project.terravision.gis.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Geometry;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeatureDto {
    @NotBlank @Pattern(regexp = "Feature")
    private String type;

    @NotNull
    private Geometry geometry;

    @NotNull @Valid
    private FeaturePropertiesDto properties;
}
