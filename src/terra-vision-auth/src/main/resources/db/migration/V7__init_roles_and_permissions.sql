-- 1. Insert Roles with Power Levels
INSERT INTO roles (name, description, power_level, is_system_role) VALUES
    ('USER', 'Standard user with profile access', 10, TRUE),
    ('ADMIN', 'Staff member with user management rights', 10000, TRUE),
    ('SUPER_ADMIN', 'Full system access and role management', 100000, TRUE);

-- 2. Insert Permissions
INSERT INTO permissions (name, description) VALUES
    ('user:create', 'Can create new users'),
    ('user:update', 'Can edit other users'),
    ('user:delete', 'Can remove users from system'),
    ('role:create', 'Can create custom roles with power_level lower then the power_level of the role that creates custom role.'),
    ('role:update', 'Can modify role permissions and power_level. power_level should be lower then power_level of the role that modifies custom role.'),
    ('role:delete', 'Can delete custom roles. power_level should be lower then power_level of the role that deletes custom role.');


-- 3. Assign Permissions to Roles (role_permissions)

------ 1. Give all existing permissions to ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

------ 2. Give all existing permissions to SUPER_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING; -- Prevents errors if some are already linked
