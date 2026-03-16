package com.project.terravision.auth.exceptions.verification;

import com.project.terravision.auth.exceptions.ApplicationException;

public class InvalidVerificationToken extends ApplicationException {
    public InvalidVerificationToken() {
        super("Verification token is invalid or expired");
    }
}
