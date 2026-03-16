package com.project.terravision.auth.exceptions.session;

import com.project.terravision.auth.exceptions.ApplicationException;

public class InvalidSessionException extends ApplicationException {
    public InvalidSessionException() {
        super("Session not found — please login again");
    }
}
