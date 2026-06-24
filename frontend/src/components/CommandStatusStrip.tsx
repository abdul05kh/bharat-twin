'use client';

import React, { useEffect, useState } from 'react';
import { useClimateStore } from '@/store/store';
import { Activity, Database, Satellite, Brain, Clock } from 'lucide-react';

export default function CommandStatusStrip() {
  const { selectedRegion } = useClimateStore();
  const [liveTime, setLiveTime] = useState('');

  // Live IST Clock
  useEffect(() => {
    const tick = () => {
      setLiveTime(new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }) + ' IST');
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'var(--surface-alt)',
      borderBottom: '1px solid var(--border)',
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '10.5px',
      color: 'var(--text)',
      fontFamily: "monospace",
      flexShrink: 0,
      width: '100%',
      gap: '12px',
      zIndex: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* Left side: Data Sources Online */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={12} color="var(--primary)" />
          <span style={{ fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>TELEMETRY SOURES:</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {['IMD', 'INSAT-3D', 'MOSDAC', 'NRSC'].map(src => (
              <span key={src} style={{
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '8.5px',
                fontWeight: 900,
                background: 'rgba(30,142,62,0.08)',
                color: 'var(--success)',
                border: '1px solid rgba(30,142,62,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Middle/Right side: Operational Engines and Live Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Forecast Engine */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Activity size={12} color="var(--accent)" />
          <span>Forecast Engine:</span>
          <span style={{
            padding: '1px 5px',
            borderRadius: '3px',
            fontSize: '9px',
            fontWeight: 800,
            background: 'rgba(0,140,255,0.08)',
            color: 'var(--accent)',
            border: '1px solid rgba(0,140,255,0.2)'
          }}>
            ACTIVE
          </span>
        </div>

        {/* AI Reasoning */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Brain size={12} color="var(--primary)" />
          <span>AI Reasoning:</span>
          <span style={{
            padding: '1px 5px',
            borderRadius: '3px',
            fontSize: '9px',
            fontWeight: 800,
            background: 'rgba(11,61,145,0.08)',
            color: 'var(--primary)',
            border: '1px solid rgba(11,61,145,0.2)'
          }}>
            ACTIVE
          </span>
        </div>

        {/* Simulation State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Satellite size={12} color="var(--success)" />
          <span>Simulation State:</span>
          <span style={{
            padding: '1px 5px',
            borderRadius: '3px',
            fontSize: '9px',
            fontWeight: 800,
            background: 'rgba(30,142,62,0.08)',
            color: 'var(--success)',
            border: '1px solid rgba(30,142,62,0.2)'
          }}>
            READY
          </span>
        </div>

        <div style={{ height: '12px', width: '1px', background: 'var(--border)' }} />

        {/* Live Update Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)' }}>
          <Clock size={11} />
          <span>Last Update: </span>
          <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{liveTime}</strong>
        </div>

      </div>
    </div>
  );
}
