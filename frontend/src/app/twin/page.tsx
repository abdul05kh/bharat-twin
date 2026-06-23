'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import MapContainer from '@/components/MapContainer';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import ScientificTrustPanel from '@/components/ScientificTrustPanel';
import PrimaryRiskHero from '@/components/PrimaryRiskHero';
import { useClimateStore, GridCell } from '@/store/store';
import { Monitor, MapPin, Layers, Clock, Play, Pause, RotateCcw } from 'lucide-react';

type LayerType = 'rainfall' | 'max_temperature' | 'min_temperature' | 'lst_temperature';
type PlaybackSource = 'current' | 'forecast' | 'scenario';
type Speed = 1 | 2 | 5;

export default function DigitalTwinConsole() {
  const { fetchRegions, selectedRegion, digitalTwin, fetchDigitalTwin, latestForecast, fetchLatestForecast, satelliteObservations, fetchSatelliteObservations, activeSimulation, apiBase } = useClimateStore();
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);

  const [activeLayer, setActiveLayer] = useState<LayerType>('max_temperature');
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>('current');
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d'); // Default to 3D flagship twin
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchDigitalTwin();
      fetchLatestForecast();
      fetchSatelliteObservations();
      fetch(`${apiBase}/climate/metadata/${selectedRegion.id}`)
        .then(r => r.json())
        .then(data => setMetadata(data))
        .catch(e => console.error("Failed to fetch climate metadata", e));
    }
  }, [selectedRegion, fetchDigitalTwin, fetchLatestForecast, fetchSatelliteObservations, apiBase]);

  const forecastDays = latestForecast?.forecast_data ?? [];
  const scenarioDays = activeSimulation?.simulation_data ?? [];

  const timelineData = playbackSource === 'forecast' ? forecastDays
    : playbackSource === 'scenario' ? scenarioDays : [];

  let displayCells: GridCell[] = digitalTwin;
  let activeDate = 'Current Observation';
  if (activeLayer === 'lst_temperature') {
    displayCells = satelliteObservations as unknown as GridCell[];
    activeDate = 'INSAT LST — Latest';
  } else if (playbackSource !== 'current' && timelineData.length > 0) {
    const day = timelineData[timelineIndex] ?? timelineData[0];
    displayCells = day.grid_cells;
    activeDate = `${playbackSource === 'forecast' ? 'Forecast' : 'Scenario'}: ${day.date}`;
  }

  // Auto-advance timeline
  const advance = useCallback(() => {
    setTimelineIndex(prev => {
      const max = timelineData.length - 1;
      if (prev >= max) { setIsPlaying(false); return 0; }
      return prev + 1;
    });
  }, [timelineData.length]);

  useEffect(() => {
    if (isPlaying && timelineData.length > 1) {
      intervalRef.current = setInterval(advance, 1000 / speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, advance, timelineData.length]);

  useEffect(() => {
    if (displayCells.length > 0) {
      setSelectedCell(prev => {
        if (!prev) return displayCells[0];
        const updated = displayCells.find(c => c.latitude === prev.latitude && c.longitude === prev.longitude);
        return updated ?? displayCells[0];
      });
    }
  }, [displayCells]);

  const LAYERS: { key: LayerType; label: string; color: string }[] = [
    { key: 'max_temperature', label: 'Max Temperature', color: '#ff3333' },
    { key: 'min_temperature', label: 'Min Temperature', color: '#00f0ff' },
    { key: 'rainfall', label: 'Rainfall', color: '#00ff66' },
    { key: 'lst_temperature', label: 'INSAT-3D LST Observation', color: '#ff6600' },
  ];

  const SOURCES: { key: PlaybackSource; label: string; disabled: boolean }[] = [
    { key: 'current', label: 'Current State', disabled: false },
    { key: 'forecast', label: 'Forecast Timeline', disabled: forecastDays.length === 0 },
    { key: 'scenario', label: 'Scenario Timeline', disabled: scenarioDays.length === 0 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />
        {/* Header */}
        <header style={{
          height: '60px', background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Monitor size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Climate Digital Twin Console</h2>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '3px', background: 'rgba(0, 255, 102, 0.1)', color: 'var(--gov-green)', border: '1px solid rgba(0, 255, 102, 0.3)', fontFamily: "'Noto Sans', monospace" }}>
              Hyderabad Grid — Nearest-Neighbor Climate Cell Fusion
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* View Mode Toggle (2D/3D) */}
            <div style={{ display: 'flex', background: 'var(--neutral-200)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <button onClick={() => setViewMode('2d')} style={{
                padding: '6px 14px', fontSize: '11px', fontWeight: viewMode === '2d' ? 600 : 400,
                background: viewMode === '2d' ? 'var(--gov-blue-light)' : 'transparent',
                color: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}>2D Map</button>
              <button onClick={() => setViewMode('3d')} style={{
                padding: '6px 14px', fontSize: '11px', fontWeight: viewMode === '3d' ? 600 : 400,
                background: viewMode === '3d' ? 'var(--gov-saffron)' : 'transparent',
                color: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}>3D Twin</button>
            </div>

            {/* Playback Source */}
            <div style={{ display: 'flex', background: 'var(--neutral-200)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {SOURCES.map(({ key, label, disabled }) => (
                <button key={key} disabled={disabled} onClick={() => { setPlaybackSource(key); setTimelineIndex(0); setIsPlaying(false); }} style={{
                  padding: '6px 14px', fontSize: '11px', fontWeight: playbackSource === key ? 600 : 400,
                  background: playbackSource === key ? 'var(--gov-blue-light)' : 'transparent',
                  color: playbackSource === key ? 'white' : disabled ? 'var(--text-light)' : 'var(--text-secondary)',
                  border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                }}>{label}</button>
              ))}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Map Canvas */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }}>
            <PrimaryRiskHero />
            <div style={{ flex: 1, position: 'relative', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', background: 'var(--surface-dark)' }}>
              {displayCells.length > 0
                ? <MapContainer cells={displayCells} activeLayer={activeLayer} viewMode={viewMode} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    Initializing climate grid models...
                  </div>
              }

              {/* Float Layer Controls */}
              <div style={{
                position: 'absolute', top: '12px', left: '12px', zIndex: 99,
                background: 'rgba(5, 12, 30, 0.85)', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Climate Layers
                </div>
                {LAYERS.map(({ key, label, color }) => (
                  <button key={key} onClick={() => setActiveLayer(key)} style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    width: '100%', padding: '6px 8px', marginBottom: '2px',
                    borderRadius: '4px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: activeLayer === key ? `${color}18` : 'transparent',
                    color: activeLayer === key ? color : 'var(--text-secondary)',
                    fontSize: '11px', fontWeight: activeLayer === key ? 600 : 400,
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Active Date Badge */}
              <div style={{
                position: 'absolute', top: '12px', right: '12px', zIndex: 99,
                background: 'var(--gov-blue-light)', color: 'white',
                fontSize: '10px', padding: '4px 10px', borderRadius: '4px',
                fontFamily: "'Noto Sans', monospace", fontWeight: 600,
                border: '1px solid var(--border)',
              }}>
                {activeDate}
              </div>
            </div>

            {/* Playback Controls */}
            {(playbackSource !== 'current' && timelineData.length > 1) && (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setIsPlaying(p => !p)} style={{
                    width: '30px', height: '30px', borderRadius: '4px',
                    background: 'var(--gov-saffron)', color: 'white',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  </button>
                  <button onClick={() => { setIsPlaying(false); setTimelineIndex(0); }} style={{
                    width: '30px', height: '30px', borderRadius: '4px',
                    background: 'var(--neutral-200)', border: '1px solid var(--border)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <RotateCcw size={12} color="var(--text-secondary)" />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {([1, 2, 5] as Speed[]).map(s => (
                    <button key={s} onClick={() => setSpeed(s)} style={{
                      padding: '3px 8px', fontSize: '10px', borderRadius: '3px', cursor: 'pointer',
                      background: speed === s ? 'var(--gov-saffron)' : 'var(--neutral-200)',
                      color: 'white',
                      border: `1px solid ${speed === s ? 'var(--gov-saffron)' : 'var(--border)'}`,
                      fontWeight: speed === s ? 700 : 400,
                    }}>{s}×</button>
                  ))}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={12} color="var(--gov-cyan)" />
                  <input type="range" min={0} max={timelineData.length - 1} value={timelineIndex}
                    onChange={e => setTimelineIndex(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--gov-saffron)', height: '2px' }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: "'Noto Sans', monospace", whiteSpace: 'nowrap' }}>
                    Day {timelineIndex + 1} / {timelineData.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Inspector Panel */}
          <div style={{
            width: '290px', background: 'var(--surface-alt)', borderLeft: '2px solid var(--border)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
          }}>
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid var(--border)',
              background: 'var(--surface-dark)', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Layers size={14} color="var(--gov-saffron)" />
              <h3 style={{ fontWeight: 600, fontSize: '12px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grid Cell Inspector</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {selectedCell ? (
                <div>
                  <div style={{ padding: '10px 12px', background: 'var(--surface-dark)', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={13} color="var(--gov-cyan)" />
                    <div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Selected Coordinates</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'Noto Sans', monospace", color: 'white' }}>
                        {selectedCell.latitude.toFixed(3)}°N, {selectedCell.longitude.toFixed(3)}°E
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>Grid Variables</div>
                  {(() => {
                    const lstTemp = selectedCell ? (selectedCell as unknown as Record<string, unknown>)['lst_temperature'] as number | undefined : undefined;
                    return [
                      { label: 'Max Temperature', value: `${selectedCell.max_temperature.toFixed(1)} °C`, show: selectedCell.max_temperature > 0, color: '#ff3333', bg: 'rgba(255, 51, 51, 0.1)' },
                      { label: 'Min Temperature', value: `${selectedCell.min_temperature.toFixed(1)} °C`, show: selectedCell.min_temperature > 0, color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.1)' },
                      { label: 'Daily Rainfall', value: `${selectedCell.rainfall.toFixed(2)} mm`, show: selectedCell.rainfall >= 0, color: '#00ff66', bg: 'rgba(0, 255, 102, 0.1)' },
                      { label: 'Land Surface Temp', value: `${(lstTemp ?? 0).toFixed(1)} °C`, show: lstTemp !== undefined, color: '#ff6600', bg: 'rgba(255, 102, 0, 0.1)' },
                    ].filter(v => v.show).map(({ label, value, color, bg }) => (
                    <div key={label} style={{
                      padding: '10px 12px', background: bg, border: `1px solid ${color}25`,
                      borderLeft: `3px solid ${color}`, borderRadius: '4px', marginBottom: '6px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color, fontFamily: "'Noto Sans', monospace" }}>{value}</span>
                    </div>
                  ))})()}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                  Select a grid cell to inspect climate metrics.
                </div>
              )}

              {/* Cell List */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>
                  Sub-Grid Coordinates
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {displayCells.slice(0, 12).map((cell, i) => {
                    const active = selectedCell?.latitude === cell.latitude && selectedCell?.longitude === cell.longitude;
                    return (
                      <button key={i} onClick={() => setSelectedCell(cell)} style={{
                        padding: '5px 6px', borderRadius: '3px', fontSize: '9px',
                        fontFamily: "'Noto Sans', monospace", cursor: 'pointer', textAlign: 'center',
                        background: active ? 'var(--gov-blue-light)' : 'var(--neutral-100)',
                        color: active ? 'white' : 'var(--text-secondary)',
                        border: `1px solid ${active ? 'var(--gov-cyan)' : 'var(--border)'}`,
                        fontWeight: active ? 600 : 400,
                      }}>
                        {cell.latitude.toFixed(2)}, {cell.longitude.toFixed(2)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scientific Trust Panel */}
              <div style={{ marginTop: '20px' }}>
                <ScientificTrustPanel
                  coveragePercent={metadata?.confidence_metrics?.coverage_percentage ?? 100}
                  forecastConfidence={metadata?.confidence_metrics?.forecast_confidence ?? 84}
                  freshness={metadata?.confidence_metrics?.data_freshness ?? 'Daily Sync (Latest)'}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
