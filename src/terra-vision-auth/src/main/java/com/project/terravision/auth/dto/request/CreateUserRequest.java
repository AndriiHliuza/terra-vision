package com.project.terravision.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
        String username,
        @Email @NotBlank String email,
        @NotBlank String password,
        String firstname,
        String lastname
) {}
