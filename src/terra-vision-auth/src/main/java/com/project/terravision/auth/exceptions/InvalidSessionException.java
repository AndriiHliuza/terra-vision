package com.project.terravision.auth.exceptions;

public class InvalidSessionException extends ApplicationException {
    public InvalidSessionException() {
        super("Session not found — please login again");
    }
}
