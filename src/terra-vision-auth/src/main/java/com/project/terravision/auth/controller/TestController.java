package com.project.terravision.auth.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class TestController {

    @GetMapping("/public")
    public String publicMethod() {
        return "[terra-vision-auth] (PUBLIC)";
    }

    @GetMapping("/user/protected")
    public String protectedUserMethod() {
        return "[terra-vision-auth] (PROTECTED) - (Role: USER)";
    }

    @GetMapping("/admin/protected")
    public String protectedAdminMethod() {
        return "[terra-vision-auth] (PROTECTED) - (Role: ADMIN)";
    }

    @GetMapping("/super-admin/protected")
    public String protectedSuperAdminMethod() {
        return "[terra-vision-auth] (PROTECTED) - (Role: SUPER_ADMIN)";
    }
}
