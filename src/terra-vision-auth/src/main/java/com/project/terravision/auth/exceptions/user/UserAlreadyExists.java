package com.project.terravision.auth.exceptions.user;

import com.project.terravision.auth.exceptions.ApplicationException;

public class UserAlreadyExists extends ApplicationException {
    public UserAlreadyExists(String message) {
        super(message);
    }
}
