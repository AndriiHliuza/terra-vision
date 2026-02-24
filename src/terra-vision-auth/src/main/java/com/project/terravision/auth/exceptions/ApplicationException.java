package com.project.terravision.auth.exceptions;

public abstract class ApplicationException extends RuntimeException {
    public ApplicationException() {}

    public ApplicationException(String message) {
        super(message);
    }
}
