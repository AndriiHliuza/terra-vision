package com.project.terravision.gis.config;

import org.n52.jackson.datatype.jts.JtsModule;
import org.springframework.context.annotation.Bean;

//
/*
* --- Java Topology Suite (For GeoJson) ---
* Used for serialization and deserialization of JSON (e.g. JSON from frontend) to GeoJson types (e.g. Geometry) in Java
* */
public class JtsConfig {

    @Bean
    public JtsModule jtsModule() { return new JtsModule(); }
}
