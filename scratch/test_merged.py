import sys
import os
from datetime import date

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal
from backend.models import ClimateObservation

db = SessionLocal()
try:
    print("=== TESTING MERGED OBSERVATIONS ===")
    
    # Query cells at coordinate (17.50, 78.50) where both rainfall and max_temperature are > 0.0
    merged = db.query(ClimateObservation).filter(
        ClimateObservation.latitude == 17.5,
        ClimateObservation.longitude == 78.5,
        ClimateObservation.max_temperature > 0.0,
        ClimateObservation.rainfall > 0.0
    ).all()
    
    print(f"Number of merged coordinate rows containing both rainfall and temperature: {len(merged)}")
    if len(merged) > 0:
        print("Sample merged records:")
        for idx, r in enumerate(merged[:5]):
            print(f"  Date: {r.observation_date} | Rainfall: {r.rainfall:.2f} mm | Max Temp: {r.max_temperature:.2f} °C | Min Temp: {r.min_temperature:.2f} °C | Source: {r.source}")
    else:
        print("WARNING: No merged coordinate rows found. Let's inspect standard observations at 17.50, 78.50:")
        all_obs = db.query(ClimateObservation).filter(
            ClimateObservation.latitude == 17.5,
            ClimateObservation.longitude == 78.5
        ).limit(5).all()
        for idx, r in enumerate(all_obs):
            print(f"  Date: {r.observation_date} | Rainfall: {r.rainfall:.2f} mm | Max Temp: {r.max_temperature:.2f} °C | Source: {r.source}")

finally:
    db.close()
