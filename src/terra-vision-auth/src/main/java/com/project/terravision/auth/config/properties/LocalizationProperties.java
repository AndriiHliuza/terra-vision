package com.project.terravision.auth.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Getter
@Setter
@ConfigurationProperties(prefix = "application.localization")
public class LocalizationProperties {
    private List<String> supportedLanguages = List.of("en");
    private String fallbackLanguage;
}
