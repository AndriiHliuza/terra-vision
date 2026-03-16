package com.project.terravision.auth.service;

import com.project.terravision.auth.enums.EmailVerificationType;

public interface EmailService {
    void sendVerificationEmail(String to, String username, String token, EmailVerificationType verificationType, String lang);
}
