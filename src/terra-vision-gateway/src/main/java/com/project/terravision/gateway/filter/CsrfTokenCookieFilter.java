package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class CsrfTokenCookieFilter implements WebFilter {
    @Override
    @NullMarked
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (!SecurityUtils.requiresCsrfTokenGeneration(path)) {
            log.debug("CsrfTokenCookieFilter — skipping CSRF token generation for path: {}", path);
            return chain.filter(exchange);
        }

        // Spring Security stores the CSRF token as a lazy Mono<CsrfToken> in the exchange attributes.
        // It is lazy — nothing happens until someone subscribes to it.
        Mono<CsrfToken> csrfTokenMono = exchange.getAttribute(CsrfToken.class.getName());
        log.debug("CsrfTokenCookieFilter — path: {}, csrfTokenMono is null: {}", exchange.getRequest().getPath().value(), csrfTokenMono == null);
        // If the token is present, subscribe to it by calling flatMap.
        // Subscription triggers CookieServerCsrfTokenRepository to write
        // the XSRF-TOKEN cookie to the response as a side effect.
        // Then continue with the rest of the filter chain.
        if (csrfTokenMono != null) {
            return csrfTokenMono.flatMap(token -> {
                log.debug("CsrfToken value: {}", token.getToken());
                return chain.filter(exchange);
            });
        }

        // No CSRF token in the exchange — just continue with the filter chain.
        log.debug("CsrfTokenMono is null — skipping cookie writing");
        return chain.filter(exchange);
    }
}
