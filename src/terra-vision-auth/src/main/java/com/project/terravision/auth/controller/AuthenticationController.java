package com.project.terravision.auth.controller;

import com.project.terravision.auth.config.SecurityConfig;
import com.project.terravision.auth.dto.AuthenticationRequest;
import com.project.terravision.auth.dto.AuthenticationResponse;
import com.project.terravision.auth.service.AuthenticationService;
import com.project.terravision.auth.service.RSAKeyService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.NoSuchAlgorithmException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final RSAKeyService rsaKeyService;

    @PostMapping("/login")
    public AuthenticationResponse authenticate(@RequestBody AuthenticationRequest authenticationRequest, HttpServletRequest httpServletRequest) {
        return authenticationService.authenticate(authenticationRequest, httpServletRequest);
    }

    @PostMapping("/refresh")
    public AuthenticationResponse refreshToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        return authenticationService.refreshToken(refreshToken);
    }

    @GetMapping("/.well-known/jwks.json") // JSON Web Key Set
    public Map<String, Object> getJwks() {
        return authenticationService.getJwks();
    }

    @PostMapping("/rotate-key")
    public void rotateKey() throws NoSuchAlgorithmException {
        rsaKeyService.rotateKey();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authorizationHeader) {
        String accessToken = extractToken(authorizationHeader);
        authenticationService.logout(accessToken);
        return ResponseEntity.noContent().build();
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith(SecurityConfig.BEARER_PREFIX)) {
            throw new IllegalArgumentException("Invalid Authorization header");
        }
        return authHeader.substring(SecurityConfig.BEARER_PREFIX.length());
    }
}
