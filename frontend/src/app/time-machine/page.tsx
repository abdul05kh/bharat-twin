'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { useClimateStore } from '@/store/store';
import { useRouter } from 'next/navigation';
import { Settings2, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ClimateScenarioLaboratory() {
  const router = useRouter();
  const { fetchRegions, selectedRegion, latestForecast, fetchLatestForecast, createScenario, runSimulation, isLoading } = useClimateStore();

  const [scenarioName, setScenarioName] = useState('Compound Drought & Heat Stress — Hyderabad');
  const [rainAdj, setRainAdj] = useState(-20);
  const [tempAdj, setTempAdj] = useState(2.5);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchLatestForecast();
    }
  }, [selectedRegion, fetchLatestForecast]);

  const handleRun = async () => {
    if (!latestForecast) return;
    const scenario = await createScenario(scenarioName, rainAdj, tempAdj, duration);
    await runSimulation(scenario.id, latestForecast.id);
    router.push('/compare');
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px',
  };

  const metricBadge = (val: number, unit: string, positiveIsWarning = true) => {
    const isPositive = val >= 0;
    const color = positiveIsWarning
      ? (val > 2 ? '#ff3333' : val < -1 ? '#00f0ff' : '#00ff66')
      : (val > 20 ? '#00ff66' : val < -20 ? '#ff6600' : 'var(--text-secondary)');
    return (
      <span style={{
        fontFamily: "monospace", fontSize: '18px', fontWeight: 700, color,
      }}>
        {val > 0 ? '+' : ''}{val.toFixed(typeof val === 'number' && Math.abs(val) < 10 ? 1 : 0)}{unit}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />

        <header style={{
          height: '60px', background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '10px', padding: '0 24px', flexShrink: 0,
        }}>
          <Settings2 size={18} color="var(--gov-saffron)" />
          <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Climate Scenario Laboratory</h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
            Parameterised Climate Simulation — Hyderabad Metropolitan Region
          </span>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '960px', width: '100%', margin: '0 auto' }}>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
              Configure Climate Scenario
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Modify precipitation and thermal parameters to simulate alternate climate futures across the
              0.25° IMD spatial grid. Results feed directly into the Impact Assessment Console.
            </p>
          </div>

          {latestForecast ? (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

              {/* Parameters Panel */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3px solid var(--gov-saffron)', borderRadius: '6px', padding: '24px' }}>
                <h4 style={{ fontWeight: 600, fontSize: '13px', color: 'white', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Scenario Parameters
                </h4>

                {/* Scenario Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Scenario Designation</label>
                  <input type="text" value={scenarioName} onChange={e => setScenarioName(e.target.value)} style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: '4px', fontSize: '13px', color: 'white',
                    fontFamily: "'Inter', sans-serif", outline: 'none', background: 'var(--surface-dark)',
                  }} />
                </div>

                {/* Temperature */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Temperature Anomaly</label>
                    {metricBadge(tempAdj, ' °C')}
                  </div>
                  <input type="range" min="-5" max="5" step="0.5" value={tempAdj}
                    onChange={e => setTempAdj(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gov-saffron)', height: '4px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: "monospace" }}>
                    <span>−5.0°C (Cooling)</span>
                    <span>Baseline: 0.0°C</span>
                    <span>+5.0°C (Heating)</span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                    Reference: IMD Heat Warning ≥37°C · Heatwave ≥40°C (plains)
                  </div>
                </div>

                {/* Rainfall */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Precipitation Deviation</label>
                    {metricBadge(rainAdj, '%', false)}
                  </div>
                  <input type="range" min="-100" max="100" step="10" value={rainAdj}
                    onChange={e => setRainAdj(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gov-saffron)', height: '4px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: "monospace" }}>
                    <span>−100% (Arid)</span>
                    <span>Baseline: 0%</span>
                    <span>+100% (Wet)</span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                    Reference: IMD SPI &lt;−1.0 Moderate Drought · Heavy Rain ≥64.5mm/day
                  </div>
                </div>

                {/* Duration */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Simulation Duration</label>
                  <select value={duration} onChange={e => setDuration(parseInt(e.target.value))} style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: '4px', fontSize: '13px', background: 'var(--surface-dark)', color: 'white', fontFamily: "'Inter', sans-serif",
                  }}>
                    <option value={7}>7-Day simulation window</option>
                    <option value={15}>15-Day simulation window</option>
                    <option value={30}>30-Day simulation window</option>
                  </select>
                </div>

                <button onClick={handleRun} disabled={isLoading} style={{
                  width: '100%', padding: '13px', background: isLoading ? 'var(--neutral-300)' : 'var(--gov-saffron)',
                  color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px',
                  fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.04em',
                  transition: 'background 0.2s',
                }}>
                  {isLoading ? 'Executing Scenario Model...' : 'EXECUTE SCENARIO MODEL'}
                </button>
              </div>

              {/* Info Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* How it works */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3px solid var(--gov-saffron)', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Info size={13} color="var(--gov-saffron)" />
                    <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Simulation Methodology
                    </h4>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    The engine clones the active forecast and applies parametric adjustments across all 0.25° grid cells.
                    Statistical perturbations maintain spatial autocorrelation from the base XGBoost ensemble model.
                  </p>
                </div>

                {/* Diagnostics */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                    Base Model Diagnostics
                  </h4>
                  {[
                    ['Forecast ID', latestForecast.id.slice(0, 12) + '...'],
                    ['Horizon', `${latestForecast.horizon_days} days`],
                    ['Grid Cells', latestForecast.forecast_data[0]?.grid_cells.length ?? 'N/A'],
                    ['Source', 'IMD Gridded (0.25°)'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--neutral-200)', fontSize: '11px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                      <span style={{ fontFamily: "monospace", color: 'var(--text-secondary)', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Scenario Preview */}
                <div style={{ background: 'rgba(255, 102, 0, 0.1)', border: '1px solid rgba(255, 102, 0, 0.3)', borderRadius: '6px', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <AlertCircle size={13} color="var(--gov-saffron)" />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scenario Preview</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Temp: <strong>{tempAdj > 0 ? '+' : ''}{tempAdj.toFixed(1)}°C</strong> ·
                    Rain: <strong>{rainAdj > 0 ? '+' : ''}{rainAdj}%</strong> over <strong>{duration} days</strong>
                    <br />
                    {tempAdj > 2 && rainAdj < -10 && <span style={{ color: '#ff3333' }}>⚠ Compound drought-heat scenario</span>}
                    {rainAdj > 40 && <span style={{ color: '#00f0ff' }}>⚠ Potential flood hazard scenario</span>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '48px 24px', border: '1px dashed var(--border)', borderRadius: '6px',
              textAlign: 'center', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto',
            }}>
              <Settings2 size={36} color="var(--neutral-300)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontWeight: 600, color: 'white', marginBottom: '6px' }}>
                No Baseline Model Active
              </h4>
              <p style={{ fontSize: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                A baseline XGBoost forecast must be executed in the <Link href="/analytics" style={{ color: 'var(--gov-cyan)', fontWeight: 600 }}>Climate Intelligence Hub</Link> before scenario simulations can be configured.
              </p>
              <Link href="/analytics" style={{
                display: 'inline-block', padding: '9px 20px', background: 'var(--gov-saffron)',
                color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
              }}>
                Open Climate Intelligence Hub
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
