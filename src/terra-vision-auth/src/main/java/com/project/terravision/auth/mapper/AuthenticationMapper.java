package com.project.terravision.auth.mapper;

import com.project.terravision.auth.config.MappingConfig;
import com.project.terravision.auth.dto.AuthenticationResponse;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.model.enums.TokenType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Map;

@Mapper(
        config = MappingConfig.class,
        imports = { TokenType.class, Map.class }
)
public interface AuthenticationMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "accessToken", expression = "java(tokens.get(TokenType.ACCESS.name()))")
    @Mapping(target = "refreshToken", expression = "java(tokens.get(TokenType.REFRESH.name()))")
    AuthenticationResponse toAuthenticationResponse(User user, Map<String, String> tokens);

}
