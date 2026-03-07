package com.project.terravision.auth.dto;

import com.project.terravision.auth.model.enums.AccountState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreationResponse {
    private String username;
    private String email;
    private AccountState accountState;
}
