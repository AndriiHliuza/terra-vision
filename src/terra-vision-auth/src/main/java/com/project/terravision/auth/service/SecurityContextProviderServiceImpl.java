package com.project.terravision.auth.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class SecurityContextProviderServiceImpl implements SecurityContextProviderService {

    @Override
    public Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public UserDetails getUserDetails() {
        return (UserDetails) getAuthentication().getPrincipal();
    }

    public User getUser() {
        return (User) getAuthentication().getPrincipal();
    }

    public String getUsername() {
        return getUserDetails().getUsername();
    }

    public List<String> getAuthorities() {
        return getUser().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
    }

    public List<String> getRoles() {
        return getUser().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .filter(role -> role.startsWith("ROLE_"))
                .toList();
    }
}
