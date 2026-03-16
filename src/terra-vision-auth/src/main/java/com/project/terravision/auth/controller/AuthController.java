package com.project.terravision.auth.controller;

import com.project.terravision.auth.dto.request.ResendVerificationEmailRequest;
import com.project.terravision.auth.dto.request.*;
import com.project.terravision.auth.dto.response.AuthenticationResponse;
import com.project.terravision.auth.dto.response.MeResponse;
import com.project.terravision.auth.dto.response.UserCreatedResponse;
import com.project.terravision.auth.enums.EmailVerificationType;
import com.project.terravision.auth.service.AuthenticationService;
import com.project.terravision.auth.service.VerificationEmailService;
import com.project.terravision.auth.service.RegistrationService;
import com.project.terravision.auth.service.impl.RSAKeyService;
import com.project.terravision.auth.utils.WebUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.security.NoSuchAlgorithmException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final RegistrationService registrationService;

    private final RSAKeyService rsaKeyService;

    private final VerificationEmailService verificationEmailService;

    // ------------ Authentication endpoints ------------

    @PostMapping("/login")
    public AuthenticationResponse authenticate(@RequestBody AuthenticationRequest authenticationRequest, HttpServletRequest httpServletRequest) {
        return authenticationService.authenticate(authenticationRequest, httpServletRequest);
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        return authenticationService.me(jwt);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader("Authorization") String authorizationHeader) {
        String accessToken = WebUtils.extractBearerTokenFromAuthorizationHeader(authorizationHeader);
        authenticationService.logout(accessToken);
    }



    // ------------ JWT & JWKS endpoints ------------

    @PostMapping("/refresh-token")
    public AuthenticationResponse refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return authenticationService.refreshToken(request.refreshToken());
    }

    @GetMapping("/.well-known/jwks.json") // JSON Web Key Set
    public Map<String, Object> getJwks() {
        return authenticationService.getJwks();
    }

    @PostMapping("/rotate-key")
    public void rotateKey() throws NoSuchAlgorithmException {
        rsaKeyService.rotateKey();
    }



    // ------------ Registration endpoints ------------

    @PostMapping("/sign-up")
    @ResponseStatus(HttpStatus.CREATED)
    public UserCreatedResponse register(@RequestBody @Valid CreateUserRequest request) {
        return registrationService.register(request);
    }

    @PostMapping("/verify-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyEmail(@RequestBody @Valid VerifyEmailRequest request) {
        registrationService.verifyEmail(request.token());
    }



    // ------------ Forgot Password endpoints ------------

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        verificationEmailService.sendVerificationEmail(request.email(), EmailVerificationType.RESET_PASSWORD_VERIFICATION);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authenticationService.resetPassword(request);
    }



    // ------------ Email verification endpoints ------------

    @PostMapping("/resend-verification")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resendVerificationEmail(@RequestBody @Valid ResendVerificationEmailRequest request) {
        verificationEmailService.sendVerificationEmail(
                request.email(),
                EmailVerificationType.valueOf(request.verificationType().toUpperCase())
        );
    }
}
