package com.project.terravision.gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SanitizedAuthenticationResponse {
    private UUID userId;
    private String username;
    private String email;
}
