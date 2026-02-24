package com.project.terravision.auth.service;

import com.project.terravision.auth.dto.AuthenticationRequest;
import com.project.terravision.auth.dto.AuthenticationResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Map;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest, HttpServletRequest httpServletRequest);
    AuthenticationResponse refreshToken(String refreshToken);
    Map<String, Object> getJwks();
    Map<String, Object> me(Jwt jwt);
    void logout(String accessToken);
}
