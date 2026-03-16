package com.project.terravision.auth.handlers;

import com.project.terravision.auth.enums.AccountStatus;
import com.project.terravision.auth.exceptions.ApplicationException;
import com.project.terravision.auth.exceptions.account.AccountStatusException;
import com.project.terravision.auth.exceptions.session.InvalidSessionException;
import com.project.terravision.auth.exceptions.user.UserAlreadyExists;
import com.project.terravision.auth.exceptions.user.UserNotFoundException;
import com.project.terravision.auth.exceptions.verification.InvalidVerificationToken;
import com.project.terravision.auth.utils.WebUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalCustomExceptionHandler {

    /*
     * Note: Keep 'Exception ex' parameters as they are used in AOP Aspect to log errors.
     * */

    // ------------ ApplicationException handler (Base Exception class for custom exceptions) ------------
    @ExceptionHandler(ApplicationException.class)
    public ProblemDetail handleApplicationException(Exception ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.BAD_REQUEST,
                request,
                "Something went wrong",
                null, null
        );
    }



    // ------------ User exceptions handlers ------------

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
                HttpStatus.NOT_FOUND,
                request,
                "User not found",
                ex.getMessage(),
                null
        );
    }



    // ------------ Account status exceptions handlers ------------
    @ExceptionHandler(AccountStatusException.class)
    public ProblemDetail handleAccountStatusException(AccountStatusException ex, HttpServletRequest request) {
        String title = getTitleForProblemDetailFromAccountStatusException(ex);
        Map<String, Object> extraProperties = getExtraPropertiesForProblemDetailFromAccountStatusException(ex);
        HttpStatus status = getHttpStatusForProblemDetailFromAccountStatusException(ex);
        return WebUtils.createProblemDetails(
                status,
                request,
                title,
                ex.getMessage(),
                extraProperties
        );
    }



    // ------------ InvalidSessionException handler ------------
    @ExceptionHandler(InvalidSessionException.class)
    public ProblemDetail handleInvalidSession(@SuppressWarnings("unused") InvalidSessionException ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.UNAUTHORIZED,
                request,
                "Invalid Session",
                null, null);
    }



    // ------------ InvalidVerificationToken handler ------------
    @ExceptionHandler(InvalidVerificationToken.class)
    public ProblemDetail handleInvalidVerificationException(@SuppressWarnings("unused") InvalidVerificationToken ex, HttpServletRequest request) {
        return WebUtils.createProblemDetails(
                HttpStatus.BAD_REQUEST,
                request,
                "Invalid Email Verification Token",
                ex.getMessage(),
                null
        );
    }



    // ------------ private methods ------------

    private HttpStatus getHttpStatusForProblemDetailFromAccountStatusException(AccountStatusException ex) {
        return switch (ex.getAccountStatus()) {
            case ACTIVE -> HttpStatus.CONFLICT;
            case PENDING_VERIFICATION -> HttpStatus.UNAUTHORIZED;
            case BLOCKED, DEACTIVATED -> HttpStatus.FORBIDDEN;
            case null -> HttpStatus.FORBIDDEN;
        };
    }

    private String getTitleForProblemDetailFromAccountStatusException(AccountStatusException ex) {
        return switch (ex.getAccountStatus()) {
            case ACTIVE -> "Account is active";
            case PENDING_VERIFICATION -> "Email requires verification";
            case BLOCKED -> "Account is blocked";
            case DEACTIVATED -> "Account is deactivated";
            case null -> "Account status is null";
        };
    }

    private Map<String, Object> getExtraPropertiesForProblemDetailFromAccountStatusException(AccountStatusException ex) {
        Map<String, Object> extraProperties = new HashMap<>();
        extraProperties.put("accountStatus", ex.getAccountStatus());
        if (ex.getAccountStatus() == AccountStatus.BLOCKED) {
            extraProperties.putAll(ex.getDetails());
        }
        return extraProperties;
    }
}
