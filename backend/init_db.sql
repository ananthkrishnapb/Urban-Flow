-- UrbanFlow Database Initialization Script
-- Target Database: PostgreSQL 14+ with PostGIS 3.0+

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Municipal zones with spatial polygons
CREATE TABLE IF NOT EXISTS urban_zones (
    zone_id SERIAL PRIMARY KEY,
    zone_name VARCHAR(100) NOT NULL UNIQUE,
    geometry GEOMETRY(Polygon, 4326) NOT NULL,
    population_density FLOAT NOT NULL,
    avg_annual_rainfall FLOAT NOT NULL
);

-- 2. Time-series infrastructure and environmental telemetry
CREATE TABLE IF NOT EXISTS infrastructure_telemetry (
    record_id SERIAL PRIMARY KEY,
    zone_id INT REFERENCES urban_zones(zone_id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asset_age_years FLOAT NOT NULL,
    material_quality_index FLOAT NOT NULL, -- Scale 0.0 to 1.0
    traffic_load_index FLOAT NOT NULL,     -- Daily average vehicle pass-through index
    soil_moisture FLOAT NOT NULL,          -- Volumetric water content (%)
    vibration_amplitude FLOAT NOT NULL,    -- RMS acceleration (mm/s^2)
    maintenance_cost FLOAT NOT NULL,       -- Continuous target variable (Regression)
    failure_risk_level INT NOT NULL        -- Categorical target (0: Low, 1: Medium, 2: Critical)
);

-- Spatial & temporal indices for ultra-fast query execution
CREATE INDEX IF NOT EXISTS idx_zone_geo ON urban_zones USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON infrastructure_telemetry (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_zone ON infrastructure_telemetry (zone_id);

-- Optional Seed Data for Urban Zones
INSERT INTO urban_zones (zone_name, geometry, population_density, avg_annual_rainfall)
VALUES 
    ('Downtown Grid', ST_GeomFromText('POLYGON((-73.990 40.750, -73.970 40.750, -73.970 40.765, -73.990 40.765, -73.990 40.750))', 4326), 14200.0, 1150.0),
    ('Industrial Wharf', ST_GeomFromText('POLYGON((-74.020 40.730, -73.995 40.730, -73.995 40.745, -74.020 40.745, -74.020 40.730))', 4326), 4500.0, 1280.0),
    ('Bridge Span B', ST_GeomFromText('POLYGON((-73.975 40.700, -73.960 40.700, -73.960 40.715, -73.975 40.715, -73.975 40.700))', 4326), 8900.0, 1310.0),
    ('Metro Tunnel North', ST_GeomFromText('POLYGON((-73.960 40.770, -73.940 40.770, -73.940 40.790, -73.960 40.790, -73.960 40.770))', 4326), 18400.0, 1100.0),
    ('Tech Corridor', ST_GeomFromText('POLYGON((-74.005 40.715, -73.985 40.715, -73.985 40.730, -74.005 40.730, -74.005 40.715))', 4326), 11300.0, 1190.0),
    ('Port Terminal East', ST_GeomFromText('POLYGON((-73.950 40.725, -73.930 40.725, -73.930 40.745, -73.950 40.745, -73.950 40.725))', 4326), 3200.0, 1340.0)
ON CONFLICT (zone_name) DO NOTHING;
