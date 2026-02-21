package com.project.terravision.auth.service;

import com.project.terravision.auth.dto.AuthenticationRequest;
import com.project.terravision.auth.dto.AuthenticationResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest, HttpServletRequest httpServletRequest);
    AuthenticationResponse refreshToken(String refreshToken);
    Map<String, Object> getJwks();
    void logout(String accessToken);
}
