CREATE TABLE features
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id     UUID,
    type          FEATURE_TYPE NOT NULL,

    title         VARCHAR(255),
    description   TEXT,

    geometry      geometry(Geometry, 4326) NOT NULL, -- EPSG:4326 is the standard used by GPS (Global Positioning System).

    fill_color    VARCHAR(7) CHECK (fill_color ~ '^#[0-9A-Fa-f]{6}$'), -- hex color
    border_color  VARCHAR(7) CHECK (border_color ~ '^#[0-9A-Fa-f]{6}$'), -- hex color
    fill_opacity  DECIMAL(3, 2) CHECK (fill_opacity >= 0 AND fill_opacity <= 1),
    border_weight INTEGER CHECK (border_weight >= 0 AND border_weight <= 12),

    radius        DOUBLE PRECISION CHECK (radius > 0),

    valid_from    TIMESTAMPTZ NOT NULL,
    valid_to      TIMESTAMPTZ,
    last_modified TIMESTAMPTZ,

    CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES features (id) ON DELETE SET NULL,
    CONSTRAINT check_valid_boundaries CHECK (valid_to IS NULL OR valid_to > valid_from),
    CONSTRAINT check_last_modified_within_bounds CHECK (
        last_modified IS NULL OR (
            last_modified >= valid_from AND
            (valid_to IS NULL OR last_modified <= valid_to)
            )
        ),
    CONSTRAINT check_last_modified_presence_for_markers_only CHECK (
        (type != 'MARKER' AND last_modified IS NULL) OR
        (type = 'MARKER')
        ),
    CONSTRAINT check_border_weight_absence_for_markers CHECK (
        (type = 'MARKER' AND border_weight IS NULL) OR
        (type != 'MARKER' AND border_weight IS NOT NULL)
        ),
    CONSTRAINT check_radius_presence_for_circles_only CHECK (
        (type = 'CIRCLE' AND radius IS NOT NULL) OR
        (type != 'CIRCLE' AND radius IS NULL)
    ),
    CONSTRAINT check_parent_id_absence_for_markers CHECK (
        (type = 'MARKER' AND parent_id IS NULL) OR
        (type != 'MARKER')
    )
)