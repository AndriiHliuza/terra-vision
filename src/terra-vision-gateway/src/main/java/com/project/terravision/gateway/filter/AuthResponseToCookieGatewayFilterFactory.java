package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.dto.AuthenticationResponse;
import com.project.terravision.gateway.dto.SanitizedAuthenticationResponse;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.cloud.gateway.filter.factory.rewrite.ModifyResponseBodyGatewayFilterFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;

@Slf4j
@Component
public class AuthResponseToCookieGatewayFilterFactory extends AbstractGatewayFilterFactory<AuthResponseToCookieGatewayFilterFactory.Config> {

    private final ObjectMapper objectMapper;
    private final ModifyResponseBodyGatewayFilterFactory modifyResponseBodyFilter;

    public AuthResponseToCookieGatewayFilterFactory(
            ModifyResponseBodyGatewayFilterFactory modifyResponseBodyFilter,
            ObjectMapper objectMapper
    ) {
        super(Config.class);
        this.modifyResponseBodyFilter = modifyResponseBodyFilter;
        this.objectMapper = objectMapper;
    }

    @NullMarked
    @Override
    public GatewayFilter apply(Config config) {
        return modifyResponseBodyFilter.apply(rewriteConfig -> rewriteConfig
                .setInClass(Object.class)   // what we receive from auth service
                .setOutClass(Object.class)   // what we send to React
                .setRewriteFunction(Object.class, Object.class,
                        (exchange, originalBody) -> {

                            // Check if response is successful first
                            HttpStatusCode statusCode = exchange.getResponse().getStatusCode();
                            if (statusCode == null || !statusCode.is2xxSuccessful()) {
                                log.warn("Auth service returned non-2xx status: {}", statusCode);
                                return Mono.justOrEmpty(originalBody);
                            }

                            AuthenticationResponse authResponse = objectMapper.convertValue(originalBody, AuthenticationResponse.class);
                            //noinspection ConstantValue
                            if (authResponse == null) {
                                log.warn("AuthResponse is null — auth service returned non authenticated response body");
                                return Mono.empty();
                            }

                            // Setting cookies
                            setCookies(exchange, authResponse, config);
                            // Returning sanitized body — only userId and username
                            SanitizedAuthenticationResponse sanitized = SanitizedAuthenticationResponse.builder()
                                    .userId(authResponse.getUserId())
                                    .username(authResponse.getUsername())
                                    .build();

                            log.info("Moved access and refresh tokens from authentication response body to cookies");
                            return Mono.just(sanitized);
                        })
        );
    }

    private void setCookies(ServerWebExchange exchange, AuthenticationResponse authResponse, Config config) {
        ResponseCookie accessCookie = ResponseCookie
                .from(config.getAccessTokenCookieName(), authResponse.getAccessToken())
                .httpOnly(true)
                .secure(config.isSecure())
                .sameSite(config.getSameSite())
                .path("/")
                .maxAge(Duration.ofMinutes(config.getAccessTokenMaxAgeMinutes()))
                .build();

        ResponseCookie refreshCookie = ResponseCookie
                .from(config.getRefreshTokenCookieName(), authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(config.isSecure())
                .sameSite(config.getSameSite())
                .path(config.getRefreshPath())
                .maxAge(Duration.ofDays(config.getRefreshTokenMaxAgeDays()))
                .build();

        exchange.getResponse().addCookie(accessCookie);
        exchange.getResponse().addCookie(refreshCookie);
    }

    @Data
    public static class Config {
        private String accessTokenCookieName = "accessToken"; // default value
        private String refreshTokenCookieName = "refreshToken"; // default value
        private String refreshPath = "/api/auth/refresh"; // default value
        private String sameSite = "Strict"; // default value
        private boolean secure = false; // default value
        private long accessTokenMaxAgeMinutes = 15; // default value
        private long refreshTokenMaxAgeDays = 7; // default value
    }
}
