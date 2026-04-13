package com.project.terravision.gis.repository;

import com.project.terravision.gis.model.Feature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeatureRepository extends JpaRepository<Feature, UUID> {

    @Query("SELECT f FROM Feature f WHERE f.id = :id AND f.validTo IS NULL")
    Optional<Feature> findActiveById(UUID id);

    List<Feature> findAllByValidToIsNull();

    // When start is null, the :start IS NULL condition is TRUE so the whole OR is TRUE and that part is skipped. Same for end.
    @Query("""
        SELECT f FROM Feature f
        WHERE (CAST(:start AS INSTANT) IS NULL OR f.validTo IS NULL OR f.validTo >= :start)
        AND (CAST(:end AS INSTANT) IS NULL OR f.validFrom <= :end)
    """)
    List<Feature> findAllActiveFeaturesInRange(
            Instant start,
            Instant end
    );

    @Query(value = """
            WITH RECURSIVE feature_history AS (
                SELECT * FROM features WHERE id = :id
                UNION ALL
                SELECT f.* FROM features f
                INNER JOIN feature_history fh ON f.id = fh.parent_id
            )
            SELECT * FROM feature_history ORDER BY valid_from DESC
            """, nativeQuery = true)
    List<Feature> findFullHistoryForFeatureById(@Param("id") UUID id);

}
