package com.project.terravision.auth.exceptions.account;

import com.project.terravision.auth.enums.AccountStatus;

import java.util.Map;

public class AccountDeactivatedException extends AccountStatusException {
    public AccountDeactivatedException(String message) {
        super(message, AccountStatus.DEACTIVATED, Map.of());
    }
}
