package com.project.terravision.gis.service.impl;

import com.project.terravision.gis.dto.FeatureCollectionDto;
import com.project.terravision.gis.dto.FeatureDto;
import com.project.terravision.gis.dto.FeaturePropertiesDto;
import com.project.terravision.gis.enums.FeatureType;
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
        if (start != null && end != null && end.isBefore(start)) throw new IllegalArgumentException("End date cannot be before start date.");
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
            if (props.isDeleted()) handleDeletedFeature(featureDto, featuresToSave);
            else if (props.isNew()) handleNewFeature(featureDto, featuresToSave);
            else if (props.isModified()) handleModifiedFeature(featureDto, featuresToSave);
        });
        if (!featuresToSave.isEmpty()) featureRepository.saveAll(featuresToSave);
    }

    private void handleDeletedFeature(FeatureDto featureDto, List<Feature> featuresToSave) {
        FeaturePropertiesDto props = featureDto.getProperties();
        featureRepository
                .findActiveById(props.getId())
                .ifPresent(activeFeature -> {
                            if (activeFeature.getValidTo() == null) {
                                Instant validTo = props.getValidTo() != null ? props.getValidTo() : Instant.now();
                                if (!validTo.isBefore(activeFeature.getValidFrom())) {
                                    activeFeature.setValidTo(validTo);
                                    featuresToSave.add(activeFeature);
                                }
                            }
                        }
                );
    }

    private void handleNewFeature(FeatureDto featureDto, List<Feature> featuresToSave) {
        FeaturePropertiesDto props = featureDto.getProperties();

        UUID id = props.getId() != null ? props.getId() : UUID.randomUUID();
        Instant validFrom = props.getValidFrom() != null ? props.getValidFrom() : Instant.now();
        FeatureType type = FeatureType.valueOf(props.getType().toUpperCase());

        Feature feature = Feature.builder()
                .id(id).type(type).validFrom(validFrom)
                .build();

        if (props.getParentId() != null) {
            featureRepository.findById(props.getParentId()).ifPresent(feature::setParent);
        }

        featureMapper.updateFeatureFromFeatureDto(feature, featureDto);
        featuresToSave.add(feature);
    }

    private void handleModifiedFeature(FeatureDto featureDto, List<Feature> featuresToSave) {
        FeaturePropertiesDto props = featureDto.getProperties();
        featureRepository
                .findActiveById(props.getId())
                .ifPresent(feature -> {
                    featureMapper.updateFeatureFromFeatureDto(feature, featureDto);
                    feature.setLastModified(props.getLastModified());
                    featuresToSave.add(feature);
                });
    }
}
