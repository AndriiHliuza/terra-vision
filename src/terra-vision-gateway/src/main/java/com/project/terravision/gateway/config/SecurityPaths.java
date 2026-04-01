package com.project.terravision.gateway.config;

import org.springframework.http.HttpMethod;

import java.util.Map;

public abstract class SecurityPaths {

    // <<<<<<<<<<<<<<<<<<<<<<<< [PUBLIC ENDPOINTS] >>>>>>>>>>>>>>>>>>>>>>>>

    public static abstract class PublicPaths {
        public static final String[] ALL_HTTP_METHODS_PATHS = {
                "/api/gis/**"
        };

        public static final String[] GET_PATHS = {

                // <<<<<<<<<<<< auth service endpoints >>>>>>>>>>>>

                "/api/auth/.well-known/jwks.json", // JSON Web Key Set

                "/api/auth/public", // Just for testing purposes

                // <<<<<<<<<<<< ai service endpoints >>>>>>>>>>>>

                "/api/ai/models"
        };

        public static final String[] POST_PATHS = {

                // <<<<<<<<<<<< auth service endpoints >>>>>>>>>>>>

                "/api/auth/login",
                "/api/auth/refresh-token",

                "/api/auth/rotate-key",

                "/api/auth/sign-up",
                "/api/auth/verify-email",

                "/api/auth/forgot-password",
                "/api/auth/reset-password",

                "/api/auth/resend-verification",

                // <<<<<<<<<<<< ai service endpoints >>>>>>>>>>>>

                "/api/ai/detect"
        };
    }




    // <<<<<<<<<<<<<<<<<<<<<<<< ['HAS AT LEAST USER's POWERLEVEL' ENDPOINTS] >>>>>>>>>>>>>>>>>>>>>>>>

    public static abstract class AtLeastUserPowerLevelPaths {
        public static final String[] GET_PATHS = {
                // <<<<<<<<<<<< auth service endpoints >>>>>>>>>>>>

                "/api/auth/me",
                "/api/auth/user/protected", // Just for testing purposes

                // <<<<<<<<<<<< ai service endpoints >>>>>>>>>>>>

                "/api/ai/stats/**",
                "/api/ai/storage/**"
        };

        public static final String[] POST_PATHS = {
                "/api/auth/logout"
        };
    }




    // <<<<<<<<<<<<<<<<<<<<<<<< ['HAS AT LEAST ADMIN's POWERLEVEL' ENDPOINTS] >>>>>>>>>>>>>>>>>>>>>>>>

    public static abstract class AtLeastAdminPowerLevelPaths {
        public static final String[] GET_PATHS = {
                "/api/auth/admin/protected" // Just for testing purposes
        };
    }




    // <<<<<<<<<<<<<<<<<<<<<<<< ['HAS AT LEAST SUPER_ADMIN's POWERLEVEL' ENDPOINTS] >>>>>>>>>>>>>>>>>>>>>>>>

    public static abstract class AtLeastSuperAdminPowerLevelPaths {
        public static final String[] GET_PATHS = {
                "/api/auth/super-admin/protected" // Just for testing purposes
        };
    }




    // <<<<<<<<<<<<<<<<<<<<<<<< [OTHER IMPORTANT ENDPOINTS] >>>>>>>>>>>>>>>>>>>>>>>>

    // ------------ public paths by method ------------
    public static final Map<HttpMethod, String[]> PERMIT_ALL_PATHS_BY_METHOD = Map.of(
            HttpMethod.GET, PublicPaths.GET_PATHS,
            HttpMethod.POST, PublicPaths.POST_PATHS
    );

    // ------------ Internal paths ------------
    public static final String[] INTERNAL_PATHS = {
            "/api/auth/internal/**",
            "/api/ai/internal/**"
    };

    // ------------ CSRF ------------
    public static final String[] CSRF_TOKEN_GENERATION_PATHS = {
            "/api/auth/login",
            "/api/auth/me"
    };
}
