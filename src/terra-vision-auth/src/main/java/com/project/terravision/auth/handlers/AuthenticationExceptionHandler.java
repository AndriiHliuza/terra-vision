package com.project.terravision.auth.handlers;

import com.nimbusds.jose.proc.BadJOSEException;
import com.project.terravision.auth.exceptions.InvalidSessionException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class AuthenticationExceptionHandler {

    @ExceptionHandler(BadJOSEException.class)
    public ProblemDetail handleBadJOSEException(BadJOSEException ex, HttpServletRequest request) {
        log.error(ex.getMessage());
        return getProblemDetailForTokenExceptions(
                request,
                "Invalid jwt",
                ex.getMessage());
    }

    @ExceptionHandler(JwtException.class)
    public ProblemDetail handleJwtException(JwtException ex, HttpServletRequest request) {
        log.error(ex.getMessage());
        return getProblemDetailForTokenExceptions(
                request,
                "Invalid jwt",
                ex.getMessage());
    }

    @ExceptionHandler(JwtValidationException.class)
    public ProblemDetail handleJwtValidation(JwtValidationException ex, HttpServletRequest request) {
        log.error(ex.getMessage());
        return getProblemDetailForTokenExceptions(
                request,
                "JWT validation failed",
                ex.getMessage());
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, String>> handleDisabledException(DisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", "ACCOUNT_DISABLED",
                "message", "Your account is currently deactivated.",
                "action", "To re-enable your account, please click on the 'Restore Account' link sent to your email or contact support."
        ));
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
