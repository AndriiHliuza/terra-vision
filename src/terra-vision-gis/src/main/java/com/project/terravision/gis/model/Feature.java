package com.project.terravision.gis.model;

import com.project.terravision.gis.enums.FeatureType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Geometry;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "features")
public class Feature {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Feature parent;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    private FeatureType type;

    private String title;
    private String description;

    @Column(columnDefinition = "geometry(Geometry, 4326)", nullable = false)
    private Geometry geometry;

    @Column(length = 7)
    private String fillColor;

    @Column(length = 7)
    private String borderColor;

    private Double fillOpacity;
    private Integer borderWeight;

    private Double radius;

    @Column(nullable = false)
    private Instant validFrom;

    private Instant validTo;
    private Instant lastModified;
}

