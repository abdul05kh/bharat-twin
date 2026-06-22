'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { Layers, Database, RefreshCw, Cpu, Monitor, Brain, AlertCircle, Briefcase } from 'lucide-react';

const ARCH_LAYERS = [
  {
    num: 1,
    title: 'Layer 1: Data Ingestion',
    desc: 'Ingests gridded meteorological datasets from India Meteorological Department (IMD) in NetCDF (.nc) and binary (.GRD) formats, alongside satellite Land Surface Temperature (LST) datasets in HDF5 (.h5) formats.',
    icon: Database,
    color: 'var(--gov-cyan)'
  },
  {
    num: 2,
    title: 'Layer 2: Nearest-Neighbor Fusion Engine',
    desc: 'Reconciles grid mismatches between IMD Rainfall (0.25° grid) and Temperature (1.0° grid). Computes spatial Euclidean distance to match rainfall grid nodes with nearest temperature values, creating unified spatial coordinates.',
    icon: Layers,
    color: 'var(--gov-cyan)'
  },
  {
    num: 3,
    title: 'Layer 3: Async XGBoost Forecast Engine',
    desc: 'Prepares features (lag-7, lag-14, lag-30 seasonal vectors) and runs async forecasting models on background thread pools using a ThreadPoolExecutor. Avoids request-blocking cycles for real-time responsiveness.',
    icon: RefreshCw,
    color: 'var(--gov-saffron)'
  },
  {
    num: 4,
    title: 'Layer 4: Spatial Digital Twin Interface',
    desc: 'Visualizes the fused regional grid in WebGL (Three.js 3D canvas) and 2D canvas layers. Projects rainfall and temperature values as extruded heights on interactive mesh grids with INSAT-3D orbit sweeps.',
    icon: Monitor,
    color: 'var(--gov-saffron)'
  },
  {
    num: 5,
    title: 'Layer 5: Multi-Tier AI Advisory Layer',
    desc: 'Orchestrates advanced generative AI reasoning. Primary queries are routed to Groq (llama-3.3-70b-versatile). If timeouts or rate limits occur, the engine fails over to Gemini 2.5 Flash for continuous availability.',
    icon: Brain,
    color: 'var(--gov-cyan)'
  },
  {
    num: 6,
    title: 'Layer 6: Decision Support Alerts',
    desc: 'Translates AI summaries into stakeholder-specific alert briefings. Categorizes risk levels (Low, Medium, High, Critical) and formats urgent action plans for Municipal Corporations, SDMA, and departments.',
    icon: AlertCircle,
    color: 'var(--gov-saffron)'
  },
  {
    num: 7,
    title: 'Layer 7: Executive Climate Briefing',
    desc: 'Consolidates local risk parameters, forecast horizons, vulnerabilities, and recommended actions into a single-pane briefing card designed for rapid administrative decision-making.',
    icon: Briefcase,
    color: 'var(--gov-green)'
  }
];

export default function PlatformArchitecturePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />

        {/* Header */}
        <header style={{
          height: '60px', background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Platform Architecture</h2>
            <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '3px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--gov-cyan)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
              7-Layer System Layout
            </span>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '28px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>7-Layer System Architecture</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
              Detailed breakdown of the BHARAT-TWIN data engineering, machine learning, and application layer layout that powers regional climate decision support.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {ARCH_LAYERS.map((layer) => {
              const Icon = layer.icon;
              return (
                <div key={layer.num} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '18px 20px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  borderLeft: `4px solid ${layer.color}`,
                  transition: 'transform 0.15s, border-color 0.15s',
                }}
                className="hover-card">
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: 'var(--surface-dark)',
                    border: `1px solid ${layer.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={16} color={layer.color} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
                      {layer.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                      {layer.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
