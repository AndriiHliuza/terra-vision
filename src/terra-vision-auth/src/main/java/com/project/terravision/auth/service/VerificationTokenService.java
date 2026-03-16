package com.project.terravision.auth.service;

import com.project.terravision.auth.enums.EmailVerificationType;

import java.util.UUID;

public interface VerificationTokenService {
    String generateAndSaveToken(UUID userId, EmailVerificationType verificationType);
    UUID validateToken(String token, EmailVerificationType verificationType);
}
