package com.project.terravision.auth.exceptions;

public class InvalidEmailVerificationToken extends ApplicationException {
    public InvalidEmailVerificationToken() {
        super("Verification token is invalid or expired");
    }
}
