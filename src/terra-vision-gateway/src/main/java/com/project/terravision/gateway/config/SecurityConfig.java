package com.project.terravision.gateway.config;

import com.project.terravision.gateway.config.properties.SecurityProperties;
import com.project.terravision.gateway.filter.CsrfTokenCookieFilter;
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
import org.springframework.security.web.server.csrf.ServerCsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Flux;

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

    public static final String[] CSRF_TOKEN_GENERATION_PATHS = {
            "/api/auth/login",
            "/api/auth/me"
    };

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http, CsrfTokenCookieFilter csrfTokenCookieFilter) {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrfSpec -> csrfSpec
                        /*
                        * CookieServerCsrfTokenRepository.withHttpOnlyFalse() creates a CSRF session cookie.
                        * A Session Cookie lives in the browser's active memory (RAM):
                        * as long as at least one window or tab of the browser is still open with the website's tab,
                        * the browser's session remains active, and the cookie stays in RAM.
                        * */
                        .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new ServerCsrfTokenRequestAttributeHandler())
                        .requireCsrfProtectionMatcher(SecurityUtils::requireCsrfProtection)
                )
                .addFilterAfter(csrfTokenCookieFilter, SecurityWebFiltersOrder.REACTOR_CONTEXT)
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
}
