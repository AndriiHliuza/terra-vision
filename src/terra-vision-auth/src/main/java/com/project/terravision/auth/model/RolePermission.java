package com.project.terravision.auth.model;

import com.project.terravision.auth.model.id.RolePermissionId;
import jakarta.persistence.*;
import lombok.*;

@Builder
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "role_permissions")
public class RolePermission {

    @EmbeddedId
    private RolePermissionId id;

    @ManyToOne
    @MapsId("roleId")
    private Role role;

    @ManyToOne
    @MapsId("permissionId")
    private Permission permission;

    public RolePermission(Role role, Permission permission) {
        this.role = role;
        this.permission = permission;
        this.id = new RolePermissionId(role.getId(), permission.getId());
    }

    public static RolePermission of(Role role, Permission permission) {
        return RolePermission.builder()
                .role(role)
                .permission(permission)
                .id(new RolePermissionId(role.getId(), permission.getId()))
                .build();
    }
}
