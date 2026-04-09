package com.project.terravision.auth.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.project.terravision.auth.config.attributes.SecurityPaths;
import com.project.terravision.auth.service.impl.RSAKeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtDecoder jwtDecoder,
            JwtAuthenticationConverter jwtAuthenticationConverter
    ) {
        return http
                .csrf(AbstractHttpConfigurer::disable) // Disabling cors. Cors are managed in terra-vision-gateway
                .cors(AbstractHttpConfigurer::disable) // Uses CorsConfigurationSource bean
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requestMatcherRegistry -> requestMatcherRegistry

                        // <<<<<<<<<<<< Public paths >>>>>>>>>>>>
                        .requestMatchers(SecurityPaths.PublicPaths.ALL_HTTP_METHODS_PATHS).permitAll()
                        .requestMatchers(HttpMethod.GET, SecurityPaths.PublicPaths.GET_PATHS).permitAll()
                        .requestMatchers(HttpMethod.POST, SecurityPaths.PublicPaths.POST_PATHS).permitAll()

                        // <<<<<<<<<<<< All other paths that are not listed above (require authentication) >>>>>>>>>>>>
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oAuth2ResourceServerConfigurer -> oAuth2ResourceServerConfigurer
                        .jwt(jwtConfigurer -> jwtConfigurer
                                .decoder(jwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter)
                        )
                )
                .build();

    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    // ------ JWT and JsonWebKey Configuration beans ------

    @Bean
    public JWKSource<SecurityContext> jwkSource(RSAKeyService rsaKeyService) {
        return (jwkSelector, _) -> {
            JWKSet jwkSet = new JWKSet(rsaKeyService.getAllKeys()); // Loads the current key on every call
            return jwkSelector.select(jwkSet);
        };
    }

    @Bean
    public JwtEncoder jwtEncoder(RSAKeyService rsaKeyService) {
        JWKSource<SecurityContext> jwkSource = (jwkSelector, context) ->
                jwkSelector.select(new JWKSet(rsaKeyService.getActiveKey()));
        return new NimbusJwtEncoder(jwkSource);
    }

    // Decodes jwt from String to Jwt and checks signature and verifies expiration
    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return NimbusJwtDecoder.withJwkSource(jwkSource).build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
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

            return authorities;
        });

        return converter;
    }
}
