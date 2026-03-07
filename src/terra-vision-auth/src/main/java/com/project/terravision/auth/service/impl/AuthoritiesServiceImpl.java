package com.project.terravision.auth.service.impl;

import com.project.terravision.auth.model.Permission;
import com.project.terravision.auth.model.Role;
import com.project.terravision.auth.model.RolePermission;
import com.project.terravision.auth.model.User;
import com.project.terravision.auth.repository.RolePermissionRepository;
import com.project.terravision.auth.service.AuthoritiesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthoritiesServiceImpl implements AuthoritiesService {

    private final RolePermissionRepository rolePermissionRepository;

    @Override
    public Set<Permission> getUserPermissions(User user) {
        Role role = user.getRole();
        return rolePermissionRepository.findAllByRoleId(role.getId())
                .stream()
                .map(RolePermission::getPermission)
                .collect(Collectors.toSet());
    }
}
