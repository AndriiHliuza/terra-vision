package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.config.properties.MailProperties;
import com.project.terravision.auth.exceptions.InvalidEmailVerificationToken;
import com.project.terravision.auth.service.EmailTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailTokenServiceImpl implements EmailTokenService {
    private static final String VERIFY_PREFIX = "verify:";
    private final MailProperties mailProperties;
    private final RedisTemplate<String, String> redisTemplate;

    public String generateAndSaveToken(UUID userId) {
        String token = UUID.randomUUID().toString();
        String key = VERIFY_PREFIX + token;
        Duration expiration = mailProperties.getVerificationProps().getExpiration();
        redisTemplate.opsForValue().set(key, userId.toString(), expiration);
        return token;
    }

    public UUID validateAndConsumeToken(String token) {
        String userId = redisTemplate.opsForValue().get(VERIFY_PREFIX + token);
        if (userId == null) throw new InvalidEmailVerificationToken();
        redisTemplate.delete(VERIFY_PREFIX + token);
        return UUID.fromString(userId);
    }
}
