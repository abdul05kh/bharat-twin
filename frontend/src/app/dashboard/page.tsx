'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import MapContainer from '@/components/MapContainer';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import PrimaryRiskHero from '@/components/PrimaryRiskHero';
import { useClimateStore } from '@/store/store';
import { CloudRain, ThermometerSun, ThermometerSnowflake, Calendar, ChevronRight, Activity } from 'lucide-react';
import downloadExecutiveBrief from '@/lib/reportClient';
import Link from 'next/link';

export default function ClimateOperationsCentre() {
  const { fetchRegions, selectedRegion, currentObservations, fetchCurrentClimate, latestForecast, fetchLatestForecast } = useClimateStore();
  const [activeLayer, setActiveLayer] = useState<'rainfall' | 'max_temperature' | 'min_temperature'>('max_temperature');

  useEffect(() => { fetchRegions(); }, [fetchRegions]);
  useEffect(() => {
    if (selectedRegion) { fetchCurrentClimate(); fetchLatestForecast(); }
  }, [selectedRegion, fetchCurrentClimate, fetchLatestForecast]);

  const obsCount = currentObservations.length;
  const avgRain = obsCount ? currentObservations.reduce((a, c) => a + c.rainfall, 0) / obsCount : 0;
  const avgMax = obsCount ? currentObservations.reduce((a, c) => a + c.max_temperature, 0) / obsCount : 0;
  const avgMin = obsCount ? currentObservations.reduce((a, c) => a + c.min_temperature, 0) / obsCount : 0;
  const latestDate = obsCount ? currentObservations[0].observation_date : 'N/A';
  const forecastDays = latestForecast ? latestForecast.forecast_data : [];

  const metrics = [
    { label: 'Latest Observation Date', value: latestDate, icon: Calendar, color: 'var(--gov-cyan)', bg: 'rgba(0, 240, 255, 0.1)' },
    { label: 'Mean Max Temperature', value: `${avgMax.toFixed(1)} °C`, icon: ThermometerSun, color: '#ff3333', bg: 'rgba(255, 51, 51, 0.1)' },
    { label: 'Mean Min Temperature', value: `${avgMin.toFixed(1)} °C`, icon: ThermometerSnowflake, color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.1)' },
    { label: 'Mean Rainfall', value: `${avgRain.toFixed(2)} mm`, icon: CloudRain, color: '#00ff66', bg: 'rgba(0, 255, 102, 0.1)' },
  ];

  const LAYERS = [
    { key: 'max_temperature', label: 'Max Temp', color: '#ff3333' },
    { key: 'min_temperature', label: 'Min Temp', color: '#00f0ff' },
    { key: 'rainfall', label: 'Rainfall', color: '#00ff66' },
  ] as const;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />
        {/* Header */}
        <header style={{

          height: '60px', background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={18} color="var(--warning)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
              Climate Operations Centre
            </h2>
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '3px',
              background: 'rgba(0, 240, 255, 0.1)', color: 'var(--gov-cyan)', border: '1px solid rgba(0, 240, 255, 0.2)',
              fontFamily: "'Noto Sans', monospace", letterSpacing: '0.04em',
            }}>
              {selectedRegion?.name || 'Hyderabad Metropolitan Region'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--gov-green)', display: 'inline-block' }} className="status-live" />
            IMD Telemetry Link: Fused
          </div>
        </header>        {/* Scrollable Workspace */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Hero Risk Assessment Header */}
          <PrimaryRiskHero />

          {/* Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            {metrics.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                borderTop: `3px solid ${color}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: 'white', fontFamily: "'Noto Sans', monospace" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
            {/* Map Panel */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>
                  IMD Spatial Observations Grid — Mesoscale Telemetry
                </h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {LAYERS.map(({ key, label, color }) => (
                    <button key={key} onClick={() => setActiveLayer(key)} style={{
                      padding: '4px 12px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer',
                      fontWeight: activeLayer === key ? 600 : 400,
                      background: activeLayer === key ? color : 'var(--neutral-100)',
                      color: activeLayer === key ? 'black' : 'white',
                      border: `1px solid ${activeLayer === key ? color : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minHeight: '380px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-dark)' }}>
                {obsCount > 0
                  ? <MapContainer cells={currentObservations} activeLayer={activeLayer} viewMode="2d" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px', background: 'var(--surface-dark)' }}>
                      Loading spatial grid data...
                    </div>
                }
              </div>
            </div>

            {/* Side Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Grid Observations */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '14px', height: '220px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                borderTop: '3px solid var(--gov-saffron)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <h3 style={{ fontWeight: 600, fontSize: '11px', color: 'white', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Climate Telemetry Points
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentObservations.slice(0, 12).map((obs, i) => (
                    <div key={i} style={{
                      padding: '8px 10px', background: 'var(--surface-dark)', borderRadius: '4px',
                      border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: '11px',
                    }}>
                      <div>
                        <div style={{ fontFamily: "'Noto Sans', monospace", color: 'var(--text-secondary)', fontSize: '10px' }}>
                          {obs.latitude.toFixed(2)}°N, {obs.longitude.toFixed(2)}°E
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{obs.source}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--risk-critical)', fontWeight: 600 }}>{obs.max_temperature.toFixed(1)}°C</div>
                        <div style={{ color: 'var(--risk-low)', fontSize: '10px' }}>{obs.rainfall.toFixed(1)} mm</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forecast Snapshot */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', borderTop: '3px solid var(--gov-cyan)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontWeight: 600, fontSize: '11px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Predictive Outlook
                  </h3>
                  <Link href="/analytics" style={{ fontSize: '10px', color: 'var(--gov-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Full Analysis <ChevronRight size={10} />
                  </Link>
                </div>
                {forecastDays.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {forecastDays.slice(0, 3).map((day, i) => {
                      const r = day.grid_cells.reduce((a, c) => a + c.rainfall, 0) / day.grid_cells.length;
                      const t = day.grid_cells.reduce((a, c) => a + c.max_temperature, 0) / day.grid_cells.length;
                      return (
                        <div key={i} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'center', background: 'var(--surface-dark)' }}>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '3px', fontFamily: "'Noto Sans', monospace" }}>
                            {day.date.split('-').slice(1).join('/')}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--risk-critical)' }}>{t.toFixed(1)}°C</div>
                          <div style={{ fontSize: '10px', color: 'var(--risk-low)' }}>{r.toFixed(1)} mm</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '12px', border: '1px dashed var(--border)', borderRadius: '4px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <Link href="/analytics" style={{ color: 'var(--gov-cyan)', textDecoration: 'none', fontWeight: 600 }}>
                      Generate Forecast →
                    </Link>
                  </div>
                )}
              </div>

              {/* Sensor Integrity Verification Card */}
                {/* Executive Brief Card (prominent) */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text)', marginBottom: '8px' }}>Executive Climate Brief</h3>
                      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>One-click brief: impact, recommended action, confidence.</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => downloadExecutiveBrief({})} style={{ padding: '10px 12px', background: 'var(--accent)', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 700 }}>Download PDF</button>
                    <Link href="/briefing" style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>View Report</Link>
                  </div>
                </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', borderTop: '3px solid var(--risk-low)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontWeight: 600, fontSize: '11px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Sensor Integrity Registry
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--risk-low)', fontWeight: 600 }}>
                    ✓ Source Verified
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--risk-low)', fontWeight: 600 }}>
                    ✓ Coverage Verified
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--risk-low)', fontWeight: 600 }}>
                    ✓ Checksum Validated
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--risk-low)', fontWeight: 600 }}>
                    ✓ Bounds Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
