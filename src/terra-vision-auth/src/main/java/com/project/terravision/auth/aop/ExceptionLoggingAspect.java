package com.project.terravision.auth.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class ExceptionLoggingAspect {

    // Common package pointcut for reuse
    @Pointcut("execution(* com.project.terravision.auth.handlers..*(..)) && " +
            "@annotation(org.springframework.web.bind.annotation.ExceptionHandler)")
    public void handlerMethod() {}

    /**
     * 1. Matches methods that ACCEPT an Exception as the first argument.
     * This allows us to log the full message and stack trace.
     */
    @Before("handlerMethod() && args(ex, ..)")
    public void logException(Exception ex) {
        log.error("Exception: {} Message: {}",
                ex.getClass().getSimpleName(),
                ex.getMessage());
    }

    /**
     * 2. Matches methods that take NO arguments.
     * Uses 'args()' with empty parentheses to target zero-argument methods.
     */
    @Before("handlerMethod() && args()")
    public void logNoArguments(JoinPoint joinPoint) {
        log.error("Exception handled in method: {} (Zero-argument handler triggered)", joinPoint.getSignature().getName());
    }
}
