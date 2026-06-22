import sys
import os
from datetime import date

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal
from backend.models import ClimateObservation
import pandas as pd
import numpy as np

db = SessionLocal()
try:
    obs_query = db.query(ClimateObservation).order_by(ClimateObservation.observation_date.desc()).all()
    print(f"Total observations: {len(obs_query)}")
    
    obs_list = []
    for o in obs_query:
        obs_list.append({
            "observation_date": o.observation_date,
            "latitude": o.latitude,
            "longitude": o.longitude,
            "rainfall": o.rainfall,
            "max_temperature": o.max_temperature,
            "min_temperature": o.min_temperature
        })
    obs_list.reverse()
    
    df = pd.DataFrame(obs_list)
    df['date'] = pd.to_datetime(df['observation_date'])
    df = df.sort_values(by=['latitude', 'longitude', 'date']).reset_index(drop=True)
    
    print("Initial df shape:", df.shape)
    
    df['day_of_year'] = df['date'].dt.dayofyear
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    
    def get_season(month):
        if month in [12, 1, 2]: return 1
        elif month in [3, 4, 5]: return 2
        elif month in [6, 7, 8, 9]: return 3
        else: return 4
        
    df['season'] = df['month'].apply(get_season)
    
    grouped = df.groupby(['latitude', 'longitude'])
    
    df['rainfall_lag_1'] = grouped['rainfall'].shift(1)
    df['rainfall_lag_7'] = grouped['rainfall'].shift(7)
    df['rainfall_lag_30'] = grouped['rainfall'].shift(30)
    
    df['max_temp_lag_1'] = grouped['max_temperature'].shift(1)
    df['max_temp_lag_7'] = grouped['max_temperature'].shift(7)
    df['max_temp_lag_30'] = grouped['max_temperature'].shift(30)
    
    df['min_temp_lag_1'] = grouped['min_temperature'].shift(1)
    df['min_temp_lag_7'] = grouped['min_temperature'].shift(7)
    df['min_temp_lag_30'] = grouped['min_temperature'].shift(30)
    
    df['rainfall_rolling_mean_7'] = grouped['rainfall'].transform(lambda x: x.rolling(7).mean())
    df['rainfall_rolling_mean_30'] = grouped['rainfall'].transform(lambda x: x.rolling(30).mean())
    
    df['avg_temp'] = (df['max_temperature'] + df['min_temperature']) / 2.0
    df['temperature_rolling_mean_7'] = df.groupby(['latitude', 'longitude'])['avg_temp'].transform(lambda x: x.rolling(7).mean())
    df['temperature_rolling_mean_30'] = df.groupby(['latitude', 'longitude'])['avg_temp'].transform(lambda x: x.rolling(30).mean())
    
    print("df shape before dropna:", df.shape)
    print("NaN counts:")
    print(df.isna().sum())
    
    df_clean = df.dropna().reset_index(drop=True)
    print("df shape after dropna:", df_clean.shape)

finally:
    db.close()
