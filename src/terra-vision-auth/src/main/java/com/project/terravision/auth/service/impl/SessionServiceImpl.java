package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.config.properties.SecurityProperties;
import com.project.terravision.auth.dto.SessionDetails;
import com.project.terravision.auth.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final SecurityProperties securityProperties;

    private static final String SESSION_PREFIX = "session:";

    @Override
    public void saveSession(String userId, String jti, SessionDetails sessionDetails) {
        String key = SESSION_PREFIX + userId + ":" + jti;
        Duration duration = securityProperties.getJwt().getRefreshToken().getExpiration();
        redisTemplate.opsForValue().set(key, sessionDetails, duration);
    }

    @Override
    public void revokeSession(String userId, String jti) {
        redisTemplate.delete(SESSION_PREFIX + userId + ":" + jti);
    }

    @Override
    public void revokeAllSessions(String userId) {
        Set<String> keys = redisTemplate.keys(SESSION_PREFIX + userId + ":*");
        if (keys != null && !keys.isEmpty()) redisTemplate.delete(keys);
    }

    @Override
    public void updateLastUsed(String userId, String jti) {
        String key = SESSION_PREFIX + userId + ":" + jti;
        SessionDetails sessionDetails = objectMapper.convertValue(
                redisTemplate.opsForValue().get(key),
                SessionDetails.class
        );
        if (sessionDetails == null) return;
        sessionDetails.setLastUsedAt(System.currentTimeMillis());
        Long ttl = redisTemplate.getExpire(key, TimeUnit.DAYS);
        redisTemplate.opsForValue().set(key, sessionDetails, ttl, TimeUnit.DAYS);
    }

    @Override
    public boolean isValidSession(String userId, String jti) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(SESSION_PREFIX + userId + ":" + jti));
    }

    @Override
    public SessionDetails getSession(String userId, String jti) {
        return objectMapper.convertValue(
                redisTemplate.opsForValue().get(SESSION_PREFIX + userId + ":" + jti),
                SessionDetails.class
        );
    }

    @Override
    public List<SessionDetails> getAllSessions(String userId) {
        Set<String> keys = redisTemplate.keys(SESSION_PREFIX + userId + ":*");
        if (keys == null || keys.isEmpty()) return List.of();

        return keys.stream()
                .map(key -> objectMapper.convertValue(redisTemplate.opsForValue().get(key), SessionDetails.class))
                .filter(Objects::nonNull)
                .toList();
    }

}
