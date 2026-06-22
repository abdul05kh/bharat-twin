'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import ScientificTrustPanel from '@/components/ScientificTrustPanel';
import { Database, Cpu, Globe2, ShieldAlert, Award, Calendar, Layers, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const TEAM = [
  {
    name: 'Akshay',
    role: 'Project Lead',
    subrole: 'Systems Strategy & Integration Oversight',
    education: 'B.Tech ECE, JNTUH University College of Engineering Jagtial (UCEJ)',
    tagline: 'Oversees overall systems integration, deployment strategy, and database scaling verification.',
    responsibilities: [
      'Command parameters oversight and system workflow design',
      'CORS security policies and backend key validation loops',
      'Database indexing strategies and SQLite query speed optimizations',
      'MD5 checksum provenance pipeline audits',
      'Cross-origin API binding configuration'
    ],
    contributions: [
      'Ingested authentic IMD gridded cell points into production database schema',
      'Created security check loops auditing key availability',
      'Configured FastAPI deployment routing and environment settings'
    ],
    technical_ownership: ['models.py', 'config.py', 'database.py', 'deployment_guide.md']
  },
  {
    name: 'Abdul Kalam Hussain',
    role: 'AI Systems Lead',
    subrole: 'Climate Intelligence, Forecasting, Platform Architecture',
    education: 'B.Tech CSE (Data Science), Kamala Institute of Technology and Science (KITS), Singapur',
    tagline: 'Architected the core spatial prediction models, async forecast worker queues, and LLM orchestration.',
    responsibilities: [
      'XGBoost spatiotemporal prediction model training scripts',
      'ThreadPoolExecutor background runner for async model execution',
      'Multi-tier LLM failover configuration (Groq llama-3.3 → Gemini 2.5 Flash)',
      'Zustand Client State Management and API polling synchronization',
      'AI Explainability logic and advisory text compilation'
    ],
    contributions: [
      'Built async forecast polling with live status updates',
      'Structured Pydantic schemas validating AI JSON outputs',
      'Configured LLM prompt builders co-locating fused coordinate values'
    ],
    technical_ownership: ['main.py', 'forecast_engine.py', 'insights_engine.py', 'store.ts']
  },
  {
    name: 'Abhiram',
    role: 'Geospatial Systems Lead',
    subrole: 'Visualization & Platform Integration',
    education: 'B.Tech ECE, JNTUH University College of Engineering Jagtial (UCEJ)',
    tagline: 'Developed the interactive frontend dashboards, Three.js WebGL twin, and Leaflet grid mapping.',
    responsibilities: [
      'Three.js 3D grid extrusion rendering and animation loop controls',
      'Orbit path rendering for INSAT-3D and sweep coordinates mapping',
      'Leaflet canvas layers drawing spatial grid overlays',
      'Responsive panel layouts and CSS telemetry styles',
      'Client-side PDF report compilation'
    ],
    contributions: [
      'Built Three.js WebGL twin rendering coordinate points at 60 FPS',
      'Created leaflet canvas grid representing temperature/precipitation',
      'Configured temporal timelines for time-machine playback'
    ],
    technical_ownership: ['ClimateTwin3D.tsx', 'ClimateMap.tsx', 'MapContainer.tsx', 'twin/page.tsx', 'compare/page.tsx']
  },
  {
    name: 'Bhavana',
    role: 'Research & Validation Lead',
    subrole: 'Documentation, QA & System Testing',
    education: 'B.Tech ECE, JNTUH University College of Engineering Jagtial (UCEJ)',
    tagline: 'Conducted meteorological threshold mapping and directed E2E system rehearsals.',
    responsibilities: [
      'Threshold parameters mapping based on IMD and NDMA warning guides',
      'Manual verification scripts auditing fused cell coordinates',
      'System test suite validation and API status diagnostics',
      'Validation of nearest-neighbor distance calculation logic',
      'Drafted technical verification and scientific trust documentation'
    ],
    contributions: [
      'Wrote comprehensive build, API, and validation audit reports',
      'Verified nearest-neighbor co-location matching bounds',
      'Audited CSS class variables avoiding styling overlaps'
    ],
    technical_ownership: ['report_generator.py', 'decision-support/page.tsx', 'tests/', 'walkthrough.md']
  }
];

const ROADMAP_PHASES = [
  { phase: 'Phase 1: Hyderabad Metropolitan Pilot', desc: 'Current execution node establishing the spatial fusion metrics and validation limits for HMR gridded coordinates.' },
  { phase: 'Phase 2: Telangana Grids Expansion', desc: 'Scaling the database schema to ingest all district-level IMD grids and local agricultural observatory sensors across the state.' },
  { phase: 'Phase 3: South India Regional Node', desc: 'Adding gridded pipelines for neighboring states and integrating regional MOSDAC geo-corrected satellite feeds.' },
  { phase: 'Phase 4: Scalable Climate Digital Twin Architecture', desc: 'Designing the core algorithm architecture for public cloud clusters enabling multi-state downscaling and regional policy advisories.' }
];

export default function MissionDirectoratePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ paddingBottom: '60px' }}>
        {/* Header Banner */}
        <div style={{ background: 'var(--gov-blue-mid)', color: 'white', padding: '48px', borderBottom: '3px solid var(--gov-saffron)' }}>
          <div style={{ maxWidth: '1000px' }}>
            <div style={{ fontSize: '11px', color: 'var(--gov-saffron)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
              Mission Operations Directorate
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Mission Directorate</h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '800px' }}>
              Authoritative overview of the BHARAT-TWIN platform: defining objectives, documenting spatial engineering challenges, showcasing the developers, and aligning with scalable climate decision frameworks.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1000px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* Why We Built This Story Layer */}
          <div style={{ background: 'var(--surface)', padding: '32px', border: '1px solid var(--border)', borderRadius: '6px', borderLeft: '4px solid var(--gov-cyan)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>Why We Built BHARAT-TWIN</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p>
                <strong>The Problem:</strong> Climate datasets in India are highly fragmented. Meteorological grids, satellite orbits, and localized ground observations sit in disjointed departmental archives.
              </p>
              <p>
                <strong>The Challenge:</strong> Reconciling data models with vastly different spatial resolutions—IMD gridded rainfall at $0.25^\circ$, temperatures at $1.0^\circ$, and INSAT satellite LST at $0.04^\circ$—is a massive barrier. Without a unified spatial grid, municipal authorities cannot translate raw climate inputs into local actions.
              </p>
              <p>
                <strong>Our Response:</strong> We built BHARAT-TWIN, a scalable digital twin platform that acts as a co-located climate intelligence layer, mapping multi-source observations into fused mesoscale cells.
              </p>
              <p>
                <strong>The Impact:</strong> State disaster managers and local planners access a single source of truth, enabling automated risk indices and actionable pre-positioned advisories.
              </p>
            </div>
          </div>

          {/* Traditional vs BHARAT-TWIN Comparison */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>Why BHARAT-TWIN Is Different</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Capability</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Traditional Workflow</th>
                    <th style={{ padding: '12px 16px', color: 'var(--gov-cyan)', fontWeight: 700 }}>BHARAT-TWIN</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cap: 'Data Structure', trad: 'Separate fragmented silod files', bt: 'Unified co-located climate layer' },
                    { cap: 'Data Processing', trad: 'Manual command-line batching', bt: 'Automated ingestion & nearest-neighbor fusion' },
                    { cap: 'Spatial Visualization', trad: 'Static GIS map charts', bt: 'Interactive 3D digital twin console' },
                    { cap: 'Risk Telemetry', trad: 'Delayed post-facto assessments', bt: 'Real-time forecasting & automated risk alerts' },
                    { cap: 'Decision Support', trad: 'Isolated policy briefs', bt: 'Integrated AI explainable advisory platform' }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'white' }}>{row.cap}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{row.trad}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>{row.bt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Objectives */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Regional Climate Objectives</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { title: '1. Resolution Fusion', desc: 'Reconcile IMD 0.25° rainfall, 1.0° temperature, and INSAT-3D 0.04° Land Surface Temperature datasets into a unified spatial grid using nearest-neighbor climate cell mapping.' },
                { title: '2. Ensemble Prediction', desc: 'Train robust gradient-boosted spatial regressors using recursive multi-step forecasting incorporating multi-scale seasonal lags and day-of-year cyclical vectors.' },
                { title: '3. Decision Automation', desc: 'Deploy multi-tiered generative AI reasoning with advisories referencing WMO and local thresholds.' }
              ].map((obj, i) => (
                <div key={i} style={{ background: 'var(--surface-alt)', padding: '20px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gov-cyan)', marginBottom: '8px' }}>{obj.title}</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{obj.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Impact */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '28px', borderLeft: '4px solid var(--gov-saffron)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <ShieldAlert color="var(--gov-saffron)" size={32} style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Regional Impact &amp; Adaptation Alignment</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  BHARAT-TWIN is architected to support local adaptation guidelines and NDMA directives on Heat Wave and drought mitigation. By supplying downscaled grid intelligence, it provides disaster managers with the predictive foresight needed to issue block-level heat advisories and coordinate multi-sector crop-water budgeting.
                </p>
              </div>
            </div>
          </div>

          {/* Mission Directorate */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Mission Directorate</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {TEAM.map((member, idx) => (
                <div key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                  
                  {/* Header info */}
                  <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '4px',
                      background: 'var(--gov-blue-light)', border: '2px solid var(--gov-saffron)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: 'white', fontSize: '16px'
                    }}>
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 3)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>{member.name}</h3>
                      <div style={{ fontSize: '12px', color: 'var(--gov-saffron)', fontWeight: 600 }}>{member.role}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 500 }}>{member.subrole}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '350px', textAlign: 'right', fontStyle: 'italic' }}>
                      "{member.tagline}"
                    </div>
                  </div>

                  {/* Body responsibilities */}
                  <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '24px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Responsibilities</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {member.responsibilities.map((r, i) => (
                          <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            <span style={{ color: 'var(--gov-saffron)' }}>›</span> {r}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Key Contributions</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {member.contributions.map((c, i) => (
                          <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            <span style={{ color: 'var(--gov-cyan)' }}>✓</span> {c}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Technical Ownership</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {member.technical_ownership.map((file, i) => (
                          <span key={i} style={{ padding: '2px 6px', background: 'var(--neutral-200)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '10px', fontFamily: 'monospace', color: 'white' }}>
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Limitations & Trust Anchor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '28px', background: 'rgba(255, 51, 51, 0.04)', height: '100%' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>Scientific Assumptions &amp; Limitations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <p>• <strong>Pilot Boundary</strong>: Deployments are limited strictly to the Hyderabad Metropolitan Region grid coordinates.</p>
                <p>• <strong>Resolution Mismatch</strong>: IMD gridded rainfall (0.25°) and temperatures (1.0°) originate from different native resolutions. Nearest-neighbor mapping co-locates variables but does not generate sub-grid local gradients.</p>
                <p>• <strong>Fusion Scope</strong>: Spatial cell fusion is based on geographic distance matching and does not compute complex atmospheric physics or moisture transport models.</p>
                <p>• <strong>Forecast Bounds</strong>: XGBoost ensemble forecasts rely heavily on multi-scale lag features. Model predictions are bound to the limits of historical observation periods.</p>
              </div>
            </div>
            <ScientificTrustPanel />
          </div>

          {/* Future Scaling Roadmap */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>Future Expansion Roadmap</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {ROADMAP_PHASES.map((sec, idx) => (
                <div key={idx} style={{ background: 'var(--surface-alt)', borderLeft: '4px solid var(--gov-cyan)', padding: '20px', borderRadius: '0 6px 6px 0', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{sec.phase}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{sec.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
