package com.project.terravision.auth.exceptions;

import org.slf4j.helpers.MessageFormatter;

public class UserAlreadyExists extends ApplicationException {
    public UserAlreadyExists(String email) {
        super(MessageFormatter.format("User with email: {} already exists", email).getMessage());
    }
}
