package com.project.terravision.auth.service;

import com.nimbusds.jose.jwk.JWKSet;
import com.project.terravision.auth.dto.AuthenticationRequest;
import com.project.terravision.auth.dto.AuthenticationResponse;
import com.project.terravision.auth.dto.SessionDetails;
import com.project.terravision.auth.exceptions.InvalidSessionException;
import com.project.terravision.auth.model.enums.TokenType;
import com.project.terravision.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RSAKeyService rsaKeyService;
    private final JwtDecoder jwtDecoder;
    private final SecurityContextProviderService securityContextProviderService;
    private final SessionService sessionService;
    private final UserRepository userRepository;

    public AuthenticationResponse authenticate(AuthenticationRequest request, HttpServletRequest httpServletRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication); // Putting User in Security Context

        String username = securityContextProviderService.getAuthentication().getName();

        // Get user from database and take its userId
        UUID userId = UUID.randomUUID(); // Get user id from database
        Map<String, Object> accessTokenClaims = getClaimsForAccessTokenUponAuthentication(userId);
        Map<String, Object> refreshTokenClaims = getClaimsForRefreshTokenUponAuthentication(userId);

        String jti = UUID.randomUUID().toString();
        String accessToken = jwtService.generateToken(jti, username, accessTokenClaims, TokenType.ACCESS);
        String refreshToken = jwtService.generateToken(jti, username, refreshTokenClaims, TokenType.REFRESH);

        // Save session to Redis
        SessionDetails sessionDetails = SessionDetails.builder()
                .ip("someIp")
                .browser("someBrowser")
                .os("someOs")
                .device("someDevice")
                .location("someLocation")
                .createdAt(System.currentTimeMillis())
                .lastUsedAt(System.currentTimeMillis())
                .build();

        sessionService.saveSession(userId.toString(), jti, sessionDetails);

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

        String jti = jwt.getId();
        String username = jwt.getSubject(); // username
        UUID userId = UUID.fromString(jwt.getClaims().get("userId").toString());

        if (!sessionService.isValidSession(userId.toString(), jti)) {
            throw new InvalidSessionException("Session not found — please login again");
        }
        // Should check if user exists by userId or username in database then generate and return new access token

        Map<String, Object> claims = getClaimsForNewAccessTokenWhileRefreshing(userId);

        String newAccessToken = jwtService.generateToken(jti, username, claims, TokenType.ACCESS);

        sessionService.updateLastUsed(userId.toString(), jti);

        return AuthenticationResponse.builder()
                .username(username)
                .userId(userId)
                .refreshToken(refreshToken)
                .accessToken(newAccessToken)
                .build();
    }

    @Override
    public Map<String, Object> getJwks() {
        return new JWKSet(rsaKeyService.getAllKeys()).toJSONObject();
    }

    @Override
    public Map<String, Object> me(Jwt jwt) {
        String userId = jwt.getClaim("userId").toString();
        String username = jwt.getSubject();
        String email = "email";
        List<String> roles = jwt.getClaimAsStringList("roles");

        return Map.of(
                "userId", userId,
                "username", username,
                "email", email,
                "roles", roles
        );
    }

    @Override
    public void logout(String accessToken) {
        Jwt jwt = jwtDecoder.decode(accessToken);
        String userId = jwt.getClaims().get("userId").toString();
        String jti = jwt.getId();

        sessionService.revokeSession(userId, jti);
    }

    private Map<String, Object> getClaimsForAccessTokenUponAuthentication(UUID userId) {
        Map<String, Object> accessTokenClaims = new HashMap<>();

        List<String> roles = securityContextProviderService.getRolesNoPrefix();
        List<String> permissions = securityContextProviderService.getPermissions();

        accessTokenClaims.put("userId", userId);
        accessTokenClaims.put("roles",  roles);
        accessTokenClaims.put("permissions",  permissions);
        return accessTokenClaims;
    }

    private Map<String, Object> getClaimsForRefreshTokenUponAuthentication(UUID userId) {
        Map<String, Object> refreshTokenClaims = new HashMap<>();
        refreshTokenClaims.put("userId", userId);
        return refreshTokenClaims;
    }

    private Map<String, Object> getClaimsForNewAccessTokenWhileRefreshing(UUID userId) {
        // Get user roles and permissions from database
        List<String> roles = List.of("USER");
        List<String> permissions = List.of("READ_USER", "READ_BOOK");

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId); // Value from refresh token
        claims.put("roles", roles); // Value from database
        claims.put("permissions", permissions); // Value from database
        return claims;
    }
}
