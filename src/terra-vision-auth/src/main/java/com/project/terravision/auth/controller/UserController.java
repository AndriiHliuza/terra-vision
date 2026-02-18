package com.project.terravision.auth.controller;

import com.project.terravision.auth.dto.UserCreationRequest;
import com.project.terravision.auth.dto.UserCreationResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @PostMapping("/sign-up")
    public UserCreationResponse register(UserCreationRequest userCreationRequest) {
        return null; //todo Registration logic should be here
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
