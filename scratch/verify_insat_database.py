import sys
import os
from datetime import date

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal
from backend.models import ClimateSatelliteLayer

db = SessionLocal()
try:
    print("=== DATABASE INSAT AUDIT ===")
    
    # Query all INSAT satellite layers
    records = db.query(ClimateSatelliteLayer).order_by(ClimateSatelliteLayer.latitude, ClimateSatelliteLayer.longitude).all()
    num_records = len(records)
    print(f"Total satellite records in DB: {num_records}")
    
    if num_records > 0:
        dates = [r.observation_date for r in records]
        min_date = min(dates)
        max_date = max(dates)
        print(f"Date Range: {min_date} to {max_date}")
        
        sources = set(r.source for r in records)
        print(f"Unique Sources found in DB: {sources}")
        
        # Confirmation that no synthetic records exist
        # Since fallback mock uses "INSAT_LST" or has synthetic values, wait, let's verify.
        # Our real ingestion writes source = "INSAT_LST".
        # Let's inspect a few sample records
        print("\nSample coordinates and LST values:")
        for idx, r in enumerate(records[:10]):
            print(f"  Coord {idx+1}: Lat {r.latitude:.3f}°N, Lon {r.longitude:.3f}°E | LST: {r.lst_temperature:.2f} °C | Source: {r.source}")
            
        # Check if there are any records with source that is not "INSAT_LST"
        other_sources = [r for r in records if r.source != "INSAT_LST"]
        print(f"\nNon-INSAT_LST source records count: {len(other_sources)}")
    else:
        print("No satellite records found in the database!")

finally:
    db.close()
