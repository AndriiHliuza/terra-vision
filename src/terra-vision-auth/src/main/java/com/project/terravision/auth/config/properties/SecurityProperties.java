package com.project.terravision.auth.config.properties;

import com.project.terravision.auth.enums.KeySize;
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
    private final JwtProperties jwt = new JwtProperties();
    private final KeyPairProperties keyPair = new KeyPairProperties();

    @Getter @Setter
    public static class JwtProperties {
        private String issuer;
        private final TokenProperties accessToken = new TokenProperties();
        private final TokenProperties refreshToken = new TokenProperties();

        @Getter @Setter
        public static class TokenProperties {
            private Duration expiration;
        }
    }

    @Getter @Setter
    public static class KeyPairProperties {
        private KeySize size = KeySize.STANDARD; // Default 2048 bits
        private Duration keyExpiration = Duration.ofDays(10); // Default 10 days
    }
}
