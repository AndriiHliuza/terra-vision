package com.project.terravision.auth.exceptions.account;

import com.project.terravision.auth.enums.AccountStatus;

import java.util.Map;

public class AccountPendingVerificationException extends AccountStatusException {
    public AccountPendingVerificationException(String message) {
        super(message, AccountStatus.PENDING_VERIFICATION, Map.of());
    }
}
