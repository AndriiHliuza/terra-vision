package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.enums.AccountStatus;
import com.project.terravision.auth.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountStatusCacheServiceImpl implements CacheService<UUID, AccountStatus> {

    private final StringRedisTemplate stringRedisTemplate;
    private static final String ACCOUNT_STATUS_PREFIX = "account:status:";

    @Override
    public void cache(UUID userId, AccountStatus status) {
        stringRedisTemplate.opsForValue().set(ACCOUNT_STATUS_PREFIX + userId, status.name());
        log.debug("Cached account status for userId={}, Account status: {}", userId, status);
    }

    @Override
    public void evict(UUID userId) {
        stringRedisTemplate.delete(ACCOUNT_STATUS_PREFIX + userId);
        log.debug("Evicted account status cache for userId={}", userId);
    }
}
