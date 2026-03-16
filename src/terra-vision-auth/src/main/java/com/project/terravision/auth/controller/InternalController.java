package com.project.terravision.auth.controller;

import com.project.terravision.auth.service.InternalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/internal")
@RequiredArgsConstructor
public class InternalController {

    private InternalService internalService;

    @GetMapping("/account-status/{userId}")
    public String getAccountStatus(@PathVariable String userId) {
        return internalService.getAccountStatus(userId).name();
    }
}
