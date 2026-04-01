package com.project.terravision.auth.handlers;

import com.nimbusds.jose.proc.BadJOSEException;
import com.project.terravision.auth.utils.WebUtils;
import io.minio.errors.MinioException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalSystemExceptionHandler {

    /*
     * Note: Keep 'Exception ex' parameters as they are used in AOP Aspect to log errors.
     * */

    // ------------ Exception handler ------------

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleException(@SuppressWarnings("unused") Exception ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.INTERNAL_SERVER_ERROR,
                request,
                "Unexpected error",
                null, null
        );
    }



    // ------------ BadCredentialsException handler ------------

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(@SuppressWarnings("unused") BadCredentialsException ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.UNAUTHORIZED,
                request,
                "Invalid email or password",
                null, null
        );
    }



    // ------------ IllegalArgumentException handler ------------

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgumentException(@SuppressWarnings("unused") Exception ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.BAD_REQUEST,
                request,
                "Illegal argument",
                null, null
        );
    }



    // ------------ JOSE, JWT Exception handler ------------
    @ExceptionHandler({
            BadJOSEException.class,
            JwtException.class,
            JwtValidationException.class,
    })
    public ProblemDetail handleBadJOSEAndJwtExceptions(@SuppressWarnings("unused") Exception ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.UNAUTHORIZED,
                request,
                "Invalid jwt",
                null, null);
    }



    // ------------ Validation exception handler ------------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(
                        error.getField(),
                        error.getDefaultMessage()
                ));
        log.error("Validation exceptions: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
