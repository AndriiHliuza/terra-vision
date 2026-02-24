-- 1. Insert Roles with Power Levels
INSERT INTO roles (name, description, power_level) VALUES
    ('USER', 'Standard user with profile access', 10),
    ('ADMIN', 'Staff member with user management rights', 100),
    ('SUPER_ADMIN', 'Full system access and role management', 1000);

-- 2. Insert Permissions
INSERT INTO permissions (name, description) VALUES
    ('user:create', 'Can create new users'),
    ('user:update', 'Can edit other users'),
    ('user:delete', 'Can remove users from system'),
    ('role:create', 'Can create custom roles'),
    ('role:update', 'Can modify role permissions and power_level'),
    ('role:delete', 'Can delete custom roles');


-- 3. Assign Permissions to Roles (role_permissions)

------ 1. Give all existing permissions to SUPER_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING; -- Prevents errors if some are already linked

------ 2. Give all existing permissions to ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;