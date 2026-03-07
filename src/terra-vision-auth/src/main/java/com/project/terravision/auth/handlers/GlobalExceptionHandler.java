package com.project.terravision.auth.handlers;

import com.project.terravision.auth.exceptions.*;
import com.project.terravision.auth.utils.WebUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * Note: Keep 'Exception ex' parameters as they are used in AOP Aspect to log errors.
     * */

    /* ------ Custom Exceptions Handling ------ */

    // --- Base Exception class for custom exceptions

    @ExceptionHandler(ApplicationException.class)
    public ProblemDetail handleApplicationException(ApplicationException ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.BAD_REQUEST,
                request,
                "Something went wrong",
                ex.getMessage(),
                null
        );
    }

    // --- User exceptions

    @ExceptionHandler(UserAlreadyExists.class)
    public ProblemDetail handleUserAlreadyExists(@SuppressWarnings("unused") UserAlreadyExists ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.CONFLICT,
                request,
                "User already exists",
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handleUserNotFoundException(@SuppressWarnings("unused") UserNotFoundException ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.CONFLICT,
                request,
                "User not found",
                ex.getMessage(),
                null
        );
    }

    @ExceptionHandler(AccountNotActiveException.class)
    public ProblemDetail handleAccountNotActiveException(AccountNotActiveException ex, HttpServletRequest request) {
        String title = switch (ex.getAccountState()) {
            case PENDING_VERIFICATION -> "Email requires verification";
            case BLOCKED ->  "Account is blocked";
            case DEACTIVATED ->  "Account is deactivated";
            default -> "Account not active";
        };
        return WebUtils.createProblemDetails(
                HttpStatus.BAD_REQUEST,
                request,
                title,
                ex.getMessage(),
                Map.of("accountState", ex.getAccountState())
        );
    }

    // --- Email token exception
    @ExceptionHandler(InvalidEmailVerificationToken.class)
    public ProblemDetail handleInvalidEmailVerificationException(@SuppressWarnings("unused") InvalidEmailVerificationToken ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.CONFLICT,
                request,
                "Invalid Email Verification Token",
                ex.getMessage(),
                null
        );
    }
}
