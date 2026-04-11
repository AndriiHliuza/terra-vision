package com.project.terravision.gis.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeaturePropertiesDto {
        @NotNull
        private UUID id;

        private UUID parentId;

        @NotBlank
        @Pattern(regexp = "polygon|circle|marker", message = "Type must be polygon, circle, or marker")
        private String type;

        private String title;
        private String description;

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "fillColor must be a valid hex color")
        private String fillColor;

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "borderColor must be a valid hex color")
        private String borderColor;

        @DecimalMin("0.0") @DecimalMax("1.0")
        private Double fillOpacity;

        @Min(0) @Max(12)
        private Integer borderWeight;

        @Positive(message = "Radius must be greater than 0")
        private Double radius;

        @NotNull Instant validFrom;
        private Instant validTo;
        private Instant lastModified;

        boolean isNew;
        boolean isModified;
        boolean isDeleted;
}
