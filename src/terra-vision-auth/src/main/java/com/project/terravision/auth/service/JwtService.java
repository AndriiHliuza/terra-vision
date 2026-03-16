package com.project.terravision.auth.service;

import com.project.terravision.auth.enums.JwtType;

import java.util.Map;

public interface JwtService {
    String generateToken(String id, String subject, Map<String, Object> claims, JwtType jwtType);
}
