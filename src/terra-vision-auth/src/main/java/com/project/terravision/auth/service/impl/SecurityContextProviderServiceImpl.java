package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.service.SecurityContextProviderService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class SecurityContextProviderServiceImpl implements SecurityContextProviderService {

    @Override
    public Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    @Override
    public UserDetails getUserDetails() {
        return (UserDetails) getAuthentication().getPrincipal();
    }

    @Override
    public User getUser() {
        return (User) getAuthentication().getPrincipal();
    }

    @Override
    public Jwt getJwt() {
        return (Jwt) getAuthentication().getPrincipal();
    }

    @Override
    public List<String> getAuthorities() {
        return getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
    }

    @Override
    public List<String> getRoles() {
        return getAuthorities().stream()
                .filter(Objects::nonNull)
                .filter(this::isRole)
                .toList();
    }

    @Override
    public String getRole() {
        return getRoles().getFirst(); // Each use can only have one role
    }

    @Override
    public List<String> getRolesNoPrefix() {
        return getRoles().stream()
                .map(role -> role.replace("ROLE_", ""))
                .toList();
    }

    @Override
    public String getRoleNoPrefix() {
        return getRolesNoPrefix().getFirst(); // Each use can only have one role
    }

    @Override
    public List<String> getPermissions() {
        return getAuthorities().stream()
                .filter(Objects::nonNull)
                .filter(this::isPermission)
                .toList();
    }

    private boolean isRole(String authority) {
        return authority.startsWith("ROLE_");
    }

    private boolean isPermission(String authority) {
        return authority.matches("\\w+:\\w+");
    }
}
