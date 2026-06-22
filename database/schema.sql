-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    bounding_box GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dataset Metadata table
CREATE TABLE IF NOT EXISTS dataset_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_name VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    temporal_coverage_start DATE NOT NULL,
    temporal_coverage_end DATE NOT NULL,
    spatial_bounding_box GEOMETRY(Polygon, 4326),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    last_ingested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_url VARCHAR(1024),
    download_date DATE,
    checksum VARCHAR(255),
    coverage_start DATE,
    coverage_end DATE
);

-- Climate Observations table
CREATE TABLE IF NOT EXISTS climate_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    observation_date DATE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    rainfall DOUBLE PRECISION NOT NULL,
    max_temperature DOUBLE PRECISION NOT NULL,
    min_temperature DOUBLE PRECISION NOT NULL,
    source VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_obs_per_coords_and_date UNIQUE (region_id, observation_date, latitude, longitude)
);

-- Climate Twins table
CREATE TABLE IF NOT EXISTS climate_twins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    grid_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_twin_per_date UNIQUE (region_id, date)
);

-- Climate Satellite Layers table (INSAT)
CREATE TABLE IF NOT EXISTS climate_satellite_layers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    observation_date DATE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    lst_temperature DOUBLE PRECISION NOT NULL,
    source VARCHAR(255) NOT NULL DEFAULT 'INSAT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_satellite_layer UNIQUE (region_id, observation_date, latitude, longitude)
);

-- Forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    horizon_days INTEGER NOT NULL CHECK (horizon_days IN (7, 15, 30)),
    forecast_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    rainfall_adjustment DOUBLE PRECISION NOT NULL, -- percentage change, e.g. -20 for -20%
    temperature_adjustment DOUBLE PRECISION NOT NULL, -- degree change, e.g. +3.0 for +3C
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    forecast_id UUID NOT NULL REFERENCES forecasts(id) ON DELETE CASCADE,
    simulation_date DATE NOT NULL,
    simulation_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Climate Insights table
CREATE TABLE IF NOT EXISTS climate_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_id UUID REFERENCES forecasts(id) ON DELETE CASCADE,
    simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
    insight_text TEXT NOT NULL,
    summary JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_reference CHECK (forecast_id IS NOT NULL OR simulation_id IS NOT NULL)
);

-- Spatial Indexes
CREATE INDEX IF NOT EXISTS idx_regions_bounding_box ON regions USING GIST (bounding_box);
CREATE INDEX IF NOT EXISTS idx_dataset_metadata_box ON dataset_metadata USING GIST (spatial_bounding_box);
CREATE INDEX IF NOT EXISTS idx_climate_obs_geom ON climate_observations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_climate_obs_date ON climate_observations (observation_date);
CREATE INDEX IF NOT EXISTS idx_climate_obs_coords ON climate_observations (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_climate_satellite_date ON climate_satellite_layers (observation_date);
CREATE INDEX IF NOT EXISTS idx_climate_satellite_coords ON climate_satellite_layers (latitude, longitude);
