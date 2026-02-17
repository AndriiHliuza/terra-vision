package com.project.terravision.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class AuthenticationResponse {
    private UUID userId;
    private String username;
    private String accessToken;
    private String refreshToken;
}
