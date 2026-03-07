package com.project.terravision.auth.service;

import com.project.terravision.auth.dto.UserCreationRequest;
import com.project.terravision.auth.dto.UserCreationResponse;

public interface RegistrationService {
    UserCreationResponse createUserAccount(UserCreationRequest userCreationRequest);
    UserCreationResponse resendConfirmationEmail(UserCreationRequest userCreationRequest);
    UserCreationResponse confirmEmail(String emailVerificationToken);
}
