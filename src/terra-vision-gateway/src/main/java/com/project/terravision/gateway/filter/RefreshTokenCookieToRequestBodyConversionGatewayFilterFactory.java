package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.service.CookieService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class RefreshTokenCookieToRequestBodyConversionGatewayFilterFactory extends AbstractGatewayFilterFactory<RefreshTokenCookieToRequestBodyConversionGatewayFilterFactory.Config> {

    private final CookieService cookieService;

    public RefreshTokenCookieToRequestBodyConversionGatewayFilterFactory(CookieService cookieService) {
        super(Config.class); // must match the generic type
        this.cookieService = cookieService;
    }

    @NullMarked
    @Override
    public GatewayFilter apply(RefreshTokenCookieToRequestBodyConversionGatewayFilterFactory.Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            long contentLength = request.getHeaders().getContentLength();

            // Has body — check if refreshToken is in it
            if (contentLength > 0) {
                return DataBufferUtils.join(request.getBody())
                        .flatMap(dataBuffer -> {
                            byte[] bytes = new byte[dataBuffer.readableByteCount()];
                            dataBuffer.read(bytes);
                            DataBufferUtils.release(dataBuffer);

                            String bodyString = new String(bytes, StandardCharsets.UTF_8);

                            // Re-wrap body since we consumed it
                            DataBuffer newBuffer = exchange.getResponse()
                                    .bufferFactory()
                                    .wrap(bytes);

                            ServerWebExchange rewrappedExchange = exchange.mutate()
                                    .request(new ServerHttpRequestDecorator(request) {
                                        @Override
                                        public Flux<DataBuffer> getBody() {
                                            return Flux.just(newBuffer);
                                        }
                                    })
                                    .build();

                            if (bodyString.contains("\"refreshToken\"")) {
                                log.info("Refresh token already in body, skipping cookie to body conversion");
                                return chain.filter(rewrappedExchange);
                            }

                            // Body exists but no refreshToken — check if cookie has refreshToken
                            return extractFromCookieAndMutate(exchange, chain, config);
                        });
            }

            // No body — check if cookie has refreshToken
            return extractFromCookieAndMutate(exchange, chain, config);
        };
    }

    private Mono<Void> extractFromCookieAndMutate(ServerWebExchange exchange, GatewayFilterChain chain, Config config) {
        HttpCookie refreshTokenCookie = exchange.getRequest().getCookies()
                .getFirst(config.getRefreshTokenCookieName());

        if (refreshTokenCookie == null) {
            log.warn("No refresh token in cookie");
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        byte[] bodyBytes = convertCookieValueToBytes(refreshTokenCookie);
        ServerHttpRequest mutatedRequest = buildMutatedRequest(exchange, bodyBytes, config);
        ServerWebExchange mutatedExchange = buildMutatedExchange(exchange, mutatedRequest, bodyBytes);

        log.info("Refresh token was moved from cookie to request body");
        return chain.filter(mutatedExchange);
    }

    private byte[] convertCookieValueToBytes(HttpCookie cookie) {
        String body = """
                {
                  "refreshToken": "%s"
                }
                """.formatted(cookie.getValue());
        return body.getBytes(StandardCharsets.UTF_8);
    }

    private ServerHttpRequest buildMutatedRequest(
            ServerWebExchange exchange,
            byte[] bodyBytes,
            RefreshTokenCookieToRequestBodyConversionGatewayFilterFactory.Config config
    ) {
        return exchange.getRequest().mutate()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(bodyBytes.length))
                .headers(header -> {
                    String mutatedRequestCookies = cookieService.removeCookieWithNameAndGetMutatedCookieString(
                            exchange,
                            config.getRefreshTokenCookieName()
                    );
                    if (mutatedRequestCookies.isBlank()) header.remove(HttpHeaders.COOKIE);
                    else header.set(HttpHeaders.COOKIE, mutatedRequestCookies);
                })
                .build();
    }

    private ServerWebExchange buildMutatedExchange(ServerWebExchange exchange, ServerHttpRequest mutatedRequest, byte[] bodyBytes) {
        return exchange.mutate()
                .request(new ServerHttpRequestDecorator(mutatedRequest) {
                    @NullMarked
                    @Override
                    public Flux<DataBuffer> getBody() {
                        DataBuffer buffer = exchange.getResponse()
                                .bufferFactory()
                                .wrap(bodyBytes);
                        return Flux.just(buffer);
                    }
                })
                .build();
    }

    @Data
    public static class Config {
        private String refreshTokenCookieName = "refreshToken"; // default value
    }
}
