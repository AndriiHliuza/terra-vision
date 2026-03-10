package com.project.terravision.gateway.config;

import com.project.terravision.gateway.config.properties.SecurityProperties;
import com.project.terravision.gateway.model.SystemRoleLevel;
import com.project.terravision.gateway.filter.CsrfTokenCookieFilter;
import com.project.terravision.gateway.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.csrf.ServerCsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.project.terravision.gateway.manager.AuthorizationManager.hasAtLeastPowerLevel;

@Slf4j
@Configuration
public class SecurityConfig {

    @Bean // Default order is @Order(100)
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http, CsrfTokenCookieFilter csrfTokenCookieFilter) {
        return http
                /*
                * Disabling cors. Instead, using corsWebFilter to manage cors
                * */
                .cors(ServerHttpSecurity.CorsSpec::disable)
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

                        // <<<<<<<<<<<< Public paths >>>>>>>>>>>>
                        .pathMatchers(SecurityPaths.PERMIT_ALL_PATHS).permitAll()
                        .pathMatchers(HttpMethod.GET, SecurityPaths.PERMIT_ALL_GET_PATHS).permitAll()
                        .pathMatchers(HttpMethod.POST, SecurityPaths.PERMIT_ALL_POST_PATHS).permitAll()

                        // <<<<<<<<<<<< Any authenticated user (power level >= 10) >>>>>>>>>>>>
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/auth/me",
                                "/api/auth/user/protected"
                        ).access(hasAtLeastPowerLevel(SystemRoleLevel.USER))
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/auth/logout"
                        ).access(hasAtLeastPowerLevel(SystemRoleLevel.USER))

                        // <<<<<<<<<<<< Admin and above (power level >= 10000) >>>>>>>>>>>>
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/auth/admin/protected"
                        ).access(hasAtLeastPowerLevel(SystemRoleLevel.ADMIN))

                        // <<<<<<<<<<<< Super Admin and above (power level >= 100000) >>>>>>>>>>>>
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/auth/super-admin/protected"
                        ).access(hasAtLeastPowerLevel(SystemRoleLevel.SUPER_ADMIN))
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
    /*
     * The lower value the higher priority. The one with higher priority runs first.
     * Ordered.HIGHEST_PRECEDENCE = Integer.MIN_VALUE
     * */
    @Order(Ordered.HIGHEST_PRECEDENCE) // Runs before security filter chain
    public CorsWebFilter corsWebFilter(SecurityProperties securityProperties) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(securityProperties.getAllowedOrigins());
        config.setAllowedMethods(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        log.info("In cors filter");

        return new CorsWebFilter(source);
    }

    // ------ JWT related configurations ------

    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<GrantedAuthority> authorities = new ArrayList<>();

            // Extract role - add ROLE_ prefix
            Map<String, Object> roleClaim = jwt.getClaim("role");
            if (roleClaim != null) {
                String roleName = (String) roleClaim.get("name");
                if (roleName != null && !roleName.isBlank()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
                }
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
