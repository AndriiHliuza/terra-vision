package com.project.terravision.auth.config;

import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import java.util.ArrayList;
import java.util.List;

//@Configuration
public class JwtConfig {

//    @Bean
//    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
//        return new NimbusJwtEncoder(jwkSource);
//    }
//
//    /*
//     * Decodes jwt from String to Jwt and checks signature and verifies expiration
//     * */
//    @Bean
//    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
//        return NimbusJwtDecoder.withJwkSource(jwkSource).build();
//    }
//
//    @Bean
//    public JwtAuthenticationConverter jwtAuthenticationConverter() {
//        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
//        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
//            List<GrantedAuthority> authorities = new ArrayList<>();
//
//            // Extract roles - add ROLE_ prefix
//            List<String> roles = jwt.getClaim("roles");
//            if (roles != null) {
//                roles.stream()
//                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
//                        .forEach(authorities::add);
//            }
//
//            // Extract permissions - no prefix needed
//            List<String> permissions = jwt.getClaim("permissions");
//            if (permissions != null) {
//                permissions.stream()
//                        .map(SimpleGrantedAuthority::new)
//                        .forEach(authorities::add);
//            }
//
//            return authorities;
//        });
//
//        return converter;
//    }
}
