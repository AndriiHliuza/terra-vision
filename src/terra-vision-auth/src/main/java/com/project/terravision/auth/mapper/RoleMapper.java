package com.project.terravision.auth.mapper;

import com.project.terravision.auth.config.MappingConfig;
import com.project.terravision.auth.dto.RoleClaim;
import com.project.terravision.auth.model.Role;
import org.mapstruct.Mapper;

@Mapper(config = MappingConfig.class)
public interface RoleMapper {
    RoleClaim toRoleClaim(Role role);
}
