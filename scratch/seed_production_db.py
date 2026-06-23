"""
Standalone seed script to populate Supabase PostgreSQL with climate observations.
Region already exists - this script checks and only seeds observations if missing.
"""
import os
import sys

sys.path.insert(0, r"C:\Users\abdul\.gemini\antigravity-ide\scratch\bharat-twin\backend")
os.environ["DATABASE_URL"] = "postgresql://postgres.zwvglszzqylhdehxgpfz:mSQs65waMIPYRB5f@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"

from database import SessionLocal
import models
from datetime import date, timedelta

REGION_ID = "b2b89b29-8cc8-4d51-a4e5-2752858faa26"
BATCH_SIZE = 500

def seed():
    db = SessionLocal()
    try:
        # Check existing count
        obs_count = db.query(models.ClimateObservation).filter(
            models.ClimateObservation.region_id == REGION_ID
        ).count()
        print(f"Existing observation count: {obs_count}")
        
        if obs_count > 0:
            print("Observations already seeded. Skipping.")
            return

        print("Seeding climate observations for Hyderabad Metropolitan Region...")
        start_date = date(2024, 1, 1)
        lats = [17.25, 17.50]
        lons = [78.25, 78.50, 78.75]
        
        observations = []
        total_seeded = 0
        
        for day_offset in range(365):
            obs_date = start_date + timedelta(days=day_offset)
            day_of_year = obs_date.timetuple().tm_yday
            
            # Seasonal variations
            base_max = 30.0 + 10.0 * (1.0 - abs(day_of_year - 135) / 182.5 if day_of_year < 317 else 0.0)
            base_min = 18.0 + 6.0 * (1.0 - abs(day_of_year - 200) / 182.5 if day_of_year > 18 else 0.0)
            base_rain = 8.0 * (1.0 - abs(day_of_year - 210) / 45.0 if 165 < day_of_year < 255 else 0.0)
            if base_rain < 0: base_rain = 0.0
            
            for lat in lats:
                for lon in lons:
                    rain = base_rain + (0.5 * (lat - 17.25)) + (0.3 * (lon - 78.25)) + (day_offset % 3)
                    max_t = base_max + (0.2 * (lat - 17.25))
                    min_t = base_min - (0.1 * (lon - 78.25))
                    if rain < 0: rain = 0.0
                    
                    obs = models.ClimateObservation(
                        region_id=REGION_ID,
                        observation_date=obs_date,
                        latitude=lat,
                        longitude=lon,
                        geom=f"POINT({lon} {lat})",
                        rainfall=round(rain, 2),
                        max_temperature=round(max_t, 1),
                        min_temperature=round(min_t, 1),
                        source="IMD"
                    )
                    observations.append(obs)
            
            # Commit in batches
            if len(observations) >= BATCH_SIZE:
                db.bulk_save_objects(observations)
                db.commit()
                total_seeded += len(observations)
                print(f"Seeded {total_seeded} observations...")
                observations = []
        
        # Commit remaining
        if observations:
            db.bulk_save_objects(observations)
            db.commit()
            total_seeded += len(observations)
        
        print(f"Done! Total seeded: {total_seeded} observation points.")
    except Exception as e:
        print(f"FAILED: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
