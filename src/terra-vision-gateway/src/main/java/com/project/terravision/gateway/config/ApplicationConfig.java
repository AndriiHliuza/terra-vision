package com.project.terravision.gateway.config;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationPropertiesScan(basePackages = "com.project.terravision.gateway.config.properties")
public class ApplicationConfig {}