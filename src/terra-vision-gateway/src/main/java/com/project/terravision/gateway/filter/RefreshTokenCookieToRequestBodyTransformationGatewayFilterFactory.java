package com.project.terravision.gateway.filter;

import com.project.terravision.gateway.config.WebAttributes;
import com.project.terravision.gateway.utils.WebUtils;
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
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
public class RefreshTokenCookieToRequestBodyTransformationGatewayFilterFactory extends AbstractGatewayFilterFactory<Object> {

    public RefreshTokenCookieToRequestBodyTransformationGatewayFilterFactory() {
        super(Object.class); // must match the generic type
    }

    @NullMarked
    @Override
    public GatewayFilter apply(Object config) {
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
                                log.debug("Refresh token already in body, skipping cookie to body conversion");
                                return chain.filter(rewrappedExchange);
                            }

                            // Body exists but no refreshToken — check if cookie has refreshToken
                            return extractRefreshTokenFromCookieAndMutate(exchange, chain);
                        });
            }

            // Request does not have body — check if cookie has refreshToken
            return extractRefreshTokenFromCookieAndMutate(exchange, chain);
        };
    }

    private Mono<Void> extractRefreshTokenFromCookieAndMutate(ServerWebExchange exchange, GatewayFilterChain chain) {
        HttpCookie refreshTokenCookie = exchange.getRequest().getCookies()
                .getFirst(WebAttributes.REFRESH_TOKEN_COOKIE);

        if (refreshTokenCookie == null) {
            log.warn("No refresh token in cookie");
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        byte[] bodyBytes = convertCookieValueToBytes(refreshTokenCookie);
        ServerHttpRequest mutatedRequest = buildMutatedRequest(exchange, bodyBytes);
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
            byte[] bodyBytes
    ) {
        MultiValueMap<String, HttpCookie> filteredCookies = WebUtils.filterCookies(
                exchange.getRequest().getCookies(),
                List.of(WebAttributes.ACCESS_TOKEN_COOKIE, WebAttributes.REFRESH_TOKEN_COOKIE)
        );
        log.debug("Filtering cookies. 'accessToken' and 'refreshToken' cookies were removed from 'Cookie' header");

        return exchange.getRequest().mutate()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(bodyBytes.length))
                .headers(headers -> mutateCookieHeader(headers, filteredCookies))
                .build();
    }

    private void mutateCookieHeader(HttpHeaders headers, MultiValueMap<String, HttpCookie> cookies) {
        String cookiesString = WebUtils.convertCookiesToString(cookies);
        if (cookiesString.isBlank()) {
            headers.remove(HttpHeaders.COOKIE);
            log.debug("No cookies remained'. Removing 'Cookie' header from the mutated request");
        } else {
            headers.set(HttpHeaders.COOKIE, cookiesString);
            log.debug("Setting remained cookies to 'Cookie' header of the mutated request");
        }
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

}
