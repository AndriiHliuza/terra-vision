package com.project.terravision.auth.exceptions.user;

import com.project.terravision.auth.exceptions.ApplicationException;

public class UserNotFoundException extends ApplicationException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
