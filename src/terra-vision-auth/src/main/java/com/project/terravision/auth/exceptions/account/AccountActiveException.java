package com.project.terravision.auth.exceptions.account;

import com.project.terravision.auth.enums.AccountStatus;

import java.util.Map;

public class AccountActiveException extends AccountStatusException {
    public AccountActiveException(String message) {
        super(message, AccountStatus.ACTIVE, Map.of());
    }
}
