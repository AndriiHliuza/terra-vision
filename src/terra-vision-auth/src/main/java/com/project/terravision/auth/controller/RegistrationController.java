package com.project.terravision.auth.controller;

import com.project.terravision.auth.dto.UserCreationRequest;
import com.project.terravision.auth.dto.UserCreationResponse;
import com.project.terravision.auth.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/registration")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserCreationResponse createUserAccount(@Valid @RequestBody UserCreationRequest userCreationRequest) {
        return registrationService.createUserAccount(userCreationRequest);
    }

    @PostMapping("/confirmation/email/resend")
    public UserCreationResponse resendConfirmationEmail(@Valid @RequestBody UserCreationRequest userCreationRequest) {
        return registrationService.resendConfirmationEmail(userCreationRequest);
    }

    @GetMapping("/confirm")
    public UserCreationResponse confirmEmail(@RequestParam String token) {
        return registrationService.confirmEmail(token);
    }
}
