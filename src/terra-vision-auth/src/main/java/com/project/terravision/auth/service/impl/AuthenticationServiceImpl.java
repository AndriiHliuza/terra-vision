package com.project.terravision.auth.service.impl;

import com.nimbusds.jose.jwk.JWKSet;
import com.project.terravision.auth.dto.*;
import com.project.terravision.auth.dto.request.AuthenticationRequest;
import com.project.terravision.auth.dto.request.ResetPasswordRequest;
import com.project.terravision.auth.dto.response.AuthenticationResponse;
import com.project.terravision.auth.dto.response.MeResponse;
import com.project.terravision.auth.enums.AccountStatus;
import com.project.terravision.auth.enums.EmailVerificationType;
import com.project.terravision.auth.exceptions.account.AccountBlockedException;
import com.project.terravision.auth.exceptions.account.AccountDeactivatedException;
import com.project.terravision.auth.exceptions.account.AccountPendingVerificationException;
import com.project.terravision.auth.exceptions.session.InvalidSessionException;
import com.project.terravision.auth.exceptions.user.UserNotFoundException;
import com.project.terravision.auth.mapper.AuthenticationMapper;
import com.project.terravision.auth.mapper.RoleMapper;
import com.project.terravision.auth.mapper.UserMapper;
import com.project.terravision.auth.model.Permission;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.enums.JwtType;
import com.project.terravision.auth.repository.UserRepository;
import com.project.terravision.auth.service.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextProviderService securityContextProviderService;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;
    private final RSAKeyService rsaKeyService;
    private final JwtDecoder jwtDecoder;

    private final UserRepository userRepository;

    private final AuthoritiesService authoritiesService;

    private final SessionDetailsService sessionDetailsService;
    private final SessionService sessionService;

    private final VerificationTokenService verificationTokenService;

    private final AuthenticationMapper authenticationMapper;
    private final UserMapper userMapper;
    private final RoleMapper roleMapper;

    // ------------ Authentication methods ------------

    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest, HttpServletRequest httpServletRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authenticationRequest.email(), authenticationRequest.password())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication); // Putting User in Security Context

        String username = securityContextProviderService.getAuthentication().getName();
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User with username '%s' not found".formatted(username)));

        validateAccountStatus(user);
        Map<String, String> tokens = generateTokensAndSaveSession(user, httpServletRequest);
        return authenticationMapper.toAuthenticationResponse(user, tokens);
    }

    @Override
    public MeResponse me(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getClaim("userId"));
        String username = jwt.getSubject();

        User user = userRepository
                .findByIdAndUsername(userId, username)
                .orElseThrow(() -> new UserNotFoundException("User with id '%s' and username '%s' not found".formatted(userId, username)));

        return userMapper.toMeResponse(user, authoritiesService);
    }

    @Override
    public void logout(String accessToken) {
        Jwt jwt = jwtDecoder.decode(accessToken);
        String userId = jwt.getClaim("userId");
        String jti = jwt.getId();

        sessionService.revokeSession(userId, jti);
        log.debug("User with userId: {}  logged out", userId);
    }



    // ------------ Method to get new ACCESS jwt ------------

    public void resetPassword(ResetPasswordRequest request) {
        UUID userId = verificationTokenService.validateToken(request.token(), EmailVerificationType.RESET_PASSWORD_VERIFICATION);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with id '%s' not found".formatted(userId)));
        validateAccountStatus(user);
        user.setPassword(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        log.debug("Password was reset for user with email: {}", user.getEmail());
    }



    // ------------ Method to get new ACCESS jwt ------------

    @Override
    public AuthenticationResponse refreshToken(String refreshToken) {
        Jwt jwt = jwtDecoder.decode(refreshToken); // Spring automatically validate token here (Validates signature and expiration time)

        String jti = jwt.getId();
        String username = jwt.getSubject(); // username
        UUID userId = UUID.fromString(jwt.getClaim("userId"));

        if (!sessionService.isValidSession(userId.toString(), jti)) throw new InvalidSessionException();
        User user = userRepository
                .findByIdAndUsername(userId, username)
                .orElseThrow(() -> new UserNotFoundException("User with id '%s' and username '%s' not found".formatted(userId, username)));

        Map<String, Object> claims = getClaimsForNewAccessToken(user);
        String newAccessToken = jwtService.generateToken(jti, username, claims, JwtType.ACCESS);
        sessionService.updateLastUsed(userId.toString(), jti);

        return authenticationMapper.toAuthenticationResponse(user, Map.of(
                JwtType.ACCESS.name(), newAccessToken,
                JwtType.REFRESH.name(), refreshToken
        ));
    }



    // ------------ Method to get JSON Web Keys required to check if JWTs are valid ------------

    @Override
    public Map<String, Object> getJwks() {
        return new JWKSet(rsaKeyService.getAllKeys()).toJSONObject();
    }



    // ------------ Private methods ------------

    /**
     * Validates whether the user's account is allowed to proceed with authentication.
     *
     * <p>This method checks the current {@code AccountStatus} of the user and determines
     * whether login is permitted. If the account is not in a valid state for authentication,
     * a corresponding exception is thrown to stop the login process.</p>
     *
     * @param user the user attempting to authenticate
     *
     * @throws AccountPendingVerificationException if account has not been verified
     * @throws AccountDeactivatedException if account has been deactivated
     * @throws AccountBlockedException if account has been blocked
     */
    private void validateAccountStatus(User user) {
        switch (user.getAccountStatus()) {
            case ACTIVE -> log.debug(
                    "Email: '{}', Account status: '{}' - Proceeding the log in flow",
                    user.getUsername(),
                    user.getAccountStatus()
            );

            case PENDING_VERIFICATION -> throw new AccountPendingVerificationException(
                    "Email: '%s', Account status: '%s' - Account not verified".formatted(
                            user.getEmail(),
                            user.getAccountStatus()
                    )
            );

            case DEACTIVATED -> throw new AccountDeactivatedException(
                    "Email: '%s', Account status: '%s' - Account deactivated".formatted(
                            user.getEmail(),
                            user.getAccountStatus()
                    )
            );

            case BLOCKED -> throw new AccountBlockedException(
                    "Email: '%s', Account status: '%s', Account is blocked".formatted(
                            user.getEmail(),
                            user.getAccountStatus()
                    ),
                    user.getBlockedAt(),
                    user.getBlockReason()
            );
        }
    }

    /**
     * Generates access and refresh JWT tokens for authenticated user and persists a new session to Redis
     *
     * <p>This method performs the following steps:</p>
     * <ul>
     *     <li>Builds the claims required for access and refresh tokens.</li>
     *     <li>Generates a unique JWT ID (JTI) used to link both tokens to a single session.</li>
     *     <li>Creates the access and refresh tokens using the {@code jwtService}.</li>
     *     <li>Extracts session details (e.g., IP address, user agent) from the incoming HTTP request.</li>
     *     <li>Stores the session in the session store via {@code sessionService}.</li>
     * </ul>
     *
     * <p>The generated tokens share the same JTI, allowing the system to associate them
     * with a single persisted session.</p>
     *
     * @param user the authenticated user for whom the tokens are generated
     * @param httpServletRequest the HTTP request used to extract session-related metadata
     *                           such as IP address and user agent
     *
     * @return a map containing the generated JWT tokens where:
     *         <ul>
     *             <li>{@code ACCESS} is the access token</li>
     *             <li>{@code REFRESH} is the refresh token</li>
     *         </ul>
     */
    private Map<String, String> generateTokensAndSaveSession(User user, HttpServletRequest httpServletRequest) {
        Map<String, Object> accessTokenClaims = getClaimsForAccessToken(user);
        Map<String, Object> refreshTokenClaims = getClaimsForRefreshToken(user);

        String jti = UUID.randomUUID().toString();
        String accessToken = jwtService.generateToken(jti, user.getUsername(), accessTokenClaims, JwtType.ACCESS);
        String refreshToken = jwtService.generateToken(jti, user.getUsername(), refreshTokenClaims, JwtType.REFRESH);

        SessionDetails sessionDetails = sessionDetailsService.getSessionDetails(httpServletRequest);
        sessionService.saveSession(user.getId().toString(), jti, sessionDetails);

        return Map.of(
                JwtType.ACCESS.name(), accessToken,
                JwtType.REFRESH.name(), refreshToken
        );
    }

    /**
     * Builds the set of claims to be included in the access JWT generated after
     * a successful user authentication.
     *
     * @param user the authenticated user for whom the access token claims are generated
     * @return a map containing the claims that will be embedded in the access JWT
     */
    private Map<String, Object> getClaimsForAccessToken(User user) {
        Map<String, Object> accessTokenClaims = new HashMap<>();

        RoleClaim role = roleMapper.toRoleClaim(user.getRole());
        List<String> permissions = securityContextProviderService.getPermissions();

        accessTokenClaims.put("userId", user.getId());
        accessTokenClaims.put("role", role);
        accessTokenClaims.put("permissions", permissions);

        return accessTokenClaims;
    }

    /**
     * Builds the set of claims to be included in the refresh JWT generated
     * after a successful user authentication.
     *
     * @param user the authenticated user for whom the refresh token claims are generated
     * @return a map containing the claims that will be embedded in the refresh JWT
     */
    private Map<String, Object> getClaimsForRefreshToken(User user) {
        Map<String, Object> refreshTokenClaims = new HashMap<>();
        refreshTokenClaims.put("userId", user.getId());
        return refreshTokenClaims;
    }

    /**
     * Builds the claims used to generate a new access token during a refresh token flow.
     *
     * <p>This method is invoked when a valid refresh token is presented and a new
     * access token needs to be issued without requiring the user to authenticate again.</p>
     *
     * @param user the user for whom the new access token is being generated
     * @return a map containing the claims that will be embedded in the new access JWT
     */
    private Map<String, Object> getClaimsForNewAccessToken(User user) {
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
