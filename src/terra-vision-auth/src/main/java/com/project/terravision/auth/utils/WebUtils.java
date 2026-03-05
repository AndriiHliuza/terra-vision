package com.project.terravision.auth.utils;

import com.project.terravision.auth.config.WebAttributes;

public abstract class WebUtils {
    public static String extractBearerTokenFromAuthorizationHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith(WebAttributes.BEARER_PREFIX)) {
            throw new IllegalArgumentException("Invalid Authorization header");
        }
        return authHeader.substring(WebAttributes.BEARER_PREFIX.length());
    }
}
