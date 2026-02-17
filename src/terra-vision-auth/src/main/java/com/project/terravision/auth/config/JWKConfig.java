package com.project.terravision.auth.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.project.terravision.auth.service.RSAKeyService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JWKConfig {
    @Bean
    public JWKSource<SecurityContext> jwkSource(RSAKeyService rsaKeyService) {
        return (jwkSelector, _) -> {
            JWKSet jwkSet = new JWKSet(rsaKeyService.getActiveKey()); // Loads the current key on every call
            return jwkSelector.select(jwkSet);
        };
    }
}
