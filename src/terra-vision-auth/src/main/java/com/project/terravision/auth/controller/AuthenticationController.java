package com.project.terravision.auth.controller;

import com.project.terravision.auth.dto.AuthenticationRequest;
import com.project.terravision.auth.dto.AuthenticationResponse;
import com.project.terravision.auth.service.AuthenticationService;
import com.project.terravision.auth.service.RSAKeyService;
import lombok.RequiredArgsConstructor;
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
    public AuthenticationResponse login(@RequestBody AuthenticationRequest authenticationRequest) {
        return authenticationService.authenticate(authenticationRequest);
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
}
