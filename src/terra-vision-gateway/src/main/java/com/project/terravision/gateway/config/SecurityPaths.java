package com.project.terravision.gateway.config;

import org.springframework.http.HttpMethod;

import java.util.Map;

public abstract class SecurityPaths {

    // ------------ Public paths ------------

    public static final String[] PERMIT_ALL_PATHS = {
            "/api/ai/**",
            "/api/gis/**"
    };

    public static final String[] PERMIT_ALL_GET_PATHS = {
            "/api/auth/.well-known/jwks.json", // JSON Web Key Set

            "/api/auth/registration/confirm",

            "/api/auth/public"
    };

    public static final String[] PERMIT_ALL_POST_PATHS = {
            "/api/auth/login",
            "/api/auth/refresh",

            "/api/auth/rotate-key",

            "/api/auth/registration",
            "/api/auth/registration/confirmation/email/resend"
    };

    public static final Map<HttpMethod, String[]> PERMIT_ALL_PATHS_BY_METHOD = Map.of(
            HttpMethod.GET, SecurityPaths.PERMIT_ALL_GET_PATHS,
            HttpMethod.POST, SecurityPaths.PERMIT_ALL_POST_PATHS
    );

    // ------------ CSRF ------------
    public static final String[] CSRF_TOKEN_GENERATION_PATHS = {
            "/api/auth/login",
            "/api/auth/me"
    };
}
