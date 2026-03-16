package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.config.WebAttributes;
import com.project.terravision.gateway.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class SessionValidationFilter implements WebFilter, Ordered {

    private final ReactiveStringRedisTemplate reactiveStringRedisTemplate;
    private final ReactiveJwtDecoder jwtDecoder;

    @NullMarked
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();

        if (SecurityUtils.isPathPublic(path, request.getMethod())) {
            log.debug("Public path [{}] — skipping session check", path);
            return chain.filter(exchange);
        }

        String authorizationHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader == null || !authorizationHeader.startsWith(WebAttributes.BEARER_PREFIX)) {
            log.debug("Authorization header is null or does not contain Bearer JWT - returning UNAUTHORIZED");
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authorizationHeader.substring(WebAttributes.BEARER_PREFIX.length());

        return jwtDecoder.decode(token)  // returns Mono<Jwt>
                .flatMap(jwt -> {
                    String userId = jwt.getClaim("userId");
                    String jti = jwt.getId();

                    return reactiveStringRedisTemplate.hasKey("session:" + userId + ":" + jti) // ✅ reactive
                            .flatMap(isValid -> {
                                if (!isValid) {
                                    log.warn("Session not found in Redis for userId={}", userId);
                                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                                    return exchange.getResponse().setComplete();
                                }

                                exchange.getAttributes().put("verifiedUserId", userId); // 'verifiedUserId' attribute is used in AccountStatusFilter
                                log.debug("Session validated for userId={}", userId);
                                return chain.filter(exchange);
                            });
                })
                .onErrorResume(JwtException.class, ex -> {
                    log.error("Invalid JWT during session check: {}", ex.getMessage());
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                });
    }

    @Override
    public int getOrder() {
        /*
         * The lower value the higher priority. The one with higher priority runs first.
         * Ordered.HIGHEST_PRECEDENCE = Integer.MIN_VALUE
         * */
        return Ordered.HIGHEST_PRECEDENCE + 300;
    }
}
