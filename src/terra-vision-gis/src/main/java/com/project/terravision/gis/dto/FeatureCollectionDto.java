package com.project.terravision.gis.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeatureCollectionDto {

    @NotBlank @Pattern(regexp = "FeatureCollection")
    private String type;

    @NotEmpty @Valid
    private List<FeatureDto> features;
}
