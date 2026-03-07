package com.project.terravision.auth.exceptions;

import com.project.terravision.auth.model.enums.AccountState;
import lombok.Getter;

@Getter
public class AccountNotActiveException extends ApplicationException {

    private final AccountState accountState;

    public AccountNotActiveException(AccountState accountState, String message) {
        super(message);
        this.accountState = accountState;
    }
}
