package com.project.terravision.auth.mapper;

import com.project.terravision.auth.config.MappingConfig;
import com.project.terravision.auth.dto.MeResponse;
import com.project.terravision.auth.dto.UserCreationRequest;
import com.project.terravision.auth.dto.UserCreationResponse;
import com.project.terravision.auth.model.Permission;
import com.project.terravision.auth.model.Role;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.model.enums.AccountState;
import com.project.terravision.auth.model.enums.TokenType;
import com.project.terravision.auth.service.AuthoritiesService;
import org.mapstruct.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@Mapper(
        config = MappingConfig.class,
        uses = { RoleMapper.class },
        imports = { AccountState.class, TokenType.class, Map.class }
)
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "imageId", ignore = true)
    @Mapping(target = "accountState", expression = "java(AccountState.PENDING_VERIFICATION)")
    @Mapping(target = "verifiedAt", ignore = true)
    @Mapping(target = "blockedAt", ignore = true)
    @Mapping(target = "blockedBy", ignore = true)
    @Mapping(target = "blockReason", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "password", ignore = true)  // encoded separately
    User toUser(
            UserCreationRequest userCreationRequest,
            Role role,
            @Context PasswordEncoder passwordEncoder
    );

    @AfterMapping
    default void encodePassword(
            @MappingTarget User user,
            UserCreationRequest request,
            @Context PasswordEncoder passwordEncoder
    ) {
        user.setPassword(passwordEncoder.encode(request.getPassword()));
    }

    UserCreationResponse toUserCreationResponse(User user);

    @Mapping(target = "permissions", ignore = true)
    MeResponse toMeResponse(User user, @Context AuthoritiesService authoritiesService);

    @AfterMapping
    default void mapPermissions(@MappingTarget MeResponse meResponse, User user, @Context AuthoritiesService authoritiesService) {
        if (user.getRole() != null) {
            meResponse.setPermissions(authoritiesService.getUserPermissions(user)
                    .stream()
                    .map(Permission::getName)
                    .toList());
        }
    }
}
