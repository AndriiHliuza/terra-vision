package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.enums.AccountStatus;
import com.project.terravision.gateway.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.function.Consumer;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccountStatusFilter implements WebFilter, Ordered {

    private final ReactiveStringRedisTemplate reactiveStringRedisTemplate;
    private final WebClient authWebClient;

    private static final String ACCOUNT_STATUS_PREFIX = "account:status:";

    @NullMarked
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().toString();

        if (SecurityUtils.isPathPublic(path, request.getMethod())) return handlePublicPath(exchange, chain, path);

        // 'userId' is being set in SessionValidationFilter after session is validated
        String userId = exchange.getAttribute("userId");
        if (userId == null) return handleUserIdIsNull(exchange);

        return reactiveStringRedisTemplate.opsForValue()
                .get(ACCOUNT_STATUS_PREFIX + userId)
                .map(AccountStatus::valueOf)
                .doOnNext(accountStatus -> log.debug(
                        "Retrieved account status from Redis for userId={}, Account status={}",
                        userId, accountStatus)
                )
                .switchIfEmpty(fetchFromAuthServiceAndCache(userId))
                .flatMap(accountStatus -> {
                    if (accountStatus != AccountStatus.ACTIVE) {
                        log.warn("Account status not ACTIVE for userId={}, Account status={} - Rejecting request.", userId, accountStatus);
                        return rejectRequest(exchange, accountStatus);
                    }
                    return chain.filter(exchange);
                });
    }

    @Override
    public int getOrder() {
        /*
         * The lower value the higher priority. The one with higher priority runs first.
         * Ordered.HIGHEST_PRECEDENCE = Integer.MIN_VALUE
         * */
        return Ordered.HIGHEST_PRECEDENCE + 400;
    }



    // ------------ private methods ------------

    private Mono<Void> handlePublicPath(ServerWebExchange exchange, WebFilterChain chain, String path) {
        log.debug("Path [{}] is public | Skipping account status check", path);
        return chain.filter(exchange);
    }

    private Mono<Void> handleUserIdIsNull(ServerWebExchange exchange) {
        log.warn("'userId' not found in exchange attributes | Can not check account status");
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private Mono<AccountStatus> fetchFromAuthServiceAndCache(String userId) {
        return Mono.defer(() -> {
            log.debug("Account status is not in Redis for userId={} | Fetching from auth microservice", userId);
            return authWebClient.get()
                    .uri("/api/auth/internal/account-status/{userId}", userId)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(AccountStatus::valueOf)
                    .flatMap(status -> reactiveStringRedisTemplate.opsForValue()
                            .set(ACCOUNT_STATUS_PREFIX + userId, status.name())
                            .thenReturn(status)
                    );
        });
    }

    private Mono<Void> rejectRequest(ServerWebExchange exchange, AccountStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        response.setStatusCode(
                status == AccountStatus.PENDING_VERIFICATION
                        ? HttpStatus.UNAUTHORIZED
                        : HttpStatus.FORBIDDEN
        );

        String body = switch (status) {
            case PENDING_VERIFICATION -> "{\"error\": \"Account requires verification\"}";
            case DEACTIVATED -> "{\"error\": \"Account is deactivated\"}";
            case BLOCKED -> "{\"error\": \"Account is blocked\"}";
            default -> "{\"error\": \"Account is not active\"}";
        };

        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes());
        return response.writeWith(Mono.just(buffer));
    }
}
