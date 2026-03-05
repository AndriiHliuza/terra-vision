package com.project.terravision.auth.service;

import com.project.terravision.auth.dto.UserCreationRequest;
import com.project.terravision.auth.dto.UserCreationResponse;
import com.project.terravision.auth.exceptions.UserAlreadyExists;
import com.project.terravision.auth.model.Role;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.model.enums.DefaultRoles;
import com.project.terravision.auth.repository.RoleRepository;
import com.project.terravision.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public UserCreationResponse createUser(UserCreationRequest userCreationRequest) {
        if (userRepository.existsByEmail(userCreationRequest.getEmail())) {
            throw new UserAlreadyExists(userCreationRequest.getEmail());
        }

        Role defaultRole = roleRepository.findByName(DefaultRoles.USER.name())
                .orElseThrow(() -> new IllegalStateException("Default role not found in database"));

        String encodedPassword = passwordEncoder.encode(userCreationRequest.getPassword());
        User user = userRepository.save(new User(
                userCreationRequest.getUsername(),
                userCreationRequest.getEmail(),
                encodedPassword,
                userCreationRequest.getFirstname(),
                userCreationRequest.getLastname(),
                defaultRole
        ));

        // todo Send email for account verification

        return new UserCreationResponse(user.getUsername(), user.getEmail());
    }
}
