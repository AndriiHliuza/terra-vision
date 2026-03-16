package com.project.terravision.auth.mapper;

import com.project.terravision.auth.config.MappingConfig;
import com.project.terravision.auth.dto.response.AuthenticationResponse;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.enums.JwtType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Map;

@Mapper(
        config = MappingConfig.class,
        imports = { JwtType.class }
)
public interface AuthenticationMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "accessToken", expression = "java(tokens.get(JwtType.ACCESS.name()))")
    @Mapping(target = "refreshToken", expression = "java(tokens.get(JwtType.REFRESH.name()))")
    AuthenticationResponse toAuthenticationResponse(User user, Map<String, String> tokens);

}
