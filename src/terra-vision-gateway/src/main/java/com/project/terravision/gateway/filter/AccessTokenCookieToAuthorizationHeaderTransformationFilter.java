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

        if (SecurityUtils.isPathPublic(path, request.getMethod())) return handlePublicPath(exchange, chain, path);

        if (request.getHeaders().containsHeader(HttpHeaders.AUTHORIZATION)) return handleAuthorizationHeaderPresence(exchange, chain);

        HttpCookie accessTokenCookie = request.getCookies().getFirst(WebAttributes.ACCESS_TOKEN_COOKIE);
        if (accessTokenCookie == null) return handleAccessTokenCookieIsNull(exchange, chain);

        ServerHttpRequest mutatedRequest = buildMutatedRequest(exchange, accessTokenCookie);
        log.info("Access token was moved from 'Cookie' to 'Authorization' header");
        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        /*
         * The lower value the higher priority. The one with higher priority runs first.
         * Ordered.HIGHEST_PRECEDENCE = Integer.MIN_VALUE
         * */
        return Ordered.HIGHEST_PRECEDENCE + 200;
    }



    // ------------ private methods ------------

    private Mono<Void> handlePublicPath(ServerWebExchange exchange, WebFilterChain chain, String path) {
        log.debug("PATH [{}]  is public | Skipping 'accessToken' cookie to 'Authorization' header transformation", path);
        return chain.filter(exchange);
    }

    private Mono<Void> handleAuthorizationHeaderPresence(ServerWebExchange exchange, WebFilterChain chain) {
        log.debug("'Authorization' header already present in request | Skipping 'accessToken' cookie to 'Authorization' header transformation");
        return chain.filter(exchange);
    }

    private Mono<Void> handleAccessTokenCookieIsNull(ServerWebExchange exchange, WebFilterChain chain) {
        log.debug("No 'accessToken' cookie found | Skipping cookie to header transformation");
        return chain.filter(exchange);
    }

    private ServerHttpRequest buildMutatedRequest(ServerWebExchange exchange, HttpCookie accessTokenCookie) {
        MultiValueMap<String, HttpCookie> filteredCookies = WebUtils.filterCookies(
                exchange.getRequest().getCookies(),
                List.of(WebAttributes.ACCESS_TOKEN_COOKIE, WebAttributes.REFRESH_TOKEN_COOKIE)
        );
        log.debug("Filtering cookies | Removing 'accessToken' and 'refreshToken' cookies from 'Cookie' header");
        return exchange.getRequest().mutate()
                .header(HttpHeaders.AUTHORIZATION, WebAttributes.BEARER_PREFIX + accessTokenCookie.getValue())
                .headers(headers -> mutateCookieHeader(headers, filteredCookies))
                .build();
    }

    private void mutateCookieHeader(HttpHeaders headers, MultiValueMap<String, HttpCookie> cookies) {
        String cookiesString = WebUtils.convertCookiesToString(cookies);
        if (cookiesString.isBlank()) {
            log.debug("No cookies remained | Removing 'Cookie' header from the mutated request");
            headers.remove(HttpHeaders.COOKIE);
        } else {
            log.debug("Setting remained cookies to 'Cookie' header of the mutated request");
            headers.set(HttpHeaders.COOKIE, cookiesString);
        }
    }
}
