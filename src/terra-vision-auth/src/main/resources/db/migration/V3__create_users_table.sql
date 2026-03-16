CREATE TABLE users (
    id            UUID PRIMARY KEY       DEFAULT gen_random_uuid(),

    username      VARCHAR(255)  NOT NULL UNIQUE,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,

    firstname     VARCHAR(255),
    lastname      VARCHAR(255),
    image_id      VARCHAR(512),

    -- Account state
    account_status ACCOUNT_STATUS NOT NULL DEFAULT 'PENDING_VERIFICATION',

    -- Audit Timestamps & Metadata
    verified_at   TIMESTAMPTZ            DEFAULT NULL,
    blocked_at    TIMESTAMPTZ            DEFAULT NULL,
    blocked_by    UUID,
    block_reason  TEXT,

    -- System Timestamps
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    role_id       UUID          NOT NULL,

    -- Constraints
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT,
    CONSTRAINT fk_blocked_by FOREIGN KEY (blocked_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT check_block_consistency CHECK (
        (
            account_status = 'BLOCKED'
                AND blocked_at IS NOT NULL
                AND blocked_by IS NOT NULL
        )
            OR
        (
            account_status <> 'BLOCKED'
                AND blocked_at IS NULL
                AND blocked_by IS NULL
                AND block_reason IS NULL
        )
    )
);