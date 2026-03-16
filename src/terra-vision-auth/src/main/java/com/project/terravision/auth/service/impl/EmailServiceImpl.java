package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.config.properties.ApplicationProperties;
import com.project.terravision.auth.config.properties.MailProperties;
import com.project.terravision.auth.enums.EmailVerificationType;
import com.project.terravision.auth.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    private final ApplicationProperties applicationProperties;
    private final MailProperties mailProperties;

    @Async
    public void sendVerificationEmail(
            String to,
            String username,
            String token,
            EmailVerificationType verificationType,
            String lang
    ) {
        System.out.println(lang);
        System.out.println(applicationProperties.getSupportedLanguages());
        String verificationLink = getVerificationLink(verificationType, lang, token);

        Duration expiration = mailProperties.getVerificationProps().getExpiration();

        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("verificationLink", verificationLink);
        context.setVariable("expirationHours", expiration.toMinutes());

        String html = templateEngine.process(getTemplateName(verificationType, lang), context);

        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(mailProperties.getFrom());
            helper.setTo(to);
            helper.setSubject(getSubject(verificationType, lang));
            helper.setText(html, true);
            mailSender.send(message);
            log.debug("Verification email sent to '{}'", to);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to '{}', Exception: {}", to, e.getMessage());
        }
    }

    private String getVerificationLink(EmailVerificationType verificationType, String lang, String token) {
        String baseurl = mailProperties.getVerificationProps().getBaseUrl();
        String urlForVerificationLink = switch (verificationType) {
            case REGISTRATION_VERIFICATION -> mailProperties.getVerificationProps().getUrlToVerifyEmail();
            case RESET_PASSWORD_VERIFICATION -> mailProperties.getVerificationProps().getUrlToResetPassword();
        };
        return baseurl
                .concat("/" + lang)
                .concat(urlForVerificationLink)
                .concat("?token=" + token);
    }

    private String getTemplateName(EmailVerificationType verificationType, String lang) {
        String baseTemplateName = switch (verificationType) {
            case REGISTRATION_VERIFICATION -> "registration-email-template";
            case RESET_PASSWORD_VERIFICATION -> "reset-password-email-template";
        };
        lang = applicationProperties.getSupportedLanguages().contains(lang) ? lang : applicationProperties.getFallbackLanguage();
        return lang + "/" + baseTemplateName;
    }

    private String getSubject(EmailVerificationType verificationType, String lang) {
        String key = switch (verificationType) {
            case REGISTRATION_VERIFICATION -> "registration-email-subject";
            case RESET_PASSWORD_VERIFICATION -> "reset-password-email-subject";
        };
        return mailProperties.getSubjects()
                .getOrDefault(key, Map.of())
                .getOrDefault(lang, "Notification");
    }
}
