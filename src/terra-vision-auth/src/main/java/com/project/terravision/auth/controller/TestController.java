package com.project.terravision.auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class TestController {

    @GetMapping("/protected")
    public String protectedMethod() {
        return "Protected: success";
    }

    @GetMapping("/public")
    public String publicMethod() {
        return "Public: success";
    }
}
