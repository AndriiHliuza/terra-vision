-- roles
CREATE INDEX idx_roles_power_level ON roles(power_level);

-- users
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_account_state ON users(account_state);
CREATE INDEX idx_users_blocked_by ON users(blocked_by);
CREATE INDEX idx_users_created_at ON users(created_at);

-- role_permissions
/*
composite primary key (role_id, permission_id) creates an index that works efficiently
when you query by role_id alone or role_id + permission_id together.
But not by permission_id alone — that's why the separate index is needed.
*/
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
