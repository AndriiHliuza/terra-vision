package com.project.terravision.auth.service;

import com.project.terravision.auth.enums.AccountStatus;

public interface InternalService {
    AccountStatus getAccountStatus(String userId);
}
