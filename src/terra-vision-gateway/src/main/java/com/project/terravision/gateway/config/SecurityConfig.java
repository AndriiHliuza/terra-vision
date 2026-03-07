package com.project.terravision.gateway.config;

import com.project.terravision.gateway.config.properties.SecurityProperties;
import com.project.terravision.gateway.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.security.web.server.csrf.ServerCsrfTokenRequestAttributeHandler;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
public class SecurityConfig {

    public static final String[] PERMIT_ALL_PATHS = {
            "/api/auth/login",
            "/api/auth/refresh",

            "/api/auth/.well-known/jwks.json", // JSON Web Key Set
            "/api/auth/rotate-key",

            "/api/auth/registration",
            "/api/auth/registration/confirmation/email/resend",
            "/api/auth/registration/confirm",

            "/api/auth/public",

            "/api/ai/**",
    };

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrfSpec -> csrfSpec
                        .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new ServerCsrfTokenRequestAttributeHandler())
                        .requireCsrfProtectionMatcher(this::requireCsrfProtection)
                )
                .addFilterAfter(csrfTokenCookieFilter(), SecurityWebFiltersOrder.REACTOR_CONTEXT)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(PERMIT_ALL_PATHS).permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oAuth2ResourceServerSpec -> oAuth2ResourceServerSpec
                        .jwt(jwtSpec -> jwtSpec
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                )
                .build();
    }

    // ------ CORS ------

    @Bean
    public CorsConfigurationSource corsConfigurationSource(SecurityProperties securityProperties) {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(securityProperties.getAllowedOrigins());
        config.setAllowedMethods(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ------ JWT related configurations ------

    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<GrantedAuthority> authorities = new ArrayList<>();

            // Extract roles - add ROLE_ prefix
            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles != null) {
                roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .forEach(authorities::add);
            }

            // Extract permissions - no prefix needed
            List<String> permissions = jwt.getClaim("permissions");
            if (permissions != null) {
                permissions.stream()
                        .map(SimpleGrantedAuthority::new)
                        .forEach(authorities::add);
            }
            return Flux.fromIterable(authorities);
        });
        return converter;
    }

    public WebFilter csrfTokenCookieFilter() {
        return (exchange, chain) -> {
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
        };
    }


    private Mono<ServerWebExchangeMatcher.MatchResult> requireCsrfProtection(ServerWebExchange  exchange) {
        String path = exchange.getRequest().getPath().value();
        boolean isPublic = SecurityUtils.isPathPublic(path);
        return isPublic
                ? ServerWebExchangeMatcher.MatchResult.notMatch() // skip CSRF token check
                : ServerWebExchangeMatcher.MatchResult.match(); // apply CSRF token check
    }
}
