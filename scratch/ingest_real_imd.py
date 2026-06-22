import sys
import os
from datetime import date

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal
from backend.models import ClimateObservation, Region
from datasets.real_imd_ingestion import RealIMDIngestion

db = SessionLocal()
try:
    print("=== STARTING OFFICIAL IMD DATA INGESTION ===")
    
    # 1. Clear synthetic/mock climate observations
    deleted_rows = db.query(ClimateObservation).delete()
    db.commit()
    print(f"Deleted {deleted_rows} old synthetic observations from climate_observations.")
    
    # Check region
    region = db.query(Region).filter(Region.name == "Hyderabad Metropolitan Region").first()
    if not region:
        print("Creating region since it does not exist...")
        region = Region(
            name="Hyderabad Metropolitan Region",
            bounding_box="POLYGON((78.10 17.10, 78.80 17.10, 78.80 17.65, 78.10 17.65, 78.10 17.10))"
        )
        db.add(region)
        db.commit()
        db.refresh(region)
        
    # 2. Ingest years 2023, 2024, 2025
    years = [2023, 2024, 2025]
    imd_ingestion = RealIMDIngestion(db, "Hyderabad Metropolitan Region")
    
    for year in years:
        print(f"\n--- Ingesting Year {year} ---")
        
        rainfall_nc = f"raw_data/rainfall/RF25_ind{year}_rfp25.nc"
        max_temp_grd = f"raw_data/temperature_max/Maxtemp_MaxT_{year}.GRD"
        min_temp_grd = f"raw_data/temperature_min/Mintemp_MinT_{year}.GRD"
        
        # Check files
        if not os.path.exists(rainfall_nc):
            print(f"ERROR: Rainfall file {rainfall_nc} not found.")
            continue
        if not os.path.exists(max_temp_grd) or not os.path.exists(min_temp_grd):
            print(f"ERROR: Temperature files for {year} not found.")
            continue
            
        print(f"Ingesting Rainfall NetCDF: {rainfall_nc}...")
        res_rain = imd_ingestion.ingest_rainfall_nc(
            file_path=rainfall_nc,
            source_url=f"https://imdpune.gov.in/rainfall/RF25_ind{year}_rfp25.nc",
            download_date=date(2026, 6, 21)
        )
        print("Rainfall Ingestion Result:", res_rain)
        
        print(f"Ingesting Temperature Binary Grids: {max_temp_grd} and {min_temp_grd}...")
        res_temp = imd_ingestion.ingest_temperature_binary(
            max_temp_path=max_temp_grd,
            min_temp_path=min_temp_grd,
            year=year,
            source_url=f"https://imdpune.gov.in/temp/Maxtemp_MaxT_{year}.GRD",
            download_date=date(2026, 6, 21)
        )
        print("Temperature Ingestion Result:", res_temp)

    # 3. Query DB to generate the report metrics
    print("\n=== INGESTION VERIFICATION QUERY ===")
    records = db.query(ClimateObservation).order_by(ClimateObservation.observation_date.asc()).all()
    num_obs = len(records)
    print(f"Total observations in DB: {num_obs}")
    
    if num_obs > 0:
        earliest_date = records[0].observation_date
        latest_date = records[-1].observation_date
        print(f"Earliest Date: {earliest_date}")
        print(f"Latest Date: {latest_date}")
        
        sources = set(r.source for r in records)
        print(f"Unique Source tags in DB: {sources}")
        
        # Extract unique grid cells coordinates
        cells = set((r.latitude, r.longitude) for r in records)
        print(f"Number of distinct Hyderabad grid cells: {len(cells)}")
        print("Coordinates of extracted grid cells:")
        for lat, lon in sorted(cells):
            # Count observations for this cell
            cell_obs = [r for r in records if r.latitude == lat and r.longitude == lon]
            print(f"  Grid Cell: {lat:.2f}°N, {lon:.2f}°E | Obs Count: {len(cell_obs)}")
            
    else:
        print("ERROR: No observations found in database after ingestion!")

finally:
    db.close()
