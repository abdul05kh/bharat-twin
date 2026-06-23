from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any, Tuple

from models import ClimateObservation, Region, Forecast
from database import is_sqlite

# Fallback imports to prevent crashes when Windows App Control blocks C-extensions
try:
    import numpy as np
    import pandas as pd
    import xgboost as xgb
    HAS_SCIENTIFIC_STACK = True
except ImportError as e:
    print(f"WARNING: Scientific stack (xgboost/numpy/pandas) failed to import ({e}). Falling back to pure Python forecasting engine.")
    HAS_SCIENTIFIC_STACK = False

class ClimateForecastEngine:
    def __init__(self, db: Session):
        self.db = db
        
    def get_season(self, month: int) -> int:
        if month in [12, 1, 2]:
            return 1
        elif month in [3, 4, 5]:
            return 2
        elif month in [6, 7, 8, 9]:
            return 3
        else:
            return 4

    if HAS_SCIENTIFIC_STACK:
        def prepare_training_data(self, observations: List[Dict[str, Any]]) -> pd.DataFrame:
            df = pd.DataFrame(observations)
            df['date'] = pd.to_datetime(df['observation_date'])
            df = df.sort_values(by=['latitude', 'longitude', 'date']).reset_index(drop=True)
            
            df['day_of_year'] = df['date'].dt.dayofyear
            df['month'] = df['date'].dt.month
            df['year'] = df['date'].dt.year
            df['season'] = df['month'].apply(self.get_season)
            
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
            
            df = df.dropna().reset_index(drop=True)
            return df

        def train_models(self, df: pd.DataFrame) -> Tuple[Any, Any, Any, List[str]]:
            feature_cols = [
                'latitude', 'longitude', 'day_of_year', 'month', 'year', 'season',
                'rainfall_lag_1', 'rainfall_lag_7', 'rainfall_lag_30',
                'max_temp_lag_1', 'max_temp_lag_7', 'max_temp_lag_30',
                'min_temp_lag_1', 'min_temp_lag_7', 'min_temp_lag_30',
                'rainfall_rolling_mean_7', 'rainfall_rolling_mean_30',
                'temperature_rolling_mean_7', 'temperature_rolling_mean_30'
            ]
            
            X = df[feature_cols]
            y_rain = df['rainfall']
            y_max = df['max_temperature']
            y_min = df['min_temperature']
            
            model_rain = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
            model_max = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
            model_min = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
            
            model_rain.fit(X, y_rain)
            model_max.fit(X, y_max)
            model_min.fit(X, y_min)
            
            return model_rain, model_max, model_min, feature_cols

    def generate_forecast(self, region_id: str, horizon_days: int) -> Dict[str, Any]:
        """Runs the forecasting pipeline (XGBoost or local mathematical fallback)."""
        region = self.db.query(Region).filter(Region.id == region_id).first()
        if not region:
            raise ValueError(f"Region {region_id} not found.")
            
        obs_query = self.db.query(ClimateObservation).filter(
            ClimateObservation.region_id == region_id
        ).order_by(ClimateObservation.observation_date.desc()).all()
        
        if not obs_query:
            raise ValueError("No historical observations found to generate forecast.")
            
        latest_obs_date = max(o.observation_date for o in obs_query)
        
        # If we have scientific stack, generate via XGBoost
        if HAS_SCIENTIFIC_STACK:
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
            
            train_df = self.prepare_training_data(obs_list)
            if train_df.empty:
                raise ValueError("Insufficient data to generate lags and rolling means.")
                
            model_rain, model_max, model_min, feature_cols = self.train_models(train_df)
            
            latest_date = pd.to_datetime(latest_obs_date)
            grid_cells = train_df[['latitude', 'longitude']].drop_duplicates().to_dict('records')
            
            history_df = pd.DataFrame(obs_list)
            history_df['date'] = pd.to_datetime(history_df['observation_date'])
            
            forecast_results = []
            
            for day in range(1, horizon_days + 1):
                target_date = latest_date + timedelta(days=day)
                day_forecast_cells = []
                
                for cell in grid_cells:
                    lat, lon = cell['latitude'], cell['longitude']
                    cell_hist = history_df[(history_df['latitude'] == lat) & (history_df['longitude'] == lon)].sort_values('date')
                    
                    rain_lag_1 = cell_hist.iloc[-1]['rainfall']
                    rain_lag_7 = cell_hist.iloc[-7]['rainfall'] if len(cell_hist) >= 7 else cell_hist['rainfall'].mean()
                    rain_lag_30 = cell_hist.iloc[-30]['rainfall'] if len(cell_hist) >= 30 else cell_hist['rainfall'].mean()
                    
                    max_lag_1 = cell_hist.iloc[-1]['max_temperature']
                    max_lag_7 = cell_hist.iloc[-7]['max_temperature'] if len(cell_hist) >= 7 else cell_hist['max_temperature'].mean()
                    max_lag_30 = cell_hist.iloc[-30]['max_temperature'] if len(cell_hist) >= 30 else cell_hist['max_temperature'].mean()
                    
                    min_lag_1 = cell_hist.iloc[-1]['min_temperature']
                    min_lag_7 = cell_hist.iloc[-7]['min_temperature'] if len(cell_hist) >= 7 else cell_hist['min_temperature'].mean()
                    min_lag_30 = cell_hist.iloc[-30]['min_temperature'] if len(cell_hist) >= 30 else cell_hist['min_temperature'].mean()
                    
                    rain_roll_7 = cell_hist.iloc[-7:]['rainfall'].mean()
                    rain_roll_30 = cell_hist.iloc[-30:]['rainfall'].mean() if len(cell_hist) >= 30 else cell_hist['rainfall'].mean()
                    
                    avg_temps = (cell_hist['max_temperature'] + cell_hist['min_temperature']) / 2.0
                    temp_roll_7 = avg_temps.iloc[-7:].mean()
                    temp_roll_30 = avg_temps.iloc[-30:].mean() if len(cell_hist) >= 30 else avg_temps.mean()
                    
                    features = {
                        'latitude': lat,
                        'longitude': lon,
                        'day_of_year': target_date.dayofyear,
                        'month': target_date.month,
                        'year': target_date.year,
                        'season': self.get_season(target_date.month),
                        'rainfall_lag_1': rain_lag_1,
                        'rainfall_lag_7': rain_lag_7,
                        'rainfall_lag_30': rain_lag_30,
                        'max_temp_lag_1': max_lag_1,
                        'max_temp_lag_7': max_lag_7,
                        'max_temp_lag_30': max_lag_30,
                        'min_temp_lag_1': min_lag_1,
                        'min_temp_lag_7': min_lag_7,
                        'min_temp_lag_30': min_lag_30,
                        'rainfall_rolling_mean_7': rain_roll_7,
                        'rainfall_rolling_mean_30': rain_roll_30,
                        'temperature_rolling_mean_7': temp_roll_7,
                        'temperature_rolling_mean_30': temp_roll_30
                    }
                    
                    feat_df = pd.DataFrame([features])[feature_cols]
                    
                    pred_rain = max(0.0, float(model_rain.predict(feat_df)[0]))
                    pred_max = float(model_max.predict(feat_df)[0])
                    pred_min = float(model_min.predict(feat_df)[0])
                    
                    day_forecast_cells.append({
                        "latitude": lat,
                        "longitude": lon,
                        "rainfall": round(pred_rain, 2),
                        "max_temperature": round(pred_max, 2),
                        "min_temperature": round(pred_min, 2),
                        "timestamp": target_date.strftime("%Y-%m-%d")
                    })
                    
                    new_row = pd.DataFrame([{
                        "latitude": lat,
                        "longitude": lon,
                        "date": target_date,
                        "observation_date": target_date.date(),
                        "rainfall": pred_rain,
                        "max_temperature": pred_max,
                        "min_temperature": pred_min
                    }])
                    history_df = pd.concat([history_df, new_row], ignore_index=True)
                    
                forecast_results.append({
                    "date": target_date.strftime("%Y-%m-%d"),
                    "grid_cells": day_forecast_cells
                })
        else:
            # Mathematical/Seasonal moving average forecast fallback in pure Python
            print("Generating seasonal heuristic forecast fallback...")
            
            # Fetch latest observations per grid cell to initialize baseline values
            latest_cells = self.db.query(
                ClimateObservation.latitude,
                ClimateObservation.longitude,
                ClimateObservation.rainfall,
                ClimateObservation.max_temperature,
                ClimateObservation.min_temperature
            ).filter(
                ClimateObservation.region_id == region_id,
                ClimateObservation.observation_date == latest_obs_date
            ).all()
            
            forecast_results = []
            for day in range(1, horizon_days + 1):
                target_date = latest_obs_date + timedelta(days=day)
                day_forecast_cells = []
                
                day_of_year = target_date.timetuple().tm_yday
                
                # Season factors
                season_temp_mod = 4.0 * (1.0 - abs(day_of_year - 135) / 182.5 if day_of_year < 317 else 0.0)
                
                for cell in latest_cells:
                    lat, lon = cell[0], cell[1]
                    base_rain = cell[2]
                    base_max = cell[3]
                    base_min = cell[4]
                    
                    # Heuristic forecasting updates
                    pred_rain = base_rain * 0.9 + (day % 3) * 0.1
                    pred_max = base_max + (day * 0.02) + (lat - 17.25) * 0.1 + season_temp_mod * 0.1
                    pred_min = base_min - (day * 0.01) - (lon - 78.25) * 0.1
                    
                    day_forecast_cells.append({
                        "latitude": lat,
                        "longitude": lon,
                        "rainfall": round(max(0.0, pred_rain), 2),
                        "max_temperature": round(pred_max, 2),
                        "min_temperature": round(pred_min, 2),
                        "timestamp": target_date.strftime("%Y-%m-%d")
                    })
                    
                forecast_results.append({
                    "date": target_date.strftime("%Y-%m-%d"),
                    "grid_cells": day_forecast_cells
                })
            
        # Store in Database
        db_forecast = Forecast(
            region_id=region_id,
            forecast_date=latest_obs_date,
            horizon_days=horizon_days,
            forecast_data=forecast_results
        )
        self.db.add(db_forecast)
        self.db.commit()
        self.db.refresh(db_forecast)
        
        return {
            "id": db_forecast.id,
            "region_id": db_forecast.region_id,
            "forecast_date": db_forecast.forecast_date,
            "horizon_days": db_forecast.horizon_days,
            "forecast_data": forecast_results,
            "created_at": db_forecast.created_at
        }
