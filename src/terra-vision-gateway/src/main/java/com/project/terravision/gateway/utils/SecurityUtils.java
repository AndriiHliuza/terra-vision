package com.project.terravision.gateway.utils;

import com.project.terravision.gateway.config.SecurityConfig;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;

public abstract class SecurityUtils {
    private static final AntPathMatcher pathMatcher = new AntPathMatcher();
    public static boolean isPathPublic(String path) {
        return Arrays.stream(SecurityConfig.PERMIT_ALL_PATHS)
                .anyMatch(excludedPath -> pathMatcher.match(excludedPath, path));
    }


    // ------ CSRF ------
    public static boolean requiresCsrfTokenGeneration(String path) {
        return Arrays.stream(SecurityConfig.CSRF_TOKEN_GENERATION_PATHS)
                .anyMatch(tokenGenerationPath -> pathMatcher.match(tokenGenerationPath, path));
    }

    public static Mono<ServerWebExchangeMatcher.MatchResult> requireCsrfProtection(ServerWebExchange exchange) {
        String path = exchange.getRequest().getPath().value();
        boolean isPublic = SecurityUtils.isPathPublic(path);
        boolean requiresCsrfTokenGeneration = requiresCsrfTokenGeneration(path);
        return isPublic || requiresCsrfTokenGeneration
                ? ServerWebExchangeMatcher.MatchResult.notMatch() // skip CSRF token check
                : ServerWebExchangeMatcher.MatchResult.match(); // apply CSRF token check
    }
}
