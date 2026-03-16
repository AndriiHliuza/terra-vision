package com.project.terravision.auth.exceptions.session;

import com.project.terravision.auth.exceptions.ApplicationException;

public class InvalidSessionException extends ApplicationException {
    public InvalidSessionException(String message) {
        super(message);
    }
}
