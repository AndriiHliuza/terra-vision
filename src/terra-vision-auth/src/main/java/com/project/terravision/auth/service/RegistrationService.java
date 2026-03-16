package com.project.terravision.auth.service;

import com.project.terravision.auth.dto.request.CreateUserRequest;
import com.project.terravision.auth.dto.response.UserCreatedResponse;

public interface RegistrationService {
    UserCreatedResponse register(CreateUserRequest request);
    void verifyEmail(String emailVerificationToken);
}
