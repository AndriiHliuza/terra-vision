package com.project.terravision.auth.service;

import com.project.terravision.auth.model.enums.TokenType;
import java.util.Map;

public interface JwtService {
    String generateToken(String id, String subject, Map<String, Object> claims, TokenType tokenType);
}
