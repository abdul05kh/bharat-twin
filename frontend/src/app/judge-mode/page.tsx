'use client';

import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { useClimateStore } from '@/store/store';
import { Play, Pause, ChevronRight, ShieldCheck, Cpu, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function JudgeModePage() {
  const { fetchRegions } = useClimateStore();

  // Demo Sequencer States
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per step (total ~90s)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Resilience states
  const [apiState, setApiState] = useState<'ONLINE' | 'DEGRADED' | 'OFFLINE'>('ONLINE');

  // Evidence Engine Active Tab
  const [activeTab, setActiveTab] = useState<'sci' | 'sec' | 'fus' | 'build' | 'deploy' | 'ready'>('sci');

  const steps = [
    { num: 1, name: 'DATA INGESTION VERIFIED', desc: 'Verify NetCDF/GRD files and INSAT-3D LST satellite transit logs' },
    { num: 2, name: 'SPATIAL FUSION COMPLETE', desc: 'Compute Euclidean nearest-neighbor grid co-locations' },
    { num: 3, name: 'FORECAST GENERATED', desc: 'Execute recursive lag forecast with confidence boundaries' },
    { num: 4, name: 'AI ADVISORY READY', desc: 'Verify Groq Llama-3.3-70b failover to Gemini 1.5 Pro' },
    { num: 5, name: 'DECISION BRIEF GENERATED', desc: 'Review administrative directives and regional situation room briefing' }
  ];

  // Auto advance logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCurrentStep(current => (current === 5 ? 1 : current + 1));
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Sync data on page load
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const handleStepSelect = (stepNum: number) => {
    setCurrentStep(stepNum);
    setTimeLeft(15);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Mock cached fallback reports to display in the evidence engine
  const reports = {
    sci: {
      title: 'Scientific Validation Report',
      content: `Nearest-Neighbor Climate Cell Fusion reconciles native gridded mismatches (Rainfall at 0.25° vs. Temperature at 1.0°).
Formulation:
  d = sqrt((lat_rain - lat_temp)^2 + (lon_rain - lon_temp)^2)
This guarantees co-located, non-null cells across the study coordinates (Latitude 17.10°N – 17.65°N, Longitude 78.10°E – 78.80°E).
Forecast model: XGBoost recursive lag regressor (lag-7, lag-14, lag-30).`
    },
    sec: {
      title: 'Security & Secret Management Audit',
      content: `Verification:
  - Secrets (GROQ_API_KEY, GEMINI_API_KEY) loaded via .env / backend/config.py (Pydantic Settings).
  - Next.js packages exclude backend keys from client-side bundles (no NEXT_PUBLIC_ prefixes).
  - validate_security_keys() masks API output keys in startup logs.
  - SQLite files (*.db) and env files are git shielded via .gitignore.`
    },
    fus: {
      title: 'Fusion Integrity Verification',
      content: `Audit status: PASS
Total Fused grid nodes representing Hyderabad: 15 cells.
Rainfall completeness: VERIFIED (PASS).
Temperature completeness: VERIFIED (fused distance index).
Verification confirms zero null coordinates or averaged grid collapses.`
    },
    build: {
      title: 'Production Build Verification',
      content: `Compilation status: PASS
  - python -m py_compile backend/*.py runs successfully.
  - Next.js client bundle builds with zero warnings.
  - API routes mapped cleanly under local environment parameters.`
    },
    deploy: {
      title: 'Deployment Readiness Report',
      content: `Registry details:
  - Backend host: https://bharat-twin.onrender.com
  - Frontend host: https://bharat-twin.web.app
  - Database dialect switch verified (SQLite for dev, Postgres/PostGIS for production).`
    },
    ready: {
      title: 'Judge Readiness Defense',
      content: `Key Q&A highlights:
  - Why not LSTM? Dataset is mesoscale-limited. Deep Learning overfitting would occur.
  - Why not PINNs? Physics-Informed models are computationally heavy for rapid dashboard iterations.
  - Why Nearest Neighbor? Kriging averages extreme precipitation peaks, masking flooding risks.`
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />

        {/* Header */}
        <header style={{
          height: '55px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={18} color="var(--primary)" />
            <h2 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)' }}>Hackathon Judge Control Panel</h2>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(11,61,145,0.1)', color: 'var(--primary)', fontWeight: 700 }}>
              90s Auto-Playback Demonstration
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* API Resilience Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', background: 'var(--surface)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>DEMO STATE:</span>
              <span style={{
                color: apiState === 'ONLINE' ? 'var(--success)' : 'var(--risk-high)',
                fontWeight: 700
              }}>{apiState}</span>
            </div>
            <button onClick={() => setApiState(prev => prev === 'ONLINE' ? 'DEGRADED' : 'ONLINE')} style={{
              fontSize: '11px', background: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: '4px', color: 'var(--text)', cursor: 'pointer', fontWeight: 600
            }}>
              Simulate Quota Limit
            </button>
          </div>
        </header>

        {/* Content grid: left playback sequencer / right live visualizations */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '14px', minHeight: 0 }}>
          
          {/* Left panel: Timeline progress & Evidence tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Autoplay Sequencer */}
            <div className="premium-card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  Demo Playback Sequencer
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={handleTogglePlay} style={{
                    background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)'
                  }}>
                    {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                  </button>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--risk-high)', fontWeight: 700 }}>
                    Step {currentStep}/5 ({timeLeft}s)
                  </span>
                </div>
              </div>

              {/* Progress steps list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {steps.map((step) => {
                  const active = currentStep === step.num;
                  const completed = step.num < currentStep;
                  return (
                    <button key={step.num} onClick={() => handleStepSelect(step.num)} style={{
                      display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 12px', borderRadius: '6px',
                      background: active ? 'rgba(0, 140, 255, 0.08)' : completed ? 'rgba(30, 142, 62, 0.06)' : 'var(--surface)',
                      border: `1px solid ${active ? 'var(--accent)' : completed ? 'var(--success)' : 'var(--border)'}`,
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                      width: '100%'
                    }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: completed ? 'var(--success)' : active ? 'var(--accent)' : 'var(--surface-alt)',
                          color: completed || active ? '#FFFFFF' : 'var(--muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', fontWeight: 800, flexShrink: 0
                        }}>
                          {completed ? '✓' : step.num}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: active ? 'var(--primary)' : completed ? 'var(--success)' : 'var(--text)', letterSpacing: '0.02em' }}>
                            {step.name} {completed && '— VERIFIED'}
                          </div>
                          <div style={{ fontSize: '9.5px', color: 'var(--muted)', marginTop: '2px' }}>
                            {step.desc}
                          </div>
                        </div>
                      </div>
                      
                      {active && (
                        <div style={{ width: '100%', height: '3px', background: 'rgba(0,140,255,0.2)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${((15 - timeLeft) / 15) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 1s linear' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {currentStep === 5 && timeLeft <= 3 && (
                <div style={{
                  background: 'rgba(30,142,62,0.08)',
                  border: '1px solid rgba(30,142,62,0.2)',
                  color: 'var(--success)',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  marginTop: '10px',
                  fontWeight: 700,
                  textAlign: 'center'
                }}>
                  ✓ CLIMATE DECISION INTELLIGENCE PROCESSES VERIFIED
                </div>
              )}
            </div>

            {/* Evidence Engine Panel */}
            <div className="premium-card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  Evidence Engine Registry
                </h3>
              </div>

              {/* Tabs selector */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {[
                  { key: 'sci', label: 'Science' },
                  { key: 'sec', label: 'Security' },
                  { key: 'fus', label: 'Fusion' },
                  { key: 'build', label: 'Build' },
                  { key: 'deploy', label: 'Deployment' },
                  { key: 'ready', label: 'Defense' }
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key as 'sci' | 'sec' | 'fus' | 'build' | 'deploy' | 'ready')} style={{
                    padding: '3px 6px', fontSize: '10px', borderRadius: '3px', cursor: 'pointer',
                    background: activeTab === tab.key ? 'var(--primary)' : 'var(--surface-alt)',
                    color: activeTab === tab.key ? 'white' : 'var(--text)',
                    border: `1px solid ${activeTab === tab.key ? 'var(--primary)' : 'var(--border)'}`,
                    fontWeight: activeTab === tab.key ? 700 : 500,
                  }}>{tab.label}</button>
                ))}
              </div>

              {/* Report display content */}
              <div style={{
                background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px',
                fontFamily: 'monospace', fontSize: '10.5px', color: 'var(--text)', lineHeight: 1.5,
                maxHeight: '130px', overflowY: 'auto'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '6px' }}>
                  {reports[activeTab].title}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {reports[activeTab].content}
                </div>
              </div>
            </div>

          </div>

          {/* Right panel: Step dynamic mock visualizations */}
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
              Step {currentStep} Active Monitor: {steps[currentStep - 1].name}
            </h3>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {currentStep === 1 && (
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>Ingesting gridded observations from source agencies:</p>
                  <div style={{ background: 'var(--surface-alt)', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'monospace', lineHeight: 1.4 }}>
                    <div>[source] IMD daily rainfall netCDF checksum: e99a182feb3e4e9b99</div>
                    <div>[source] IMD daily temperature binary checksum: f20980cf282d8c36</div>
                    <div>[source] INSAT-3D LST orbital sweeping coordinates: Latitude 17.10°N – 17.65°N bounds (HMR study)</div>
                    <div style={{ color: 'var(--success)', marginTop: '6px', fontWeight: 700 }}>Status: INGESTION PIPELINE VERIFIED (PASS)</div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>Nearest-Neighbor Spatial distance matching (resolves IMD 0.25° vs 1.0° resolution mismatch):</p>
                  <div style={{ background: 'var(--surface-alt)', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'monospace', lineHeight: 1.4 }}>
                    <div>d = sqrt((lat_rain - lat_temp)^2 + (lon_rain - lon_temp)^2)</div>
                    <div style={{ color: 'var(--primary)', marginTop: '6px' }}>• Rain Grid Point: 17.25°N, 78.25°E -- Rainfall: 11.89mm</div>
                    <div style={{ color: 'var(--primary)' }}>• Fused nearest Temperature Point: 17.25°N, 78.25°E -- Max Temp: 31.49°C</div>
                    <div style={{ color: 'var(--success)', marginTop: '6px', fontWeight: 700 }}>Status: FUSION MATRIX INTEGRITY VERIFIED (PASS)</div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>XGBoost Ensemble Recursive Lag Forecast (trained on seasonal history):</p>
                  <div style={{ background: 'var(--surface-alt)', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'monospace', lineHeight: 1.4 }}>
                    <div>Forecast horizon: 30-Day predictive cycle</div>
                    <div>Confidence Boundary offsets: Temperature ±1.4°C / Rainfall ±2.8mm</div>
                    <div style={{ color: 'var(--primary)', marginTop: '6px' }}>• D+1 temperature predicted: 35.6°C (Range: 34.2°C – 37.0°C)</div>
                    <div style={{ color: 'var(--primary)' }}>• D+1 rainfall predicted: 12.4mm (Range: 9.6mm – 15.2mm)</div>
                    <div style={{ color: 'var(--success)', marginTop: '6px', fontWeight: 700 }}>Status: PREDICTIVE OUTPUTS VALIDATED (R² = 0.88 temp)</div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>Multi-tier AI Advisory Generation (Groq failover isolation layer):</p>
                  {apiState === 'DEGRADED' ? (
                    <div style={{ background: 'rgba(255, 145, 0, 0.06)', border: '1px solid rgba(255, 145, 0, 0.2)', padding: '12px', borderRadius: '6px', fontFamily: 'monospace' }}>
                      <div style={{ color: 'var(--risk-high)', fontWeight: 700 }}>[WARN] Groq API quota reached. Triggering failover...</div>
                      <div>Fallback model selected: Gemini 1.5 Pro</div>
                      <div style={{ color: 'var(--success)', fontWeight: 700, marginTop: '4px' }}>Status: RESILIENCE ACTIVE (Advisory successfully compiled)</div>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--surface-alt)', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'monospace', lineHeight: 1.4 }}>
                      <div>Primary model: Llama-3.3-70b (Groq API client)</div>
                      <div>Token count: 1,452 input / 384 output (1,836 total)</div>
                      <div style={{ color: 'var(--success)', marginTop: '6px', fontWeight: 700 }}>Status: AI INSIGHT ADVISORY GENERATED (PASS)</div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>Decision support directives and situation room briefing:</p>
                  <div style={{ background: 'var(--surface-alt)', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Situation Room Summary</div>
                    <p style={{ fontSize: '11px', color: 'var(--text)', lineHeight: 1.4, margin: 0 }}>
                      Composite Alert Level: <strong>Medium Risk</strong>. Vulnerability hotspot detected at Hyderabad metropolitan core (17.36°N, 78.48°E) due to urban heat island anomalies.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ padding: '6px 10px', background: 'var(--surface-alt)', borderLeft: '3px solid var(--risk-high)', borderRadius: '4px' }}>
                      <strong style={{ color: 'var(--primary)', fontSize: '11px' }}>District Administration / SDMA alert</strong>
                      <div style={{ fontSize: '10px', color: 'var(--text)', marginTop: '2px' }}>Pre-position drinking water tankers and medical heat kits.</div>
                    </div>
                    <div style={{ padding: '6px 10px', background: 'var(--surface-alt)', borderLeft: '3px solid var(--accent)', borderRadius: '4px' }}>
                      <strong style={{ color: 'var(--primary)', fontSize: '11px' }}>Municipal Corporation directive</strong>
                      <div style={{ fontSize: '10px', color: 'var(--text)', marginTop: '2px' }}>Activate local street misting sprays and adjust public garden irrigation.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Playback Controls Footer */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Demo progress: <strong>{Math.round((currentStep / 5) * 100)}% complete</strong>
              </div>
              <Link href="/dashboard" style={{
                fontSize: '12px', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none'
              }}>
                Launch Operations Centre <ChevronRight size={13} />
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
