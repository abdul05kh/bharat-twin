'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MapContainer from '@/components/MapContainer';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { useClimateStore } from '@/store/store';
import { useRouter } from 'next/navigation';
import { BarChart2, TrendingDown, TrendingUp, BrainCircuit, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function ImpactAssessmentConsole() {
  const router = useRouter();
  const { comparison, activeSimulation, generateInsights, isLoading } = useClimateStore();
  const [deltaMode, setDeltaMode] = useState<'max_temp' | 'rainfall'>('max_temp');

  const handleGenerateInsights = async () => {
    if (!comparison) return;
    await generateInsights(undefined, activeSimulation?.id);
    router.push('/insights');
  };

  const mapCells = comparison?.grid_delta.map(c => ({
    latitude: c.latitude,
    longitude: c.longitude,
    rainfall: 0,
    max_temperature: 0,
    min_temperature: 0,
    rainfall_delta: c.rainfall_delta,
    max_temp_delta: c.max_temp_delta,
  })) || [];

  const chartStyle = { backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-primary)' };

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
          </div>
          {comparison && (
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
          )}
        </header>

        {comparison ? (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>

            {/* 1. Metric Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {/* Scenario Info */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3px solid var(--gov-saffron)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontWeight: 600 }}>
                  Active Scenario
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {comparison.scenario_name}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Simulation window: {comparison.duration_days} days</span>
              </div>

              {/* Temperature Delta */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${comparison.max_temp_delta.delta > 0 ? '#ff3333' : '#00f0ff'}`, borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '6px' }}>
                    Temperature Anomaly
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: "monospace" }}>
                    {comparison.max_temp_delta.simulated_mean.toFixed(1)}°C
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    vs. {comparison.max_temp_delta.baseline_mean.toFixed(1)}°C baseline
                  </div>
                </div>
                <div style={{
                  padding: '10px', borderRadius: '6px',
                  background: comparison.max_temp_delta.delta > 0 ? 'rgba(255, 51, 51, 0.1)' : 'rgba(0, 240, 255, 0.1)',
                  color: comparison.max_temp_delta.delta > 0 ? '#ff3333' : '#00f0ff',
                  textAlign: 'center', border: `1px solid ${comparison.max_temp_delta.delta > 0 ? 'rgba(255, 51, 51, 0.3)' : 'rgba(0, 240, 255, 0.3)'}`
                }}>
                  {comparison.max_temp_delta.delta > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px', fontFamily: "monospace" }}>
                    {comparison.max_temp_delta.delta > 0 ? '+' : ''}{comparison.max_temp_delta.delta.toFixed(1)}°C
                  </div>
                </div>
              </div>

              {/* Rainfall Delta */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${comparison.rainfall_delta.delta > 0 ? '#00ff66' : '#ff6600'}`, borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '6px' }}>
                    Precipitation Deviation
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: "monospace" }}>
                    {comparison.rainfall_delta.simulated_mean.toFixed(2)} mm
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    vs. {comparison.rainfall_delta.baseline_mean.toFixed(2)} mm baseline
                  </div>
                </div>
                <div style={{
                  padding: '10px', borderRadius: '6px',
                  background: comparison.rainfall_delta.delta > 0 ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 102, 0, 0.1)',
                  color: comparison.rainfall_delta.delta > 0 ? '#00ff66' : '#ff6600',
                  textAlign: 'center', border: `1px solid ${comparison.rainfall_delta.delta > 0 ? 'rgba(0, 255, 102, 0.3)' : 'rgba(255, 102, 0, 0.3)'}`
                }}>
                  {comparison.rainfall_delta.delta > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px', fontFamily: "monospace" }}>
                    {comparison.rainfall_delta.percentage_change > 0 ? '+' : ''}{comparison.rainfall_delta.percentage_change}%
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Spatial Delta Map */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', marginBottom: '20px', height: '400px', display: 'flex', flexDirection: 'column' }}>
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
                  <LineChart data={comparison.daily_comparison}>
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
    </div>
  );
}
