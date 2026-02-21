package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.config.SecurityConfig;
import com.project.terravision.gateway.service.CookieService;
import com.project.terravision.gateway.service.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccessTokenCookieToAuthorizationHeaderConversionFilter implements WebFilter, Ordered {

    @Value("${application.gateway.filters.access-token-to-authorization-header-filter.accessTokenCookieName}")
    private String accessTokenCookieName;
    private final CookieService cookieService;

    @NullMarked
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();
        if (SecurityUtils.isPathPublic(path)) return chain.filter(exchange);

        if (request.getHeaders().containsHeader(HttpHeaders.AUTHORIZATION)) return chain.filter(exchange);

        HttpCookie accessTokenCookie = request.getCookies().getFirst(accessTokenCookieName);
        if (accessTokenCookie == null) return chain.filter(exchange);
        String accessToken = accessTokenCookie.getValue();

        ServerHttpRequest mutatedRequest = buildMutatedRequest(exchange, accessToken);

        log.info("Access token was moved from cookie to Authorization header");
        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 100; // Lower value means higher priority. The one with higher priority runs first
    }

    private ServerHttpRequest buildMutatedRequest(ServerWebExchange exchange, String accessToken) {
        return exchange.getRequest().mutate()
                .header(HttpHeaders.AUTHORIZATION, SecurityConfig.BEARER_PREFIX + accessToken)
                .headers(header -> {
                    String mutatedRequestCookies = cookieService.removeCookieWithNameAndGetMutatedCookieString(
                            exchange,
                            accessTokenCookieName
                    );
                    if (mutatedRequestCookies.isBlank()) header.remove(HttpHeaders.COOKIE);
                    else header.set(HttpHeaders.COOKIE, mutatedRequestCookies);
                })
                .build();
    }
}
