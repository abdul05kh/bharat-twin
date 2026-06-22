import os
from datetime import datetime, timedelta

# Fallback imports to prevent crashes when Windows App Control blocks C-extensions
try:
    import numpy as np
    import pandas as pd
    import xarray as xr
    HAS_SCIENTIFIC_STACK = True
except ImportError as e:
    print(f"WARNING: Scientific python stack failed to import ({e}). Falling back to pure Python mocks.")
    HAS_SCIENTIFIC_STACK = False

def generate_mock_datasets(output_dir: str, start_year: int = 2024, end_year: int = 2024):
    os.makedirs(output_dir, exist_ok=True)
    
    if HAS_SCIENTIFIC_STACK:
        # Grid configurations
        # Rainfall: 0.25° grid for Hyderabad bounding box (17.10 to 17.65 Lat, 78.10 to 78.80 Lon)
        rain_lats = np.arange(17.0, 17.75, 0.25)
        rain_lons = np.arange(78.0, 79.0, 0.25)
        
        # Temperature: 1.0° grid (IMD standards: 31x31 grid from 7.5N-37.5N, 67.5E-97.5E)
        temp_lats = np.arange(7.5, 38.5, 1.0)
        temp_lons = np.arange(67.5, 98.5, 1.0)
        
        # Temporal range
        dates = pd.date_range(start=f"{start_year}-01-01", end=f"{end_year}-12-31", freq="D")
        num_days = len(dates)
        
        # --- 1. Generate Rainfall NetCDF (0.25 degree) ---
        print("Generating mock rainfall NetCDF dataset...")
        rain_data = np.zeros((num_days, len(rain_lats), len(rain_lons)))
        for i, date in enumerate(dates):
            day_of_year = date.dayofyear
            base_rain = 15.0 * np.exp(-((day_of_year - 210) / 45) ** 2) if 120 < day_of_year < 300 else 0.5
            rain_data[i, :, :] = np.random.gamma(shape=2.0, scale=base_rain/2.0, size=(len(rain_lats), len(rain_lons)))
        
        ds_rain = xr.Dataset(
            {
                "rainfall": (["time", "lat", "lon"], rain_data)
            },
            coords={
                "time": dates,
                "lat": rain_lats,
                "lon": rain_lons
            }
        )
        ds_rain.to_netcdf(os.path.join(output_dir, f"imd_rainfall_{start_year}.nc"))
        
        # --- 2. Generate Temperature Binary Grids (1.0 degree) ---
        print("Generating mock max/min temperature binary files...")
        max_temp_data = np.zeros((num_days, 31, 31), dtype=np.float32)
        min_temp_data = np.zeros((num_days, 31, 31), dtype=np.float32)
        
        for i, date in enumerate(dates):
            day_of_year = date.dayofyear
            base_max = 30.0 + 12.0 * np.exp(-((day_of_year - 135) / 40) ** 2)
            base_min = 15.0 + 10.0 * np.sin((day_of_year - 100) * 2 * np.pi / 365)
            
            for lat_idx, lat in enumerate(temp_lats):
                lat_effect = (20.0 - lat) * 0.2
                max_temp_data[i, lat_idx, :] = base_max + lat_effect + np.random.normal(0, 1.5, size=31)
                min_temp_data[i, lat_idx, :] = base_min + lat_effect + np.random.normal(0, 1.2, size=31)
                
        max_temp_file = os.path.join(output_dir, f"max_temp_{start_year}.bin")
        min_temp_file = os.path.join(output_dir, f"min_temp_{start_year}.bin")
        
        with open(max_temp_file, "wb") as f:
            max_temp_data.tofile(f)
            
        with open(min_temp_file, "wb") as f:
            min_temp_data.tofile(f)
            
        print(f"Mock datasets saved to {output_dir}")
    else:
        # Create text marker files to satisfy ingestion checks
        print("Creating placeholder text files for ingestion scaffolding...")
        with open(os.path.join(output_dir, f"imd_rainfall_{start_year}.nc"), "w") as f:
            f.write("Rainfall NetCDF placeholder (numpy/xarray blocked by Windows policy)")
        with open(os.path.join(output_dir, f"max_temp_{start_year}.bin"), "w") as f:
            f.write("Max Temp Binary placeholder (numpy/xarray blocked by Windows policy)")
        with open(os.path.join(output_dir, f"min_temp_{start_year}.bin"), "w") as f:
            f.write("Min Temp Binary placeholder (numpy/xarray blocked by Windows policy)")
        print(f"Placeholder files created in {output_dir}")

if __name__ == "__main__":
    generate_mock_datasets("./raw")

