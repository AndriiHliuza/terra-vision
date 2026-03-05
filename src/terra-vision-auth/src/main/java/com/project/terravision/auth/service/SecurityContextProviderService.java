package com.project.terravision.auth.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface SecurityContextProviderService {
    Authentication getAuthentication();
    UserDetails getUserDetails();
    User getUser();
    List<String> getAuthorities();
    List<String> getRoles();
    List<String> getRolesNoPrefix();
    List<String> getPermissions();
}
