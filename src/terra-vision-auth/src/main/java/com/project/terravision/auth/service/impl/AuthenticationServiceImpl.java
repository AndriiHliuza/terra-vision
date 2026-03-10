package com.project.terravision.auth.service.impl;

import com.nimbusds.jose.jwk.JWKSet;
import com.project.terravision.auth.dto.*;
import com.project.terravision.auth.exceptions.AccountNotActiveException;
import com.project.terravision.auth.exceptions.InvalidSessionException;
import com.project.terravision.auth.exceptions.UserNotFoundException;
import com.project.terravision.auth.mapper.AuthenticationMapper;
import com.project.terravision.auth.mapper.RoleMapper;
import com.project.terravision.auth.mapper.UserMapper;
import com.project.terravision.auth.model.Permission;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.model.enums.AccountState;
import com.project.terravision.auth.model.enums.TokenType;
import com.project.terravision.auth.repository.UserRepository;
import com.project.terravision.auth.service.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.helpers.MessageFormatter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextProviderService securityContextProviderService;

    private final JwtService jwtService;
    private final RSAKeyService rsaKeyService;
    private final JwtDecoder jwtDecoder;

    private final UserRepository userRepository;
    private final AuthoritiesService authoritiesService;

    private final SessionDetailsService sessionDetailsService;
    private final SessionService sessionService;

    private final AuthenticationMapper authenticationMapper;
    private final UserMapper userMapper;
    private final RoleMapper roleMapper;

    public AuthenticationResponse authenticate(AuthenticationRequest request, HttpServletRequest httpServletRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication); // Putting User in Security Context

        String username = securityContextProviderService.getAuthentication().getName();
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(MessageFormatter.format(
                        "User with username '{}' not found",
                        username
                ).getMessage()));

        checkAccountState(user);
        Map<String, String> tokens = generateTokensAndSaveSessionUponAuthentication(user, httpServletRequest);
        return authenticationMapper.toAuthenticationResponse(user, tokens);
    }

    @Override
    public AuthenticationResponse refreshToken(String refreshToken) {
        Jwt jwt = jwtDecoder.decode(refreshToken); // Spring automatically validate token here (Validates signature and expiration time)

        String jti = jwt.getId();
        String username = jwt.getSubject(); // username
        UUID userId = UUID.fromString(jwt.getClaim("userId"));

        if (!sessionService.isValidSession(userId.toString(), jti)) throw new InvalidSessionException();
        User user = userRepository
                .findByIdAndUsername(userId, username)
                .orElseThrow(() -> new UserNotFoundException(MessageFormatter.format(
                        "User with id '{}' and username '{}' not found",
                        userId, username
                ).getMessage()));

        Map<String, Object> claims = getClaimsForNewAccessTokenForTokenRefreshingOperation(user);
        String newAccessToken = jwtService.generateToken(jti, username, claims, TokenType.ACCESS);
        sessionService.updateLastUsed(userId.toString(), jti);

        return authenticationMapper.toAuthenticationResponse(user, Map.of(
                TokenType.ACCESS.name(), newAccessToken,
                TokenType.REFRESH.name(), refreshToken
        ));
    }

    @Override
    public Map<String, Object> getJwks() {
        return new JWKSet(rsaKeyService.getAllKeys()).toJSONObject();
    }

    @Override
    public MeResponse me(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getClaim("userId"));
        String username = jwt.getSubject();

        User user = userRepository
                .findByIdAndUsername(userId, username)
                .orElseThrow(() -> new UserNotFoundException(MessageFormatter.format(
                        "User with id '{}' and username '{}' not found",
                        userId, username
                ).getMessage()));

        return userMapper.toMeResponse(user, authoritiesService);
    }

    @Override
    public void logout(String accessToken) {
        Jwt jwt = jwtDecoder.decode(accessToken);
        String userId = jwt.getClaim("userId");
        String jti = jwt.getId();

        sessionService.revokeSession(userId, jti);
    }

    private void checkAccountState(User user) {
        if (!user.getAccountState().equals(AccountState.ACTIVE)) throw new AccountNotActiveException(
                user.getAccountState(),
                MessageFormatter.format(
                        "Account not active. Current account state: '{}'",
                        user.getAccountState()
                ).getMessage()
        );
    }

    private Map<String, String> generateTokensAndSaveSessionUponAuthentication(User user, HttpServletRequest httpServletRequest) {
        Map<String, Object> accessTokenClaims = getClaimsForAccessTokenUponAuthentication(user);
        Map<String, Object> refreshTokenClaims = getClaimsForRefreshTokenUponAuthentication(user);

        String jti = UUID.randomUUID().toString();
        String accessToken = jwtService.generateToken(jti, user.getUsername(), accessTokenClaims, TokenType.ACCESS);
        String refreshToken = jwtService.generateToken(jti, user.getUsername(), refreshTokenClaims, TokenType.REFRESH);

        SessionDetails sessionDetails = sessionDetailsService.getSessionDetails(httpServletRequest);
        sessionService.saveSession(user.getId().toString(), jti, sessionDetails);

        return Map.of(
                TokenType.ACCESS.name(), accessToken,
                TokenType.REFRESH.name(), refreshToken
        );
    }

    private Map<String, Object> getClaimsForAccessTokenUponAuthentication(User user) {
        Map<String, Object> accessTokenClaims = new HashMap<>();

        RoleClaim role = roleMapper.toRoleClaim(user.getRole());
        List<String> permissions = securityContextProviderService.getPermissions();

        accessTokenClaims.put("userId", user.getId());
        accessTokenClaims.put("role", role);
        accessTokenClaims.put("permissions", permissions);

        return accessTokenClaims;
    }

    private Map<String, Object> getClaimsForRefreshTokenUponAuthentication(User user) {
        Map<String, Object> refreshTokenClaims = new HashMap<>();
        refreshTokenClaims.put("userId", user.getId());
        return refreshTokenClaims;
    }

    private Map<String, Object> getClaimsForNewAccessTokenForTokenRefreshingOperation(User user) {
        RoleClaim role = roleMapper.toRoleClaim(user.getRole());
        List<String> permissions = authoritiesService.getUserPermissions(user)
                .stream()
                .map(Permission::getName)
                .toList();

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", role);
        claims.put("permissions", permissions);
        return claims;
    }
}
