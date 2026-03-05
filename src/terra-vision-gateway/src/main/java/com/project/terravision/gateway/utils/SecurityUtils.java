package com.project.terravision.gateway.utils;

import com.project.terravision.gateway.config.SecurityConfig;
import org.springframework.util.AntPathMatcher;

import java.util.Arrays;

public abstract class SecurityUtils {
    private static final AntPathMatcher pathMatcher = new AntPathMatcher();
    public static boolean isPathPublic(String path) {
        return Arrays.stream(SecurityConfig.PERMIT_ALL_PATHS)
                .anyMatch(excludedPath -> pathMatcher.match(excludedPath, path));
    }
}
