package com.project.terravision.auth.service;

import com.project.terravision.auth.dto.UserCreationRequest;
import com.project.terravision.auth.dto.UserCreationResponse;

public interface UserService {
    UserCreationResponse createUser(UserCreationRequest userCreationRequest);
}
