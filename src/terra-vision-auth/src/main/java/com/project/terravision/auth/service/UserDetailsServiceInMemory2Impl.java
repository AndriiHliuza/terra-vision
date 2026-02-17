package com.project.terravision.auth.service;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserDetailsServiceInMemory2Impl implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;

    @Override
    public @NonNull UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        // Example: hard-coded users
        if ("Sam".equals(username)) {
            return User.builder()
                    .username("Sam")
                    .password(passwordEncoder.encode("12345678"))
                    .roles("USER")
                    .build();
        } else if ("Robert".equals(username)) {
            return User.builder()
                    .username("Robert")
                    .password(passwordEncoder.encode("12345678"))
                    .roles("ADMIN")
                    .build();
        }

        // Throw exception if user not found
        throw new UsernameNotFoundException("User not found: " + username);
    }
}
