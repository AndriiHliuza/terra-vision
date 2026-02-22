package com.project.terravision.auth.handlers;

import com.nimbusds.jose.proc.BadJOSEException;
import com.project.terravision.auth.exceptions.InvalidSessionException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;

@Slf4j
@RestControllerAdvice
public class AuthenticationExceptionHandler {

    @ExceptionHandler(BadJOSEException.class)
    public ProblemDetail handleBadJOSEException(BadJOSEException e, HttpServletRequest request) {
        log.error(e.getMessage(), e);
        return getProblemDetailForTokenExceptions(
                request,
                "Invalid jwt",
                e.getMessage());
    }

    @ExceptionHandler(JwtException.class)
    public ProblemDetail handleJwtException(JwtException e, HttpServletRequest request) {
        log.error(e.getMessage(), e);
        return getProblemDetailForTokenExceptions(
                request,
                "Invalid jwt",
                e.getMessage());
    }

    @ExceptionHandler(JwtValidationException.class)
    public ProblemDetail handleJwtValidation(JwtValidationException e, HttpServletRequest request) {
        log.error(e.getMessage(), e);
        return getProblemDetailForTokenExceptions(
                request,
                "JWT validation failed",
                e.getMessage());
    }

    @ExceptionHandler(InvalidSessionException.class)
    public ProblemDetail handleInvalidSession(InvalidSessionException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
        problem.setTitle("Invalid Session");
        problem.setInstance(URI.create(request.getRequestURI()));
        return problem;
    }

    private ProblemDetail getProblemDetailForTokenExceptions(HttpServletRequest request, String title, String message) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);

        problemDetail.setTitle(title);
        problemDetail.setDetail(message);
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("timestamp", System.currentTimeMillis());

        return problemDetail;
    }

}
