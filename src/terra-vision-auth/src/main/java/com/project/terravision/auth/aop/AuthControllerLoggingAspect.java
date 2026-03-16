package com.project.terravision.auth.aop;

import com.project.terravision.auth.dto.response.AuthenticationResponse;
import com.project.terravision.auth.dto.response.UserCreatedResponse;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class AuthControllerLoggingAspect {

    @AfterReturning(
            pointcut = "execution(* com.project.terravision.auth.controller.AuthController.authenticate(..))",
            returning = "result"
    )
    public void logAfterAuthentication(AuthenticationResponse result) {
        log.debug("Authentication successful for user with email: '{}'", result.getEmail());
    }

    @AfterReturning(
            pointcut = "execution(* com.project.terravision.auth.controller.AuthController.refreshToken(..))",
            returning = "result"
    )
    public void logAfterTokenRefreshing(AuthenticationResponse result) {
        log.debug("Token refreshed, new ACCESS token received for user with email: {}", result.getEmail());
    }

    @AfterReturning(
            pointcut = "execution(* com.project.terravision.auth.controller.AuthController.register(..))",
            returning = "result"
    )
    public void logAfterUserRegistration(UserCreatedResponse result) {
        log.debug("User registered successfully. Email: {}", result.getEmail());
    }
}
