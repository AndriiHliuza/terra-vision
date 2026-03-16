package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.enums.AccountStatus;
import com.project.terravision.auth.exceptions.user.UserNotFoundException;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.repository.UserRepository;
import com.project.terravision.auth.service.AccountStatusCacheService;
import com.project.terravision.auth.service.InternalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InternalServiceImpl implements InternalService {

    private final UserRepository userRepository;
    private final AccountStatusCacheService accountStatusCacheService;

    @Override
    public AccountStatus getAccountStatus(String userId) {
        User user = userRepository.findById(UUID.fromString(userId)).orElseThrow(
                () -> new UserNotFoundException("User with id=%s not found".formatted(userId))
        );

        accountStatusCacheService.cacheAccountStatus(user.getId(), user.getAccountStatus());
        return user.getAccountStatus();
    }
}
