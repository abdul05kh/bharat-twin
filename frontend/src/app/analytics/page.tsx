'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import ValidationCenter from '@/components/ValidationCenter';
import AITransparencyPanel from '@/components/AITransparencyPanel';
import { useClimateStore } from '@/store/store';
import downloadExecutiveBrief from '@/lib/reportClient';
import { ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ClimateIntelligenceHub() {
  const { 
    fetchRegions, 
    selectedRegion, 
    historicalTrends, 
    fetchHistoricalTrends, 
    generateForecast, 
    latestForecast, 
    fetchLatestForecast, 
    isLoading, 
    apiBase, 
    forecastJobStatus 
  } = useClimateStore();
  
  const [forecastHorizon, setForecastHorizon] = useState(30);
  const [activeTab, setActiveTab] = useState<'temperature' | 'rainfall'>('temperature');
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  // Hardened Forecast Export system states
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'ready' | 'error'>('idle');
  const [exportError, setExportError] = useState<string | null>(null);

  const triggerForecastExport = () => {
    console.log('[TELEMETRY] Forecast Export triggered', {
      timestamp: new Date().toISOString(),
      forecastId: latestForecast?.id,
      dataPoints: forecastData.length
    });

    if (exportStatus === 'exporting') return;
    setExportStatus('exporting');
    setExportError(null);

    setTimeout(() => {
      try {
        if (!forecastData || forecastData.length === 0) {
          throw new Error('No forecast data available to export');
        }

        const dataStr = JSON.stringify({
          region: selectedRegion?.name || 'Hyderabad Metropolitan Region',
          exportedAt: new Date().toISOString(),
          forecastId: latestForecast?.id || 'BT-FC-PLACEHOLDER',
          horizonDays: forecastHorizon,
          forecastSeries: forecastData
        }, null, 2);

        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `bharat_twin_forecast_${selectedRegion?.name?.toLowerCase().replace(/\s+/g, '_') || 'hyderabad'}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        setExportStatus('ready');
        setTimeout(() => setExportStatus('idle'), 1500);
      } catch (err: any) {
        console.error('Forecast export failed:', err);
        setExportStatus('error');
        setExportError(err.message || 'Export error');
        setTimeout(() => setExportStatus('idle'), 3000);
      }
    }, 1000); // 1s simulation delay
  };

  const triggerDiagnosticsDownload = async () => {
    console.log('[TELEMETRY] Export Diagnostics triggered', {
      timestamp: new Date().toISOString(),
      forecastId: latestForecast?.id
    });
    if (pdfStatus === 'generating' || !latestForecast) return;
    setPdfStatus('generating');
    setPdfError(null);
    try {
      await downloadExecutiveBrief({ forecastId: latestForecast.id });
      setPdfStatus('ready');
      setTimeout(() => setPdfStatus('idle'), 1500);
    } catch (err: any) {
      console.error('Diagnostics export failed:', err);
      setPdfStatus('error');
      setPdfError(err.message || 'Export error');
      setTimeout(() => setPdfStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchHistoricalTrends();
      fetchLatestForecast();
      setIsChartLoading(true);
      const timer = setTimeout(() => setIsChartLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [selectedRegion, fetchHistoricalTrends, fetchLatestForecast]);

  // Generate placeholder historical observations (90 days)
  const placeholderHistData = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (90 - i));
    const name = `${d.getMonth() + 1}/${d.getDate()}`;
    const baseTemp = 31.4 + Math.sin(i / 10) * 3.5;
    return {
      name,
      maxTemp: parseFloat((baseTemp + Math.random() * 1.5).toFixed(1)),
      minTemp: parseFloat((baseTemp - 7.8 + Math.random() * 1.5).toFixed(1)),
      rainfall: parseFloat((Math.max(0, Math.sin(i / 6) * 4.2) + Math.random() * 1.8).toFixed(2)),
    };
  });

  // Generate placeholder forecast data (30 days)
  const placeholderForecastData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const name = `D${i + 1}`;
    const baseTemp = 32.8 + Math.sin(i / 5) * 2.8;
    const r = Math.max(0, Math.sin(i / 3) * 5.5) + Math.random() * 2.2;
    return {
      name,
      date: d.toISOString().split('T')[0],
      maxTemp: parseFloat((baseTemp + Math.random() * 1.2).toFixed(1)),
      maxTempUpper: parseFloat((baseTemp + 2.8).toFixed(1)),
      maxTempLower: parseFloat((baseTemp - 1.2).toFixed(1)),
      minTemp: parseFloat((baseTemp - 8.2 + Math.random() * 1.2).toFixed(1)),
      minTempUpper: parseFloat((baseTemp - 6.8).toFixed(1)),
      minTempLower: parseFloat((baseTemp - 9.6).toFixed(1)),
      rainfall: parseFloat(r.toFixed(2)),
      rainfallUpper: parseFloat((r + 2.8).toFixed(2)),
      rainfallLower: parseFloat(Math.max(0, r - 2.8).toFixed(2))
    };
  });

  const hasLiveHistData = historicalTrends && historicalTrends.length > 0;
  const histData = hasLiveHistData
    ? historicalTrends.slice(-90).map(h => ({
        name: h.date.split('-').slice(1).join('/'),
        maxTemp: h.avg_max_temp,
        minTemp: h.avg_min_temp,
        rainfall: h.avg_rainfall,
      }))
    : placeholderHistData;

  const hasLiveForecastData = latestForecast && latestForecast.forecast_data && latestForecast.forecast_data.length > 0;
  const forecastData = hasLiveForecastData
    ? latestForecast.forecast_data.map((day, i) => {
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
      })
    : placeholderForecastData;

  const chartStyle = { 
    backgroundColor: 'var(--surface)', 
    border: '1px solid var(--border)', 
    borderRadius: '6px', 
    fontSize: '11px', 
    color: 'var(--text)' 
  };

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
            <TrendingUp size={18} color="var(--primary)" />
            <h2 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)' }}>Climate Intelligence Hub</h2>
          </div>
          {latestForecast && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <button 
                onClick={triggerDiagnosticsDownload} 
                disabled={pdfStatus === 'generating'}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', 
                  padding: '7px 14px', background: pdfStatus === 'ready' ? 'var(--success)' : pdfStatus === 'error' ? 'var(--critical)' : 'var(--primary)', 
                  color: '#FFFFFF', borderRadius: '4px', border: 'none',
                  fontSize: '12px', fontWeight: 700, cursor: pdfStatus === 'generating' ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow)', transition: 'all 0.2s'
                }}>
                {pdfStatus === 'generating' ? (
                  <>
                    <div className="animate-spin" style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent' }} />
                    Generating PDF...
                  </>
                ) : pdfStatus === 'ready' ? (
                  <>
                    <CheckCircle2 size={13} />
                    Diagnostics Exported
                  </>
                ) : pdfStatus === 'error' ? (
                  <>
                    <AlertCircle size={13} />
                    Failed
                  </>
                ) : (
                  <>
                    <Download size={13} /> Export Diagnostics
                  </>
                )}
              </button>
              {pdfError && <span style={{ fontSize: '8.5px', color: 'var(--critical)', marginTop: '2px' }}>{pdfError}</span>}
            </div>
          )}
        </header>

        <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
          
          {forecastJobStatus && (
            <div style={{
              padding: '10px 16px', background: 'rgba(0,140,255,0.08)', border: '1px solid rgba(0,140,255,0.2)',
              borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '12px', color: 'var(--accent)', marginBottom: '14px'
            }}>
              <RefreshCw size={13} className="animate-spin" />
              <span>Forecast model training in progress (Status: <strong>{forecastJobStatus.toUpperCase()}</strong>).</span>
            </div>
          )}

          {/* Forecast Control Panel */}
          <div className="premium-card" style={{ 
            borderTop: '3px solid var(--primary)', 
            padding: '16px 20px', 
            marginBottom: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: '16px' 
          }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '14px', color: 'var(--primary)', marginBottom: '2px' }}>XGBoost Ensemble Forecast</h3>
              <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.3 }}>
                Recursive lag model trained on IMD gridded observations (2023–2025) with seasonal feature engineering.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Horizon:</label>
                <select value={forecastHorizon} onChange={e => setForecastHorizon(parseInt(e.target.value))} style={{
                  padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '4px',
                  fontSize: '11px', color: 'var(--text)', background: 'var(--surface-alt)', fontFamily: "'Inter', sans-serif",
                }}>
                  <option value={7}>7-Day Outlook</option>
                  <option value={15}>15-Day Outlook</option>
                  <option value={30}>30-Day Outlook</option>
                </select>
              </div>
              <button onClick={() => generateForecast(forecastHorizon)} disabled={isLoading} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: isLoading ? 'var(--border)' : 'var(--primary)',
                color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px',
                fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
              }}>
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                {isLoading ? 'Computing Model...' : 'Execute Forecast Engine'}
              </button>

              <button 
                onClick={triggerForecastExport} 
                disabled={exportStatus === 'exporting'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', background: exportStatus === 'ready' ? 'var(--success)' : exportStatus === 'error' ? 'var(--critical)' : 'var(--accent)',
                  color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px',
                  fontWeight: 700, cursor: exportStatus === 'exporting' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {exportStatus === 'exporting' ? (
                  <>
                    <div className="animate-spin" style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent' }} />
                    Exporting JSON...
                  </>
                ) : exportStatus === 'ready' ? (
                  <>
                    <CheckCircle2 size={12} />
                    Exported!
                  </>
                ) : exportStatus === 'error' ? (
                  <>
                    <AlertCircle size={12} />
                    Failed
                  </>
                ) : (
                  <>
                    <Download size={12} /> Export Forecast Data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '14px' }}>
            {[
              { key: 'temperature', label: 'Temperature Analysis' },
              { key: 'rainfall', label: 'Precipitation Analysis' },
            ].map(({ key, label }) => (
              <button 
                key={key} 
                onClick={() => setActiveTab(key as 'temperature' | 'rainfall')} 
                style={{
                  padding: '10px 20px', fontSize: '13px', fontWeight: activeTab === key ? 700 : 500,
                  borderBottom: `2px solid ${activeTab === key ? 'var(--primary)' : 'transparent'}`,
                  color: activeTab === key ? 'var(--primary)' : 'var(--muted)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  marginBottom: '-1px', transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            
            {/* Historical Chart Card */}
            <div className="premium-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Historical Observations — Last 90 Days
                  </h4>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>Source: IMD Gridded Daily Data (2023–2025)</span>
                </div>
                <div>
                  {hasLiveHistData ? (
                    <span style={{ fontSize: '9px', background: 'rgba(30,142,62,0.1)', color: 'var(--success)', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(30,142,62,0.2)', fontWeight: 700 }}>LIVE Telemetry</span>
                  ) : (
                    <span style={{ fontSize: '9px', background: 'var(--surface-alt)', color: 'var(--muted)', padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--border)', fontWeight: 700 }}>Baseline Mode</span>
                  )}
                </div>
              </div>
              
              <div style={{ flex: 1, minHeight: 0 }}>
                {isChartLoading ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="animate-spin" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent' }} />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'temperature' ? (
                      <LineChart data={histData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 9 }} interval={14} />
                        <YAxis stroke="var(--muted)" tick={{ fontSize: 9 }} unit="°C" />
                        <Tooltip contentStyle={chartStyle} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="maxTemp" name="Max Temp (°C)" stroke="var(--risk-high)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="minTemp" name="Min Temp (°C)" stroke="var(--accent)" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    ) : (
                      <AreaChart data={histData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 9 }} interval={14} />
                        <YAxis stroke="var(--muted)" tick={{ fontSize: 9 }} unit=" mm" />
                        <Tooltip contentStyle={chartStyle} />
                        <Area type="monotone" dataKey="rainfall" name="Rainfall (mm)" fill="var(--success)" fillOpacity={0.1} stroke="var(--success)" strokeWidth={2} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Forecast Chart Card */}
            <div className="premium-card" style={{ borderTop: '3px solid var(--primary)', height: '350px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    XGBoost Forecast Outlook
                  </h4>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>Ensemble model forecasting output.</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  {hasLiveForecastData ? (
                    <span style={{ fontSize: '9px', background: 'rgba(30,142,62,0.1)', color: 'var(--success)', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(30,142,62,0.2)', fontWeight: 700 }}>LIVE Forecast</span>
                  ) : (
                    <span style={{ fontSize: '9px', background: 'var(--surface-alt)', color: 'var(--muted)', padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--border)', fontWeight: 700 }}>Simulated Data</span>
                  )}
                  <span style={{ fontSize: '8px', color: 'var(--muted)' }}>
                    {activeTab === 'temperature' ? 'Confidence: ±1.4°C' : 'Confidence: ±2.8mm'}
                  </span>
                </div>
              </div>
              
              <div style={{ flex: 1, minHeight: 0 }}>
                {isChartLoading ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="animate-spin" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent' }} />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'temperature' ? (
                      <ComposedChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 9 }} interval={4} />
                        <YAxis stroke="var(--muted)" tick={{ fontSize: 9 }} unit="°C" />
                        <Tooltip contentStyle={chartStyle} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="maxTemp" name="Max Temp Forecast" stroke="var(--risk-high)" strokeWidth={2.5} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="maxTempUpper" stroke="var(--risk-high)" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                        <Line type="monotone" dataKey="maxTempLower" stroke="var(--risk-high)" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                        <Line type="monotone" dataKey="minTemp" name="Min Temp Forecast" stroke="var(--accent)" strokeWidth={1.5} />
                        <Line type="monotone" dataKey="minTempUpper" stroke="var(--accent)" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                        <Line type="monotone" dataKey="minTempLower" stroke="var(--accent)" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                      </ComposedChart>
                    ) : (
                      <ComposedChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 9 }} interval={4} />
                        <YAxis stroke="var(--muted)" tick={{ fontSize: 9 }} unit=" mm" />
                        <Tooltip contentStyle={chartStyle} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Area type="monotone" dataKey="rainfall" name="Rainfall Forecast" fill="var(--success)" fillOpacity={0.1} stroke="var(--success)" strokeWidth={2} />
                        <Line type="monotone" dataKey="rainfallUpper" stroke="var(--success)" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                        <Line type="monotone" dataKey="rainfallLower" stroke="var(--success)" strokeDasharray="3 3" strokeWidth={1} dot={false} legendType="none" />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* Diagnostics Section */}
          <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <ValidationCenter />
            <AITransparencyPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
