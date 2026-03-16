package com.project.terravision.auth.service;

import com.project.terravision.auth.dto.request.AuthenticationRequest;
import com.project.terravision.auth.dto.request.ResetPasswordRequest;
import com.project.terravision.auth.dto.response.AuthenticationResponse;
import com.project.terravision.auth.dto.response.MeResponse;
import com.project.terravision.auth.enums.EmailVerificationType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

public interface AuthenticationService {

    // ------------ Authentication methods ------------

    AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest, HttpServletRequest httpServletRequest);
    MeResponse me(Jwt jwt);
    void logout(String accessToken);



    // ------------ Method to send verification email ------------
    void sendVerificationEmail(String email, EmailVerificationType verificationType);

    // ------------ Method that resets password after verifying the email ------------
    void resetPassword(ResetPasswordRequest request);



    // ------------ Method to get new ACCESS jwt ------------
    AuthenticationResponse refreshToken(String refreshToken);

    // ------------ Method to get JSON Web Keys required to check if JWTs are valid ------------
    Map<String, Object> getJwks();
}
