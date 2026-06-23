from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Dict, Any

from models import Forecast, Scenario, Simulation

class ClimateTimeMachine:
    def __init__(self, db: Session):
        self.db = db

    def run_simulation(self, scenario_id: str, forecast_id: str) -> Dict[str, Any]:
        """Loads a baseline forecast, applies scenario adjustments, and saves the modified outcome."""
        scenario = self.db.query(Scenario).filter(Scenario.id == scenario_id).first()
        if not scenario:
            raise ValueError(f"Scenario {scenario_id} not found.")
            
        forecast = self.db.query(Forecast).filter(Forecast.id == forecast_id).first()
        if not forecast:
            raise ValueError(f"Forecast {forecast_id} not found.")
            
        # Extract adjustments
        rain_adj = scenario.rainfall_adjustment / 100.0  # percentage, e.g. -20% -> -0.2
        temp_adj = scenario.temperature_adjustment      # absolute degrees Celsius, e.g. +3.0
        duration = scenario.duration_days
        
        baseline_data = forecast.forecast_data  # List of daily gridded data
        simulated_data = []
        
        for idx, day_data in enumerate(baseline_data):
            # If current index is within the scenario's simulation duration, apply adjustments
            apply_adj = idx < duration
            
            day_cells = day_data["grid_cells"]
            sim_day_cells = []
            
            for cell in day_cells:
                lat = cell["latitude"]
                lon = cell["longitude"]
                base_rain = cell["rainfall"]
                base_max_t = cell["max_temperature"]
                base_min_t = cell["min_temperature"]
                
                if apply_adj:
                    # Apply adjustments
                    sim_rain = max(0.0, base_rain * (1.0 + rain_adj))
                    sim_max_t = base_max_t + temp_adj
                    sim_min_t = base_min_t + temp_adj
                else:
                    sim_rain = base_rain
                    sim_max_t = base_max_t
                    sim_min_t = base_min_t
                    
                sim_day_cells.append({
                    "latitude": lat,
                    "longitude": lon,
                    "rainfall": round(sim_rain, 2),
                    "max_temperature": round(sim_max_t, 2),
                    "min_temperature": round(sim_min_t, 2),
                    "timestamp": cell.get("timestamp") or day_data["date"]
                })
                
            simulated_data.append({
                "date": day_data["date"],
                "grid_cells": sim_day_cells
            })
            
        # Store simulation result
        simulation = Simulation(
            scenario_id=scenario_id,
            forecast_id=forecast_id,
            simulation_date=date.today(),
            simulation_data=simulated_data
        )
        self.db.add(simulation)
        self.db.commit()
        self.db.refresh(simulation)
        
        return {
            "id": simulation.id,
            "scenario_id": simulation.scenario_id,
            "forecast_id": simulation.forecast_id,
            "simulation_date": simulation.simulation_date,
            "simulation_data": simulated_data,
            "created_at": simulation.created_at
        }
