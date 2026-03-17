package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.config.WebAttributes;
import com.project.terravision.gateway.utils.WebUtils;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.jspecify.annotations.NullMarked;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;

/*
* WebFilter runs before GatewayFilter
* */
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
                        boolean isSecure = config.isSecure() || WebUtils.isRequestViaHttps(exchange);
                        ResponseCookie clearAccessCookie = ResponseCookie
                                .from(WebAttributes.ACCESS_TOKEN_COOKIE, StringUtils.EMPTY)
                                .httpOnly(true)
                                .secure(isSecure)
                                .sameSite(config.getSameSite())
                                .path(config.getRootPath())
                                .maxAge(Duration.ZERO)  // expire immediately
                                .build();

                        ResponseCookie clearRefreshCookie = ResponseCookie
                                .from(WebAttributes.REFRESH_TOKEN_COOKIE, StringUtils.EMPTY)
                                .httpOnly(true)
                                .secure(isSecure)
                                .sameSite(config.getSameSite())
                                .path(config.getRefreshPath())
                                .maxAge(Duration.ZERO)  // expire immediately
                                .build();

                        ResponseCookie clearCsrfCookie = ResponseCookie
                                .from(WebAttributes.XSRF_TOKEN_COOKIE, StringUtils.EMPTY)
                                .httpOnly(false)
                                .secure(isSecure)
                                .sameSite(config.getSameSite())
                                .path(config.getRootPath())
                                .maxAge(Duration.ZERO) // expire immediately
                                .build();

                        exchange.getResponse().addCookie(clearAccessCookie);
                        exchange.getResponse().addCookie(clearRefreshCookie);
                        exchange.getResponse().addCookie(clearCsrfCookie);

                        String userId = exchange.getAttribute("userId");
                        log.info("Log out | userId={} | Cleared 'accessToken', 'refreshToken', 'XSRF-TOKEN' cookies",  userId);
                    }
                }));
    }

    @Data
    public static class Config {
        // fallback value can be specified here in there is no value in application.yaml
        private String domain;
        private String rootPath;
        private String refreshPath;
        private String sameSite;
        private boolean secure;
    }

}
