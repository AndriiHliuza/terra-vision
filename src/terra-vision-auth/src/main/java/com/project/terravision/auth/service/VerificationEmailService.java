package com.project.terravision.auth.service;

import com.project.terravision.auth.enums.EmailVerificationType;

public interface VerificationEmailService {
    void sendVerificationEmail(String email, EmailVerificationType verificationType);
}
