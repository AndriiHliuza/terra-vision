package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.exceptions.user.UserNotFoundException;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.enums.EmailVerificationType;
import com.project.terravision.auth.repository.UserRepository;
import com.project.terravision.auth.service.EmailService;
import com.project.terravision.auth.service.VerificationTokenService;
import com.project.terravision.auth.service.VerificationEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.helpers.MessageFormatter;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationEmailServiceImpl implements VerificationEmailService {

    private final UserRepository userRepository;

    private final EmailService emailService;
    private final VerificationTokenService verificationTokenService;

    @Override
    public void sendVerificationEmail(String email, EmailVerificationType verificationType) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        MessageFormatter.format("User with email '{}' not found", email).getMessage())
                );
        String verificationToken = verificationTokenService.generateAndSaveToken(user.getId(), verificationType);
        String lang = LocaleContextHolder.getLocale().getLanguage();
        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), verificationToken, verificationType, lang);
    }
}
