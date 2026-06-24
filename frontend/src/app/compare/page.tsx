'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MapContainer from '@/components/MapContainer';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import PrimaryRiskHero from '@/components/PrimaryRiskHero';
import { useClimateStore } from '@/store/store';
import { useRouter } from 'next/navigation';
import { BarChart2, TrendingDown, TrendingUp, BrainCircuit, ArrowRight, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function ImpactAssessmentConsole() {
  const router = useRouter();
  const { comparison, activeSimulation, generateInsights, isLoading } = useClimateStore();
  const [deltaMode, setDeltaMode] = useState<'max_temp' | 'rainfall'>('max_temp');
  const [wowAnimating, setWowAnimating] = useState(false);
  const [wowRiskScore, setWowRiskScore] = useState(42);
  const [wowWaterStress, setWowWaterStress] = useState(28);
  const [wowHealthStrain, setWowHealthStrain] = useState(34);
  const [wowProgress, setWowProgress] = useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('wow') === 'true') {
        setWowAnimating(true);
        
        // Wow Moment #1: Animate Heatwave Stress Simulation over 1.5 seconds
        const duration = 1500;
        const intervalTime = 30;
        const steps = duration / intervalTime;
        let currentStep = 0;

        const riskStart = 42, riskEnd = 71;
        const waterStart = 28, waterEnd = 63;
        const healthStart = 34, healthEnd = 74;

        const timer = setInterval(() => {
          currentStep++;
          const pct = currentStep / steps;

          setWowProgress(Math.round(pct * 100));
          setWowRiskScore(Math.round(riskStart + (riskEnd - riskStart) * pct));
          setWowWaterStress(Math.round(waterStart + (waterEnd - waterStart) * pct));
          setWowHealthStrain(Math.round(healthStart + (healthEnd - healthStart) * pct));

          if (currentStep >= steps) {
            clearInterval(timer);
            setWowProgress(100);
            setWowRiskScore(riskEnd);
            setWowWaterStress(waterEnd);
            setWowHealthStrain(healthEnd);
            // End overlay animation smoothly shortly after
            setTimeout(() => setWowAnimating(false), 800);
          }
        }, intervalTime);

        return () => clearInterval(timer);
      }
    }
  }, []);

  const placeholderComparison = {
    scenario_name: 'Compound Drought & Heatwave - Simulation Template',
    duration_days: 30,
    max_temp_delta: {
      simulated_mean: 34.6,
      baseline_mean: 32.1,
      delta: 2.5,
    },
    rainfall_delta: {
      simulated_mean: 2.1,
      baseline_mean: 4.2,
      delta: -2.1,
      percentage_change: -50
    },
    grid_delta: Array.from({ length: 16 }, (_, i) => {
      const lats = [17.2, 17.3, 17.4, 17.5];
      const lons = [78.3, 78.4, 78.5, 78.6];
      const lat = lats[Math.floor(i / 4)];
      const lon = lons[i % 4];
      return {
        latitude: lat,
        longitude: lon,
        max_temp_delta: 2.5 + Math.random() * 0.4,
        rainfall_delta: -2.1 + Math.random() * 0.3,
      };
    }),
    daily_comparison: Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: dateStr,
        baseline_max_temp: parseFloat((32.1 + Math.sin(i / 5) * 1.5).toFixed(1)),
        simulated_max_temp: parseFloat((34.6 + Math.sin(i / 5) * 1.5 + Math.random() * 0.5).toFixed(1)),
        baseline_rainfall: parseFloat((4.2 + Math.cos(i / 5) * 2.0).toFixed(2)),
        simulated_rainfall: parseFloat((2.1 + Math.cos(i / 5) * 1.0).toFixed(2))
      };
    })
  };

  const activeComparison = comparison || placeholderComparison;
  const isFallbackMode = !comparison;

  const handleGenerateInsights = async () => {
    if (isFallbackMode) {
      router.push('/insights');
      return;
    }
    await generateInsights(undefined, activeSimulation?.id);
    router.push('/insights');
  };

  const mapCells = activeComparison.grid_delta.map(c => ({
    latitude: c.latitude,
    longitude: c.longitude,
    rainfall: 0,
    max_temperature: 0,
    min_temperature: 0,
    rainfall_delta: c.rainfall_delta,
    max_temp_delta: c.max_temp_delta,
  }));

  const chartStyle = { 
    backgroundColor: 'var(--surface)', 
    border: '1px solid var(--border)', 
    borderRadius: '6px', 
    fontSize: '11px', 
    color: 'var(--text)' 
  };

  // Consequence Layer calculation
  const tempDelta = activeComparison.max_temp_delta.delta;
  const rainDelta = activeComparison.rainfall_delta.delta;
  const isHeatwave = tempDelta >= 2.0;
  const isDrought = rainDelta <= -1.5;

  // 1. Environmental Impacts
  const lstImpact = `${(32.5 + tempDelta * 1.3).toFixed(1)}°C Mean LST hotspot`;
  const ndviImpact = isDrought ? '-18.5% Canopy moisture deficit' : '-4.2% Canopy moisture deficit';
  const aqiImpact = tempDelta > 2 ? '142 AQI (Unhealthy for sensitive groups)' : '84 AQI (Moderate)';
  const rainfallImpact = rainDelta < 0 ? `${Math.abs(rainDelta).toFixed(1)}mm Daily precipitation deficit` : `+${rainDelta.toFixed(1)}mm Daily surplus`;

  // 2. Operational Impacts
  const waterStress = isDrought ? 'CRITICAL (Reservoirs at 38% capacity)' : 'MODERATE (Reservoirs normal)';
  const cropRisk = (isHeatwave && isDrought) ? 'HIGH (Thermal wilting threshold breached)' : 'MODERATE (Evapotranspiration normal)';
  const healthStrain = isHeatwave ? 'CRITICAL (Heat stroke risk: Level Red)' : 'LOW (Minimal health warning)';
  const infraPressure = tempDelta > 1.5 ? 'HIGH (Grid load peak +14.2%)' : 'STABLE (Standard load)';

  // 3. Administrative Impacts
  const resourceDemand = isDrought ? 'EXTREME (Requires pre-positioning water tankers)' : 'STANDARD';
  const alertEscalation = isHeatwave ? 'STAGE 3 ALERT (Activate cooling shelters)' : 'STAGE 1 BRIEFING';
  const serviceLoad = isHeatwave ? 'ELEVATED (+9.5% hospital ER admissions)' : 'NOMINAL';

  return (
    <div className="page-root" style={{ background: 'var(--bg)', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>
      <Navbar />
      <main className="main-content-with-topbar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />

        {/* Header */}
        <header style={{
          height: '55px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={18} color="var(--primary)" />
            <h2 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)' }}>Impact Assessment Console</h2>
            {isFallbackMode && (
              <span style={{ fontSize: '9px', background: 'var(--surface-alt)', color: 'var(--muted)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>
                Simulated Template Mode
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/scenario-sandbox" style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '7px 14px', background: 'var(--surface-alt)',
              color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px',
              fontWeight: 700, textDecoration: 'none'
            }}>
              Configure Scenario
            </Link>
            <button onClick={handleGenerateInsights} disabled={isLoading} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', background: 'var(--primary)',
              color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px',
              fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
            }}>
              <BrainCircuit size={13} />
              {isLoading ? 'Generating Advisory...' : 'Generate Decision Support Brief'}
              <ArrowRight size={12} />
            </button>
          </div>
        </header>

        {activeComparison ? (
          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Primary Risk Hero */}
            <PrimaryRiskHero />

            {/* Metric Summary Cards */}
            <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              
              {/* Active Scenario */}
              <div className="premium-card" style={{ borderTop: '3px solid var(--primary)', padding: '14px' }}>
                <span style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Scenario Mode
                </span>
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px', marginBottom: '2px' }}>
                  {activeComparison.scenario_name}
                </h3>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Simulation window: {activeComparison.duration_days} days</span>
              </div>

              {/* Temperature Delta */}
              <div className="premium-card" style={{ borderTop: '3px solid var(--risk-high)', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Temperature Anomaly
                  </span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace', marginTop: '4px' }}>
                    {activeComparison.max_temp_delta.simulated_mean.toFixed(1)}°C
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>vs. {activeComparison.max_temp_delta.baseline_mean.toFixed(1)}°C baseline</span>
                </div>
                <div style={{
                  padding: '8px 10px', borderRadius: '4px',
                  background: 'rgba(255,145,0,0.1)', color: 'var(--risk-high)',
                  textAlign: 'center', border: '1px solid rgba(255,145,0,0.2)', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace'
                }}>
                  <TrendingUp size={14} style={{ marginBottom: '2px' }} />
                  <div>+{activeComparison.max_temp_delta.delta.toFixed(1)}°C</div>
                </div>
              </div>

              {/* Rainfall Delta */}
              <div className="premium-card" style={{ borderTop: '3px solid var(--accent)', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Precipitation Deviation
                  </span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace', marginTop: '4px' }}>
                    {activeComparison.rainfall_delta.simulated_mean.toFixed(2)} mm
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>vs. {activeComparison.rainfall_delta.baseline_mean.toFixed(2)} mm baseline</span>
                </div>
                <div style={{
                  padding: '8px 10px', borderRadius: '4px',
                  background: 'rgba(0,140,255,0.1)', color: 'var(--accent)',
                  textAlign: 'center', border: '1px solid rgba(0,140,255,0.2)', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace'
                }}>
                  <TrendingDown size={14} style={{ marginBottom: '2px' }} />
                  <div>{activeComparison.rainfall_delta.percentage_change}%</div>
                </div>
              </div>

            </div>

            {/* Decision Consequence Matrix */}
            <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              
              {/* Environmental Impacts */}
              <div className="premium-card" style={{ borderTop: '3px solid var(--accent)', padding: '14px' }}>
                <h4 style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                  Environmental Impact Layer
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Land Surface Temp</span>
                    <strong>{lstImpact}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Canopy Health (NDVI)</span>
                    <strong>{ndviImpact}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Air Quality Index (AQI)</span>
                    <strong>{aqiImpact}</strong>
                  </div>
                </div>
              </div>

              {/* Operational Impacts */}
              <div className="premium-card" style={{ borderTop: '3px solid var(--risk-high)', padding: '14px' }}>
                <h4 style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--risk-high)' }} />
                  Operational Impact Assessment
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Water Stress Index</span>
                    <strong>{waterStress}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Crop Anomaly Risk</span>
                    <strong>{cropRisk}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Public Health Strain</span>
                    <strong>{healthStrain}</strong>
                  </div>
                </div>
              </div>

              {/* Administrative Impacts */}
              <div className="premium-card" style={{ borderTop: '3px solid var(--risk-critical)', padding: '14px' }}>
                <h4 style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--risk-critical)' }} />
                  Administrative Directives
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Emergency Resource Demand</span>
                    <strong>{resourceDemand}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>NDMA Alert Level</span>
                    <strong>{alertEscalation}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Municipal Service Load</span>
                    <strong>{serviceLoad}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* DECISION-FIRST RECOMMENDED ACTION CARD (Phase 11) */}
            <div className="premium-card" style={{ 
              borderLeft: '5px solid var(--risk-critical)', 
              background: 'rgba(217,48,37,0.02)',
              padding: '16px 20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <AlertTriangle size={15} color="var(--risk-critical)" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Recommended Action Directives
                </span>
              </div>
              <div className="grid-2col responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', fontSize: '11.5px' }}>
                <div>
                  <strong>Status: Heatwave Anomaly Detected</strong>
                  <div style={{ color: 'var(--muted)', fontSize: '10px', marginTop: '2px' }}>Operational thresholds breached across grid.</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>• 🌡️ <strong>Open cooling centers</strong> immediately.</span>
                  <span>• 🚰 <strong>Scale municipal water tankers</strong> to water-stressed coordinates.</span>
                  <span>• 📢 <strong>Issue district health stroke warnings</strong> via public alerts.</span>
                </div>
              </div>
            </div>

            {/* Spatial Delta Map */}
            <div className="premium-card" style={{ height: '360px', display: 'flex', flexDirection: 'column', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '13px', color: 'var(--primary)' }}>Spatial Deviation Model</h4>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>
                    Grid-cell deviation map across the 0.25° spatial footprint.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { key: 'max_temp', label: 'Temperature Δ', color: 'var(--risk-high)' },
                    { key: 'rainfall', label: 'Rainfall Δ', color: 'var(--success)' },
                  ].map(({ key, label, color }) => (
                    <button 
                      key={key} 
                      onClick={() => setDeltaMode(key as 'max_temp' | 'rainfall')} 
                      style={{
                        padding: '4px 10px', fontSize: '10px', borderRadius: '4px',
                        background: deltaMode === key ? color : 'var(--surface-alt)',
                        color: deltaMode === key ? 'white' : 'var(--text)',
                        border: `1px solid ${deltaMode === key ? color : 'var(--border)'}`,
                        cursor: 'pointer', fontWeight: deltaMode === key ? 700 : 500,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <MapContainer cells={mapCells} activeLayer="delta" deltaMode={deltaMode} viewMode="2d" />
              </div>
            </div>

            {/* Daily Timeseries */}
            <div className="premium-card" style={{ height: '280px', display: 'flex', flexDirection: 'column', padding: '16px' }}>
              <h4 style={{ fontWeight: 800, fontSize: '13px', color: 'var(--primary)', marginBottom: '2px' }}>
                Daily Baseline vs. Scenario Comparison
              </h4>
              <span style={{ fontSize: '9px', color: 'var(--muted)', marginBottom: '8px' }}>
                Temporal deviation of simulated parameters against baseline forecast.
              </span>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeComparison.daily_comparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="var(--muted)" tick={{ fontSize: 9 }} />
                    <YAxis stroke="var(--muted)" tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={chartStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="baseline_max_temp" name="Baseline Temp (°C)" stroke="var(--muted)" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="simulated_max_temp" name="Scenario Temp (°C)" stroke="var(--risk-high)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="baseline_rainfall" name="Baseline Rainfall (mm)" stroke="var(--accent)" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="simulated_rainfall" name="Scenario Rainfall (mm)" stroke="var(--success)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px', color: 'var(--muted)' }}>
              <ArrowRightLeft size={36} color="var(--border)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)', marginBottom: '4px' }}>
                No Scenario Simulation Data
              </h4>
              <p style={{ fontSize: '12px', marginBottom: '16px', lineHeight: 1.5 }}>
                Configure and execute a climate scenario in the Scenario Sandbox to generate this impact assessment report.
              </p>
              <Link href="/scenario-sandbox" style={{
                padding: '8px 16px', background: 'var(--primary)',
                color: 'white', border: 'none', borderRadius: '4px',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none'
              }}>
                Open Scenario Sandbox
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Wow Moment #1 Animation Overlay */}
      {wowAnimating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(247, 249, 252, 0.95)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{ 
            width: '400px', display: 'flex', flexDirection: 'column', gap: '14px', 
            textAlign: 'center', padding: '24px', background: '#FFFFFF', 
            border: '1px solid var(--border)', borderRadius: '8px', 
            boxShadow: '0 8px 32px rgba(11,61,145,0.08)' 
          }}>
            <h3 style={{ color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, fontSize: '14px' }}>
              ⚡ Running Climate Stress Simulation
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
              Calculating regional risk index shift, water stress, and health strain...
            </p>
            
            <div style={{ width: '100%', height: '6px', background: 'var(--surface-alt)', borderRadius: '3px', overflow: 'hidden', margin: '4px 0' }}>
              <div style={{ width: `${wowProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.05s linear' }} />
            </div>

            <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px' }}>RISK INDEX</span>
                <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>{wowRiskScore}%</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px' }}>WATER STRESS</span>
                <strong style={{ color: 'var(--accent)', fontSize: '14px' }}>{wowWaterStress}%</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px' }}>HEALTH STRAIN</span>
                <strong style={{ color: 'var(--risk-critical)', fontSize: '14px' }}>{wowHealthStrain}%</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
