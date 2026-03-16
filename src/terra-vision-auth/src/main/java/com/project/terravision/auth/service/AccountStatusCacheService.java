package com.project.terravision.auth.service;

import com.project.terravision.auth.enums.AccountStatus;

import java.util.UUID;

public interface AccountStatusCacheService {
    void cacheAccountStatus(UUID userId, AccountStatus status);
    void evictAccountStatus(UUID userId);
}
