package com.project.terravision.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SessionDetails {
    private String ip;
    private String browser;
    private String os;
    private long createdAt;
    private long lastUsedAt;
}
