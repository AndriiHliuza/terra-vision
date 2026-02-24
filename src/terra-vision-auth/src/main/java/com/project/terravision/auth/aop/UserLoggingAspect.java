package com.project.terravision.auth.aop;

import com.project.terravision.auth.dto.UserCreationResponse;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class UserLoggingAspect {

    @AfterReturning(
            pointcut = "execution(* com.project.terravision.auth.service.UserService.createUser(..))",
            returning = "result"
    )
    public void logAfterUserCreation(UserCreationResponse result) {
        log.info("User created successfully. Username: {}, Email: {}",
                result.getUsername(),
                result.getEmail()
        );
    }

}
