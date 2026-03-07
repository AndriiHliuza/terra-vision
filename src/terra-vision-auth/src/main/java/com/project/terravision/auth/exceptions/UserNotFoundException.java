package com.project.terravision.auth.exceptions;

public class UserNotFoundException extends ApplicationException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
