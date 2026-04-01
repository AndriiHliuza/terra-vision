package com.project.terravision.gis.config;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@Configuration
@ConfigurationPropertiesScan(basePackages = "com.project.terravision.gis.config.properties")
public class ApplicationConfig {}