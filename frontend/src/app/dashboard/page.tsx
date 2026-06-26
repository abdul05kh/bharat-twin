'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import MapContainer from '@/components/MapContainer';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import PrimaryRiskHero from '@/components/PrimaryRiskHero';
import { useClimateStore } from '@/store/store';
import { Calendar, Thermometer, CloudRain, ShieldCheck, AlertTriangle, ChevronRight, Activity } from 'lucide-react';
import downloadExecutiveBrief from '@/lib/reportClient';
import Link from 'next/link';

export default function ClimateOperationsCentre() {
  const { 
    fetchRegions, 
    selectedRegion, 
    currentObservations, 
    fetchCurrentClimate, 
    latestForecast, 
    fetchLatestForecast 
  } = useClimateStore();

  const [activeLayer, setActiveLayer] = useState<'max_temperature' | 'min_temperature' | 'rainfall'>('max_temperature');
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'ready'>('idle');

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchCurrentClimate();
      fetchLatestForecast();
    }
  }, [selectedRegion, fetchCurrentClimate, fetchLatestForecast]);

  const obsCount = currentObservations.length;
  const avgRain = obsCount ? currentObservations.reduce((a, c) => a + c.rainfall, 0) / obsCount : 0;
  const avgMax = obsCount ? currentObservations.reduce((a, c) => a + c.max_temperature, 0) / obsCount : 0;
  const avgMin = obsCount ? currentObservations.reduce((a, c) => a + c.min_temperature, 0) / obsCount : 0;
  const latestDate = obsCount ? currentObservations[0].observation_date : 'N/A';
  const forecastDays = latestForecast ? latestForecast.forecast_data : [];

  const metrics = [
    { label: 'Latest Ingestion Date', value: latestDate, icon: Calendar, color: 'var(--primary)', bg: 'rgba(11,61,145,0.08)' },
    { label: 'Mean Max Temperature', value: `${avgMax.toFixed(1)} °C`, icon: Thermometer, color: 'var(--risk-high)', bg: 'rgba(255,145,0,0.08)' },
    { label: 'Mean Min Temperature', value: `${avgMin.toFixed(1)} °C`, icon: Thermometer, color: 'var(--accent)', bg: 'rgba(0,140,255,0.08)' },
    { label: 'Mean Rainfall', value: `${avgRain.toFixed(2)} mm`, icon: CloudRain, color: 'var(--success)', bg: 'rgba(30,142,62,0.08)' },
  ];

  const LAYERS = [
    { key: 'max_temperature', label: 'Max Temp', color: 'var(--risk-high)' },
    { key: 'min_temperature', label: 'Min Temp', color: 'var(--accent)' },
    { key: 'rainfall', label: 'Rainfall', color: 'var(--success)' },
  ] as const;

  // Wow Moment #2: Animate PDF generation under 2 seconds
  const triggerPdfDownload = async () => {
    if (pdfStatus === 'generating') return;
    setPdfStatus('generating');

    setTimeout(async () => {
      setPdfStatus('ready');
      try {
        await downloadExecutiveBrief({});
      } catch (err) {
        console.error('Failed to download PDF', err);
      }
      setTimeout(() => setPdfStatus('idle'), 1500);
    }, 1200);
  };

  return (
    <div className="page-root" style={{ background: 'var(--bg)', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>
      <Navbar />
      
      <main className="page-layout-main main-content-with-topbar">
        <CommandStatusStrip />
        
        {/* Header */}
        <header style={{
          height: '55px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} color="var(--primary)" />
            <h2 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)' }}>
              Climate Operations Centre
            </h2>
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
              background: 'var(--surface-alt)', color: 'var(--primary)', border: '1px solid var(--border)',
              fontWeight: 700, fontFamily: 'monospace',
            }}>
              {selectedRegion?.name || 'Hyderabad Region'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--muted)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} className="status-live" />
            IMD Telemetry Connected
          </div>
        </header>

        {/* Workspace */}
        <div className="page-body-container" style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Global Risk Assessment Hero */}
          <PrimaryRiskHero />

          {/* Metric Cards Grid */}
          <div className="grid-4col" style={{ display: 'grid', gap: '12px' }}>
            {metrics.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="premium-card" style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                borderTop: `3px solid ${color}`,
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text)', fontFamily: 'monospace' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Split Map and Sidebar */}
          <div className="grid-split-70-30" style={{ display: 'grid', gap: '14px' }}>
            
            {/* Map Panel */}
            <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '13px', color: 'var(--primary)' }}>
                    IMD Spatial Observations Grid
                  </h3>
                  <span style={{ fontSize: '9px', color: 'var(--muted)' }}>
                    Gridded mesoscale telemetry across the pilot district.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {LAYERS.map(({ key, label, color }) => (
                    <button 
                      key={key} 
                      onClick={() => setActiveLayer(key)} 
                      style={{
                        padding: '4px 10px', fontSize: '10px', borderRadius: '4px', cursor: 'pointer',
                        fontWeight: activeLayer === key ? 700 : 500,
                        background: activeLayer === key ? color : 'var(--surface-alt)',
                        color: activeLayer === key ? 'white' : 'var(--text)',
                        border: `1px solid ${activeLayer === key ? color : 'var(--border)'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ flex: 1, minHeight: '340px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {obsCount > 0 ? (
                  <MapContainer cells={currentObservations} activeLayer={activeLayer} viewMode="2d" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '11px', background: 'var(--surface-alt)' }}>
                    Loading gridded observations...
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Inspector & Action Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Telemetry Points list */}
              <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '160px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Telemetry Nodes Ingested
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {currentObservations.slice(0, 8).map((obs, i) => (
                    <div key={i} style={{
                      padding: '6px 10px', background: 'var(--surface-alt)', borderRadius: '4px',
                      border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: '11px',
                    }}>
                      <div>
                        <div style={{ fontFamily: 'monospace', color: 'var(--text)', fontWeight: 600 }}>
                          {obs.latitude.toFixed(2)}°N, {obs.longitude.toFixed(2)}°E
                        </div>
                        <div style={{ fontSize: '8px', color: 'var(--muted)' }}>Source: {obs.source}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--critical)', fontWeight: 700 }}>{obs.max_temperature.toFixed(1)}°C</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DECISION-FIRST RECOMMENDED ACTION CARD (Phase 11) */}
              <div className="premium-card" style={{ 
                borderLeft: '4px solid var(--risk-high)', 
                background: 'rgba(255,145,0,0.02)',
                padding: '12px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <AlertTriangle size={13} color="var(--risk-high)" />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Decision Directive
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text)', lineHeight: 1.3, margin: 0 }}>
                  <strong>Risk: HIGH (Compound Heat stress)</strong>. Issue local heat warnings and pre-position water tankers.
                </p>
              </div>

              {/* Scientific Trust and PDF Brief */}
              <div className="premium-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '11px', color: 'var(--primary)', margin: 0 }}>Executive Climate Brief</h3>
                  <p style={{ fontSize: '10.5px', color: 'var(--muted)', lineHeight: 1.3, marginTop: '2px' }}>
                    Instant NDMA framework briefings and advisory download.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={triggerPdfDownload} 
                    disabled={pdfStatus === 'generating'}
                    style={{ 
                      flex: 1, padding: '8px 10px', background: pdfStatus === 'ready' ? 'var(--success)' : 'var(--accent)', 
                      color: 'white', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '11px', cursor: 'pointer' 
                    }}
                  >
                    {pdfStatus === 'generating' ? 'Generating...' : 'Download PDF'}
                  </button>
                  <Link href="/briefing" style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px', 
                    border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' 
                  }}>
                    View Briefing
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
