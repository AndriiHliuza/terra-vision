package com.project.terravision.auth.handlers;

import com.nimbusds.jose.proc.BadJOSEException;
import com.project.terravision.auth.exceptions.InvalidSessionException;
import com.project.terravision.auth.utils.WebUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class AuthenticationExceptionHandler {

    /*
     * Note: Keep 'Exception ex' parameters as they are used in AOP Aspect to log errors.
     * */

    /* ------ Java (System) Exceptions Handling ------ */

    @ExceptionHandler({
            BadJOSEException.class,
            JwtException.class,
            JwtValidationException.class,
    })
    public ProblemDetail handleBadJOSEException(@SuppressWarnings("unused") Exception ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.UNAUTHORIZED,
                request,
                "Invalid jwt",
                null, null);
    }

    @ExceptionHandler(DisabledException.class)
    public ProblemDetail handleDisabledException(@SuppressWarnings("unused") DisabledException ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.FORBIDDEN,
                request,
                "Account Disabled",
                "Your account is currently deactivated.",
                Map.of(
                        "status", "ACCOUNT_DISABLED",
                        "action", "To re-enable your account, please click on the 'Restore Account' link."
                ));
    }



    /* ------ Custom Exceptions Handling ------ */

    @ExceptionHandler(InvalidSessionException.class)
    public ProblemDetail handleInvalidSession(@SuppressWarnings("unused") InvalidSessionException ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.UNAUTHORIZED,
                request,
                "Invalid Session",
                null, null);
    }
}
