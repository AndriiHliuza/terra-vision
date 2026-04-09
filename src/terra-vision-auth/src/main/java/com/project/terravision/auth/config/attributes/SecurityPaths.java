package com.project.terravision.auth.config.attributes;

public class SecurityPaths {

    // <<<<<<<<<<<<<<<<<<<<<<<< [PUBLIC ENDPOINTS] >>>>>>>>>>>>>>>>>>>>>>>>

    public static abstract class PublicPaths {
        public static final String[] ALL_HTTP_METHODS_PATHS = {
                "/api/auth/internal/**"
        };

        public static final String[] GET_PATHS = {
                "/api/auth/.well-known/jwks.json", // JSON Web Key Set

                "/api/auth/public" // Just for testing purposes
        };

        public static final String[] POST_PATHS = {
                "/api/auth/login",
                "/api/auth/refresh-token",

                "/api/auth/rotate-key",

                "/api/auth/sign-up",
                "/api/auth/verify-email",

                "/api/auth/forgot-password",
                "/api/auth/reset-password",

                "/api/auth/resend-verification"
        };
    }
}
