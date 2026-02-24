package com.project.terravision.auth.controller;

import com.project.terravision.auth.dto.UserCreationRequest;
import com.project.terravision.auth.dto.UserCreationResponse;
import com.project.terravision.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/sign-up")
    public UserCreationResponse createUser(@Valid @RequestBody UserCreationRequest userCreationRequest) {
        return userService.createUser(userCreationRequest);
    }

    @GetMapping("/protected")
    public String protectedMethod() {
        return "Protected: success";
    }

    @GetMapping("/public")
    public String publicMethod() {
        return "Public: success";
    }
}
