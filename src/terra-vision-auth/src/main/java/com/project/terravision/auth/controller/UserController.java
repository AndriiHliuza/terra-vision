package com.project.terravision.auth.controller;

import com.project.terravision.auth.dto.UserCreationRequest;
import com.project.terravision.auth.dto.UserCreationResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @PostMapping("/register")
    public UserCreationResponse register(UserCreationRequest userCreationRequest) {
        return null; //todo Registration logic should be here
    }
}
