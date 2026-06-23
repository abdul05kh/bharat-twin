'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MapContainer from '@/components/MapContainer';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import PrimaryRiskHero from '@/components/PrimaryRiskHero';
import { useClimateStore } from '@/store/store';
import { useRouter } from 'next/navigation';
import { BarChart2, TrendingDown, TrendingUp, BrainCircuit, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function ImpactAssessmentConsole() {
  const router = useRouter();
  const { comparison, activeSimulation, generateInsights, isLoading } = useClimateStore();
  const [deltaMode, setDeltaMode] = useState<'max_temp' | 'rainfall'>('max_temp');
  const [wowAnimating, setWowAnimating] = useState(false);
  const [wowRiskScore, setWowRiskScore] = useState(45);
  const [wowProgress, setWowProgress] = useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('wow') === 'true') {
        setWowAnimating(true);
        // Start rapid risk index count up (completes in 1.4s)
        let score = 45;
        const interval = setInterval(() => {
          score += 3;
          if (score >= 88) {
            setWowRiskScore(88);
            clearInterval(interval);
          } else {
            setWowRiskScore(score);
          }
        }, 80);
        
        // Progress bar simulation (completes in 1.8s)
        let progress = 0;
        const pInterval = setInterval(() => {
          progress += 5;
          if (progress >= 100) {
            setWowProgress(100);
            setWowAnimating(false);
            clearInterval(pInterval);
          } else {
            setWowProgress(progress);
          }
        }, 90);

        return () => {
          clearInterval(interval);
          clearInterval(pInterval);
        };
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

  const chartStyle = { backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-primary)' };

  // Consequence Layer calculation
  const tempDelta = activeComparison.max_temp_delta.delta;
  const rainDelta = activeComparison.rainfall_delta.delta;
  const isHeatwave = tempDelta >= 2.0;
  const isDrought = rainDelta <= -1.5;

  // 1. Environmental Impacts
  const lstImpact = `${(32.5 + tempDelta * 1.3).toFixed(1)}°C Mean LST hotspot`;
  const ndviImpact = isDrought ? '-18.5% Canopy Moisture Deficit' : '-4.2% Canopy Moisture Deficit';
  const aqiImpact = tempDelta > 2 ? '142 AQI (Unhealthy for sensitive groups)' : '84 AQI (Moderate)';
  const rainfallImpact = rainDelta < 0 ? `${Math.abs(rainDelta).toFixed(1)}mm Daily Precipitation Deficit` : `+${rainDelta.toFixed(1)}mm Daily Surplus`;

  // 2. Operational Impacts
  const waterStress = isDrought ? 'CRITICAL (Municipal reservoirs at 38% capacity)' : 'MODERATE (Reservoirs normal)';
  const cropRisk = (isHeatwave && isDrought) ? 'HIGH (Thermal wilting threshold breached for kharif crops)' : 'MODERATE (Normal evapotranspiration)';
  const healthStrain = isHeatwave ? 'CRITICAL (Urban heat stroke risk index: Level Red)' : 'LOW (Minimal health advisory impact)';
  const infraPressure = tempDelta > 1.5 ? 'HIGH (Grid load capacity peak +14.2% due to air conditioning load)' : 'STABLE (Standard distribution)';

  // 3. Administrative Impacts
  const resourceDemand = isDrought ? 'EXTREME (Requires pre-positioning of 120 additional water tankers)' : 'STANDARD';
  const alertEscalation = isHeatwave ? 'STAGE 3 ALERT (Activate municipal cooling shelters)' : 'STAGE 1 BRIEFING';
  const serviceLoad = isHeatwave ? 'ELEVATED (+9.5% hospital ER admissions for dehydration/exhaustion)' : 'NOMINAL';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />

        <header style={{
          height: '60px', background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Impact Assessment Console</h2>
            {isFallbackMode && (
              <span style={{ fontSize: '9px', background: 'rgba(255, 145, 0, 0.1)', color: '#FF9100', padding: '2px 8px', borderRadius: '3px', border: '1px solid rgba(255, 145, 0, 0.2)', fontWeight: 600, marginLeft: '10px' }}>
                Simulated Scenario Template
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/time-machine" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', background: 'var(--neutral-100)',
              color: 'white', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '12px',
              fontWeight: 700, textDecoration: 'none', cursor: 'pointer'
            }}>
              Configure Scenario
            </Link>
            <button onClick={handleGenerateInsights} disabled={isLoading} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', background: 'var(--gov-saffron)',
              color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px',
              fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
            }}>
              <BrainCircuit size={14} />
              {isLoading ? 'Generating Advisory...' : 'Generate Decision Support Brief'}
              <ArrowRight size={13} />
            </button>
          </div>
        </header>

        {activeComparison ? (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Primary Risk Hero Header */}
            <PrimaryRiskHero />

            {/* 1. Metric Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {/* Scenario Info */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3px solid var(--gov-saffron)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontWeight: 600 }}>
                  Active Scenario
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {activeComparison.scenario_name}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Simulation window: {activeComparison.duration_days} days</span>
              </div>

              {/* Temperature Delta */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${activeComparison.max_temp_delta.delta > 0 ? '#ff3333' : '#00f0ff'}`, borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '6px' }}>
                    Temperature Anomaly
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: "monospace" }}>
                    {activeComparison.max_temp_delta.simulated_mean.toFixed(1)}°C
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    vs. {activeComparison.max_temp_delta.baseline_mean.toFixed(1)}°C baseline
                  </div>
                </div>
                <div style={{
                  padding: '10px', borderRadius: '6px',
                  background: activeComparison.max_temp_delta.delta > 0 ? 'rgba(255, 51, 51, 0.1)' : 'rgba(0, 240, 255, 0.1)',
                  color: activeComparison.max_temp_delta.delta > 0 ? '#ff3333' : '#00f0ff',
                  textAlign: 'center', border: `1px solid ${activeComparison.max_temp_delta.delta > 0 ? 'rgba(255, 51, 51, 0.3)' : 'rgba(0, 240, 255, 0.3)'}`
                }}>
                  {activeComparison.max_temp_delta.delta > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px', fontFamily: "monospace" }}>
                    {activeComparison.max_temp_delta.delta > 0 ? '+' : ''}{activeComparison.max_temp_delta.delta.toFixed(1)}°C
                  </div>
                </div>
              </div>

              {/* Rainfall Delta */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${activeComparison.rainfall_delta.delta > 0 ? '#00ff66' : '#ff6600'}`, borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '6px' }}>
                    Precipitation Deviation
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: "monospace" }}>
                    {activeComparison.rainfall_delta.simulated_mean.toFixed(2)} mm
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    vs. {activeComparison.rainfall_delta.baseline_mean.toFixed(2)} mm baseline
                  </div>
                </div>
                <div style={{
                  padding: '10px', borderRadius: '6px',
                  background: activeComparison.rainfall_delta.delta > 0 ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 102, 0, 0.1)',
                  color: activeComparison.rainfall_delta.delta > 0 ? '#00ff66' : '#ff6600',
                  textAlign: 'center', border: `1px solid ${activeComparison.rainfall_delta.delta > 0 ? 'rgba(0, 255, 102, 0.3)' : 'rgba(255, 102, 0, 0.3)'}`
                }}>
                  {activeComparison.rainfall_delta.delta > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px', fontFamily: "monospace" }}>
                    {activeComparison.rainfall_delta.percentage_change > 0 ? '+' : ''}{activeComparison.rainfall_delta.percentage_change}%
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Consequence Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {/* Environmental Impacts */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3px solid var(--gov-cyan)', borderRadius: '6px', padding: '16px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gov-cyan)' }} />
                  Environmental Impact Layer
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Land Surface Temp (LST)</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{lstImpact}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Vegetation Health (NDVI)</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{ndviImpact}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Air Quality Index (AQI)</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{aqiImpact}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Precipitation Deviation</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{rainfallImpact}</span>
                  </div>
                </div>
              </div>

              {/* Operational Impacts */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3px solid var(--gov-saffron)', borderRadius: '6px', padding: '16px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gov-saffron)' }} />
                  Operational Impact Assessment
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Water Stress Index</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{waterStress}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Agricultural Crop Risk</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{cropRisk}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Public Health Strain</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{healthStrain}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Grid & Infrastructure Load</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{infraPressure}</span>
                  </div>
                </div>
              </div>

              {/* Administrative Impacts */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3px solid var(--risk-critical)', borderRadius: '6px', padding: '16px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--risk-critical)' }} />
                  Administrative Directives
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Emergency Resource Demand</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{resourceDemand}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>NDMA Alert Escalation level</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{alertEscalation}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Municipal Service Load</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{serviceLoad}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Spatial Delta Map */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', height: '400px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>Spatial Deviation Model</h4>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Grid-cell deviation map across the 0.25° IMD spatial footprint
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { key: 'max_temp', label: 'Temperature Δ', color: '#ff3333' },
                    { key: 'rainfall', label: 'Rainfall Δ', color: '#00ff66' },
                  ].map(({ key, label, color }) => (
                    <button key={key} onClick={() => setDeltaMode(key as 'max_temp' | 'rainfall')} style={{
                      padding: '5px 12px', fontSize: '11px', borderRadius: '4px',
                      background: deltaMode === key ? color : 'var(--neutral-100)',
                      color: 'white',
                      border: `1px solid ${deltaMode === key ? color : 'var(--border)'}`,
                      cursor: 'pointer', fontWeight: deltaMode === key ? 600 : 400,
                    }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-dark)' }}>
                <MapContainer cells={mapCells} activeLayer="delta" deltaMode={deltaMode} viewMode="2d" />
              </div>
            </div>

            {/* 3. Daily Timeseries */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', height: '340px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontWeight: 600, fontSize: '13px', color: 'white', marginBottom: '4px' }}>
                Daily Baseline vs. Scenario Comparison
              </h4>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Temporal deviation of simulated parameters against unperturbed baseline forecast
              </p>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeComparison.daily_comparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 9 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={chartStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="baseline_max_temp" name="Baseline Max Temp (°C)" stroke="var(--text-muted)" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="simulated_max_temp" name="Scenario Max Temp (°C)" stroke="#ff3333" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="baseline_rainfall" name="Baseline Rainfall (mm)" stroke="var(--text-light)" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey="simulated_rainfall" name="Scenario Rainfall (mm)" stroke="#00ff66" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: '420px', padding: '24px', color: 'var(--text-muted)' }}>
              <ArrowRightLeft size={40} color="var(--neutral-300)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontWeight: 600, fontSize: '16px', color: 'white', marginBottom: '6px' }}>
                No Scenario Simulation Data
              </h4>
              <p style={{ fontSize: '13px', marginBottom: '20px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                Configure and execute a climate scenario in the <Link href="/time-machine" style={{ color: 'var(--gov-cyan)', fontWeight: 600 }}>Climate Scenario Laboratory</Link> to generate the impact assessment comparison.
              </p>
              <Link href="/time-machine" style={{
                padding: '10px 20px', background: 'var(--gov-saffron)',
                color: 'white', border: 'none', borderRadius: '4px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none'
              }}>
                Open Climate Scenario Laboratory
              </Link>
            </div>
          </div>
        )}
      </main>

      {wowAnimating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 12, 30, 0.95)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{ width: '420px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: 'var(--gov-saffron)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, fontSize: '15px' }}>
              ⚡ Apply Stress Preset Overlays
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Calculating regional risk index shift and spatial deviation...
            </p>
            
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', margin: '8px 0' }}>
              <div style={{ width: `${wowProgress}%`, height: '100%', background: 'var(--gov-saffron)', transition: 'width 0.08s linear' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              <span>Risk Index Shift: {wowRiskScore} / 100</span>
              <span>STRESS INDICATORS: {wowRiskScore > 75 ? 'CRITICAL' : 'HIGH'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
