package com.project.terravision.gis.service.impl;

import com.project.terravision.gis.dto.FeatureCollectionDto;
import com.project.terravision.gis.dto.FeatureDto;
import com.project.terravision.gis.dto.FeaturePropertiesDto;
import com.project.terravision.gis.mapper.FeatureMapper;
import com.project.terravision.gis.model.Feature;
import com.project.terravision.gis.repository.FeatureRepository;
import com.project.terravision.gis.service.FeatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeatureServiceImpl implements FeatureService {

    private final FeatureRepository featureRepository;
    private final FeatureMapper featureMapper;

    public FeatureCollectionDto getAllActiveFeatures() {
        List<FeatureDto> features = featureRepository.findAllByValidToIsNull().stream()
                .map(featureMapper::toDto)
                .toList();
        return new FeatureCollectionDto("FeatureCollection", features);
    }

    public FeatureCollectionDto findAllActiveFeaturesInRange(Instant start, Instant end) {
        if (end.isBefore(start)) throw new IllegalArgumentException("End date cannot be before start date.");
        List<FeatureDto> features = featureRepository.findAllActiveFeaturesInRange(start, end).stream()
                .map(featureMapper::toDto)
                .toList();
        return new FeatureCollectionDto("FeatureCollection", features);
    }

    public FeatureCollectionDto getFullHistoryForFeatureById(UUID id) {
        List<FeatureDto> features = featureRepository.findFullHistoryForFeatureById(id).stream()
                .map(featureMapper::toDto)
                .toList();
        return new FeatureCollectionDto("FeatureCollection", features);
    }

    @Transactional
    public void sync(FeatureCollectionDto collection) {
        List<Feature> featuresToSave = new ArrayList<>();
        collection.getFeatures().forEach(featureDto -> {
            FeaturePropertiesDto props = featureDto.getProperties();
            if (props.isDeleted()) handleDeletedFeature(props, featuresToSave);
            else if (props.isNew() || props.isModified()) handleNewAndModifiedFeature(featureDto, featuresToSave);
            else
                log.error("Feature with id={} provided for sync but is not 'new' or 'modified' or 'deleted' | Skipping feature", props.getId());
        });
        if (!featuresToSave.isEmpty()) featureRepository.saveAll(featuresToSave);
    }

    private void handleDeletedFeature(FeaturePropertiesDto props, List<Feature> featuresToSave) {
        featureRepository
                .findActiveById(props.getId())
                .ifPresentOrElse(
                        activeFeature -> {
                            Instant validFrom = activeFeature.getValidFrom();
                            if (activeFeature.getValidTo() == null) {
                                Instant validTo = props.getValidTo() != null ? props.getValidTo() : Instant.now();
                                if (validTo.isBefore(validFrom)) {
                                    log.error("[Timeline Error] | Feature with id={} deletion date (validTo={}) cannot be before its creation date (validFrom={}) | Skipping feature",
                                            props.getId(), validTo, activeFeature.getValidFrom());
                                    return;
                                }
                                activeFeature.setValidTo(validTo);
                                featuresToSave.add(activeFeature);
                            } else {
                                log.error("Feature with id={} already has validTo set | Skipping feature", props.getId());
                            }
                        },
                        () -> log.error("Feature with id={} is marked as 'deleted' but was not found in within active features in database | Skipping feature", props.getId())
                );
    }

    private void handleNewAndModifiedFeature(
            FeatureDto featureDto,
            List<Feature> featuresToSave) {
        FeaturePropertiesDto props = featureDto.getProperties();
        Feature feature = props.isNew()
                ? new Feature()
                : featureRepository.findActiveById(props.getId()).orElse(null);

        if (feature != null) {
            if (props.isNew()) {
                if (props.getId() == null) log.error("Feature with isNew but does not have the id | Generating id");
                feature.setId(props.getId() != null ? props.getId() : UUID.randomUUID());
                feature.setValidFrom(props.getValidFrom() != null ? props.getValidFrom() : Instant.now());
            }

            if (props.getParentId() != null) featureRepository.findById(props.getParentId()).ifPresent(feature::setParent);
            else feature.setParent(null);

            featureMapper.updateFeatureFromFeatureDto(feature, featureDto);

            Instant lastModified = props.getLastModified();
            Instant validFrom = feature.getValidFrom();
            Instant validTo = feature.getValidTo();

            if (lastModified != null) {
                if (lastModified.isBefore(validFrom) || (validTo != null && lastModified.isAfter(validTo))) {
                    log.error("[Timeline Error] | Feature with id={}: lastModified={} is out of bounds [validFrom={}, validTo={}]",
                            props.getId(), lastModified, validFrom, validTo);
                    return;
                }
                feature.setLastModified(lastModified);
            }
            featuresToSave.add(feature);
        } else {
            log.error("Feature with id={} is marked as 'modified' but was not found within active features in database | Skipping feature", featureDto.getProperties().getId());
        }

    }
}
