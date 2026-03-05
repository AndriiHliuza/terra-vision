package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.config.WebAttributes;
import com.project.terravision.gateway.utils.SecurityUtils;
import com.project.terravision.gateway.utils.WebUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.core.Ordered;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.List;

/*
* WebFilter always runs before GlobalFilter
* */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccessTokenCookieToAuthorizationHeaderTransformationFilter implements WebFilter, Ordered {

    @NullMarked
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();

        if (SecurityUtils.isPathPublic(path)) {
            log.debug("Public path [{}] — skipping 'accessToken' cookie to Authorization header transformation", path);
            return chain.filter(exchange);
        }
        if (request.getHeaders().containsHeader(HttpHeaders.AUTHORIZATION)) {
            log.debug("Authorization header already present — skipping 'accessToken' cookie to Authorization header transformation");
            return chain.filter(exchange);
        }

        HttpCookie accessTokenCookie = request.getCookies().getFirst(WebAttributes.ACCESS_TOKEN_COOKIE);
        if (accessTokenCookie == null) {
            log.debug("No 'accessToken' cookie found — skipping cookie to header transformation");
            return chain.filter(exchange);
        }

        String accessToken = accessTokenCookie.getValue();
        ServerHttpRequest mutatedRequest = buildMutatedRequest(exchange, accessToken);

        log.info("Access token was moved from 'Cookie' to 'Authorization' header");
        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 100; // Lower value means higher priority. The one with higher priority runs first
    }

    private ServerHttpRequest buildMutatedRequest(ServerWebExchange exchange, String accessToken) {
        MultiValueMap<String, HttpCookie> filteredCookies = WebUtils.filterCookies(
                exchange.getRequest().getCookies(),
                List.of(WebAttributes.ACCESS_TOKEN_COOKIE, WebAttributes.REFRESH_TOKEN_COOKIE)
        );
        log.debug("'accessToken' and 'refreshToken' cookies were removed from 'Cookie' header");
        return exchange.getRequest().mutate()
                .header(HttpHeaders.AUTHORIZATION, WebAttributes.BEARER_PREFIX + accessToken)
                .headers(headers -> mutateCookieHeader(headers, filteredCookies))
                .build();
    }

    private void mutateCookieHeader(HttpHeaders headers, MultiValueMap<String, HttpCookie> cookies) {
        String cookiesString = WebUtils.convertCookiesToString(cookies);
        if (cookiesString.isBlank()) {
            headers.remove(HttpHeaders.COOKIE);
            log.debug("No cookies remained. Removing 'Cookie' header from the mutated request");
        } else {
            headers.set(HttpHeaders.COOKIE, cookiesString);
            log.debug("Setting remained cookies to 'Cookie' header of the mutated request");
        }
    }
}
