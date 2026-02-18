package com.project.terravision.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final String[] PERMIT_ALL_PATHS = {
            "/api/auth/**",
            "/api/ai/**"
    };

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .cors(Customizer.withDefaults())
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
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

    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<GrantedAuthority> authorities = new ArrayList<>();

            // ----- Roles -----
            List<String> roles = jwt.getClaimAsStringList("roles");
            List<String> permissions = jwt.getClaimAsStringList("permissions");
            if (roles != null) roles.stream()
                    .filter(this::isRole)
                    .map(SimpleGrantedAuthority::new)
                    .forEach(authorities::add);

            if (permissions != null) permissions.stream()
                    .filter(this::isPermission)
                    .map(SimpleGrantedAuthority::new)
                    .forEach(authorities::add);
            return Flux.fromIterable(authorities);
        });
        return converter;
    }

    private boolean isRole(String role) {
        return role.startsWith("ROLE_");
    }

    private boolean isPermission(String permission) {
        return permission.startsWith("READ_") ||  permission.startsWith("WRITE_");
    }

}
