package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.config.properties.MailProperties;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final MailProperties mailProperties;

    @Async
    public void sendVerificationEmail(String to, String username, String token) {
        String baseUrl = mailProperties.getVerificationProps().getBaseUrl();
        Duration expiration = mailProperties.getVerificationProps().getExpiration();

        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("verificationLink", baseUrl + "?token=" + token);
        context.setVariable("expirationHours", expiration.toMinutes());

        String html = templateEngine.process("email-verification", context);

        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(mailProperties.getFrom());
            helper.setTo(to);
            helper.setSubject("ACCOUNT VERIFICATION");
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Verification email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
        }


    }
}
