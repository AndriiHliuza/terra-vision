package com.project.terravision.gis.config;

import org.n52.jackson.datatype.jts.JtsModule;
import org.springframework.context.annotation.Bean;

// --- Java Topology Suite (For GeoJson) ---
public class JtsConfig {

    @Bean
    public JtsModule jtsModule() { return new JtsModule(); }
}
