package com.project.terravision.auth.mapper;

import com.project.terravision.auth.config.MappingConfig;
import com.project.terravision.auth.dto.response.MeResponse;
import com.project.terravision.auth.dto.request.CreateUserRequest;
import com.project.terravision.auth.dto.response.UserCreatedResponse;
import com.project.terravision.auth.enums.AccountStatus;
import com.project.terravision.auth.model.Permission;
import com.project.terravision.auth.model.Role;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.service.AuthoritiesService;
import org.mapstruct.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Mapper(
        config = MappingConfig.class,
        uses = {RoleMapper.class},
        imports = {AccountStatus.class}
)
public interface UserMapper {

    // ------------ toUser ------------
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "email", source = "request.email")
    @Mapping(target = "firstname", source = "request.firstname")
    @Mapping(target = "lastname", source = "request.lastname")
    @Mapping(target = "accountStatus", expression = "java(AccountStatus.PENDING_VERIFICATION)")
    @Mapping(target = "role", source = "role")
    User toUser(
            CreateUserRequest request,
            Role role,
            @Context PasswordEncoder passwordEncoder
    );

    // ------------ updateUserFromCreateUserRequest ------------
    @BeanMapping(
            ignoreByDefault = true,
            nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "email", source = "request.email")
    @Mapping(target = "firstname", source = "request.firstname")
    @Mapping(target = "lastname", source = "request.lastname")
    @Mapping(target = "accountStatus", expression = "java(AccountStatus.PENDING_VERIFICATION)")
    void updateUserFromCreateUserRequest(
            CreateUserRequest request,
            @MappingTarget User user,
            @Context PasswordEncoder passwordEncoder
    );

    /*
    * ------------ (AfterMapping) ------------
    * For methods:
    * - toUser
    * - updateUserFromCreateUserRequest
    * */
    @AfterMapping
    default void handlePasswordAndUsernameMapping(
            CreateUserRequest request,
            @MappingTarget User user,
            @Context PasswordEncoder passwordEncoder
    ) {
        user.setPassword(passwordEncoder.encode(request.password()));

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            String username = request.username();
            if (username == null || username.isBlank()) {
                username = request.email().split("@")[0];
                if (username.isBlank()) {
                    throw new IllegalArgumentException("Cannot derive username from email: " + request.email());
                }
            }
            user.setUsername(username);
        }
    }





    // ------------ toUserCreationResponse ------------
    UserCreatedResponse toUserCreatedResponse(User user);


    // ------------ toMeResponse ------------
    @Mapping(target = "permissions", ignore = true)
    MeResponse toMeResponse(User user, @Context AuthoritiesService authoritiesService);

    /*
     * ------------ (AfterMapping) ------------
     * For methods:
     * - toMeResponse
     * */
    @AfterMapping
    default void mapPermissions(User user, @MappingTarget MeResponse meResponse, @Context AuthoritiesService authoritiesService) {
        if (user.getRole() != null) {
            meResponse.setPermissions(authoritiesService.getUserPermissions(user)
                    .stream()
                    .map(Permission::getName)
                    .toList());
        }
    }
}
