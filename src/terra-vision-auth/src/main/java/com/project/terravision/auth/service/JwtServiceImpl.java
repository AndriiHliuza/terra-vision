package com.project.terravision.auth.service;

import com.project.terravision.auth.model.enums.TokenType;
import com.project.terravision.auth.config.properties.SecurityProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    private final JwtEncoder jwtEncoder;
    private final SecurityProperties securityProperties;
    private final SecurityContextProviderService securityContextProviderService;
    private final JwtDecoder jwtDecoder;

    @Override
    public String generateTokenForUserInSecurityContext(Map<String, Object> claims, TokenType tokenType) {
        User user = securityContextProviderService.getUser();
        if (tokenType == TokenType.REFRESH) claims.put("roles", securityContextProviderService.getAuthorities());
        claims.put("type",  tokenType);
        return generateToken(user.getUsername(), claims, tokenType);
    }

    @Override
    public String generateToken(String subject, Map<String, Object> claims, TokenType tokenType) {
        Instant now = Instant.now();
        JwtClaimsSet.Builder claimsSetBuilder = JwtClaimsSet.builder()
                .issuer(securityProperties.getJwt().getIssuer())
                .issuedAt(now)
                .subject(subject) // username
                .claims(claimsMap -> claimsMap.putAll(claims));
        switch (tokenType) {
            case ACCESS -> claimsSetBuilder.expiresAt(now.plus(15, ChronoUnit.MINUTES));
            case REFRESH -> claimsSetBuilder.expiresAt(now.plus(7, ChronoUnit.DAYS));
        };
        JwtClaimsSet claimsSet = claimsSetBuilder.build();
        return jwtEncoder.encode(JwtEncoderParameters.from(claimsSet)).getTokenValue();
    }
}
