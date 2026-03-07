package com.project.terravision.auth.config;

import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@Configuration
@ConfigurationPropertiesScan(basePackages = "com.project.terravision.auth.config.properties")
public class ApplicationConfig {}
