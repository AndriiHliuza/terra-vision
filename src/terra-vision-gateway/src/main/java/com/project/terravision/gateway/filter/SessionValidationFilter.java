package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.config.SecurityConfig;
import com.project.terravision.gateway.config.WebAttributes;
import com.project.terravision.gateway.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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

    private final RedisTemplate<String, Object> redisTemplate;
    private final ReactiveJwtDecoder jwtDecoder;

    @NullMarked
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();

        if (SecurityUtils.isPathPublic(path)) return chain.filter(exchange);

        String authorizationHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader == null || !authorizationHeader.startsWith(WebAttributes.BEARER_PREFIX)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authorizationHeader.substring(WebAttributes.BEARER_PREFIX.length());

        return jwtDecoder.decode(token)  // returns Mono<Jwt>
                .flatMap(jwt -> {
                    String userId = jwt.getClaim("userId");
                    String jti = jwt.getId();

                    Boolean isValid = redisTemplate.hasKey("session:" + userId + ":" + jti);
                    if (!Boolean.TRUE.equals(isValid)) {
                        log.warn("Session not found in Redis for userId: {}", userId);
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }

                    log.info("Session validated for userId: {}", userId);
                    return chain.filter(exchange);
                })
                .onErrorResume(JwtException.class, e -> {
                    log.error("Invalid JWT: {}", e.getMessage());
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                });
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 200;
    }
}
