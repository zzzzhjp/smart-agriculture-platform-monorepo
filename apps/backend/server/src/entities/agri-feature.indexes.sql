-- Ensure PostGIS is available before creating geometry columns
CREATE EXTENSION IF NOT EXISTS postgis;

-- Optional: add/repair indexes to match the planned geospatial query patterns exactly
CREATE INDEX IF NOT EXISTS idx_agri_feature_time
  ON crm.agri_feature (start_time DESC, end_time DESC);

CREATE INDEX IF NOT EXISTS idx_agri_feature_attrs
  ON crm.agri_feature USING gin (attrs);
