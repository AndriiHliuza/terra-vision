package com.project.terravision.auth.service;

import java.util.UUID;

public interface EmailTokenService {
    String generateAndSaveToken(UUID userId);
    UUID validateAndConsumeToken(String token);
}
