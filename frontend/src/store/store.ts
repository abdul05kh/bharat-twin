import { create } from 'zustand';

export interface GridCell {
  latitude: number;
  longitude: number;
  rainfall: number;
  max_temperature: number;
  min_temperature: number;
  timestamp: string;
}

export interface ForecastDay {
  date: string;
  grid_cells: GridCell[];
}

export interface Region {
  id: string;
  name: string;
  bounding_box: string;
  created_at: string;
}

export interface Scenario {
  id: string;
  name: string;
  rainfall_adjustment: number;
  temperature_adjustment: number;
  duration_days: number;
}

export interface CompareData {
  baseline_forecast_id: string;
  simulated_forecast_id: string;
  scenario_name: string;
  duration_days: number;
  rainfall_delta: {
    variable: string;
    baseline_mean: number;
    simulated_mean: number;
    delta: number;
    percentage_change: number;
  };
  max_temp_delta: {
    variable: string;
    baseline_mean: number;
    simulated_mean: number;
    delta: number;
  };
  min_temp_delta: {
    variable: string;
    baseline_mean: number;
    simulated_mean: number;
    delta: number;
  };
  daily_comparison: {
    date: string;
    baseline_rainfall: number;
    simulated_rainfall: number;
    baseline_max_temp: number;
    simulated_max_temp: number;
  }[];
  grid_delta: {
    latitude: number;
    longitude: number;
    rainfall_delta: number;
    max_temp_delta: number;
    baseline_max_temp: number;
    simulated_max_temp: number;
  }[];
}

export interface ClimateInsight {
  id: string;
  insight_text: string;
  summary: {
    anomaly_level?: string;
    primary_threat?: string;
    strategic_action?: string;
    executive_summary?: string;
    risk_assessment?: { level: string; rationale: string } | string;
    impact_assessment?: Record<string, string>;
    recommended_actions?: Array<{ authority: string; action: string; urgency: string; estimated_benefit: string }>;
    confidence_statement?: string;
    scientific_notes?: string;
    ai_provider?: string;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface ClimateObservation {
  id: string;
  region_id: string;
  observation_date: string;
  latitude: number;
  longitude: number;
  rainfall: number;
  max_temperature: number;
  min_temperature: number;
  source: string;
}

export interface HistoricalTrend {
  date: string;
  avg_rainfall: number;
  avg_max_temp: number;
  avg_min_temp: number;
}

export interface SatelliteObservation {
  id: string;
  region_id: string;
  observation_date: string;
  latitude: number;
  longitude: number;
  lst_temperature: number;
  source: string;
  created_at: string;
}

interface ClimateStore {
  apiBase: string;
  regions: Region[];
  selectedRegion: Region | null;
  currentObservations: ClimateObservation[];
  historicalTrends: HistoricalTrend[];
  digitalTwin: GridCell[];
  satelliteObservations: SatelliteObservation[];
  latestForecast: {
    id: string;
    horizon_days: number;
    forecast_data: ForecastDay[];
  } | null;
  scenarios: Scenario[];
  activeScenario: Scenario | null;
  activeSimulation: {
    id: string;
    simulation_data: ForecastDay[];
  } | null;
  comparison: CompareData | null;
  insights: ClimateInsight | null;
  isLoading: boolean;
  forecastJobStatus: string | null;
  riskIndex: Record<string, unknown> | null;
  activeStressor: 'Heatwave' | 'Delayed Monsoon' | 'Drought' | 'AQI Surge' | 'Water Scarcity' | 'Baseline';
  
  // Actions
  setActiveStressor: (stressor: 'Heatwave' | 'Delayed Monsoon' | 'Drought' | 'AQI Surge' | 'Water Scarcity' | 'Baseline') => void;
  fetchRiskIndex: () => Promise<void>;
  fetchRegions: () => Promise<void>;
  selectRegion: (region: Region) => void;
  fetchCurrentClimate: () => Promise<void>;
  fetchHistoricalTrends: (startDate?: string, endDate?: string) => Promise<void>;
  fetchDigitalTwin: () => Promise<void>;
  generateForecast: (horizon: number) => Promise<void>;
  fetchLatestForecast: () => Promise<void>;
  createScenario: (name: string, rainAdj: number, tempAdj: number, duration: number) => Promise<Scenario>;
  runSimulation: (scenarioId: string, forecastId: string) => Promise<void>;
  fetchComparison: (baselineId: string, simulatedId: string) => Promise<void>;
  generateInsights: (forecastId?: string, simulationId?: string) => Promise<void>;
  fetchSatelliteObservations: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useClimateStore = create<ClimateStore>((set, get) => ({
  apiBase: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  regions: [],
  selectedRegion: null,
  currentObservations: [],
  historicalTrends: [],
  digitalTwin: [],
  latestForecast: null,
  scenarios: [],
  activeScenario: null,
  activeSimulation: null,
  comparison: null,
  insights: null,
  satelliteObservations: [],
  isLoading: false,
  forecastJobStatus: null,
  riskIndex: null,
  activeStressor: 'Baseline',

  setActiveStressor: (stressor) => {
    set({ activeStressor: stressor });
    if (typeof document !== 'undefined') {
      document.body.classList.remove(
        'theme-heatwave', 'theme-rainfall', 'theme-aqi', 'theme-water',
        'shimmer-active', 'rainfall-active', 'aqi-active', 'water-active'
      );
      if (stressor === 'Heatwave') {
        document.body.classList.add('theme-heatwave', 'shimmer-active');
      } else if (stressor === 'Delayed Monsoon' || stressor === 'Drought' || stressor === 'Water Scarcity') {
        document.body.classList.add('theme-water', 'water-active');
      } else if (stressor === 'AQI Surge') {
        document.body.classList.add('theme-aqi', 'aqi-active');
      }
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  fetchRegions: async () => {
    try {
      const res = await fetch(`${get().apiBase}/regions`);
      if (res.ok) {
        const data = await res.json();
        set({ regions: data });
        if (data.length > 0 && !get().selectedRegion) {
          set({ selectedRegion: data[0] });
        }
      }
    } catch (e) {
      console.error("Failed to fetch regions", e);
    }
  },

  selectRegion: (region: Region) => {
    set({ selectedRegion: region });
    // Refetch region-dependent data
    get().fetchCurrentClimate();
    get().fetchDigitalTwin();
    get().fetchLatestForecast();
    get().fetchSatelliteObservations();
    get().fetchRiskIndex();
  },

  fetchCurrentClimate: async () => {
    const region = get().selectedRegion;
    if (!region) return;
    try {
      const res = await fetch(`${get().apiBase}/climate/current/${region.id}`);
      if (res.ok) {
        const data = await res.json();
        set({ currentObservations: data });
      }
    } catch (e) {
      console.error("Failed to fetch current climate", e);
    }
  },

  fetchHistoricalTrends: async (startDate?: string, endDate?: string) => {
    const region = get().selectedRegion;
    if (!region) return;
    try {
      let url = `${get().apiBase}/climate/history/${region.id}`;
      const params = [];
      if (startDate) params.push(`start_date=${startDate}`);
      if (endDate) params.push(`end_date=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        set({ historicalTrends: data });
      }
    } catch (e) {
      console.error("Failed to fetch historical trends", e);
    }
  },

  fetchDigitalTwin: async () => {
    const region = get().selectedRegion;
    if (!region) return;
    try {
      const res = await fetch(`${get().apiBase}/twin/${region.id}`);
      if (res.ok) {
        const data = await res.json();
        set({ digitalTwin: data.grid_data });
      }
    } catch (e) {
      console.error("Failed to fetch digital twin", e);
    }
  },

  generateForecast: async (horizon: number) => {
    const region = get().selectedRegion;
    if (!region) return;
    set({ isLoading: true, forecastJobStatus: 'QUEUED' });
    try {
      const res = await fetch(`${get().apiBase}/forecast/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region_id: region.id, horizon_days: horizon })
      });
      if (res.ok) {
        const jobData = await res.json();
        const jobId = jobData.job_id;
        
        let completed = false;
        while (!completed) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const statusRes = await fetch(`${get().apiBase}/forecast/status/${jobId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            set({ forecastJobStatus: statusData.status });
            if (statusData.status === 'COMPLETED') {
              set({ latestForecast: statusData.result, forecastJobStatus: null });
              completed = true;
            } else if (statusData.status === 'FAILED') {
              console.error("Forecast job failed:", statusData.error);
              set({ forecastJobStatus: null });
              completed = true;
              alert(`Forecast Generation Failed: ${statusData.error}`);
            }
          } else {
            console.error("Failed to fetch forecast job status");
            set({ forecastJobStatus: null });
            completed = true;
          }
        }
      }
    } catch (e) {
      console.error("Failed to generate forecast", e);
      set({ forecastJobStatus: null });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLatestForecast: async () => {
    const region = get().selectedRegion;
    if (!region) return;
    try {
      const res = await fetch(`${get().apiBase}/forecast/latest/${region.id}`);
      if (res.ok) {
        const data = await res.json();
        set({ latestForecast: data });
      }
    } catch (e) {
      console.error("Failed to fetch latest forecast", e);
    }
  },

  createScenario: async (name: string, rainAdj: number, tempAdj: number, duration: number) => {
    try {
      const res = await fetch(`${get().apiBase}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rainfall_adjustment: rainAdj,
          temperature_adjustment: tempAdj,
          duration_days: duration
        })
      });
      if (res.ok) {
        const data = await res.json();
        set({ activeScenario: data });
        return data;
      }
      throw new Error("Failed to create scenario");
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  runSimulation: async (scenarioId: string, forecastId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${get().apiBase}/simulations/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId, forecast_id: forecastId })
      });
      if (res.ok) {
        const data = await res.json();
        set({ activeSimulation: data });
        // After simulation finishes, pull the comparison automatically
        await get().fetchComparison(forecastId, data.id);
      }
    } catch (e) {
      console.error("Failed to run simulation", e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchComparison: async (baselineId: string, simulatedId: string) => {
    try {
      const res = await fetch(`${get().apiBase}/compare?baseline_forecast_id=${baselineId}&simulated_forecast_id=${simulatedId}`);
      if (res.ok) {
        const data = await res.json();
        set({ comparison: data });
      }
    } catch (e) {
      console.error("Failed to fetch comparison", e);
    }
  },

  generateInsights: async (forecastId?: string, simulationId?: string) => {
    set({ isLoading: true });
    try {
      const body: { forecast_id?: string; simulation_id?: string } = {};
      if (forecastId) body.forecast_id = forecastId;
      if (simulationId) body.simulation_id = simulationId;
      
      const res = await fetch(`${get().apiBase}/insights/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        set({ insights: data });
      }
    } catch (e) {
      console.error("Failed to generate insights", e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSatelliteObservations: async () => {
    const region = get().selectedRegion;
    if (!region) return;
    try {
      const res = await fetch(`${get().apiBase}/climate/satellite/${region.id}`);
      if (res.ok) {
        const data = await res.json();
        set({ satelliteObservations: data });
      }
    } catch (e) {
      console.error("Failed to fetch satellite observations", e);
    }
  },

  fetchRiskIndex: async () => {
    const region = get().selectedRegion;
    if (!region) return;
    try {
      const res = await fetch(`${get().apiBase}/risk-index/${region.id}`);
      if (res.ok) {
        const data = await res.json();
        set({ riskIndex: data });
      }
    } catch (e) {
      console.error("Failed to fetch risk index", e);
    }
  }
}));
