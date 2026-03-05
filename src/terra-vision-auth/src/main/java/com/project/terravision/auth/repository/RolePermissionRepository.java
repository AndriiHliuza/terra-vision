package com.project.terravision.auth.repository;

import com.project.terravision.auth.model.RolePermission;
import com.project.terravision.auth.model.id.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {
    List<RolePermission> findAllByRoleId(UUID roleId);
}
