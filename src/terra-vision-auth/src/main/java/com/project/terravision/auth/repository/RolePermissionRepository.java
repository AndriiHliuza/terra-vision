package com.project.terravision.auth.repository;

import com.project.terravision.auth.model.RolePermission;
import com.project.terravision.auth.model.id.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {}
