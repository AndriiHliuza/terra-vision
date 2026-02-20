package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.dto.AuthenticationResponse;
import com.project.terravision.gateway.dto.SanitizedAuthenticationResponse;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.cloud.gateway.filter.factory.rewrite.ModifyResponseBodyGatewayFilterFactory;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Component
public class AuthResponseToCookieGatewayFilterFactory extends AbstractGatewayFilterFactory<AuthResponseToCookieGatewayFilterFactory.Config> {

    private final ModifyResponseBodyGatewayFilterFactory modifyResponseBodyFilter;

    public AuthResponseToCookieGatewayFilterFactory(ModifyResponseBodyGatewayFilterFactory modifyResponseBodyFilter) {
        super(Config.class);
        this.modifyResponseBodyFilter = modifyResponseBodyFilter;
    }

    @NullMarked
    @Override
    public GatewayFilter apply(Config config) {
        return modifyResponseBodyFilter.apply(rewriteConfig -> rewriteConfig
                .setInClass(AuthenticationResponse.class)   // what we receive from auth service
                .setOutClass(SanitizedAuthenticationResponse.class)   // what we send to React
                .setRewriteFunction(AuthenticationResponse.class, SanitizedAuthenticationResponse.class,
                        (exchange, authResponse) -> {

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
