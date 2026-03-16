package com.project.terravision.auth.controller;

import com.project.terravision.auth.service.InternalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth/internal")
@RequiredArgsConstructor
public class InternalController {

    private final InternalService internalService;

    @GetMapping("/account-status/{userId}")
    public String getAccountStatus(@PathVariable String userId) {
        return internalService.getAccountStatus(userId).name();
    }
}
