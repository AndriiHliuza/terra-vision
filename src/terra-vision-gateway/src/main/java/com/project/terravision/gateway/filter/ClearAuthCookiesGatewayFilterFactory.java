package com.project.terravision.gateway.filter;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Component
public class ClearAuthCookiesGatewayFilterFactory extends AbstractGatewayFilterFactory<ClearAuthCookiesGatewayFilterFactory.Config> {

    public ClearAuthCookiesGatewayFilterFactory() {
        super(Config.class);
    }

    @NullMarked
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> chain
                .filter(exchange)
                .then(Mono.fromRunnable(() -> {
                    HttpStatus status = (HttpStatus) exchange.getResponse().getStatusCode();
                    // Only clear cookies if logout was successful
                    if (status != null && status.is2xxSuccessful()) {
                        ResponseCookie clearAccess = ResponseCookie
                                .from(config.getAccessTokenCookieName(), "")
                                .httpOnly(true)
                                .secure(config.isSecure())
                                .sameSite(config.getSameSite())
                                .path("/")
                                .maxAge(Duration.ZERO)  // expire immediately
                                .build();

                        ResponseCookie clearRefresh = ResponseCookie
                                .from(config.getRefreshTokenCookieName(), "")
                                .httpOnly(true)
                                .secure(config.isSecure())
                                .sameSite(config.getSameSite())
                                .path(config.getRefreshPath())
                                .maxAge(Duration.ZERO)  // expire immediately
                                .build();

                        exchange.getResponse().addCookie(clearAccess);
                        exchange.getResponse().addCookie(clearRefresh);

                        log.info("Cleared auth cookies on logout");
                    }
                }));
    }

    @Data
    public static class Config {
        private String accessTokenCookieName = "accessToken";
        private String refreshTokenCookieName = "refreshToken";
        private String refreshPath = "/api/auth/refresh";
        private String sameSite = "Strict";
        private boolean secure = false;
    }

}
