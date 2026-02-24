package com.project.terravision.auth.service;

import com.project.terravision.auth.config.SecurityConfig;

public class HttpHeaderUtils {
    public static String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith(SecurityConfig.BEARER_PREFIX)) {
            throw new IllegalArgumentException("Invalid Authorization header");
        }
        return authHeader.substring(SecurityConfig.BEARER_PREFIX.length());
    }
}
