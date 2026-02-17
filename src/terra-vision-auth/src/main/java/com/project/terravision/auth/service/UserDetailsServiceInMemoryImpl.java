package com.project.terravision.auth.service;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Primary
@Component
@RequiredArgsConstructor
public class UserDetailsServiceInMemoryImpl implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;

    @Override
    public @NonNull UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        //todo Load users from database

        // Example: hard-coded users
        if ("John".equals(username)) {
            return User.builder()
                    .username("John")
                    .password(passwordEncoder.encode("12345678"))
                    .roles("USER")
                    .build();
        } else if ("Bob".equals(username)) {
            return User.builder()
                    .username("John")
                    .password(passwordEncoder.encode("12345678"))
                    .roles("ADMIN")
                    .build();
        }

        // Throw exception if user not found
        throw new UsernameNotFoundException("User not found: " + username);
    }
}
