package com.project.terravision.auth.service;

import com.project.terravision.auth.model.enums.TokenType;
import java.util.Map;

public interface JwtService {
    String generateTokenForUserInSecurityContext(Map<String, Object> claims, TokenType tokenType);
    String generateToken(String subject, Map<String, Object> claims, TokenType tokenType);
}
