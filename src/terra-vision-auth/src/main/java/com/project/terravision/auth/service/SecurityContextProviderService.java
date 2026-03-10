package com.project.terravision.auth.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface SecurityContextProviderService {
    Authentication getAuthentication();
    UserDetails getUserDetails();
    User getUser();
    Jwt getJwt();
    List<String> getAuthorities();
    List<String> getRoles();
    String getRole();
    List<String> getRolesNoPrefix();
    String getRoleNoPrefix();
    List<String> getPermissions();
}
