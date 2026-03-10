package com.project.terravision.gateway.manager;

import org.jspecify.annotations.NullMarked;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationResult;
import org.springframework.security.authorization.ReactiveAuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import reactor.core.publisher.Mono;

import java.util.*;

public class AuthorizationManager implements ReactiveAuthorizationManager<AuthorizationContext> {

    public enum AuthorityStrategy { ALL_OF, ANY_OF }

    private final int requiredPowerLevel;
    private final List<String> requiredAuthorities;
    private final AuthorityStrategy strategy;

    private AuthorizationManager(int level, AuthorityStrategy strategy, String... authorities) {
        this.requiredPowerLevel = level;
        this.strategy = strategy;
        this.requiredAuthorities = List.of(authorities);
    }

    // --- Static Factory Methods ---

    // Power level only
    public static AuthorizationManager hasAtLeastPowerLevel(int level) {
        return new AuthorizationManager(level, AuthorityStrategy.ANY_OF);
    }

    // Power level + any of these permissions
    public static AuthorizationManager hasAtLeastPowerLevelAndAnyAuthority(int level, String... permissions) {
        return new AuthorizationManager(level, AuthorityStrategy.ANY_OF, permissions);
    }

    // Power level + all of these permissions
    public static AuthorizationManager hasAtLeastPowerLevelAndAllAuthorities(int level, String... permissions) {
        return new AuthorizationManager(level, AuthorityStrategy.ALL_OF, permissions);
    }

    // Power level + any of these roles (e.g: accepts "ADMIN" or "ROLE_ADMIN")
    public static AuthorizationManager hasAtLeastPowerLevelAndAnyRole(int level, String... roles) {
        String[] normalizedRoles = Arrays.stream(roles)
                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                .toArray(String[]::new);
        return new AuthorizationManager(level, AuthorityStrategy.ANY_OF, normalizedRoles);
    }

    // ------------ Authorization logic ------------

    @Override
    @NullMarked
    public Mono<AuthorizationResult> authorize(Mono<Authentication> authentication, AuthorizationContext object) {
        return authentication
                .filter(Authentication::isAuthenticated)
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .cast(JwtAuthenticationToken.class)
                .<AuthorizationResult>map(jwtAuthenticationToken -> {
                    Jwt jwt = jwtAuthenticationToken.getToken();

                    // 1. Power level check — from "role" claim.
                    Map<String, Object> roleClaim = jwt.getClaim("role");
                    if (roleClaim == null) return new AuthorizationDecision(false);

                    Object powerLevelObj = roleClaim.get("powerLevel");
                    if (!(powerLevelObj instanceof Number powerLevel) || powerLevel.intValue() < requiredPowerLevel) {
                        return new AuthorizationDecision(false);
                    }

                    // 2. No authority check needed
                    if (requiredAuthorities.isEmpty()) return new AuthorizationDecision(true);

                    // 3. Split authorities into permissions and roles
                    Set<String> roles = new HashSet<>();
                    Set<String> authoritiesWithoutRoles = new HashSet<>();

                    for (GrantedAuthority authority : jwtAuthenticationToken.getAuthorities()) {
                        String authorityString = authority.getAuthority();
                        if (authorityString == null) continue;

                        if (authorityString.startsWith("ROLE_")) {
                            roles.add(authorityString);        // "ROLE_ADMIN"
                        } else {
                            authoritiesWithoutRoles.add(authorityString);  // "DELETE_USERS"
                        }
                    }

                    // 4. Check required authorities against the correct set
                    boolean authoritiesMatch = switch (strategy) {
                        case ANY_OF -> requiredAuthorities.stream().anyMatch(required ->
                                required.startsWith("ROLE_")
                                        ? roles.contains(required)
                                        : authoritiesWithoutRoles.contains(required)
                        );
                        case ALL_OF -> requiredAuthorities.stream().allMatch(required ->
                                required.startsWith("ROLE_")
                                        ? roles.contains(required)
                                        : authoritiesWithoutRoles.contains(required)
                        );
                    };

                    return new AuthorizationDecision(authoritiesMatch);
                }).defaultIfEmpty(new AuthorizationDecision(false));
    }
}
