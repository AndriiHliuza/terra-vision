package com.project.terravision.auth.dto.response;

import com.project.terravision.auth.enums.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreatedResponse {
    private String username;
    private String email;
    private AccountStatus accountStatus;
}
