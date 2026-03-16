package com.project.terravision.auth.exceptions.account;

import com.project.terravision.auth.enums.AccountStatus;
import com.project.terravision.auth.exceptions.ApplicationException;
import lombok.Getter;

import java.util.Map;

@Getter
public class AccountStatusException extends ApplicationException {
    private final AccountStatus accountStatus;
    private final Map<String, ?> details;
    public AccountStatusException(String message, AccountStatus accountStatus, Map<String, ?> details) {
        super(message);
        this.accountStatus = accountStatus;
        this.details = details;
    }
}
