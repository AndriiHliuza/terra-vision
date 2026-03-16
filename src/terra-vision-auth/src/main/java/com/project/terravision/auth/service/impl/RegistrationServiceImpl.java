package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.dto.request.CreateUserRequest;
import com.project.terravision.auth.dto.response.UserCreatedResponse;
import com.project.terravision.auth.exceptions.account.AccountActiveException;
import com.project.terravision.auth.exceptions.account.AccountBlockedException;
import com.project.terravision.auth.exceptions.user.UserAlreadyExists;
import com.project.terravision.auth.exceptions.user.UserNotFoundException;
import com.project.terravision.auth.mapper.UserMapper;
import com.project.terravision.auth.model.Role;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.enums.AccountStatus;
import com.project.terravision.auth.enums.EmailVerificationType;
import com.project.terravision.auth.enums.SystemRole;
import com.project.terravision.auth.repository.RoleRepository;
import com.project.terravision.auth.repository.UserRepository;
import com.project.terravision.auth.service.AccountStatusCacheService;
import com.project.terravision.auth.service.VerificationEmailService;
import com.project.terravision.auth.service.VerificationTokenService;
import com.project.terravision.auth.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final PasswordEncoder passwordEncoder;

    private final VerificationEmailService verificationEmailService;
    private final VerificationTokenService verificationTokenService;

    private final AccountStatusCacheService accountStatusCacheService;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final UserMapper userMapper;

    @Override
    public UserCreatedResponse register(CreateUserRequest request) {
        return userRepository.findByEmail(request.email())
                .map(user -> handleExistingUser(user, request))
                .orElseGet(() -> createNewUser(request));
    }

    @Override
    public void verifyEmail(String verificationToken) {
        UUID userId = verificationTokenService.validateToken(verificationToken, EmailVerificationType.REGISTRATION_VERIFICATION);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User with id '%s' not found".formatted(userId)));
        validateAccountStatusForEmailVerification(user);
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
        accountStatusCacheService.cacheAccountStatus(userId, AccountStatus.ACTIVE);
        log.debug("Email verified for user with email: '{}'", user.getEmail());
    }


    // ------------ private methods ------------

    /**
     * Handles a registration attempt when a user with the provided email already exists.
     *
     * <p>This method determines whether the existing account can continue the
     * registration flow or if the request should be rejected.</p>
     *
     * @param user the existing user found by email
     * @param request the registration request containing user's data required for registration
     * @return a {@link UserCreatedResponse} representing the registered user
     */
    private UserCreatedResponse handleExistingUser(User user, CreateUserRequest request) {
        validateAccountStatusForRegistration(user); // throws for ACTIVE, BLOCKED
        updatedExistingUser(user, request); // only PENDING_VERIFICATION and DEACTIVATED reach here
        verificationEmailService.sendVerificationEmail(user.getEmail(), EmailVerificationType.REGISTRATION_VERIFICATION);
        return userMapper.toUserCreatedResponse(user);
    }

    /**
     * Creates a new user account from the registration request.
     *
     * <p>The method assigns the default system role ({@code USER}),
     * encodes the user's password, persists the user in the database,
     * and sends a registration email verification.</p>
     *
     * @param request the registration request containing user's data required for creating a new user
     * @return a {@link UserCreatedResponse} representing the newly created user
     * @throws IllegalStateException if the default system role cannot be found
     */
    private UserCreatedResponse createNewUser(CreateUserRequest request) {
        Role defaultRole = roleRepository
                .findByName(SystemRole.USER.name())
                .orElseThrow(() -> new IllegalStateException("Default role not found in database"));
        User user = userRepository.save(userMapper.toUser(request, defaultRole, passwordEncoder));
        accountStatusCacheService.cacheAccountStatus(user.getId(), user.getAccountStatus());
        verificationEmailService.sendVerificationEmail(user.getEmail(), EmailVerificationType.REGISTRATION_VERIFICATION);
        return userMapper.toUserCreatedResponse(user);
    }

    /**
     * Updates an existing user with the data from a new registration request.
     *
     * <p>This method is used when a user attempts to register again while their
     * account is still in a state that allows continuation of the registration
     * process (e.g., {@code PENDING_VERIFICATION} or {@code DEACTIVATED}).</p>
     *
     * @param user the existing user entity to update
     * @param request the registration request containing updated user information
     */
    private void updatedExistingUser(User user, CreateUserRequest request) {
        userMapper.updateUserFromCreateUserRequest(request, user, passwordEncoder);
        accountStatusCacheService.cacheAccountStatus(user.getId(), user.getAccountStatus());
        userRepository.save(user);
    }

    /**
     * Validates whether the user's account status allows a new registration attempt.
     *
     * <p>This method ensures that duplicate accounts cannot be created while still
     * allowing users who have not completed verification or whose accounts were
     * deactivated to continue the registration process.</p>
     *
     * @param user the existing user whose account status is being validated
     *
     * @throws UserAlreadyExists if account is already active
     * @throws AccountBlockedException if account is blocked
     */
    private void validateAccountStatusForRegistration(User user) {
        switch (user.getAccountStatus()) {
            case ACTIVE -> throw new UserAlreadyExists(
                    "[Registration] Email: '%s', Account status: '%s' - User already exists".formatted(
                            user.getEmail(),
                            user.getAccountStatus()
                    )
            );

            case PENDING_VERIFICATION -> log.debug(
                    "[Registration] Email: '{}', Account status: '{}' - Account already exists and pending verification",
                    user.getEmail(),
                    user.getAccountStatus()
            );

            case DEACTIVATED -> log.debug(
                    "[Registration] Email: '{}', Account status: '{}' - Account is deactivated, reactivating...",
                    user.getEmail(),
                    user.getAccountStatus()
            );

            case BLOCKED -> throw new AccountBlockedException(
                    "[Registration] Email: '%s', Account status: '%s' - Account is blocked"
                            .formatted(user.getEmail(), user.getAccountStatus()),
                    user.getBlockedAt(),
                    user.getBlockReason());
        }
    }

    /**
     * Validates whether the user's account status allows email verification.
     *
     * <p>This method ensures that email verification is performed only for
     * accounts that are eligible to be activated.</p>
     *
     * @param user the user whose account status is being validated
     *
     * @throws AccountActiveException if account is already active
     * @throws AccountBlockedException if account is blocked
     */
    private void validateAccountStatusForEmailVerification(User user) {
        switch (user.getAccountStatus()) {
            case ACTIVE -> throw new AccountActiveException(
                    "[Email Verification] Email: '%s', Account status: '%s' - Account already activated".formatted(
                            user.getEmail(),
                            user.getAccountStatus()
                    )
            );

            case PENDING_VERIFICATION -> log.debug(
                    "[Email Verification] Email: '{}', Account status: '{}' - Proceeding with verification",
                    user.getEmail(),
                    user.getAccountStatus()
            );

            case DEACTIVATED -> log.debug(
                    "[Email Verification] Email: '{}', Account status: '{}' - Account is deactivated, reactivating...",
                    user.getEmail(),
                    user.getAccountStatus()
            );

            case BLOCKED -> throw new AccountBlockedException(
                    "[Email Verification] Email: '%s', Account status: '%s' - Account is blocked".formatted(
                            user.getEmail(),
                            user.getAccountStatus()
                    ),
                    user.getBlockedAt(),
                    user.getBlockReason());
        }
    }
}
