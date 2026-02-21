package com.project.terravision.auth.handlers;

import com.project.terravision.auth.exceptions.InvalidSessionException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;

@RestControllerAdvice
public class CustomAuthenticationExceptionHandler {
    @ExceptionHandler(InvalidSessionException.class)
    public ProblemDetail handleInvalidSession(InvalidSessionException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
        problem.setTitle("Invalid Session");
        problem.setInstance(URI.create(request.getRequestURI()));
        return problem;
    }
}
