import uuid
from sqlalchemy import Column, String, Float, Date, DateTime, Integer, JSON, Text, ForeignKey, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base, is_sqlite

# Define UUID type based on backend
if is_sqlite:
    from sqlalchemy.types import TypeDecorator, CHAR
    class GUID(TypeDecorator):
        impl = CHAR
        cache_ok = True
        def load_dialect_impl(self, dialect):
            return dialect.type_descriptor(CHAR(36))
        def process_bind_param(self, value, dialect):
            if value is None:
                return value
            elif isinstance(value, uuid.UUID):
                return str(value)
            else:
                return str(uuid.UUID(value))
        def process_result_value(self, value, dialect):
            if value is None:
                return value
            else:
                return uuid.UUID(value)
    UUID_TYPE = GUID
    JSON_TYPE = JSON
else:
    UUID_TYPE = UUID(as_uuid=True)
    JSON_TYPE = JSONB

# Define Geometry type based on backend
if is_sqlite:
    GeometryType = String
else:
    from geoalchemy2 import Geometry
    GeometryType = Geometry

class Region(Base):
    __tablename__ = "regions"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    bounding_box = Column(GeometryType, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    
    observations = relationship("ClimateObservation", back_populates="region", cascade="all, delete-orphan")
    twins = relationship("ClimateTwin", back_populates="region", cascade="all, delete-orphan")
    forecasts = relationship("Forecast", back_populates="region", cascade="all, delete-orphan")
    satellite_layers = relationship("ClimateSatelliteLayer", back_populates="region", cascade="all, delete-orphan")

class DatasetMetadata(Base):
    __tablename__ = "dataset_metadata"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    dataset_name = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False)
    temporal_coverage_start = Column(Date, nullable=False)
    temporal_coverage_end = Column(Date, nullable=False)
    spatial_bounding_box = Column(GeometryType, nullable=True)
    status = Column(String(50), nullable=False, default="active")
    last_ingested_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    source_url = Column(String(1024), nullable=True)
    download_date = Column(Date, nullable=True)
    checksum = Column(String(255), nullable=True)
    coverage_start = Column(Date, nullable=True)
    coverage_end = Column(Date, nullable=True)

class ClimateObservation(Base):
    __tablename__ = "climate_observations"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    region_id = Column(UUID_TYPE, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False, index=True)
    observation_date = Column(Date, nullable=False, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    geom = Column(GeometryType, nullable=False)
    rainfall = Column(Float, nullable=False)
    max_temperature = Column(Float, nullable=False)
    min_temperature = Column(Float, nullable=False)
    source = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    
    __table_args__ = (
        UniqueConstraint("region_id", "observation_date", "latitude", "longitude", name="unique_obs_per_coords_and_date"),
    )
    
    region = relationship("Region", back_populates="observations")

class ClimateSatelliteLayer(Base):
    __tablename__ = "climate_satellite_layers"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    region_id = Column(UUID_TYPE, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False, index=True)
    observation_date = Column(Date, nullable=False, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    lst_temperature = Column(Float, nullable=False)
    source = Column(String(255), nullable=False, default="INSAT")
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    
    __table_args__ = (
        UniqueConstraint("region_id", "observation_date", "latitude", "longitude", name="unique_satellite_layer"),
    )
    
    region = relationship("Region", back_populates="satellite_layers")

class ClimateTwin(Base):
    __tablename__ = "climate_twins"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    region_id = Column(UUID_TYPE, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    grid_data = Column(JSON_TYPE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    
    __table_args__ = (
        UniqueConstraint("region_id", "date", name="unique_twin_per_date"),
    )
    
    region = relationship("Region", back_populates="twins")

class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    region_id = Column(UUID_TYPE, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)
    forecast_date = Column(Date, nullable=False)
    horizon_days = Column(Integer, nullable=False)
    forecast_data = Column(JSON_TYPE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    
    region = relationship("Region", back_populates="forecasts")
    simulations = relationship("Simulation", back_populates="forecast", cascade="all, delete-orphan")
    insights = relationship("ClimateInsight", back_populates="forecast", cascade="all, delete-orphan")

class Scenario(Base):
    __tablename__ = "scenarios"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    rainfall_adjustment = Column(Float, nullable=False)
    temperature_adjustment = Column(Float, nullable=False)
    duration_days = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    
    simulations = relationship("Simulation", back_populates="scenario", cascade="all, delete-orphan")

class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    scenario_id = Column(UUID_TYPE, ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False)
    forecast_id = Column(UUID_TYPE, ForeignKey("forecasts.id", ondelete="CASCADE"), nullable=False)
    simulation_date = Column(Date, nullable=False)
    simulation_data = Column(JSON_TYPE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    
    scenario = relationship("Scenario", back_populates="simulations")
    forecast = relationship("Forecast", back_populates="simulations")
    insights = relationship("ClimateInsight", back_populates="simulation", cascade="all, delete-orphan")

class ClimateInsight(Base):
    __tablename__ = "climate_insights"
    
    id = Column(UUID_TYPE, primary_key=True, default=uuid.uuid4)
    forecast_id = Column(UUID_TYPE, ForeignKey("forecasts.id", ondelete="CASCADE"), nullable=True)
    simulation_id = Column(UUID_TYPE, ForeignKey("simulations.id", ondelete="CASCADE"), nullable=True)
    insight_text = Column(Text, nullable=False)
    summary = Column(JSON_TYPE, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    
    forecast = relationship("Forecast", back_populates="insights")
    simulation = relationship("Simulation", back_populates="insights")
