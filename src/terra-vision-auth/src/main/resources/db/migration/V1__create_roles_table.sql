CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    power_level INT NOT NULL DEFAULT 1,
    CONSTRAINT check_power_level_range CHECK (power_level >= 0)
);
