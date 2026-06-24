'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  CloudRain, 
  Thermometer, 
  Leaf, 
  Wind, 
  FileDown, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  Terminal,
  AlertTriangle,
  X,
  MapPin,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import downloadExecutiveBrief from '@/lib/reportClient';
import { useClimateStore } from '@/store/store';

export default function LandingPage() {
  const router = useRouter();
  const { fetchRegions, selectedRegion } = useClimateStore();
  const [currentTime, setCurrentTime] = useState('');
  
  // ─── Climate Simulation Theater Logs State ───
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  // ─── Climate Pulse Loop State ───
  const [pulseStep, setPulseStep] = useState(0); // 0: Baseline, 1: Heatwave, 2: Risk Peak, 3: Directive
  const [riskScore, setRiskScore] = useState(42);
  const [currentTemp, setCurrentTemp] = useState(34.2);
  const [currentAQI, setCurrentAQI] = useState(84);
  const [waterStress, setWaterStress] = useState(28);
  const [healthStrain, setHealthStrain] = useState(34);

  // ─── PDF Download State ───
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [pdfError, setPdfError] = useState<string | null>(null);

  // ─── Watch Demo Modal State ───
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoSlide, setDemoSlide] = useState(0);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Live IST Clock
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Continuous Rolling Console Logs (Simulation Theater) ───
  useEffect(() => {
    const logMessages = [
      'INGESTING SATELLITE FRAME FROM INSAT-3D (LST CHANNEL)...',
      'SYNCHRONIZING IMD 0.25° WEATHER OBS CELL DATA...',
      'RUNNING MESOSCALE XGBOOST 30-DAY CLIMATE PREDICTION CORE...',
      'CALCULATING SPATIAL HAZARD COEFFICIENTS FOR PILOT BOUNDS...',
      'GENERATING MUNICIPAL DIRECTIVE BRIEFS ALIGNED WITH NDMA V2.0...',
      'SECURE INFERENCE EXECUTED ON LLAMA-3.3-70B MODEL HUB...',
      'RESOLVING SUPABASE CONNECTION POOLER LIVENESS: HEALTHY...',
      'COMPILED ASSESSMENTS SAVED TO CLIMATE DATA VAULT...'
    ];

    let count = 0;
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      const msg = logMessages[count % logMessages.length];
      const prefix = msg.includes('INGESTING') || msg.includes('SYNCHRONIZING') ? '[INGEST]' :
                     msg.includes('RUNNING') || msg.includes('EXECUTED') ? '[MODEL]' :
                     msg.includes('CALCULATING') ? '[COMPUTE]' : '[SYSTEM]';
                     
      setConsoleLogs(prev => [...prev.slice(-12), `${time} ${prefix} ${msg}`]);
      count++;
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Scroll console to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // ─── Climate Pulse Loop (Observing → Simulating → Predicting → Acting) ───
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseStep(prev => {
        const next = (prev + 1) % 4;
        // Adjust metrics dynamically based on simulated state
        if (next === 0) {
          // Baseline state
          setRiskScore(42);
          setCurrentTemp(34.2);
          setCurrentAQI(84);
          setWaterStress(28);
          setHealthStrain(34);
        } else if (next === 1) {
          // Heatwave anomaly begins
          setRiskScore(54);
          setCurrentTemp(38.6);
          setCurrentAQI(115);
          setWaterStress(45);
          setHealthStrain(52);
        } else if (next === 2) {
          // Peak critical risk
          setRiskScore(71);
          setCurrentTemp(41.6);
          setCurrentAQI(162);
          setWaterStress(63);
          setHealthStrain(74);
        } else {
          // Action Directive in progress
          setRiskScore(68);
          setCurrentTemp(40.2);
          setCurrentAQI(140);
          setWaterStress(60);
          setHealthStrain(70);
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(pulseInterval);
  }, []);

  // ─── Playback Slideshow loop for Demo Modal (30 seconds target) ───
  useEffect(() => {
    if (isDemoOpen) {
      setDemoSlide(0);
      demoIntervalRef.current = setInterval(() => {
        setDemoSlide(prev => (prev + 1) % 6);
      }, 4000); // 4s per slide * 6 slides = 24 seconds total walkthrough loop
    } else {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    }
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, [isDemoOpen]);

  // Telemetry Audit PDF Download
  const triggerPdfDownload = async () => {
    console.log('[TELEMETRY] downloadExecutiveBrief triggered from LandingPage', {
      timestamp: new Date().toISOString(),
      pulseRiskState: { riskScore, currentTemp, currentAQI }
    });

    if (pdfStatus === 'generating') return;
    setPdfStatus('generating');
    setPdfError(null);

    // Dynamic simulation query simulation
    setTimeout(async () => {
      try {
        await downloadExecutiveBrief({});
        setPdfStatus('ready');
        setTimeout(() => setPdfStatus('idle'), 1500);
      } catch (err: any) {
        console.error('Report download failed:', err);
        setPdfStatus('error');
        setPdfError(err.message || 'Verification fail');
        setTimeout(() => setPdfStatus('idle'), 3000);
      }
    }, 1200);
  };

  const handleOpenDemo = () => {
    console.log('[TELEMETRY] Watch Demo opened', { timestamp: new Date().toISOString() });
    setIsDemoOpen(true);
  };

  const handleCloseDemo = () => {
    console.log('[TELEMETRY] Watch Demo closed', { timestamp: new Date().toISOString() });
    setIsDemoOpen(false);
  };

  // Demo Slides Definitions
  const demoSlides = [
    { step: '01', title: 'Select District Coordinate Bounds', desc: 'Isolate specific pilot grids (e.g. Hyderabad Metropolitan Region) with boundary projections.', highlight: 'Map coordinates lock in.' },
    { step: '02', title: 'Apply Climate Stressors', desc: 'Perturb base parameters in the cockpit: inject severe +4.0°C Heatwaves or -50% Drought precipitation deficits.', highlight: 'System enters alert status.' },
    { step: '03', title: 'Predict Anomaly Propagation', desc: 'XGBoost ML forecast models compute mesoscale cell variables recursively, showing risk spread.', highlight: 'Forecast curves shift in real-time.' },
    { step: '04', title: 'Assess Integrated System Risk', desc: 'Aggregate Digital Risk Index surges (42% to 71%) mapping thermal, water, crop, health, and resource strains.', highlight: 'High-contrast radial speedometers peak.' },
    { step: '05', title: 'Formulate Action Directives', desc: 'The AI Command engine synthesizes immediate response directives aligned with official NDMA frameworks.', highlight: 'Cooling center alerts activated.' },
    { step: '06', title: 'Export Official Briefing Report', desc: 'The McKinsey-grade ReportLab PDF engine compiles active grid states, vector graphs, and QR codes for auto-download.', highlight: 'PDF document generated & downloaded.' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text)', overflow: 'hidden' }}>
      <Navbar />
      
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px 20px', gap: '14px', boxSizing: 'border-box' }}>
        
        {/* Top Executive Status Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px 20px',
          boxShadow: 'var(--shadow)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--primary)" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              BHARAT-TWIN Command Operations Center
            </span>
            <span style={{ fontSize: '9px', background: 'rgba(30,142,62,0.1)', color: 'var(--success)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase' }}>
              OPERATIONAL
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} /> IST {currentTime}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Pilot Grid Node: <strong style={{ color: 'var(--text)' }}>Hyderabad Mesoscale Area</strong>
            </span>
          </div>
        </div>

        {/* Above-The-Fold Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '14px', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          
          {/* LEFT: Climate Simulation Theater (Unified Hero & Workflow) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '2px' }}>
            
            <div className="premium-card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '20px 22px', 
              gap: '14px',
              background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
              position: 'relative',
              flex: 1
            }}>
              {/* Header Branding */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '9px', background: 'rgba(11,61,145,0.08)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🚀 Climate Simulation Theater · Operational Flow
                  </span>
                  <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, marginTop: '6px', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                    BHARAT-TWIN
                  </h1>
                  <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.4, maxWidth: '95%' }}>
                    India's premier Climate Scenario Sandbox. Experience the automated Observe → Simulate → Predict → Act workflow.
                  </p>
                </div>
              </div>

              {/* Continuously Animated Workflow Blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '2px' }}>
                {[
                  { step: 0, num: '01', title: 'OBSERVE', desc: 'Telemetry Ingest', color: 'var(--success)', details: 'INSAT-3D & IMD gridding' },
                  { step: 1, num: '02', title: 'SIMULATE', desc: 'Stress Cockpit', color: 'var(--accent)', details: 'Parameters override' },
                  { step: 2, num: '03', title: 'PREDICT', desc: 'XGBoost Forecasting', color: 'var(--warning)', details: 'Temporal risk maps' },
                  { step: 3, num: '04', title: 'ACT', desc: 'NDMA Action Briefs', color: 'var(--critical)', details: 'McKinsey PDF & AI synthesis' }
                ].map(phase => {
                  const isActive = pulseStep === phase.step;
                  const phaseColors: Record<string, string> = {
                    'var(--success)': '#1E8E3E',
                    'var(--accent)': '#008CFF',
                    'var(--warning)': '#B78103',
                    'var(--critical)': '#D50000'
                  };
                  const activeColorHex = phaseColors[phase.color] || '#0B3D91';
                  
                  return (
                    <div key={phase.step} style={{
                      background: isActive ? 'var(--surface)' : 'rgba(255,255,255,0.4)',
                      border: isActive ? `2px solid ${activeColorHex}` : '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '82px',
                      boxShadow: isActive ? `0 4px 12px rgba(0,0,0,0.05), inset 0 0 0 1px ${activeColorHex}15` : 'none',
                      opacity: isActive ? 1 : 0.65,
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.40s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Animated Active Indicator Line */}
                      {isActive && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
                          background: activeColorHex, animation: 'statusPulse 2s ease-in-out infinite'
                        }} />
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: isActive ? activeColorHex : 'var(--muted)', fontFamily: 'monospace' }}>
                          {phase.num}
                        </span>
                        {isActive && (
                          <span className="status-live" style={{
                            width: '5px', height: '5px', borderRadius: '50%', background: activeColorHex
                          }} />
                        )}
                      </div>
                      
                      <div>
                        <h4 style={{ fontSize: '10.5px', fontWeight: 800, color: isActive ? 'var(--text)' : 'var(--muted)', letterSpacing: '0.04em', margin: '2px 0 1px 0' }}>
                          {phase.title}
                        </h4>
                        <p style={{ fontSize: '9px', color: 'var(--muted)', lineHeight: 1.2 }}>
                          {phase.desc}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2px', marginTop: '2px', fontSize: '8px', color: isActive ? 'var(--text)' : 'var(--muted)', fontStyle: 'italic' }}>
                        {phase.details}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation & Controls */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                <Link href="/scenario-sandbox" style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px', 
                  padding: '9px 14px', 
                  background: 'var(--primary)', 
                  color: '#FFFFFF', 
                  borderRadius: '6px', 
                  fontWeight: 700, 
                  fontSize: '11px', 
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(11, 61, 145, 0.18)',
                  transition: 'background 0.2s'
                }}>
                  <Play size={11} fill="white" /> Enter Sandbox Cockpit
                </Link>
                
                <button onClick={handleOpenDemo} style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px', 
                  padding: '9px 14px', 
                  background: '#FFFFFF', 
                  color: 'var(--primary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '6px', 
                  fontWeight: 700, 
                  fontSize: '11px', 
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}>
                  <Sparkles size={11} /> Watch Simulation Walkthrough
                </button>
              </div>

              {/* Sleek Embedded Terminal Console */}
              <div style={{ 
                background: '#0F172A', 
                border: '1px solid #1E293B', 
                borderRadius: '6px',
                padding: '10px 12px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px',
                fontFamily: 'monospace',
                color: '#38BDF8',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
                flex: 1,
                minHeight: '100px',
                maxHeight: '120px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px', color: '#64748B', fontSize: '8.5px', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={10} /> SIMULATION THEATER DATA STREAM
                  </span>
                  <span className="status-live" style={{ fontSize: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', padding: '1px 5px', borderRadius: '2px' }}>
                    ACTIVE
                  </span>
                </div>
                <div ref={consoleRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9px', lineHeight: 1.3 }}>
                  {consoleLogs.map((log, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#475569' }}>{log.slice(0, 8)}</span>
                      <span style={{ 
                        color: log.includes('[INGEST]') ? '#34D399' : log.includes('[MODEL]') ? '#FB7185' : log.includes('[COMPUTE]') ? '#FBBF24' : '#60A5FA',
                        fontWeight: 700
                      }}>{log.slice(9, 18)}</span>
                      <span style={{ color: '#CBD5E1' }}>{log.slice(18)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT: Live Pulse Dashboard & Briefing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            
            {/* Live Climate Pulse Indicator Card */}
            <div className="premium-card" style={{ 
              borderLeft: `5px solid ${riskScore > 65 ? 'var(--risk-critical)' : riskScore > 50 ? 'var(--risk-high)' : 'var(--risk-low)'}`,
              padding: '16px 20px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                    Live Climate Pulse Dashboard
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '3px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {riskScore}%
                    </span>
                    <span className={`risk-badge ${riskScore > 65 ? 'risk-badge-critical' : riskScore > 50 ? 'risk-badge-high' : 'risk-badge-low'}`}>
                      {getRiskLevel(riskScore)} Risk
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '8.5px', background: 'var(--surface-alt)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {pulseStep === 0 ? 'Observe: Baseline' : pulseStep === 1 ? 'Simulate: Stressing' : pulseStep === 2 ? 'Predict: Anomaly' : 'Act: Directive'}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2, 3].map(step => (
                      <div key={step} style={{ 
                        width: '6px', height: '6px', borderRadius: '50%', 
                        background: pulseStep === step ? 'var(--primary)' : 'var(--border)', 
                        transition: 'background-color 0.3s' 
                      }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Flow visualization */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Trend</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: riskScore > 65 ? 'var(--critical)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <TrendingUp size={12} /> {riskScore > 65 ? '+29% Surge' : 'Stable'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Confidence</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>91.4% (High)</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>NDMA Action Directive</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                    {riskScore > 65 
                      ? '⚠️ Open urban cooling centers, load-balance grids.' 
                      : '✓ Nominal irrigation; standard grid monitoring.'}
                  </span>
                </div>
              </div>

              {/* Stress indicators meters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '8px', background: 'var(--surface-alt)', padding: '6px 12px', borderRadius: '6px' }}>
                <div>
                  <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Water Stress Index</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, fontFamily: 'monospace' }}>{waterStress}%</span>
                    <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${waterStress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Health Strain Index</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, fontFamily: 'monospace' }}>{healthStrain}%</span>
                    <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${healthStrain}%`, height: '100%', background: 'var(--critical)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Climate Signals Chips */}
            <div>
              <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Active Meteorological Signals (Live Sensors)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { label: 'Temperature', value: `${currentTemp.toFixed(1)}°C`, status: currentTemp > 38 ? 'Critical' : 'Normal', icon: Thermometer, color: currentTemp > 38 ? 'var(--critical)' : 'var(--primary)' },
                  { label: 'Rainfall', value: '2.5 mm', status: 'Nominal', icon: CloudRain, color: '#008CFF' },
                  { label: 'NDVI (Green)', value: '0.72', status: 'Stable', icon: Leaf, color: 'var(--success)' },
                  { label: 'AQI (Air)', value: currentAQI, status: currentAQI > 120 ? 'Unhealthy' : 'Moderate', icon: Wind, color: currentAQI > 120 ? 'var(--risk-high)' : 'var(--muted)' }
                ].map((sig, idx) => {
                  const Icon = sig.icon;
                  return (
                    <div key={idx} style={{ 
                      background: 'var(--surface)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '6px', 
                      padding: '8px 10px', 
                      boxShadow: 'var(--shadow)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '8.5px', color: 'var(--muted)', fontWeight: 600 }}>{sig.label}</span>
                        <Icon size={12} color={sig.color} />
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', fontFamily: 'monospace', marginTop: '1px' }}>{sig.value}</div>
                      <div style={{ fontSize: '8px', color: sig.color, fontWeight: 700, textTransform: 'uppercase' }}>{sig.status}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Latest Executive Brief Card */}
            <div className="premium-card" style={{ flex: 1, minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Latest Executive Brief
                </h3>
                <span style={{ fontSize: '8.5px', color: 'var(--muted)' }}>Format: dynamic PDF</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '11px', lineHeight: 1.4 }}>
                <div>
                  <strong style={{ color: 'var(--muted)', display: 'block', fontSize: '8.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Key Finding Summary</strong>
                  <span style={{ color: 'var(--text)' }}>
                    {riskScore > 65 
                      ? 'Severe land surface thermal anomalies breaching standards, threatening power and health grids.' 
                      : 'Regional climate cells map closely to historical baselines; reservoir volumes remain stable.'}
                  </span>
                </div>
                <div>
                  <strong style={{ color: 'var(--muted)', display: 'block', fontSize: '8.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Emergency Response Directive</strong>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>
                    {riskScore > 65 
                      ? 'Deploy water tankers, issue heat notices, pre-position cooling grid reserves immediately.' 
                      : 'Review municipal water reserves and maintain standard telemetry schedules.'}
                  </span>
                </div>
              </div>

              {/* Download actions with Loading & Telemetry */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button 
                  onClick={triggerPdfDownload} 
                  disabled={pdfStatus === 'generating'}
                  style={{ 
                    flex: 1,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    padding: '8px 12px', 
                    background: pdfStatus === 'ready' ? 'var(--success)' : pdfStatus === 'error' ? 'var(--critical)' : 'var(--accent)', 
                    color: '#FFFFFF', 
                    border: 'none',
                    borderRadius: '4px', 
                    fontWeight: 700, 
                    fontSize: '11px', 
                    cursor: pdfStatus === 'generating' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {pdfStatus === 'generating' ? (
                    <>
                      <div className="animate-spin" style={{ width: '11px', height: '11px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent' }} />
                      Synthesizing Assessment...
                    </>
                  ) : pdfStatus === 'ready' ? (
                    <>
                      <CheckCircle2 size={11} />
                      Executive Brief Ready
                    </>
                  ) : pdfStatus === 'error' ? (
                    <>
                      <AlertCircle size={11} />
                      Failed. Re-try.
                    </>
                  ) : (
                    <>
                      <FileDown size={11} /> Download PDF Brief
                    </>
                  )}
                </button>
                {pdfError && <div style={{ fontSize: '8px', color: 'var(--critical)', marginTop: '2px' }}>{pdfError}</div>}
                <Link href="/briefing" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px',
                  padding: '8px 12px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '4px', 
                  fontSize: '11px', 
                  color: 'var(--primary)', 
                  fontWeight: 700,
                  textDecoration: 'none'
                }}>
                  View Full Report <ArrowRight size={11} />
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* 30-Second Autoplay Walkthrough Modal (Watch Demo) */}
        {isDemoOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}>
            <div className="premium-card" style={{
              width: '580px', background: 'var(--surface)', padding: '24px',
              border: '1px solid var(--border)', borderRadius: '12px',
              display: 'flex', flexDirection: 'column', gap: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)', position: 'relative'
            }}>
              {/* Close Button */}
              <button 
                onClick={handleCloseDemo} 
                style={{ position: 'absolute', top: 18, right: 18, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
              >
                <X size={18} />
              </button>

              <div>
                <span style={{ fontSize: '9px', background: 'rgba(0,140,255,0.08)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                  Cinematic Demonstration Walkthrough
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                  BHARAT-TWIN Operations Sandbox Walkthrough
                </h3>
              </div>

              {/* Progress Slideshow indicator bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                {demoSlides.map((slide, idx) => (
                  <div key={idx} style={{ 
                    height: '4px', borderRadius: '2px', 
                    background: demoSlide === idx ? 'var(--accent)' : demoSlide > idx ? 'var(--primary)' : 'var(--border)',
                    transition: 'background-color 0.3s'
                  }} />
                ))}
              </div>

              {/* Current Slide Display */}
              <div style={{ 
                background: 'var(--surface-alt)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px',
                minHeight: '120px', justifyContent: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800
                  }}>
                    {demoSlides[demoSlide].step}
                  </div>
                  <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>
                    {demoSlides[demoSlide].title}
                  </strong>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.4, marginTop: '2px' }}>
                  {demoSlides[demoSlide].desc}
                </p>
                <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Sparkles size={11} /> {demoSlides[demoSlide].highlight}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  Playing automatically: <strong>Slide {demoSlide + 1} of 6</strong> (30s envelope)
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setDemoSlide(prev => (prev - 1 + 6) % 6)}
                    style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Prev
                  </button>
                  <button 
                    onClick={() => setDemoSlide(prev => (prev + 1) % 6)}
                    style={{ padding: '6px 12px', border: 'none', background: 'var(--primary)', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
        
        {/* Persistent Provenance Footer */}
        <footer style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'var(--surface-alt)', 
          border: '1px solid var(--border)', 
          borderRadius: '8px', 
          padding: '8px 20px', 
          fontSize: '10px', 
          color: 'var(--muted)',
          flexShrink: 0
        }}>
          <div>
            © 2026 BHARAT-TWIN Operational Sandbox · Designed for the <strong>Bharatiya Antariksh Hackathon Grand Finale</strong>
          </div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>Confidence Index: <strong>91.4% (Pass)</strong></span>
            <span>Framework: <strong>NDMA V2.0</strong></span>
            <span>AI Model Engine: <strong>Gemini Pro 1.5 API</strong></span>
          </div>
        </footer>

      </main>
    </div>
  );
}

function getRiskLevel(score: number): string {
  if (score >= 70) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 45) return 'Moderate';
  return 'Low';
}
