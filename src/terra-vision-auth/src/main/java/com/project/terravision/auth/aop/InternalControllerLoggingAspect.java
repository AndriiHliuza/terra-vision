package com.project.terravision.auth.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class InternalControllerLoggingAspect {

    @Before("execution(* com.project.terravision.auth.controller.InternalController.getAccountStatus(..)) && args(userId, ..)")
    public void logBeforeGettingAccountStatus(String userId) {
        log.debug("[Internal request] — Fetching account status for userId={}", userId);
    }
}
