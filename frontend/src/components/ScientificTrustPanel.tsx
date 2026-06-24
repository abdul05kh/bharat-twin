'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface ScientificTrustPanelProps {
  coveragePercent?: number;
  forecastConfidence?: number;
  freshness?: string;
}

export default function ScientificTrustPanel({
  coveragePercent = 94,
  forecastConfidence = 91,
  freshness = 'Daily Sync (Latest)'
}: ScientificTrustPanelProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px 20px',
      color: 'var(--text)',
      fontFamily: "'Inter', sans-serif",
      boxShadow: 'var(--shadow)'
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <ShieldCheck size={16} color="var(--primary)" />
        <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', margin: 0 }}>
          Scientific Trust Anchor
        </h4>
      </div>

      {/* Grid Specs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
        <div>
          <span style={{ color: 'var(--muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Data Provenance</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>• IMD Rainfall</span>
              <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>0.25° (~25km)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>• IMD Temperature</span>
              <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>1.0° (~100km)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>• INSAT-3D LST</span>
              <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>~4km</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
          <span style={{ color: 'var(--muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Model Frameworks</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Fusion Method:</span>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>Nearest Neighbor</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Forecast Engine:</span>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>XGBoost Regressor</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
          <span style={{ color: 'var(--muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Metadata Registries</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Spatial Coverage:</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{coveragePercent}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Forecast Confidence:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{forecastConfidence}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Data Freshness:</span>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{freshness}</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', background: 'rgba(255,145,0,0.02)', padding: '6px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <AlertTriangle size={12} color="var(--risk-high)" />
            <span style={{ color: 'var(--risk-high)', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>Scientific Limitations</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9.5px', color: 'var(--muted)', lineHeight: 1.3 }}>
            <li>Hyderabad metropolitan grid study area limits.</li>
            <li>Station density limitations.</li>
            <li>Forecast uncertainty increases over 30 days.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
