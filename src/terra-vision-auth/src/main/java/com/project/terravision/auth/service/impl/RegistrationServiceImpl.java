package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.dto.UserCreationRequest;
import com.project.terravision.auth.dto.UserCreationResponse;
import com.project.terravision.auth.exceptions.UserAlreadyExists;
import com.project.terravision.auth.exceptions.UserNotFoundException;
import com.project.terravision.auth.mapper.UserMapper;
import com.project.terravision.auth.model.Role;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.model.enums.AccountState;
import com.project.terravision.auth.model.enums.SystemRole;
import com.project.terravision.auth.repository.RoleRepository;
import com.project.terravision.auth.repository.UserRepository;
import com.project.terravision.auth.service.EmailService;
import com.project.terravision.auth.service.EmailTokenService;
import com.project.terravision.auth.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.helpers.MessageFormatter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final EmailService emailService;
    private final EmailTokenService emailTokenService;

    private final UserMapper userMapper;

    @Override
    public UserCreationResponse createUserAccount(UserCreationRequest userCreationRequest) {
        if (userRepository.existsByEmail(userCreationRequest.getEmail())) {
            throw new UserAlreadyExists(
                    MessageFormatter.format(
                    "User with email '{}' already exists",
                    userCreationRequest.getEmail()).getMessage());
        }

        Role defaultRole = roleRepository
                .findByName(SystemRole.USER.name())
                .orElseThrow(() -> new IllegalStateException("Default role not found in database"));
        User user = userRepository.save(userMapper.toUser(userCreationRequest, defaultRole, passwordEncoder));

        generateAndSendVerificationTokenToEmail(user);
        return userMapper.toUserCreationResponse(user);
    }

    public UserCreationResponse resendConfirmationEmail(UserCreationRequest userCreationRequest) {
        String email = userCreationRequest.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        MessageFormatter.format("User with email '{}' not found", email).getMessage())
                );
        generateAndSendVerificationTokenToEmail(user);
        return userMapper.toUserCreationResponse(user);
    }

    @Override
    public UserCreationResponse confirmEmail(String emailVerificationToken) {
        UUID userId = emailTokenService.validateAndConsumeToken(emailVerificationToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(
                        MessageFormatter.format("User with id '{}' already exists", userId).getMessage())
                );
        user.setAccountState(AccountState.ACTIVE);
        userRepository.save(user);
        log.info("Account verified for user with id: {}", userId);
        return userMapper.toUserCreationResponse(user);
    }

    private void generateAndSendVerificationTokenToEmail(User user) {
        String verificationToken = emailTokenService.generateAndSaveToken(user.getId());
        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), verificationToken);
    }
}
