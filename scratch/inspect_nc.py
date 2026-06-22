import xarray as xr
import numpy as np

nc_path = "raw_data/rainfall/RF25_ind2024_rfp25.nc"
ds = xr.open_dataset(nc_path)
print("=== NetCDF Info ===")
print("Dimensions:", ds.dims)
print("Coords lat range:", ds.LATITUDE.values.min(), "to", ds.LATITUDE.values.max(), "Step:", ds.LATITUDE.values[1] - ds.LATITUDE.values[0])
print("Coords lon range:", ds.LONGITUDE.values.min(), "to", ds.LONGITUDE.values.max(), "Step:", ds.LONGITUDE.values[1] - ds.LONGITUDE.values[0])
print("Time values:", len(ds.TIME.values))
print("Variables:", list(ds.variables.keys()))
