package com.project.terravision.gateway.filter;

import com.nimbusds.jwt.JWT;
import com.nimbusds.jwt.JWTParser;
import com.project.terravision.gateway.config.WebAttributes;
import com.project.terravision.gateway.dto.AuthenticationResponse;
import com.project.terravision.gateway.dto.SanitizedAuthenticationResponse;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.cloud.gateway.filter.factory.rewrite.ModifyResponseBodyGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseCookie;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tools.jackson.databind.ObjectMapper;

import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class AuthenticationResponseToTokenCookiesGatewayFilterFactory extends AbstractGatewayFilterFactory<AuthenticationResponseToTokenCookiesGatewayFilterFactory.Config> {

    private final ObjectMapper objectMapper;
    private final ModifyResponseBodyGatewayFilterFactory modifyResponseBodyFilter;

    public AuthenticationResponseToTokenCookiesGatewayFilterFactory(
            ModifyResponseBodyGatewayFilterFactory modifyResponseBodyFilter,
            ObjectMapper objectMapper
    ) {
        super(Config.class);
        this.modifyResponseBodyFilter = modifyResponseBodyFilter;
        this.objectMapper = objectMapper;
    }

    @NullMarked
    @Override
    public GatewayFilter apply(Config config) {
        return modifyResponseBodyFilter.apply(rewriteConfig -> rewriteConfig
                .setInClass(Object.class)   // what we receive from auth service
                .setOutClass(Object.class)   // what we send to React
                .setRewriteFunction(Object.class, Object.class,
                        (exchange, originalBody) -> {

                            // Checking if response is successful first
                            HttpStatusCode statusCode = exchange.getResponse().getStatusCode();
                            if (statusCode == null || !statusCode.is2xxSuccessful()) {
                                log.warn("Auth service returned non-2xx status: {}", statusCode);
                                return Mono.justOrEmpty(originalBody);
                            }

                            AuthenticationResponse authenticationResponse = objectMapper.convertValue(originalBody, AuthenticationResponse.class);
                            //noinspection ConstantValue
                            if (authenticationResponse == null) {
                                log.warn("Authentication response is null | Auth service returned non-authenticated response body");
                                return Mono.empty();
                            }

                            // Creating cookies from access and refresh tokens and adding generated cookies to the response
                            Map<String, ResponseCookie> generatedCookies = generateCookiesFromAuthenticationResponse(authenticationResponse, config, exchange);

                            // Checking if generated cookies are present
                            if (generatedCookies.isEmpty()) {
                                log.warn("No cookies generated");
                                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                                return Mono.empty();
                            }

                            log.debug("Setting generated cookies for http response");
                            setGeneratedCookiesForHttpResponse(exchange.getResponse(), generatedCookies);

                            log.debug("Converting body to sanitized body");
                            // Returning sanitized body — only userId, username and email
                            SanitizedAuthenticationResponse sanitized = SanitizedAuthenticationResponse.builder()
                                    .userId(authenticationResponse.getUserId())
                                    .username(authenticationResponse.getUsername())
                                    .email(authenticationResponse.getEmail())
                                    .build();

                            log.info("Moved access and refresh tokens from authentication response body to cookies");
                            return Mono.just(sanitized);
                        })
        );
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



    // ------------ private methods ------------

    private Map<String, ResponseCookie> generateCookiesFromAuthenticationResponse(
            AuthenticationResponse authenticationResponse,
            Config config,
            ServerWebExchange exchange
    ) {
        Map<String, ResponseCookie> cookies = new HashMap<>();

        Duration accessDuration = getTokenDuration(authenticationResponse.getAccessToken());
        Duration refreshDuration = getTokenDuration(authenticationResponse.getRefreshToken());

        if (accessDuration == null || refreshDuration == null) {
            log.warn("Failed to parse token durations — skipping cookie generation");
            return Collections.emptyMap();
        }

        boolean isSecure = config.isSecure() || exchange.getRequest().getURI().getScheme().equalsIgnoreCase("https");

        cookies.put(WebAttributes.ACCESS_TOKEN_COOKIE, ResponseCookie
                .from(WebAttributes.ACCESS_TOKEN_COOKIE, authenticationResponse.getAccessToken())
                .httpOnly(true)
                .secure(isSecure)
                .sameSite(config.getSameSite())
                .path(config.getRootPath())
                .maxAge(accessDuration) // directly from JWT
                .build());

        cookies.put(WebAttributes.REFRESH_TOKEN_COOKIE, ResponseCookie
                .from(WebAttributes.REFRESH_TOKEN_COOKIE, authenticationResponse.getRefreshToken())
                .httpOnly(true)
                .secure(isSecure)
                .sameSite(config.getSameSite())
                .path(config.getRefreshPath())
                .maxAge(refreshDuration) // directly from JWT
                .build());

        return cookies;
    }

    private Duration getTokenDuration(String token) {
        try {
            JWT parsedJwt = JWTParser.parse(token);
            Date expiresAt = parsedJwt.getJWTClaimsSet().getExpirationTime();

            if (expiresAt != null) {
                return Duration.between(Instant.now(), expiresAt.toInstant()).minusSeconds(10);
            }
        } catch (ParseException e) {
            log.warn("Failed to parse JWT for expiration: {}", e.getMessage());
        }
        return null;
    }

    private void setGeneratedCookiesForHttpResponse(ServerHttpResponse response, Map<String, ResponseCookie> cookies) {
        response.addCookie(cookies.get(WebAttributes.ACCESS_TOKEN_COOKIE));
        response.addCookie(cookies.get(WebAttributes.REFRESH_TOKEN_COOKIE));
    }
}
