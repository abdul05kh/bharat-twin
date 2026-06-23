import sys
import os
# Ensure backend directory is on sys.path so top-level imports like `database` resolve
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
from models import Region, ClimateObservation
from datetime import date
import uuid

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    # Ensure region exists
    region = db.query(Region).filter(Region.name == "Hyderabad Metropolitan Region").first()
    if not region:
        region = Region(
            id=uuid.uuid4(),
            name="Hyderabad Metropolitan Region",
            bounding_box="POLYGON((78.10 17.10, 78.80 17.10, 78.80 17.65, 78.10 17.65, 78.10 17.10))"
        )
        db.add(region)
        db.commit()
        db.refresh(region)
        print(f"Created region: {region.name} (id={region.id})")
    else:
        print(f"Region already exists: {region.name} (id={region.id})")

    # Insert a few sample observations if none exist
    obs_count = db.query(ClimateObservation).filter(ClimateObservation.region_id == region.id).count()
    if obs_count == 0:
        sample_dates = [date(2024,6,20), date(2024,6,21), date(2024,6,22)]
        sample_cells = [(17.25, 78.25), (17.50, 78.50), (17.25, 78.50)]
        created = 0
        for d in sample_dates:
            for lat, lon in sample_cells:
                obs = ClimateObservation(
                    id=uuid.uuid4(),
                    region_id=region.id,
                    observation_date=d,
                    latitude=lat,
                    longitude=lon,
                    geom=f"POINT({lon} {lat})",
                    rainfall=2.3,
                    max_temperature=33.2,
                    min_temperature=22.1,
                    source="IMD_Rain_0.25"
                )
                db.add(obs)
                created += 1
        db.commit()
        print(f"Inserted {created} sample observations")
    else:
        print(f"Observations already present: {obs_count}")

finally:
    db.close()
