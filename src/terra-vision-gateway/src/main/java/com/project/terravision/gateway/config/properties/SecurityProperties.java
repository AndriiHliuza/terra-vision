package com.project.terravision.gateway.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component
@Getter @Setter
@ConfigurationProperties(prefix = "application.security")
public class SecurityProperties {
    private List<String> allowedOrigins = new ArrayList<>();
}
