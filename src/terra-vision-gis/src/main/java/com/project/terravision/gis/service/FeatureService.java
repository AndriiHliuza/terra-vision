package com.project.terravision.gis.service;

import com.project.terravision.gis.dto.FeatureCollectionDto;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface FeatureService {
    FeatureCollectionDto getAllActiveFeatures();
    FeatureCollectionDto findAllActiveFeaturesInRange(Instant start, Instant end);
    FeatureCollectionDto getFullHistoryForFeatureById(UUID id);
    void sync(FeatureCollectionDto collection);
}
