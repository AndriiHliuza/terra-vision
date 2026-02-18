package com.project.terravision.auth.service;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserDetailsServiceInMemory2Impl implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;

    @Override
    public @NonNull UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        // Example: hard-coded users
        if ("Sam".equals(username)) {
            List<SimpleGrantedAuthority> roles = new ArrayList<>();
            roles.add(new SimpleGrantedAuthority("ROLE_USER"));
            List<SimpleGrantedAuthority> permissions = new ArrayList<>();
            permissions.add(new SimpleGrantedAuthority("READ_USER"));

            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.addAll(roles);
            authorities.addAll(permissions);

            return User.builder()
                    .username("Sam")
                    .password(passwordEncoder.encode("12345678"))
                    .authorities(authorities)
                    .build();
        } else if ("Robert".equals(username)) {
            List<SimpleGrantedAuthority> roles = new ArrayList<>();
            roles.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            List<SimpleGrantedAuthority> permissions = new ArrayList<>();
            permissions.add(new SimpleGrantedAuthority("READ_USER"));
            permissions.add(new SimpleGrantedAuthority("WRITE_USER"));

            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.addAll(roles);
            authorities.addAll(permissions);

            return User.builder()
                    .username("Robert")
                    .password(passwordEncoder.encode("12345678"))
                    .roles("ADMIN")
                    .authorities(authorities)
                    .build();
        }

        // Throw exception if user not found
        throw new UsernameNotFoundException("User not found: " + username);
    }
}
