package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.config.properties.SecurityProperties;
import com.project.terravision.auth.dto.SessionDetails;
import com.project.terravision.auth.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;
    private final SecurityProperties securityProperties;

    private static final String SESSION_PREFIX = "session:";

    @Override
    public void saveSession(String userId, String jti, SessionDetails sessionDetails) {
        String key = SESSION_PREFIX + userId + ":" + jti;
        String value = objectMapper.writeValueAsString(sessionDetails);
        Duration duration = securityProperties.getJwt().getRefreshToken().getExpiration();

        stringRedisTemplate.opsForValue().set(key, value, duration);

        log.debug("Saved session object for userId={}, jti: {}", userId, jti);
    }

    @Override
    public void revokeSession(String userId, String jti) {
        stringRedisTemplate.delete(SESSION_PREFIX + userId + ":" + jti);
        log.debug("Revoked session for userId={}, jti: {}", userId, jti);
    }

    @Override
    public void revokeAllSessions(String userId) {
        Set<String> keys = stringRedisTemplate.keys(SESSION_PREFIX + userId + ":*");
        if (keys != null && !keys.isEmpty()) stringRedisTemplate.delete(keys);
        log.debug("Revoked all sessions for userId={}", userId);
    }

    @Override
    public void updateLastUsed(String userId, String jti) {
        String key = SESSION_PREFIX + userId + ":" + jti;
        SessionDetails sessionDetails = objectMapper.readValue(
                stringRedisTemplate.opsForValue().get(key),
                SessionDetails.class
        );

        if (sessionDetails == null) return;
        sessionDetails.setLastUsedAt(System.currentTimeMillis());

        Long ttl = stringRedisTemplate.getExpire(key, TimeUnit.SECONDS);
        String value = objectMapper.writeValueAsString(sessionDetails);
        stringRedisTemplate.opsForValue().set(key, value, ttl, TimeUnit.SECONDS);

        log.debug("Updated session object for userId={}, jti: {}", userId, jti);
    }

    @Override
    public boolean isValidSession(String userId, String jti) {
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(SESSION_PREFIX + userId + ":" + jti));
    }

    @Override
    public SessionDetails getSession(String userId, String jti) {
        return objectMapper.readValue(
                stringRedisTemplate.opsForValue().get(SESSION_PREFIX + userId + ":" + jti),
                SessionDetails.class
        );
    }

    @Override
    public List<SessionDetails> getAllSessions(String userId) {
        Set<String> keys = stringRedisTemplate.keys(SESSION_PREFIX + userId + ":*");
        if (keys == null || keys.isEmpty()) return List.of();

        return keys.stream()
                .map(key -> objectMapper.readValue(stringRedisTemplate.opsForValue().get(key), SessionDetails.class))
                .filter(Objects::nonNull)
                .toList();
    }

}
