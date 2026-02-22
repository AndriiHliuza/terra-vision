package com.project.terravision.auth.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Getter @Setter
@ConfigurationProperties(prefix = "application.security")
public class SecurityProperties {
    private List<String> allowedOrigins = new ArrayList<>();
    private final Jwt jwt = new Jwt();
    private final KeyPair keyPair = new KeyPair();

    @Getter @Setter
    public static class Jwt {
        private String issuer;
    }

    @Getter @Setter
    public static class KeyPair {
        private int size;
    }
}
