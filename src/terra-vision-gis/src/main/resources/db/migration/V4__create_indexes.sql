--- GIST stands for Generalized Search Tree — it's a type of index designed for complex data types that don't have a simple linear order, like geometric shapes.
--- --- USING specifies which index algorithm to use. Without it PostgreSQL defaults to BTREE.
CREATE INDEX features_geometry_idx ON features USING GIST (geometry);
CREATE INDEX features_parent_id_idx ON features (parent_id);
CREATE INDEX features_valid_range_idx ON features (valid_from, valid_to); -- covers only valid_from or both together (valid_from and valid_to)
CREATE INDEX features_valid_to_idx ON features (valid_to); -- covers only valid_to