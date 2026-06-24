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
  AlertCircle,
  Globe as GlobeIcon,
  ShieldAlert,
  Compass
} from 'lucide-react';
import * as THREE from 'three';
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

  // Three.js Canvas Reference
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);

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

  // ─── Continuous Rolling Console Logs ───
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

  // ─── Climate Pulse Loop ───
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseStep(prev => {
        const next = (prev + 1) % 4;
        if (next === 0) {
          setRiskScore(42);
          setCurrentTemp(34.2);
          setCurrentAQI(84);
          setWaterStress(28);
          setHealthStrain(34);
        } else if (next === 1) {
          setRiskScore(54);
          setCurrentTemp(38.6);
          setCurrentAQI(115);
          setWaterStress(45);
          setHealthStrain(52);
        } else if (next === 2) {
          setRiskScore(71);
          setCurrentTemp(41.6);
          setCurrentAQI(162);
          setWaterStress(63);
          setHealthStrain(74);
        } else {
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

  // ─── Three.js Holographic Globe ───
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 180;
    const height = canvas.clientHeight || 180;

    const scene = new THREE.Scene();
    
    // Transparent background for seamless glass dashboard embedding
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 100);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#008CFF', 1.2);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // 1. Globe Wireframe (Holographic Blue Grid)
    const globeGeo = new THREE.SphereGeometry(12, 18, 18);
    const globeMat = new THREE.MeshBasicMaterial({
      color: '#008CFF',
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // 2. Solid Translucent Inner Core
    const coreGeo = new THREE.SphereGeometry(11.8, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: '#0B3D91',
      transparent: true,
      opacity: 0.04
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // 3. Orbital Ring (Satellite Track)
    const ringGeo = new THREE.RingGeometry(15, 15.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#00D2FF',
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotateX(Math.PI / 3);
    scene.add(ring);

    // 4. Satellite Dot (Orbital Sweep Indicator)
    const satGeo = new THREE.SphereGeometry(0.8, 8, 8);
    const satMat = new THREE.MeshBasicMaterial({
      color: '#FF1744',
      transparent: true,
      opacity: 0.85
    });
    const satellite = new THREE.Mesh(satGeo, satMat);
    scene.add(satellite);

    // 5. Active Telemetry Pulse Point (Hyderabad Position on Globe)
    // Coords approximately aligned to face camera on start
    const pulseGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: '#00E676',
      transparent: true,
      opacity: 0.9
    });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    pulse.position.set(6, 8, 7); // front-facing upper quadrant
    globe.add(pulse);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate Globe slowly
      globe.rotation.y = elapsed * 0.12;
      globe.rotation.x = Math.sin(elapsed * 0.05) * 0.1;

      // Rotate Satellite along its orbital path
      const angle = elapsed * 0.8;
      const radius = 15.1;
      
      // Orbit math mapped to the ring rotation
      const localX = radius * Math.cos(angle);
      const localY = radius * Math.sin(angle) * Math.cos(Math.PI / 3);
      const localZ = -radius * Math.sin(angle) * Math.sin(Math.PI / 3);

      satellite.position.set(localX, localY, localZ);

      // Pulse the telemetry point in opacity
      pulseMat.opacity = 0.4 + 0.6 * Math.sin(elapsed * 8.0);
      const scale = 1.0 + 0.3 * Math.sin(elapsed * 8.0);
      pulse.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  // Telemetry Audit PDF Download
  const triggerPdfDownload = async () => {
    console.log('[TELEMETRY] downloadExecutiveBrief triggered from LandingPage', {
      timestamp: new Date().toISOString(),
      pulseRiskState: { riskScore, currentTemp, currentAQI }
    });

    if (pdfStatus === 'generating') return;
    setPdfStatus('generating');
    setPdfError(null);

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
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 70) return 'Critical';
    if (score >= 55) return 'High';
    if (score >= 45) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="page-root" style={{ background: 'var(--bg)', fontFamily: "'Inter', sans-serif", color: 'var(--text)', overflow: 'hidden' }}>
      <Navbar />
      
      <main className="main-content-with-topbar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px 20px', gap: '14px', boxSizing: 'border-box' }}>
        
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
              Active Area: <strong style={{ color: 'var(--text)' }}>Hyderabad Pilot Sector</strong>
            </span>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="home-hero-grid" style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '14px', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          
          {/* LEFT COLUMN: Climate Simulation Theater (Workflow & Terminal) */}
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
                    🚀 Climate Simulation Theater
                  </span>
                  <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, marginTop: '6px', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                    BHARAT-TWIN
                  </h1>
                  <p style={{ fontSize: '13.5px', color: 'var(--primary)', fontWeight: 600, lineHeight: 1.4, maxWidth: '95%' }}>
                    BHARAT-TWIN predicts climate threats before they become disasters and shows decision-makers exactly what action reduces risk.
                  </p>
                </div>
              </div>

              {/* Continuously Animated Workflow Blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '2px' }}>
                {[
                  { step: 0, num: '01', title: 'OBSERVE', desc: 'Telemetry Ingest', color: '#1E8E3E', details: 'INSAT-3D & IMD gridding' },
                  { step: 1, num: '02', title: 'SIMULATE', desc: 'Stress Cockpit', color: '#008CFF', details: 'Parameters override' },
                  { step: 2, num: '03', title: 'PREDICT', desc: 'XGBoost Forecasting', color: '#B78103', details: 'Temporal risk maps' },
                  { step: 3, num: '04', title: 'ACT', desc: 'NDMA Action Briefs', color: '#D50000', details: 'McKinsey PDF & AI synthesis' }
                ].map(phase => {
                  const isActive = pulseStep === phase.step;
                  
                  return (
                    <div key={phase.step} style={{
                      background: isActive ? 'var(--surface)' : 'rgba(255,255,255,0.4)',
                      border: isActive ? `2px solid ${phase.color}` : '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '82px',
                      boxShadow: isActive ? `0 4px 12px rgba(0,0,0,0.05)` : 'none',
                      opacity: isActive ? 1 : 0.65,
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.40s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {isActive && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
                          background: phase.color
                        }} />
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: isActive ? phase.color : 'var(--muted)', fontFamily: 'monospace' }}>
                          {phase.num}
                        </span>
                        {isActive && (
                          <span className="status-live" style={{
                            width: '5px', height: '5px', borderRadius: '50%', background: phase.color
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

              {/* Navigation CTAs */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                <Link href="/scenario-sandbox" style={{ 
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', 
                  padding: '9px 14px', background: 'var(--primary)', color: '#FFFFFF', borderRadius: '6px', 
                  fontWeight: 700, fontSize: '11px', textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(11, 61, 145, 0.18)', transition: 'background 0.2s'
                }}>
                  <Play size={11} fill="white" /> Enter Sandbox Cockpit
                </Link>
                
                <Link href="/judge-mode" style={{ 
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', 
                  padding: '9px 14px', background: '#FFFFFF', color: 'var(--primary)', border: '1px solid var(--border)', 
                  borderRadius: '6px', fontWeight: 700, fontSize: '11px', textDecoration: 'none', transition: 'background 0.2s'
                }}>
                  <Sparkles size={11} /> Launch Cinematic Demo
                </Link>
              </div>

              {/* Terminal Console */}
              <div style={{ 
                background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px',
                padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px',
                fontFamily: 'monospace', color: '#38BDF8', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
                flex: 1, minHeight: '100px', maxHeight: '120px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px', color: '#64748B', fontSize: '8.5px', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={10} /> THEATER REAL-TIME PIPELINE STREAM
                  </span>
                  <span style={{ fontSize: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8', padding: '1px 5px', borderRadius: '2px' }}>
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

          {/* RIGHT COLUMN: Holographic Globe & Climate Impact Card */}
          <div className="home-globe-first" style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            
            {/* HOLOGRAPHIC GLOBE SATELLITE MONITOR */}
            <div className="premium-card" style={{
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: '180px 1fr',
              gap: '16px',
              alignItems: 'center'
            }}>
              {/* Three.js Globe Container */}
              <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <canvas ref={globeCanvasRef} style={{ width: '180px', height: '180px', cursor: 'grab' }} />
                <div style={{ position: 'absolute', bottom: '8px', fontSize: '8px', background: 'rgba(11,61,145,0.08)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  INSAT-3D ORBIT TRANSIT
                </div>
              </div>

              {/* Satellite parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Orbital Telemetry Lock
                  </span>
                  <strong style={{ fontSize: '15px', color: 'var(--primary)', display: 'block', marginTop: '2px' }}>
                    ISRO INSAT-3D Sounder Sweeps
                  </strong>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'var(--surface-alt)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block' }}>Orbit Altitude</span>
                    <strong style={{ fontSize: '11px', fontFamily: 'monospace' }}>35,786 km (GEO)</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block' }}>Sweeping Speed</span>
                    <strong style={{ fontSize: '11px', fontFamily: 'monospace' }}>3.07 km/s (Locked)</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block' }}>Sensor Bandwidth</span>
                    <strong style={{ fontSize: '11px', fontFamily: 'monospace' }}>10.8 µm LST (Pass)</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block' }}>Telemetry Sync</span>
                    <strong style={{ fontSize: '11px', color: 'var(--success)' }}>100% SECURE</strong>
                  </div>
                </div>
                
                <span style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.3 }}>
                  Concurrently ingesting spaceborne infrared radiometer telemetry grids to map microclimatic concrete absorption points.
                </span>
              </div>
            </div>

            {/* THREE-QUESTION DECISION SUPPORT HUD & IMPACT CARD */}
            <div className="premium-card" style={{
              borderLeft: '5px solid var(--primary)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              
              {/* Impact Card Grid (Requirement 5) */}
              <div>
                <span style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                  Regional Climate Impact Card
                </span>
                <div className="impact-cards-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div style={{ background: 'rgba(11,61,145,0.02)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px' }}>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Citizens Exposed</span>
                    <strong style={{ fontSize: '16px', color: 'var(--primary)', fontFamily: 'monospace', display: 'block', marginTop: '2px' }}>482,000+</strong>
                    <span style={{ fontSize: '8px', color: 'var(--critical)', fontWeight: 700 }}>Urban Core</span>
                  </div>
                  <div style={{ background: 'rgba(11,61,145,0.02)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px' }}>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Water Stress</span>
                    <strong style={{ fontSize: '16px', color: 'var(--primary)', fontFamily: 'monospace', display: 'block', marginTop: '2px' }}>+35.2%</strong>
                    <span style={{ fontSize: '8px', color: 'var(--risk-high)', fontWeight: 700 }}>Moisture Deficit</span>
                  </div>
                  <div style={{ background: 'rgba(11,61,145,0.02)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px' }}>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Health Impact</span>
                    <strong style={{ fontSize: '16px', color: '#FF1744', fontFamily: 'monospace', display: 'block', marginTop: '2px' }}>CRITICAL</strong>
                    <span style={{ fontSize: '8px', color: '#FF1744', fontWeight: 700 }}>Thermal Loading</span>
                  </div>
                  <div style={{ background: 'rgba(11,61,145,0.02)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px' }}>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>NDMA Action</span>
                    <strong style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, display: 'block', marginTop: '4px', lineHeight: 1.1 }}>DEPLOY COOLING</strong>
                    <span style={{ fontSize: '8px', color: 'var(--success)', fontWeight: 700 }}>Pre-approved</span>
                  </div>
                </div>
              </div>

              {/* Three-Question HUD (Requirement 6) */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={14} color="var(--primary)" />
                  <strong style={{ fontSize: '10.5px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Decision Intelligence HUD
                  </strong>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', lineHeight: 1.4 }}>
                  <div>
                    <strong>WHAT IS HAPPENING?</strong>
                    <span style={{ color: 'var(--text)', marginLeft: '6px' }}>
                      Mesoscale temperature anomalies are pacing at +4.0°C under severe urban heatwave pressures.
                    </span>
                  </div>
                  <div>
                    <strong>WHY DOES IT MATTER?</strong>
                    <span style={{ color: 'var(--text)', marginLeft: '6px' }}>
                      Aggregate risk has climbed to 71% (Critical). High concrete UHI thermal absorption exposes 482,000+ citizens and spikes water drawdowns.
                    </span>
                  </div>
                  <div>
                    <strong>WHAT SHOULD I DO?</strong>
                    <span style={{ color: 'var(--primary)', fontWeight: 750, marginLeft: '6px' }}>
                      1. Activate urban cooling networks. 2. Ration municipal reservoir drawdowns. 3. Enforce power grid balancing load offsets.
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* National Climate Readiness Timeline Card */}
            <div className="premium-card" style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <GlobeIcon size={14} color="var(--primary)" />
                <strong style={{ fontSize: '11px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  National Climate Readiness Timeline
                </strong>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid rgba(11,61,145,0.12)' }}>
                {[
                  { year: '2026', title: 'Urban Heatwave Planning', desc: 'Deploying mesoscale micro-climate sensors and cooling coordinates across pilot zones.' },
                  { year: '2027', title: 'Multi-District Risk Intelligence', desc: 'Scaling spatial cell resolution overlays to Telangana districts using INSAT-3D correction feeds.' },
                  { year: '2028', title: 'National Climate Operating System', desc: 'Deploying unified API-driven emergency command interfaces for State Disaster Management Authorities.' },
                  { year: '2030', title: 'Digital Climate Twin of India', desc: 'Integrating a country-scale country-mesh 3D simulation twin with sub-kilometer forecasting envelopes.' }
                ].map((item, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    {/* Circle badge */}
                    <div style={{
                      position: 'absolute', left: '-23px', top: '2px', width: '10px', height: '10px',
                      borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--primary)',
                      boxShadow: '0 0 0 3px rgba(11,61,145,0.06)'
                    }} />
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>{item.year}</span>
                      <strong style={{ fontSize: '11px', color: 'var(--text)' }}>{item.title}</strong>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--muted)', margin: '1px 0 0 0', lineHeight: 1.3 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
        
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
            © 2026 BHARAT-TWIN Operations Room · Designed for the <strong>Bharatiya Antariksh Hackathon Grand Finale</strong>
          </div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>Confidence Index: <strong>91.4% (PASS)</strong></span>
            <span>Framework: <strong>NDMA V2.0</strong></span>
            <span>AI Model Engine: <strong>Gemini Pro 1.5 API</strong></span>
          </div>
        </footer>

      </main>
    </div>
  );
}
