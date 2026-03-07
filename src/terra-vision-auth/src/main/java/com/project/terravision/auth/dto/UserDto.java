package com.project.terravision.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private UUID id;
    private String username;
    private String email;

    private String firstname;
    private String lastname;

    private String imageId;

    private Instant createdAt;
    private Instant updatedAt;

    private String role;
    private List<String> permissions;
}
