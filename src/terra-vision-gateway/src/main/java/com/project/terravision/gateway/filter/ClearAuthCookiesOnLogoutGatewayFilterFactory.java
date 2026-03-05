package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.config.WebAttributes;
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
public class ClearAuthCookiesOnLogoutGatewayFilterFactory extends AbstractGatewayFilterFactory<ClearAuthCookiesOnLogoutGatewayFilterFactory.Config> {

    public ClearAuthCookiesOnLogoutGatewayFilterFactory() {
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
                        boolean isSecure = config.isSecure() || exchange.getRequest().getURI().getScheme().equalsIgnoreCase("https");
                        ResponseCookie clearAccess = ResponseCookie
                                .from(WebAttributes.ACCESS_TOKEN_COOKIE, "")
                                .httpOnly(true)
                                .secure(isSecure)
                                .sameSite(config.getSameSite())
                                .path(config.getAccessPath())
                                .maxAge(Duration.ZERO)  // expire immediately
                                .build();

                        ResponseCookie clearRefresh = ResponseCookie
                                .from(WebAttributes.REFRESH_TOKEN_COOKIE, "")
                                .httpOnly(true)
                                .secure(isSecure)
                                .sameSite(config.getSameSite())
                                .path(config.getRefreshPath())
                                .maxAge(Duration.ZERO)  // expire immediately
                                .build();

                        exchange.getResponse().addCookie(clearAccess);
                        exchange.getResponse().addCookie(clearRefresh);

                        log.info("Cleared access and refresh cookies on logout");
                    }
                }));
    }

    @Data
    public static class Config {
        private String domain = "localhost";
        private String accessPath = "/";
        private String refreshPath = "/api/auth/refresh";
        private String sameSite = "Lax";
        private boolean secure = false;
    }

}
