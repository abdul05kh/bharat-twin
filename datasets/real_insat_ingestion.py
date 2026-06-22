import os
import uuid
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.models import Region, DatasetMetadata
from backend.database import is_sqlite
from datasets.climate_dataset_validator import ClimateDatasetValidator

try:
    import numpy as np
    import h5py
    HAS_SCIENTIFIC = True
except ImportError:
    HAS_SCIENTIFIC = False

class RealINSATIngestion:
    """Ingestion engine for real INSAT Land Surface Temperature (LST) HDF5 datasets."""
    
    def __init__(self, db: Session, target_region_name: str = "Hyderabad Metropolitan Region"):
        self.db = db
        self.region = db.query(Region).filter(Region.name == target_region_name).first()
        if not self.region:
            raise ValueError(f"Region '{target_region_name}' not found. Seed the database first.")
        
        # Bounding box coordinates for Hyderabad Metropolitan Region
        self.lat_min, self.lat_max = 17.10, 17.65
        self.lon_min, self.lon_max = 78.10, 78.80

        # Target native INSAT coordinate list for Hyderabad bounding box at ~0.04° spacing
        # Generate native points for Hyderabad subgrids (approx 4km footprint)
        self.native_lats = [round(y, 3) for y in np.arange(17.12, 17.65, 0.04)] if HAS_SCIENTIFIC else [17.12, 17.20, 17.30, 17.40, 17.50, 17.60]
        self.native_lons = [round(x, 3) for x in np.arange(78.12, 78.80, 0.04)] if HAS_SCIENTIFIC else [78.12, 78.20, 78.30, 78.40, 78.50, 78.60, 78.70]

    def ingest_lst_h5(self, file_path: str, obs_date: date, source_url: str, download_date: date) -> str:
        """Parses and ingests daily INSAT LST HDF5 data into climate_satellite_layers."""
        # 1. Validate file
        val_result = ClimateDatasetValidator.validate_insat_lst(file_path)
        checksum = val_result["checksum"]
        
        if not HAS_SCIENTIFIC:
            raise RuntimeError("Cannot ingest real INSAT LST data: h5py library is missing from the environment.")
            
        if val_result.get("file_type") != "INSAT HDF5 LST":
            raise ValueError(f"Invalid file format: {val_result.get('file_type')}. Expected 'INSAT HDF5 LST' (HDF5 format). Fallback generation is disabled.")
            
        count = 0
        # HDF5 parsing
        with h5py.File(file_path, 'r') as f:
            lst_var = val_result["dataset_name"]
            dset = f[lst_var]
            data = dset[...]
            
            # Check data dimensions
            if len(data.shape) != 2 or data.shape[0] < len(self.native_lats) or data.shape[1] < len(self.native_lons):
                raise ValueError(f"HDF5 LST dataset shape {data.shape} does not accommodate target region grid dimensions ({len(self.native_lats)}x{len(self.native_lons)}).")
            
            for i, lat in enumerate(self.native_lats):
                for j, lon in enumerate(self.native_lons):
                    # Map to grid index or retrieve native pixel
                    kelvin_val = float(data[i, j])
                    if np.isnan(kelvin_val) or kelvin_val <= 0:
                        continue
                    
                    # Convert Kelvin to Celsius: Celsius = Kelvin - 273.15
                    lst_celsius = kelvin_val - 273.15
                    
                    # Set to native table
                    self._upsert_satellite_layer(obs_date, lat, lon, lst_celsius, "INSAT_LST")
                    count += 1
                    
        # Update/create metadata with provenance info
        self._write_metadata(
            dataset_name="INSAT Land Surface Temperature",
            source="ISRO MOSDAC",
            source_url=source_url,
            download_date=download_date,
            checksum=checksum,
            coverage_start=obs_date,
            coverage_end=obs_date
        )
        return f"Successfully ingested {count} native INSAT LST cells."

    def _upsert_satellite_layer(self, obs_date: date, lat: float, lon: float, lst_val: float, source: str):
        """Internal helper to upsert satellite layers coordinate cells."""
        obs_id = str(uuid.uuid4())
        
        if is_sqlite:
            sql = """
                INSERT INTO climate_satellite_layers 
                (id, region_id, observation_date, latitude, longitude, lst_temperature, source)
                VALUES (:id, :region_id, :obs_date, :lat, :lon, :lst_val, :source)
                ON CONFLICT(region_id, observation_date, latitude, longitude) DO UPDATE SET
                    lst_temperature = EXCLUDED.lst_temperature,
                    source = EXCLUDED.source
            """
        else:
            sql = """
                INSERT INTO climate_satellite_layers 
                (id, region_id, observation_date, latitude, longitude, lst_temperature, source)
                VALUES (:id, :region_id, :obs_date, :lat, :lon, :lst_val, :source)
                ON CONFLICT(region_id, observation_date, latitude, longitude) DO UPDATE SET
                    lst_temperature = EXCLUDED.lst_temperature,
                    source = EXCLUDED.source
            """
        
        self.db.execute(
            text(sql),
            {
                "id": obs_id,
                "region_id": str(self.region.id),
                "obs_date": obs_date,
                "lat": lat,
                "lon": lon,
                "lst_val": lst_val,
                "source": source
            }
        )

    def _write_metadata(self, dataset_name: str, source: str, source_url: str, download_date: date, checksum: str, coverage_start: date, coverage_end: date):
        """Writes or updates dataset provenance metadata."""
        meta = self.db.query(DatasetMetadata).filter(DatasetMetadata.dataset_name == dataset_name).first()
        if not meta:
            meta = DatasetMetadata(
                dataset_name=dataset_name,
                source=source,
                temporal_coverage_start=coverage_start,
                temporal_coverage_end=coverage_end,
                status="active",
                source_url=source_url,
                download_date=download_date,
                checksum=checksum,
                coverage_start=coverage_start,
                coverage_end=coverage_end
            )
            self.db.add(meta)
        else:
            meta.temporal_coverage_start = min(meta.temporal_coverage_start, coverage_start)
            meta.temporal_coverage_end = max(meta.temporal_coverage_end, coverage_end)
            meta.coverage_start = min(meta.coverage_start, coverage_start) if meta.coverage_start else coverage_start
            meta.coverage_end = max(meta.coverage_end, coverage_end) if meta.coverage_end else coverage_end
            meta.source_url = source_url
            meta.download_date = download_date
            meta.checksum = checksum
            meta.last_ingested_at = datetime.now()
            
        self.db.commit()
