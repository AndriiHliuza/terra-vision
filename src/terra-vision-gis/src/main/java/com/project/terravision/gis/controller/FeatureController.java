package com.project.terravision.gis.controller;

import com.project.terravision.gis.dto.FeatureCollectionDto;
import com.project.terravision.gis.service.FeatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/gis/features")
@RequiredArgsConstructor
public class FeatureController {
    private final FeatureService featureService;

    @PostMapping("/sync")
    public void syncFeatures(@RequestBody FeatureCollectionDto featureCollectionDto) {
        featureService.sync(featureCollectionDto);
    }

    @GetMapping("/active")
    public FeatureCollectionDto getAllActiveFeatures(
            @RequestParam(required = false) Instant start,
            @RequestParam(required = false) Instant end
    ) {
        if (start != null && end != null) {
            return featureService.findAllActiveFeaturesInRange(start, end);
        }
        return featureService.getAllActiveFeatures();
    }

    @GetMapping("/history/{id}")
    public FeatureCollectionDto getFullHistoryForFeatureById(@PathVariable UUID id) {
        return featureService.getFullHistoryForFeatureById(id);
    }
}
