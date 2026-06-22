from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import List, Optional, Dict, Any

# Region Schemas
class RegionBase(BaseModel):
    name: str

class RegionCreate(RegionBase):
    bounding_box_wkt: str  # WKT string, e.g. POLYGON(...)

class RegionResponse(RegionBase):
    id: UUID
    created_at: datetime
    # We will return bounding box as a geojson or wkt string in routes
    bounding_box: Optional[str] = None
    
    class Config:
        from_attributes = True

# Dataset Metadata Schemas
class DatasetMetadataResponse(BaseModel):
    id: UUID
    dataset_name: str
    source: str
    temporal_coverage_start: date
    temporal_coverage_end: date
    status: str
    last_ingested_at: datetime
    source_url: Optional[str] = None
    download_date: Optional[date] = None
    checksum: Optional[str] = None
    coverage_start: Optional[date] = None
    coverage_end: Optional[date] = None

    class Config:
        from_attributes = True

class ClimateSatelliteLayerResponse(BaseModel):
    id: UUID
    region_id: UUID
    observation_date: date
    latitude: float
    longitude: float
    lst_temperature: float
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

# Climate Observation Schemas
class ClimateObservationResponse(BaseModel):
    id: UUID
    region_id: UUID
    observation_date: date
    latitude: float
    longitude: float
    rainfall: float
    max_temperature: float
    min_temperature: float
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

# Grid Cell Schema for Climate Twin
class GridCellData(BaseModel):
    latitude: float
    longitude: float
    rainfall: float
    max_temperature: float
    min_temperature: float
    timestamp: date

# Climate Twin Schemas
class ClimateTwinResponse(BaseModel):
    id: UUID
    region_id: UUID
    date: date
    grid_data: List[GridCellData]
    created_at: datetime

    class Config:
        from_attributes = True

# Forecast Schemas
class ForecastRequest(BaseModel):
    region_id: UUID
    horizon_days: int = Field(..., description="Forecast horizon in days (7, 15, or 30)")

class DailyForecastItem(BaseModel):
    date: date
    grid_cells: List[GridCellData]

class ForecastResponse(BaseModel):
    id: UUID
    region_id: UUID
    forecast_date: date
    horizon_days: int
    forecast_data: List[DailyForecastItem]
    created_at: datetime

    class Config:
        from_attributes = True

# Scenario Schemas
class ScenarioRequest(BaseModel):
    name: str
    rainfall_adjustment: float = Field(..., description="Percentage change in rainfall (-100 to 100)")
    temperature_adjustment: float = Field(..., description="Absolute change in temperature in degrees Celsius")
    duration_days: int = Field(..., description="Duration of simulation in days")

class ScenarioResponse(BaseModel):
    id: UUID
    name: str
    rainfall_adjustment: float
    temperature_adjustment: float
    duration_days: int
    created_at: datetime

    class Config:
        from_attributes = True

# Simulation Schemas
class SimulationRequest(BaseModel):
    scenario_id: UUID
    forecast_id: UUID

class SimulationResponse(BaseModel):
    id: UUID
    scenario_id: UUID
    forecast_id: UUID
    simulation_date: date
    simulation_data: List[DailyForecastItem]
    created_at: datetime

    class Config:
        from_attributes = True

# Compare Schemas
class DeltaMetric(BaseModel):
    variable: str
    baseline_mean: float
    simulated_mean: float
    delta: float
    percentage_change: Optional[float] = None

class CompareResponse(BaseModel):
    baseline_forecast_id: UUID
    simulated_forecast_id: UUID
    scenario_name: str
    duration_days: int
    rainfall_delta: DeltaMetric
    max_temp_delta: DeltaMetric
    min_temp_delta: DeltaMetric
    daily_comparison: List[Dict[str, Any]]  # Array comparing each day's average values
    grid_delta: List[Dict[str, Any]]       # Spatial delta per grid cell for rendering maps

# Insight Schemas
class InsightRequest(BaseModel):
    forecast_id: Optional[UUID] = None
    simulation_id: Optional[UUID] = None

class InsightResponse(BaseModel):
    id: UUID
    forecast_id: Optional[UUID] = None
    simulation_id: Optional[UUID] = None
    insight_text: str
    summary: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ForecastJobResponse(BaseModel):
    job_id: str
    status: str

class ForecastJobStatusResponse(BaseModel):
    status: str
    result: Optional[ForecastResponse] = None
    error: Optional[str] = None
