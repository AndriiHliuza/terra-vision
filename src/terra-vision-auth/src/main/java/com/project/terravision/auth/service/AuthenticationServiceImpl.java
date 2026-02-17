package com.project.terravision.auth.service;

import com.nimbusds.jose.jwk.JWKSet;
import com.project.terravision.auth.dto.AuthenticationRequest;
import com.project.terravision.auth.dto.AuthenticationResponse;
import com.project.terravision.auth.model.enums.TokenType;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RSAKeyService rsaKeyService;
    private final JwtDecoder jwtDecoder;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication); // Putting User in Security Context

        Map<String, Object> claims = new HashMap<>();
        UUID userId = UUID.randomUUID();
        claims.put("userId", userId);
        String accessToken = jwtService.generateTokenForUserInSecurityContext(claims, TokenType.ACCESS);
        String refreshToken = jwtService.generateTokenForUserInSecurityContext(claims, TokenType.REFRESH);

        return AuthenticationResponse.builder()
                .username(authentication.getName())
                .userId(userId)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public AuthenticationResponse refreshToken(String refreshToken) {
        Jwt jwt = jwtDecoder.decode(refreshToken); // Spring automatically validate token here (Validates signature and expiration time)

        String username = jwt.getSubject();
        UUID userId = UUID.fromString(jwt.getClaims().get("userId").toString());
        TokenType tokenType = TokenType.valueOf(jwt.getClaim("type"));

        // Check if user exists by userId or username in database then generate and return new access token

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        // claims.put("roles", roles); Get user's roles from database
        claims.put("type",  tokenType);


        String newAccessToken = jwtService.generateToken(username, claims, TokenType.ACCESS);
        return AuthenticationResponse.builder()
                .username(username)
                .userId(userId)
                .refreshToken(newAccessToken)
                .accessToken(refreshToken)
                .build();
    }

    @Override
    public Map<String, Object> getJwks() {
        return new JWKSet(rsaKeyService.getActiveKey().toPublicJWK()).toJSONObject();
    }
}
