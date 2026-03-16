package com.project.terravision.auth.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Component
@Getter @Setter
@ConfigurationProperties(prefix = "application.mail")
public class MailProperties {
    private String from;
    private Map<String, Map<String, String>> subjects = new HashMap<>();
    private VerificationProps verificationProps = new VerificationProps();

    @Getter @Setter
    public static class VerificationProps {
        private String baseUrl;
        private String urlToVerifyEmail;
        private String urlToResetPassword;
        private Duration expiration;
    }
}
