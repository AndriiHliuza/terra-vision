package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.model.enums.TokenType;
import com.project.terravision.auth.config.properties.SecurityProperties;
import com.project.terravision.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    private final JwtEncoder jwtEncoder;
    private final SecurityProperties securityProperties;

    @Override
    public String generateToken(String jti, String subject, Map<String, Object> claims, TokenType tokenType) {
        Instant issuedAt = Instant.now();

        String issuer = securityProperties.getJwt().getIssuer();
        Duration accessTokenExpiry = securityProperties.getJwt().getAccessToken().getExpiration();
        Duration refreshTokenExpiry = securityProperties.getJwt().getRefreshToken().getExpiration();

        claims.put("type",  tokenType);

        JwtClaimsSet.Builder claimsSetBuilder = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .id(jti)
                .subject(subject) // username
                .claims(claimsMap -> claimsMap.putAll(claims));

        switch (tokenType) {
            case ACCESS -> claimsSetBuilder.expiresAt(issuedAt.plus(accessTokenExpiry));
            case REFRESH -> claimsSetBuilder.expiresAt(issuedAt.plus(refreshTokenExpiry));
        };

        JwtClaimsSet claimsSet = claimsSetBuilder.build();
        return jwtEncoder.encode(JwtEncoderParameters.from(claimsSet)).getTokenValue();
    }
}
