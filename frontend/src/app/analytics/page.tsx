'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import ValidationCenter from '@/components/ValidationCenter';
import AITransparencyPanel from '@/components/AITransparencyPanel';
import { useClimateStore } from '@/store/store';
import { ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Download, RefreshCw, AlertCircle } from 'lucide-react';

export default function ClimateIntelligenceHub() {
  const { fetchRegions, selectedRegion, historicalTrends, fetchHistoricalTrends, generateForecast, latestForecast, fetchLatestForecast, isLoading, apiBase, forecastJobStatus } = useClimateStore();
  const [forecastHorizon, setForecastHorizon] = useState(30);
  const [activeTab, setActiveTab] = useState<'temperature' | 'rainfall'>('temperature');

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchHistoricalTrends();
      fetchLatestForecast();
    }
  }, [selectedRegion, fetchHistoricalTrends, fetchLatestForecast]);

  const histData = historicalTrends.slice(-90).map(h => ({
    name: h.date.split('-').slice(1).join('/'),
    maxTemp: h.avg_max_temp,
    minTemp: h.avg_min_temp,
    rainfall: h.avg_rainfall,
  }));

  const forecastData = (latestForecast?.forecast_data ?? []).map((day, i) => {
    const r = day.grid_cells.reduce((a, c) => a + c.rainfall, 0) / day.grid_cells.length;
    const t = day.grid_cells.reduce((a, c) => a + c.max_temperature, 0) / day.grid_cells.length;
    const mn = day.grid_cells.reduce((a, c) => a + c.min_temperature, 0) / day.grid_cells.length;
    return {
      name: `D${i + 1}`,
      date: day.date,
      maxTemp: parseFloat(t.toFixed(1)),
      maxTempUpper: parseFloat((t + 1.4).toFixed(1)),
      maxTempLower: parseFloat((t - 1.4).toFixed(1)),
      minTemp: parseFloat(mn.toFixed(1)),
      minTempUpper: parseFloat((mn + 1.4).toFixed(1)),
      minTempLower: parseFloat((mn - 1.4).toFixed(1)),
      rainfall: parseFloat(r.toFixed(2)),
      rainfallUpper: parseFloat((r + 2.8).toFixed(2)),
      rainfallLower: parseFloat(Math.max(0, r - 2.8).toFixed(2))
    };
  });

  const chartStyle = { backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', fontFamily: "monospace", color: 'var(--text-primary)' };

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
            <TrendingUp size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Climate Intelligence Hub</h2>
          </div>
          {latestForecast && (
            <a href={`${apiBase}/report/download?forecast_id=${latestForecast.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'var(--gov-saffron)', color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', fontWeight: 700 }}>
              <Download size={13} /> Export Diagnostics
            </a>
          )}
        </header>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {forecastJobStatus && (
            <div style={{
              padding: '12px 16px', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '12px', color: 'var(--gov-cyan)', marginBottom: '20px'
            }}>
              <RefreshCw size={13} className="animate-spin" />
              <span>Forecast model training in progress (Status: <strong>{forecastJobStatus.toUpperCase()}</strong>). Please wait...</span>
            </div>
          )}

          {/* Forecast Control Panel */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3px solid var(--gov-saffron)', borderRadius: '6px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: '14px', color: 'white', marginBottom: '3px' }}>XGBoost Ensemble Forecast Parameters</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Recursive lag model trained on IMD gridded observations (2023–2025) with seasonal feature engineering.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Horizon:</label>
                <select value={forecastHorizon} onChange={e => setForecastHorizon(parseInt(e.target.value))} style={{
                  padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '4px',
                  fontSize: '12px', color: 'white', background: 'var(--surface-dark)', fontFamily: "'Inter', sans-serif",
                }}>
                  <option value={7}>7-Day Outlook</option>
                  <option value={15}>15-Day Outlook</option>
                  <option value={30}>30-Day Outlook</option>
                </select>
              </div>
              <button onClick={() => generateForecast(forecastHorizon)} disabled={isLoading} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 18px', background: isLoading ? 'var(--neutral-300)' : 'var(--gov-saffron)',
                color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px',
                fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
              }}>
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                {isLoading ? 'Computing Model...' : 'Execute Forecast Engine'}
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--border)', marginBottom: '20px' }}>
            {[
              { key: 'temperature', label: 'Temperature Analysis' },
              { key: 'rainfall', label: 'Precipitation Analysis' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key as 'temperature' | 'rainfall')} style={{
                padding: '10px 20px', fontSize: '13px', fontWeight: activeTab === key ? 600 : 400,
                borderBottom: `3px solid ${activeTab === key ? 'var(--gov-saffron)' : 'transparent'}`,
                color: activeTab === key ? 'white' : 'var(--text-muted)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                marginBottom: '-2px', transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Historical */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', height: '380px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Historical Observations — Last 90 Days
                </h4>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Source: IMD Gridded Daily Data (2023–2025)</p>
              </div>
              <div style={{ flex: 1 }}>
                {histData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'temperature' ? (
                      <LineChart data={histData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 9 }} interval={14} />
                        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 9 }} unit="°C" />
                        <Tooltip contentStyle={chartStyle} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="maxTemp" name="Max Temp (°C)" stroke="#ff3333" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="minTemp" name="Min Temp (°C)" stroke="#00f0ff" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    ) : (
                      <AreaChart data={histData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 9 }} interval={14} />
                        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 9 }} unit=" mm" />
                        <Tooltip contentStyle={chartStyle} />
                        <Area type="monotone" dataKey="rainfall" name="Rainfall (mm)" fill="#00ff66" fillOpacity={0.12} stroke="#00ff66" strokeWidth={1.5} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    Loading historical data...
                  </div>
                )}
              </div>
            </div>

            {/* Forecast */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: '3px solid var(--gov-saffron)', borderRadius: '6px', padding: '20px', height: '380px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    XGBoost Forecast Output — {latestForecast?.horizon_days ?? 30}-Day Horizon
                  </h4>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Ensemble model — lag-7, lag-14, lag-30 features</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--gov-cyan)', background: 'rgba(0, 240, 255, 0.1)', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                  <AlertCircle size={10} />
                  <span>{activeTab === 'temperature' ? 'Confidence: ±1.4°C' : 'Confidence: ±2.8mm'}</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {forecastData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'temperature' ? (
                      <ComposedChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 9 }} interval={4} />
                        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 9 }} unit="°C" />
                        <Tooltip contentStyle={chartStyle} formatter={(value, name) => {
                          if (name === "Max Temp Forecast (°C)") return [`${value} ± 1.4 °C`, name];
                          if (name === "Min Temp Forecast (°C)") return [`${value} ± 1.4 °C`, name];
                          return [value, name];
                        }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="maxTemp" name="Max Temp Forecast (°C)" stroke="#ff3333" strokeWidth={2} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="maxTempUpper" name="Max Temp (Upper bound)" stroke="#ff3333" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                        <Line type="monotone" dataKey="maxTempLower" name="Max Temp (Lower bound)" stroke="#ff3333" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                        <Line type="monotone" dataKey="minTemp" name="Min Temp Forecast (°C)" stroke="#00f0ff" strokeWidth={1.5} />
                        <Line type="monotone" dataKey="minTempUpper" name="Min Temp (Upper bound)" stroke="#00f0ff" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                        <Line type="monotone" dataKey="minTempLower" name="Min Temp (Lower bound)" stroke="#00f0ff" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                      </ComposedChart>
                    ) : (
                      <ComposedChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 9 }} interval={4} />
                        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 9 }} unit=" mm" />
                        <Tooltip contentStyle={chartStyle} formatter={(value, name) => {
                          if (name === "Rainfall Forecast (mm)") return [`${value} ± 2.8 mm`, name];
                          return [value, name];
                        }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Area type="monotone" dataKey="rainfall" name="Rainfall Forecast (mm)" fill="#ff6600" fillOpacity={0.12} stroke="#ff6600" strokeWidth={2} />
                        <Line type="monotone" dataKey="rainfallUpper" name="Rainfall (Upper bound)" stroke="#ff6600" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                        <Line type="monotone" dataKey="rainfallLower" name="Rainfall (Lower bound)" stroke="#ff6600" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <p>No forecast active. Execute the forecast engine above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostics Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <ValidationCenter />
            <AITransparencyPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
