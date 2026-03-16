package com.project.terravision.auth.exceptions.account;

import com.project.terravision.auth.enums.AccountStatus;

import java.time.Instant;
import java.util.Map;

public class AccountBlockedException extends AccountStatusException {
    public AccountBlockedException(
            String message,
            Instant blockedAt,
            String blockReason
    ) {
        Map<String, String> details = Map.of(
                "blockedAt", blockedAt.toString(),
                "blockReason", blockReason
        );
        super(message, AccountStatus.BLOCKED, details);
    }
}
