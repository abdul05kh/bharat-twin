"""
BHARAT-TWIN V2.0 — Climate AI Decision Support Engine
Multi-tier LLM architecture: Groq (primary) → Gemini (secondary)
AI Persona: Climate Scientist + Disaster Risk Analyst + Policy Advisor
Output: Official climate advisory format — never conversational.
"""

import json
import re
import math
from sqlalchemy.orm import Session
from datetime import datetime, date
from sqlalchemy import func

from backend.config import settings
from backend.models import Forecast, Simulation, ClimateInsight, ClimateObservation, ClimateSatelliteLayer, Region

SYSTEM_PROMPT = """You are a Senior Climate Scientist and Disaster Risk Analyst operating within the 
BHARAT-TWIN National Climate Digital Twin Platform, jointly maintained with reference data from 
the India Meteorological Department (IMD) and the Indian Space Research Organisation (ISRO).

Your function is to generate formal, peer-review-quality climate advisory briefs for use by:
- State and District Disaster Management Authorities (SDMA/DDMA)
- Municipal Corporations and Urban Local Bodies
- Water Resource and Irrigation Departments
- Agricultural Advisory Boards
- Public Health Emergency Committees

ALL outputs MUST:
- Use formal scientific and technical language
- Reference authoritative climate thresholds (WMO, IMD, NDMA guidelines)
- Never use conversational, chatbot, or casual language
- Follow the structure of official government climate advisories
- Quantify uncertainties using confidence intervals where applicable
- Use ISO units (mm, °C, km², m³)
"""

def build_analysis_prompt(region_name, base_averages, hist_averages, risk_scores, twin_lst_averages, sim_averages=None, scenario=None):
    is_sim = sim_averages is not None and scenario is not None

    prompt = f"""
ANALYSIS REQUEST — BHARAT-TWIN CLIMATE ADVISORY SYSTEM
Region: {region_name}
Mode: {"Scenario Impact Assessment" if is_sim else "Baseline Forecast Analysis"}
Generated: {datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')} UTC

1. HISTORICAL OBSERVATIONS (Past 30 Days):
  Average Daily Rainfall: {hist_averages['rainfall']:.2f} mm/day
  Average Maximum Temperature: {hist_averages['max_temp']:.2f} °C
  Average Minimum Temperature: {hist_averages['min_temp']:.2f} °C

2. BASELINE FORECAST (30-Day Horizon):
  Average Daily Rainfall: {base_averages['rainfall']:.2f} mm/day
  Average Maximum Temperature: {base_averages['max_temp']:.2f} °C
  Average Minimum Temperature: {base_averages['min_temp']:.2f} °C
  Spatial Grid Cells Analysed: {base_averages.get('total_cells', 'N/A')}
"""

    if is_sim:
        rain_delta = sim_averages['rainfall'] - base_averages['rainfall']
        temp_delta = sim_averages['max_temp'] - base_averages['max_temp']
        rain_pct = ((rain_delta / base_averages['rainfall']) * 100) if base_averages['rainfall'] > 0 else 0
        prompt += f"""
3. SCENARIO PARAMETERS: {scenario.name}
  Rainfall Adjustment Applied: {scenario.rainfall_adjustment:+.1f}%
  Temperature Adjustment Applied: {scenario.temperature_adjustment:+.1f}°C
  Simulation Duration: {scenario.duration_days} days

4. PROJECTED SCENARIO STATE:
  Simulated Daily Rainfall: {sim_averages['rainfall']:.2f} mm/day (Δ {rain_delta:+.2f} mm, {rain_pct:+.1f}%)
  Simulated Max Temperature: {sim_averages['max_temp']:.2f} °C (Δ {temp_delta:+.1f}°C)
  Simulated Min Temperature: {sim_averages['min_temp']:.2f} °C
"""

    prompt += f"""
5. COMPUTED NATIONAL CLIMATE RISK INDEX:
  Composite Risk Score: {risk_scores['composite']['score']}/100 ({risk_scores['composite']['level']})
  Heat Risk Score: {risk_scores['heat_risk']['score']}/100 ({risk_scores['heat_risk']['level']})
  Rainfall Risk Score: {risk_scores['rainfall_risk']['score']}/100 ({risk_scores['rainfall_risk']['level']})
  Drought Risk Score: {risk_scores['drought_risk']['score']}/100 ({risk_scores['drought_risk']['level']})
  Climate Stress Score: {risk_scores['climate_stress']['score']}/100 ({risk_scores['climate_stress']['level']})

6. CLIMATE TWIN OBSERVATIONS (INSAT LST & FUSED CELLS):
  Average Satellite Land Surface Temperature (LST): {twin_lst_averages['avg_lst']:.2f} °C
  Observation Count: {twin_lst_averages['count']}

MANDATORY OUTPUT FORMAT (return raw JSON only, no markdown fences, no conversational wrappers):
{{
  "executive_summary": "2-3 sentence authoritative summary of the climate situation and primary risk.",
  "threat_assessment": {{
    "level": "Low|Medium|High|Critical",
    "rationale": "Scientific rationale citing specific thresholds (IMD heatwave: >=40°C, drought: SPI < -1.5, flood: >115.6mm/day).",
    "confidence_score": 0.85
  }},
  "impact_assessment": {{
    "agricultural_risk": "Impact on Kharif/Rabi crop cycles, soil moisture deficit, irrigation demand.",
    "water_resource_risk": "Quantified impact on reservoirs, groundwater recharge, and surface runoff.",
    "urban_heat_risk": "Urban Heat Island intensity, night-time cooling failure risk, wet-bulb temperature concern.",
    "emergency_preparedness": "Emergency response recommendations, evacuation warnings, shelter readiness."
  }},
  "sector_analysis": {{
    "agriculture": "Detailed analysis of crops and soil moisture.",
    "water": "Detailed analysis of surface water and groundwater reserves.",
    "urban": "Detailed analysis of heat index and power grids.",
    "emergency": "Detailed analysis of disaster response trigger levels."
  }},
  "policy_recommendations": [
    "Formal list item 1 detailing long-term structural adaptation policy.",
    "Formal list item 2 detailing medium-term policy."
  ],
  "decision_recommendations": [
    "Formal list item 1 detailing short-term operational decision trigger.",
    "Formal list item 2 detailing local response trigger."
  ],
  "confidence_level": "High (85%)",
  "explainability": "Detailed methodology notes explaining how observation density, forecasting engine errors (RMSE), and scenario deltas impact this advisory."
}}
"""
    return prompt

def parse_llm_json(raw_text: str) -> dict:
    """Robustly extract JSON from LLM output, stripping any markdown fences."""
    text = raw_text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    text = text.strip()
    return json.loads(text)

class ClimateInsightEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_averages(self, daily_data: list) -> dict:
        total_days = len(daily_data)
        if total_days == 0:
            return {"rainfall": 0.0, "max_temp": 0.0, "min_temp": 0.0, "total_cells": 0}

        rain_sum, max_sum, min_sum, count = 0.0, 0.0, 0.0, 0
        for day in daily_data:
            for cell in day["grid_cells"]:
                rain_sum += cell["rainfall"]
                max_sum += cell["max_temperature"]
                min_sum += cell["min_temperature"]
                count += 1

        total_cells = count // total_days if total_days else 0
        return {
            "rainfall": round(rain_sum / count, 2) if count else 0.0,
            "max_temp": round(max_sum / count, 2) if count else 0.0,
            "min_temp": round(min_sum / count, 2) if count else 0.0,
            "total_cells": total_cells,
        }

    def _call_groq(self, prompt: str) -> tuple:
        """Primary: Groq llama-3.3-70b-versatile."""
        from groq import Groq
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not set.")
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        raw = response.choices[0].message.content
        tokens = {
            "prompt_tokens": getattr(response.usage, "prompt_tokens", 0) if hasattr(response, "usage") else 0,
            "completion_tokens": getattr(response.usage, "completion_tokens", 0) if hasattr(response, "usage") else 0,
            "total_tokens": getattr(response.usage, "total_tokens", 0) if hasattr(response, "usage") else 0
        }
        return parse_llm_json(raw), tokens

    def _call_gemini(self, prompt: str) -> tuple:
        """Secondary: Gemini 2.5 Flash."""
        from google import genai
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set.")
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        full_prompt = SYSTEM_PROMPT + "\n\n" + prompt
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt,
        )
        raw = response.text.strip()
        prompt_tokens = 0
        completion_tokens = 0
        total_tokens = 0
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            prompt_tokens = getattr(response.usage_metadata, "prompt_token_count", 0)
            completion_tokens = getattr(response.usage_metadata, "candidates_token_count", 0)
            total_tokens = getattr(response.usage_metadata, "total_token_count", 0)
        tokens = {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens
        }
        return parse_llm_json(raw), tokens

    def calculate_risk_scores(self, region_id, base_averages) -> dict:
        obs = self.db.query(ClimateObservation).filter(
            ClimateObservation.region_id == region_id
        ).order_by(ClimateObservation.observation_date.desc()).limit(300).all()

        max_temps = [o.max_temperature for o in obs if o.max_temperature and o.max_temperature > 0]
        rainfalls = [o.rainfall for o in obs if o.rainfall is not None]

        avg_max_temp = sum(max_temps) / len(max_temps) if max_temps else 30.0
        avg_rain = sum(rainfalls) / len(rainfalls) if rainfalls else 2.0

        forecast_avg_rain = base_averages["rainfall"]
        forecast_avg_temp = base_averages["max_temp"]

        def heat_score(t):
            if t >= 42: return 100
            if t >= 40: return 90
            if t >= 38: return 75
            if t >= 36: return 55
            if t >= 34: return 35
            return max(0, int((t - 25) * 3))

        heat_risk_score = heat_score(max(avg_max_temp, forecast_avg_temp))

        def rain_risk_score(rain_mm):
            if rain_mm < 0.5: return 80
            if rain_mm < 1.5: return 60
            if rain_mm < 4.0: return 20
            if rain_mm < 20.0: return 30
            if rain_mm < 64.5: return 55
            if rain_mm < 115.6: return 80
            return 100

        rainfall_risk_score = rain_risk_score(min(avg_rain, forecast_avg_rain))

        normal_rain = 3.0
        spi_proxy = (avg_rain - normal_rain) / max(normal_rain * 0.5, 0.5)
        drought_score = max(0, min(100, int((1 - spi_proxy) * 50)))

        thermal_stress = max(0, (avg_max_temp - 28) / 14 * 100)
        moisture_stress = max(0, (1 - min(avg_rain / normal_rain, 2)) * 50) if avg_rain < normal_rain else 0
        stress_score = min(100, int((thermal_stress * 0.6 + moisture_stress * 0.4)))

        composite = min(100, int(
            heat_risk_score * 0.30 +
            rainfall_risk_score * 0.25 +
            drought_score * 0.25 +
            stress_score * 0.20
        ))

        def risk_label(score):
            if score >= 75: return "Critical"
            if score >= 50: return "High"
            if score >= 25: return "Moderate"
            return "Low"

        return {
            "composite": {"score": composite, "level": risk_label(composite)},
            "heat_risk": {"score": heat_risk_score, "level": risk_label(heat_risk_score)},
            "rainfall_risk": {"score": rainfall_risk_score, "level": risk_label(rainfall_risk_score)},
            "drought_risk": {"score": drought_score, "level": risk_label(drought_score)},
            "climate_stress": {"score": stress_score, "level": risk_label(stress_score)}
        }

    def generate_scientific_summary(self, forecast_id: str = None, simulation_id: str = None) -> dict:
        """
        Generate an AI-powered climate advisory brief using multi-tier LLM failover.
        Priority: Groq (llama-3.3-70b) → Gemini 2.5 Flash
        Strictly no deterministic mock fallback narrative generators.
        """
        forecast = None
        simulation = None

        if simulation_id:
            simulation = self.db.query(Simulation).filter(Simulation.id == simulation_id).first()
            if not simulation:
                raise ValueError(f"Simulation {simulation_id} not found.")
            forecast = simulation.forecast
        elif forecast_id:
            forecast = self.db.query(Forecast).filter(Forecast.id == forecast_id).first()
            if not forecast:
                raise ValueError(f"Forecast {forecast_id} not found.")

        # 1. Forecast statistics
        base_averages = self.calculate_averages(forecast.forecast_data)
        
        # 2. Historical observations statistics
        recent_obs = self.db.query(ClimateObservation).filter(
            ClimateObservation.region_id == forecast.region_id
        ).order_by(ClimateObservation.observation_date.desc()).limit(180).all() # ~30 days for Hyderabad points
        
        if not recent_obs:
            hist_averages = {"rainfall": 2.0, "max_temp": 32.0, "min_temp": 22.0}
        else:
            hist_rain = sum(o.rainfall for o in recent_obs) / len(recent_obs)
            hist_max = sum(o.max_temperature for o in recent_obs if o.max_temperature > 0) / len([o for o in recent_obs if o.max_temperature > 0])
            hist_min = sum(o.min_temperature for o in recent_obs if o.min_temperature > 0) / len([o for o in recent_obs if o.min_temperature > 0])
            hist_averages = {
                "rainfall": round(hist_rain, 2),
                "max_temp": round(hist_max, 2),
                "min_temp": round(hist_min, 2)
            }

        # 3. Risk index scores
        risk_scores = self.calculate_risk_scores(forecast.region_id, base_averages)

        # 4. Climate Twin observations (LST)
        latest_sat_layers = self.db.query(ClimateSatelliteLayer).filter(
            ClimateSatelliteLayer.region_id == forecast.region_id
        ).order_by(ClimateSatelliteLayer.observation_date.desc()).limit(100).all()

        if not latest_sat_layers:
            twin_lst_averages = {"avg_lst": 30.5, "count": 0}
        else:
            avg_lst = sum(o.lst_temperature for o in latest_sat_layers) / len(latest_sat_layers)
            twin_lst_averages = {"avg_lst": round(avg_lst, 2), "count": len(latest_sat_layers)}

        sim_averages = None
        scenario = None
        if simulation:
            sim_averages = self.calculate_averages(simulation.simulation_data)
            scenario = simulation.scenario

        region_name = forecast.region.name if forecast.region else "Hyderabad Metropolitan Region"
        prompt = build_analysis_prompt(region_name, base_averages, hist_averages, risk_scores, twin_lst_averages, sim_averages, scenario)

        parsed = None
        provider_used = "unknown"
        token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

        # Tier 1: Groq Llama 3.3
        if settings.GROQ_API_KEY:
            try:
                print("AI Engine: Attempting Groq llama-3.3-70b-versatile...")
                parsed, token_usage = self._call_groq(prompt)
                provider_used = "Groq/llama-3.3-70b-versatile"
                print("AI Engine: Groq succeeded.")
            except Exception as e:
                print(f"AI Engine: Groq failed ({e}). Trying Gemini...")

        # Tier 2: Gemini 2.5 Flash
        if parsed is None and settings.GEMINI_API_KEY:
            try:
                print("AI Engine: Attempting Gemini 2.5 Flash...")
                parsed, token_usage = self._call_gemini(prompt)
                provider_used = "Google/gemini-2.5-flash"
                print("AI Engine: Gemini succeeded.")
            except Exception as e:
                print(f"AI Engine: Gemini failed ({e}).")

        # Raise exception if AI is completely unavailable
        if parsed is None:
            raise RuntimeError(
                "Real AI insights generation failed: Both Groq and Gemini APIs are unavailable. "
                "Ensure GEMINI_API_KEY or GROQ_API_KEY is configured."
            )

        # Standardize for DB/UI
        threat = parsed.get("threat_assessment", {})
        impact = parsed.get("impact_assessment", {})
        sector = parsed.get("sector_analysis", {})
        
        insight_text = parsed.get("executive_summary", "") + "\n\n"
        insight_text += f"THREAT ASSESSMENT ({threat.get('level', 'N/A')}): "
        insight_text += threat.get("rationale", "") + f" [Confidence Score: {threat.get('confidence_score', 'N/A')}]\n\n"
        insight_text += "AGRICULTURE RISK: " + impact.get("agricultural_risk", "") + "\n\n"
        insight_text += "WATER RESOURCE RISK: " + impact.get("water_resource_risk", "") + "\n\n"
        insight_text += "URBAN HEAT RISK: " + impact.get("urban_heat_risk", "") + "\n\n"
        insight_text += "EMERGENCY PREPAREDNESS: " + impact.get("emergency_preparedness", "") + "\n\n"
        insight_text += "CONFIDENCE: " + parsed.get("confidence_level", "") + "\n\n"
        insight_text += "EXPLAINABILITY: " + parsed.get("explainability", "")

        # Format list for recommended actions
        recommended_actions_compat = []
        for recommendation in parsed.get("policy_recommendations", []):
            recommended_actions_compat.append({
                "authority": "Policy Directorate",
                "action": recommendation,
                "urgency": "Medium-term",
                "estimated_benefit": "Long-term climate resilience and adaptation planning."
            })
        for recommendation in parsed.get("decision_recommendations", []):
            recommended_actions_compat.append({
                "authority": "District Administration / SDMA",
                "action": recommendation,
                "urgency": "Immediate",
                "estimated_benefit": "Immediate mitigation of severe climate risk impact."
            })

        summary_dict = {
            "anomaly_level": threat.get("level", "Low"),
            "primary_threat": threat.get("rationale", ""),
            "strategic_action": (
                recommended_actions_compat[0]["action"] if recommended_actions_compat else ""
            ),
            "executive_summary": parsed.get("executive_summary", ""),
            "threat_assessment": threat,
            "impact_assessment": impact,
            "sector_analysis": sector,
            "recommended_actions": recommended_actions_compat,
            "policy_recommendations": parsed.get("policy_recommendations", []),
            "decision_recommendations": parsed.get("decision_recommendations", []),
            "confidence_level": parsed.get("confidence_level", ""),
            "explainability": parsed.get("explainability", ""),
            "ai_provider": provider_used,
            "confidence_score": threat.get("confidence_score", 0.8),
            "token_usage": token_usage,
            "timestamp": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        }

        # Store in DB
        db_insight = ClimateInsight(
            forecast_id=forecast.id if not simulation_id else None,
            simulation_id=simulation_id,
            insight_text=insight_text,
            summary=summary_dict,
        )
        self.db.add(db_insight)
        self.db.commit()
        self.db.refresh(db_insight)

        return {
            "id": db_insight.id,
            "forecast_id": db_insight.forecast_id,
            "simulation_id": db_insight.simulation_id,
            "insight_text": db_insight.insight_text,
            "summary": db_insight.summary,
            "created_at": db_insight.created_at,
        }
