'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { Info, Target, Cpu, ShieldAlert, Users, Database, Globe, Landmark } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>
      <Navbar />
      
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />

        {/* Header */}
        <header style={{
          height: '55px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '10px', padding: '0 24px', flexShrink: 0,
        }}>
          <Info size={18} color="var(--primary)" />
          <h2 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)', letterSpacing: '-0.02em' }}>About BHARAT-TWIN</h2>
          <span style={{ fontSize: '9px', background: 'rgba(11,61,145,0.08)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 700, textTransform: 'uppercase' }}>
            Scientific Provenance & Documentation
          </span>
        </header>

        {/* Scrollable Document Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Section 1: Vision and Platform Genesis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            
            {/* Vision & Platform Genesis */}
            <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Target size={14} color="var(--primary)" />
                  <strong style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.08em' }}>Platform Mission & Vision</strong>
                </div>
                <p style={{ fontSize: '12px', lineHeight: 1.4, margin: 0 }}>
                  To safeguard Indian lives, agricultural yields, and municipal infrastructure by transforming complex climate datasets into instantaneous, actionable emergency directives. BHARAT-TWIN stands as India's premier **Climate Scenario Sandbox**, empowering decision-makers to stress-test regional resilience before physical damage occurs.
                </p>
              </div>

              <div>
                <strong style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '2px', letterSpacing: '0.08em' }}>Why BHARAT-TWIN Exists</strong>
                <p style={{ fontSize: '12px', lineHeight: 1.4, margin: 0 }}>
                  disaster managers and municipal executives operate in a data-rich but decision-poor environment. While raw weather feeds exist, translating a forecasted 42°C heatwave or a 40% rainfall deficit into specific, localized administrative actions (such as rationing reservoir drawdowns or establishing cooling centers) is traditionally manual and delayed. BHARAT-TWIN bridges this gap, translating physical stressors into policy directives instantly.
                </p>
              </div>
            </div>

            {/* National Impact and Economic Resilience Narrative */}
            <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Landmark size={14} color="var(--primary)" />
                <strong style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.08em' }}>National Impact & Economic Value</strong>
              </div>
              <p style={{ fontSize: '12px', lineHeight: 1.4, margin: 0 }}>
                For a rapidly urbanizing India, climate anomalies represent severe financial and human risks. An unmitigated urban heat island surge or agricultural drought can severely impact regional GDP.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', lineHeight: 1.3 }}>
                <div>• <strong>Municipal Case:</strong> Load-balancing power grids prevents transformer explosion outages.</div>
                <div>• <strong>Agricultural Case:</strong> Advancing irrigation frequency by 48 hours protects crop roots.</div>
                <div>• <strong>Economic Case:</strong> Pre-positioning relief resources saves crores in emergency expenditures.</div>
              </div>
            </div>

          </div>

          {/* Section 2: Visual System Pipeline Flowchart */}
          <div className="premium-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Cpu size={14} color="var(--primary)" />
              <strong style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.08em' }}>
                Operational System Architecture Pipeline
              </strong>
            </div>
            
            {/* Horizontal Flowchart */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', gap: '8px', overflowX: 'auto' }}>
              {[
                { step: '01', name: 'IMD / INSAT Ingestion', desc: '0.25° weather cell feeds & LST frames' },
                { step: '02', name: 'Database Decoupler', desc: 'Supabase PostgreSQL startup resilience' },
                { step: '03', name: 'XGBoost ML Core', desc: 'Recursive lag-30 day predictions' },
                { step: '04', name: 'Three.js 3D Twin', desc: 'Deccan Plateau terrain DEM mesh' },
                { step: '05', name: 'ReportLab PDF Engine', desc: 'Unique McKinsey-grade PDF briefing' }
              ].map((flow, i) => (
                <React.Fragment key={i}>
                  <div style={{
                    background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '6px',
                    padding: '8px 12px', textAlign: 'center', minWidth: '155px'
                  }}>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>{flow.step}</span>
                    <strong style={{ fontSize: '11px', color: 'var(--primary)', display: 'block', marginTop: '1px' }}>{flow.name}</strong>
                    <span style={{ fontSize: '9px', color: 'var(--muted)', display: 'block', marginTop: '2px', lineHeight: 1.1 }}>{flow.desc}</span>
                  </div>
                  {i < 4 && <span style={{ color: 'var(--border)', fontSize: '14px', fontWeight: 'bold' }}>→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Section 3: Scientific Data Sources */}
          <div className="premium-card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Database size={14} color="var(--primary)" />
              <strong style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.08em' }}>
                Scientific Data Provenance Registry
              </strong>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '11.5px', lineHeight: 1.4 }}>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Indian Meteorological Department (IMD)</strong>
                <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px', marginBottom: '8px' }}>
                  Supplies historical daily gridded precipitation records at 0.25° resolution and maximum/minimum temperature records at 1.0° resolution, forming the physical baselines.
                </p>
                
                <strong style={{ color: 'var(--primary)' }}>INSAT-3D / 3DR Satellite Telemetry</strong>
                <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px', marginBottom: '8px' }}>
                  Ingests Land Surface Temperature (LST) thermal bands mapped in real-time, correcting regional weather station interpolation errors across core urban zones.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--primary)' }}>MOSDAC Weather Archival Portal</strong>
                <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px', marginBottom: '8px' }}>
                  Provides space-applications gridded meteorological parameters and humidity indexes, validating model input vectors during monsoon periods.
                </p>
                
                <strong style={{ color: 'var(--primary)' }}>NRSC Vegetation Greenness Index (NDVI)</strong>
                <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px' }}>
                  Integrates satellite-derived canopy moisture and NDVI parameters from the National Remote Sensing Centre, defining baseline regional crop drought vulnerability.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Mission Directorate Directory */}
          <div className="premium-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Users size={14} color="var(--primary)" />
              <strong style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.08em' }}>
                Mission Directorate & Technical Directory
              </strong>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { name: 'Akshay', role: 'Project Lead', resp: 'Platform execution, NDMA policy alignment, government coordination, and operational validation.' },
                { name: 'Abdul Kalam Hussain', role: 'AI Systems Lead', resp: 'FastAPI startup decoupler, database connection diagnostic suites, and XGBoost lag forecast training.' },
                { name: 'Abhiram', role: 'Geospatial Systems Lead', resp: 'Three.js 3D Digital Earth terrain DEM mapping, Leaflet Wind-heatmap overlays, and WebGL shader code.' },
                { name: 'Bhavana', role: 'Research & Validation Lead', resp: 'IMD data curation, INSAT LST calibration, agricultural stress indicators, and scorecard QA testing.' }
              ].map((member, idx) => (
                <div key={idx} style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '12px', color: 'var(--primary)', letterSpacing: '-0.01em' }}>{member.name}</div>
                  <div style={{ fontSize: '8.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>{member.role}</div>
                  <p style={{ fontSize: '10.5px', color: 'var(--text)', lineHeight: 1.3, margin: 0 }}>{member.resp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: National Climate Readiness Timeline & Scientific Assumptions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', paddingBottom: '20px' }}>
            
            {/* National Climate Readiness Timeline */}
            <div className="premium-card" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Globe size={14} color="var(--primary)" />
                <strong style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.08em' }}>
                  National Climate Readiness Timeline
                </strong>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid rgba(11,61,145,0.12)' }}>
                {[
                  { year: '2026', title: 'Urban Heatwave Planning', desc: 'Deploying mesoscale micro-climate sensors and cooling coordinates across pilot zones.' },
                  { year: '2027', title: 'Multi-District Risk Intelligence', desc: 'Scaling spatial cell resolution overlays to Telangana districts using INSAT-3D correction feeds.' },
                  { year: '2028', title: 'National Climate Operating System', desc: 'Deploying unified API-driven emergency command interfaces for State Disaster Management Authorities.' },
                  { year: '2030', title: 'Digital Climate Twin of India', desc: 'Integrating a country-scale country-mesh 3D simulation twin with sub-kilometer forecasting envelopes.' }
                ].map((item, index) => (
                  <div key={index} style={{ position: 'relative', marginBottom: index === 3 ? 0 : '4px' }}>
                    {/* Circle badge */}
                    <div style={{
                      position: 'absolute', left: '-23px', top: '2px', width: '12px', height: '12px',
                      borderRadius: '50%', background: 'var(--surface)', border: '2.5px solid var(--primary)',
                      boxShadow: '0 0 0 3px rgba(11,61,145,0.06)'
                    }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>{item.year}</span>
                      <strong style={{ fontSize: '11.5px', color: 'var(--text)' }}>{item.title}</strong>
                    </div>
                    <p style={{ fontSize: '10.5px', color: 'var(--muted)', margin: '2px 0 0 0', lineHeight: 1.3 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Assumptions & Transparency */}
            <div className="premium-card" style={{ borderLeft: '4px solid var(--risk-high)', background: 'rgba(255,145,0,0.02)', padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <ShieldAlert size={14} color="var(--risk-high)" />
                <strong style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.06em' }}>
                  Scientific Assumptions & Model Transparency
                </strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px', lineHeight: 1.4 }}>
                <div>
                  <strong>Scientific Limitations:</strong> Mesh resolution is mathematically bounded to the 0.25° regional pilot grids. Forecasting skill is bounded by historical station density. Simulated perturbations represent sensitivity analyses rather than physical numerical weather predictions.
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                  <strong>Vulnerability Calibration:</strong> Composite risk index represents land cover susceptibility, concrete absorption indices, and socioeconomic exposure factors, aligned with NDMA Framework v2.0 guidelines.
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
