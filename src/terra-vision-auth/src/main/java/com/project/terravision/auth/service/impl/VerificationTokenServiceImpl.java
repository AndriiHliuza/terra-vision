package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.config.properties.MailProperties;
import com.project.terravision.auth.exceptions.verification.InvalidVerificationToken;
import com.project.terravision.auth.enums.EmailVerificationType;
import com.project.terravision.auth.service.VerificationTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationTokenServiceImpl implements VerificationTokenService {
    private static final String VERIFY_PREFIX = "verify:";
    private static final String LATEST_PREFIX = "latest:";

    private final MailProperties mailProperties;
    private final RedisTemplate<String, String> redisTemplate;

    /**
     * Generates a new email verification token and stores it in Redis.
     *
     * <p>The method creates a unique token associated with the provided user ID
     * and verification type. Two Redis entries are created:</p>
     *
     * <ul>
     *     <li>
     *         <p></p><b>Token key</b> – maps the generated token to the user ID.
     *         <p></p><b>Example of the token key:</b> verify:registration-email-verification:token
     *         <p></p><b>Example of the token key:</b> verify:registration-email-verification:token
     *     </li>
     *     <li>
     *         <b>Latest token key</b> – maps the user ID to the most recently issued token.
     *     </li>
     * </ul>
     *
     * <p>This design ensures that only the latest verification token for a user
     * is considered valid. If a new token is generated (e.g., user requests another
     * verification email), previously issued tokens automatically become invalid.</p>
     *
     * <p>Both keys expire automatically based on the configured verification expiration time.</p>
     *
     * @param userId the ID as {@link UUID} of the user for whom the verification token is generated
     * @param verificationType the type as {@link EmailVerificationType} of verification process
     *
     * @return the generated verification token that should be sent to the user
     */
    @Override
    public String generateAndSaveToken(UUID userId, EmailVerificationType verificationType) {
        String token = UUID.randomUUID().toString();
        Duration expiration = mailProperties.getVerificationProps().getExpiration();

        String commonKeyPrefix = VERIFY_PREFIX.concat(getVerificationTypePrefix(verificationType));

        String tokenKey = commonKeyPrefix.concat(token);
        redisTemplate.opsForValue().set(tokenKey, userId.toString(), expiration);

        String latestKey = commonKeyPrefix.concat(LATEST_PREFIX).concat(userId.toString());
        redisTemplate.opsForValue().set(latestKey, token, expiration);

        log.debug("Verification token generated for user with id: '{}', verification type: '{}'", userId, verificationType);
        return token;
    }

    /**
     * Validates an email verification token and returns the associated user ID.
     *
     * <p>The validation process performs the following checks:</p>
     * <ul>
     *     <li>Ensures the token exists in Redis.</li>
     *     <li>Ensures the token is the most recently issued token for the user.</li>
     * </ul>
     *
     * <p>If the token is valid, both Redis entries (the token mapping and the
     * latest-token reference) are deleted to prevent token reuse.</p>
     *
     * @param token the email verification token to validate
     * @param verificationType the type as {@link EmailVerificationType} of verification process associated with the token
     *
     * @return the ID as {@link UUID} of the user associated with the token
     *
     * @throws InvalidVerificationToken if the token does not exist, has expired, or is not the latest issued token
     */
    @Override
    public UUID validateToken(String token, EmailVerificationType verificationType) {
        String commonKeyPrefix = VERIFY_PREFIX.concat(getVerificationTypePrefix(verificationType));

        String tokenKey = commonKeyPrefix.concat(token);
        String userId = redisTemplate.opsForValue().get(tokenKey);

        if (userId == null) throw new InvalidVerificationToken();

        String latestKey = commonKeyPrefix.concat(LATEST_PREFIX).concat(userId);
        String latestToken = redisTemplate.opsForValue().get(latestKey);

        if (!token.equals(latestToken)) throw new InvalidVerificationToken();

        redisTemplate.delete(tokenKey);
        redisTemplate.delete(latestKey);

        log.debug("Verification token validated for user with id: '{}', Verification type: '{}'", userId, verificationType);
        return UUID.fromString(userId);
    }

    private String getVerificationTypePrefix(EmailVerificationType verificationType) {
        return verificationType.name().toLowerCase()
                .replace("_", "-")
                .concat(":");
    }
}
