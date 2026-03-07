package com.project.terravision.auth.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@Getter @Setter
@ConfigurationProperties(prefix = "application.mail")
public class MailProperties {
    private String from;
    private VerificationProps verificationProps = new VerificationProps();

    @Getter @Setter
    public static class VerificationProps {
        private String baseUrl;
        private Duration expiration;
    }
}
