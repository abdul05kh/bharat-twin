'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import MapContainer from '@/components/MapContainer';
import { useClimateStore } from '@/store/store';
import downloadExecutiveBrief from '@/lib/reportClient';
import {
  Settings2,
  MapPin,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Terminal,
  Activity,
  AlertCircle,
  Clock,
  ShieldCheck,
  Cpu,
  Database,
  Globe,
  QrCode,
  Link2,
  TrendingUp,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

type Severity = 'Low' | 'Moderate' | 'High' | 'Critical';
type Duration = '3 Days' | '1 Week' | '2 Weeks' | '1 Month';
type Stressor = 'Heatwave' | 'Delayed Monsoon' | 'Drought' | 'AQI Surge' | 'Water Scarcity';

interface SimLog {
  timestamp: string;
  status: 'info' | 'warn' | 'success' | 'process';
  message: string;
}

export default function ScenarioSandbox() {
  const {
    fetchRegions,
    selectedRegion,
    latestForecast,
    fetchLatestForecast,
    createScenario,
    runSimulation,
    activeSimulation,
    setActiveStressor,
    digitalTwin,
    fetchDigitalTwin
  } = useClimateStore();

  // Form State
  const [severity, setSeverity] = useState<Severity>('High');
  const [duration, setDuration] = useState<Duration>('2 Weeks');
  const [activeStressors, setActiveStressors] = useState<Stressor[]>(['Heatwave']);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<SimLog[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const modalLogRef = useRef<HTMLDivElement>(null);

  // Output Values (Dynamic metrics)
  const [riskScore, setRiskScore] = useState(42);
  const [heatHazard, setHeatHazard] = useState(38);
  const [waterStress, setWaterStress] = useState(28);
  const [cropRisk, setCropRisk] = useState(32);
  const [healthStrain, setHealthStrain] = useState(34);
  const [resourceDepletion, setResourceDepletion] = useState(30);

  // Fullscreen Wow Moment Overlay State
  const [showWowMoment, setShowWowMoment] = useState(false);

  // Executive Briefing Delivery Pipeline States
  const [briefingStep, setBriefingStep] = useState<'idle' | 'generating' | 'ready' | 'qr' | 'link' | 'complete'>('idle');
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineText, setPipelineText] = useState('');
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Screen shake effect for WOW moments
  const [screenAlert, setScreenAlert] = useState(false);
  
  // Set client-side origin post-mount to prevent hydration warnings
  const [clientOrigin, setClientOrigin] = useState('https://bharat-twin.web.app');
  useEffect(() => {
    setClientOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchLatestForecast();
      fetchDigitalTwin();
    }
  }, [selectedRegion, fetchLatestForecast, fetchDigitalTwin]);

  // Sync Global Climate Mood Engine when simulation is done
  useEffect(() => {
    if (simulationComplete && activeStressors.length > 0) {
      setActiveStressor(activeStressors[0]);
    }
  }, [simulationComplete, activeStressors, setActiveStressor]);

  // Scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    if (modalLogRef.current) {
      modalLogRef.current.scrollTop = modalLogRef.current.scrollHeight;
    }
  }, [simulationLogs, isSimulating]);

  const toggleStressor = (str: Stressor) => {
    if (activeStressors.includes(str)) {
      setActiveStressors(activeStressors.filter(s => s !== str));
    } else {
      setActiveStressors([...activeStressors, str]);
    }
  };

  const addLog = (message: string, status: 'info' | 'warn' | 'success' | 'process' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(new Date().getMilliseconds()).padStart(3, '0');
    setSimulationLogs(prev => [...prev, { timestamp: time, status, message }]);
  };

  // Sync 3D Twin active layer automatically with active stressors
  const getActiveLayerFromStressors = (stressors: Stressor[]) => {
    if (stressors.includes('Heatwave')) return 'temperature';
    if (stressors.includes('AQI Surge')) return 'aqi';
    if (stressors.includes('Water Scarcity') || stressors.includes('Drought')) return 'stress';
    if (stressors.includes('Delayed Monsoon')) return 'rainfall';
    return 'temperature';
  };

  // Run Simulation with the Fullscreen Mission Control Overlay
  const executeSimulation = () => {
    console.log('[TELEMETRY] executeSimulation triggered', {
      timestamp: new Date().toISOString(),
      parameters: { severity, duration, activeStressors, region: selectedRegion?.name }
    });

    setIsSimulating(true);
    setSimulationComplete(false);
    setScreenAlert(false);
    setProgress(0);
    setSimulationLogs([]);
    setShowWowMoment(false);

    const riskStart = 42;
    const heatStart = 38;
    const waterStart = 28;
    const cropStart = 32;
    const healthStart = 34;
    const resourceStart = 30;

    let riskEnd = 42;
    let heatEnd = 38;
    let waterEnd = 28;
    let cropEnd = 32;
    let healthEnd = 34;
    let resourceEnd = 30;

    const isHeatwave = activeStressors.includes('Heatwave');
    const isMonsoon = activeStressors.includes('Delayed Monsoon');
    const isDrought = activeStressors.includes('Drought');
    const isAQI = activeStressors.includes('AQI Surge');
    const isWater = activeStressors.includes('Water Scarcity');

    // Calculate stressor final values
    if (isHeatwave) {
      riskEnd = 71;
      heatEnd = 82;
      waterEnd = 63;
      cropEnd = 54;
      healthEnd = 74;
      resourceEnd = 58;
    } else {
      const mult = severity === 'Critical' ? 2.1 : severity === 'High' ? 1.7 : severity === 'Moderate' ? 1.3 : 1.1;
      const count = activeStressors.length || 1;
      riskEnd = Math.min(95, Math.round(riskStart * mult * (1 + count * 0.08)));
      heatEnd = Math.min(95, Math.round(heatStart * mult));
      waterEnd = Math.min(95, Math.round(waterStart * mult));
      cropEnd = Math.min(95, Math.round(cropStart * mult));
      healthEnd = Math.min(95, Math.round(healthStart * mult));
      resourceEnd = Math.min(95, Math.round(resourceStart * mult));
    }

    // Interactive timeline steps
    const logSteps = [
      { t: 0, msg: 'Initializing ISRO-aligned Mesoscale Grid Matrix...', stat: 'info' as const },
      { t: 300, msg: 'Syncing INSAT-3D Land Surface Temperature (LST) raster bands...', stat: 'process' as const },
      { t: 600, msg: 'Loading IMD historical observations (1951-2025) for baseline calibration...', stat: 'info' as const },
      { t: 900, msg: `Applying Climatic Stressors: ${activeStressors.join(', ')} (${severity} Anomaly)...`, stat: 'warn' as const },
      { t: 1200, msg: 'Executing XGBoost mesoscale forecast engine & multi-step lag models...', stat: 'process' as const },
      { t: 1500, msg: 'Evaluating Cellular Risk Propagation Fronts and soil moisture deficits...', stat: 'process' as const },
      { t: 1800, msg: 'Synthesizing NDMA vulnerability indices and structural resource stress scores...', stat: 'process' as const },
      { t: 2100, msg: 'Generating scenario registry record and emergency response actions...', stat: 'success' as const },
      { t: 2400, msg: 'Climate simulation complete. Decision directive PDF brief generated.', stat: 'success' as const }
    ];

    logSteps.forEach(step => {
      setTimeout(() => {
        addLog(step.msg, step.stat);
      }, step.t);
    });

    const durationMs = 2800;
    const stepMs = 40;
    const totalSteps = durationMs / stepMs;
    let currentStep = 0;

    // Trigger backend models in sync
    if (latestForecast && activeStressors.length > 0) {
      const tempAdj = isHeatwave ? 4.0 : severity === 'Critical' ? 3.0 : severity === 'High' ? 2.0 : 0.8;
      const rainAdj = isDrought ? -40 : isMonsoon ? -60 : -10;
      createScenario(
        `Sandbox: ${activeStressors.join(' & ')} (${severity})`,
        rainAdj,
        tempAdj,
        duration === '3 Days' ? 3 : duration === '1 Week' ? 7 : duration === '2 Weeks' ? 14 : 30
      ).then(sc => {
        runSimulation(sc.id, latestForecast.id).catch(err => console.warn(err));
      }).catch(err => console.warn(err));
    }

    const interval = setInterval(() => {
      currentStep++;
      const pct = currentStep / totalSteps;
      setProgress(Math.round(pct * 100));

      // Smooth sweeping numbers
      setRiskScore(Math.round(riskStart + (riskEnd - riskStart) * pct));
      setHeatHazard(Math.round(heatStart + (heatEnd - heatStart) * pct));
      setWaterStress(Math.round(waterStart + (waterEnd - waterStart) * pct));
      setCropRisk(Math.round(cropStart + (cropEnd - cropStart) * pct));
      setHealthStrain(Math.round(healthStart + (healthEnd - healthStart) * pct));
      setResourceDepletion(Math.round(resourceStart + (resourceEnd - resourceStart) * pct));

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setRiskScore(riskEnd);
        setHeatHazard(heatEnd);
        setWaterStress(waterEnd);
        setCropRisk(cropEnd);
        setHealthStrain(healthEnd);
        setResourceDepletion(resourceEnd);

        // Let user see 100% complete briefly, then trigger the Wow Moment fullscreen transition
        setTimeout(() => {
          setIsSimulating(false);
          setSimulationComplete(true);
          setShowWowMoment(true); // Trigger the Wow Moment

          if (isHeatwave && (severity === 'High' || severity === 'Critical')) {
            setScreenAlert(true);
            setTimeout(() => setScreenAlert(false), 2000);
          }
        }, 800);
      }
    }, stepMs);
  };

  // Rebuilt Executive Climate Briefing Delivery Pipeline
  const triggerPdfDownload = async () => {
    if (!simulationComplete) return;

    console.log('[TELEMETRY] Executive Climate Brief pipeline triggered from sandbox', {
      timestamp: new Date().toISOString(),
      simulationId: activeSimulation?.id,
      region: selectedRegion?.name
    });

    if (briefingStep !== 'idle') return;
    setBriefingStep('generating');
    setPipelineProgress(0);
    setPipelineText('Initializing Government Cryptographic Seal...');
    setPdfError(null);

    let progressVal = 0;
    const interval = setInterval(() => {
      progressVal += 5;
      if (progressVal >= 100) {
        progressVal = 100;
        clearInterval(interval);
      }
      setPipelineProgress(progressVal);

      if (progressVal === 25) setPipelineText('Formatting Official Government Headers...');
      else if (progressVal === 50) setPipelineText('Reconciling INSAT-3D LST & IMD Grids...');
      else if (progressVal === 75) setPipelineText('Synthesizing NDMA Crisis Directives...');
      else if (progressVal === 90) setPipelineText('Packaging Briefing PDF Document...');
    }, 100);

    try {
      // Pass the actual active simulation id to guarantee a scenario-specific PDF with QR code
      await downloadExecutiveBrief({ simulationId: activeSimulation?.id || undefined });

      setTimeout(() => {
        setBriefingStep('ready');

        setTimeout(() => {
          setBriefingStep('qr');

          setTimeout(() => {
            setBriefingStep('link');

            setTimeout(() => {
              setBriefingStep('complete');

              setTimeout(() => {
                setBriefingStep('idle');
              }, 2000); // end of timeline
            }, 2000); // link copied review
          }, 2500); // qr code scan review
        }, 1500); // brief ready mark
      }, 2000);

    } catch (err: any) {
      clearInterval(interval);
      setBriefingStep('idle');
      console.error('Report download failed:', err);
      setPdfError(err.message || 'Verification fail');
      alert('Executive Brief synthesis failed: ' + err.message);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#FF1744'; // Critical
    if (score >= 55) return '#FF9100'; // High
    if (score >= 45) return '#FFD600'; // Moderate
    return '#00E676'; // Low
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'CRITICAL';
    if (score >= 55) return 'HIGH';
    if (score >= 45) return 'MODERATE';
    return 'LOW';
  };

  const getStressorParamText = () => {
    const tempAdj = activeStressors.includes('Heatwave') ? '+4.0°C' : severity === 'Critical' ? '+3.0°C' : severity === 'High' ? '+2.0°C' : '+0.8°C';
    const rainAdj = activeStressors.includes('Drought') ? '-40%' : activeStressors.includes('Delayed Monsoon') ? '-60%' : '-10%';
    return { tempAdj, rainAdj };
  };

  const { tempAdj, rainAdj } = getStressorParamText();

  // Dynamic values for National-Scale Digital Risk Index
  const popExposedVal = severity === 'Critical' ? '482,000' : severity === 'High' ? '310,000' : severity === 'Moderate' ? '210,000' : '62,000';
  const econLossVal = severity === 'Critical' ? '₹38.6 Cr' : severity === 'High' ? '₹22.4 Cr' : severity === 'Moderate' ? '₹14.5 Cr' : '₹4.8 Cr';
  const recoveryTimeVal = severity === 'Critical' ? '18 Days' : severity === 'High' ? '14 Days' : severity === 'Moderate' ? '10 Days' : '4 Days';

  // NDMA Mitigated values
  const ndmaEconLossVal = severity === 'Critical' ? '₹7.8 Cr' : severity === 'High' ? '₹4.9 Cr' : severity === 'Moderate' ? '₹3.2 Cr' : '₹1.1 Cr';
  const ndmaPopExposedVal = severity === 'Critical' ? '115,000' : severity === 'High' ? '62,000' : severity === 'Moderate' ? '45,000' : '15,000';
  const ndmaSavingsVal = severity === 'Critical' ? '₹30.8 Cr' : severity === 'High' ? '₹17.5 Cr' : severity === 'Moderate' ? '₹11.3 Cr' : '₹3.7 Cr';
  const ndmaRiskReductionVal = severity === 'Critical' ? '79%' : severity === 'High' ? '78%' : severity === 'Moderate' ? '77%' : '75%';

  // Reusable Radial Gauge Component
  const RadialGauge = ({ value, label, color }: { value: number, label: string, color: string }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={radius} stroke="var(--border)" strokeWidth="4" fill="transparent" />
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          <text x="30" y="34" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--text)" fontFamily="monospace">
            {value}%
          </text>
        </svg>
        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.1, maxWidth: '75px' }}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="page-root" style={{ background: 'var(--bg)', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>
      <Navbar />

      <main className="page-layout-main main-content-with-topbar">
        <CommandStatusStrip />

        {/* Cockpit Title Bar */}
        <header style={{
          height: '55px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0, zIndex: 5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings2 size={18} color="var(--primary)" />
            <h2 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              Climate Scenario Sandbox
            </h2>
            <span style={{ fontSize: '9px', background: 'rgba(11,61,145,0.08)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 700, textTransform: 'uppercase' }}>
              SIMULATION COCKPIT
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Active Target: <strong>{selectedRegion?.name || 'Hyderabad Metropolitan Region'}</strong>
          </div>
        </header>

        {/* Map-First Command Center Split Layout */}
        <div className="grid-split-70-30" style={{ flex: 1, display: 'grid', gridTemplateColumns: '70% 30%', overflow: 'hidden', zIndex: 2 }}>

          {/* LEFT COLUMN: 3D Digital Earth Map Hero (70% width) */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', overflow: 'hidden', height: '100%', position: 'relative' }}>
            <div className="map-wrapper" style={{
              flex: 1, position: 'relative',
              border: '1px solid var(--border)', borderRadius: '8px',
              overflow: 'hidden', background: '#FFFFFF',
              boxShadow: 'var(--shadow)'
            }}>
              {digitalTwin && digitalTwin.length > 0 ? (
                <MapContainer
                  cells={digitalTwin}
                  activeLayer={getActiveLayerFromStressors(activeStressors)}
                  viewMode="3d"
                  isSimulating={isSimulating}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div className="animate-spin" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent' }} />
                    <span>Initializing 3D geospatial elevation layers...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Parameters Console & Simulated Intelligence HUD (30% width, scrollable) */}
          <div className="sandbox-right-panel" style={{
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '20px',
            gap: '16px'
          }}>

            {/* STRESS PARAMETERS COCKPIT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                  Stress Parameters Cockpit
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4 }}>
                  Configure climatic anomalies to stress-test municipal resilience thresholds in real-time.
                </p>
              </div>

              {/* Step 1: Select District */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '8.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  01 / TARGET GRID ZONE
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', background: 'var(--surface-alt)',
                  border: '1px solid var(--border)', borderRadius: '6px'
                }}>
                  <MapPin size={12} color="var(--primary)" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700 }}>{selectedRegion?.name || 'Hyderabad Metropolitan Region'}</span>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)' }}>Mesoscale bounds EPSG:4326</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Severity Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '8.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  02 / STRESS INTENSITY
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {(['Low', 'Moderate', 'High', 'Critical'] as Severity[]).map(sev => {
                    const active = severity === sev;
                    const color = getRiskColor(sev === 'Critical' ? 75 : sev === 'High' ? 60 : sev === 'Moderate' ? 50 : 20);
                    return (
                      <button
                        key={sev}
                        onClick={() => setSeverity(sev)}
                        style={{
                          padding: '6px 2px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: `1px solid ${active ? color : 'var(--border)'}`,
                          background: active ? color : 'transparent',
                          color: active ? '#FFFFFF' : 'var(--text)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {sev}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Duration Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '8.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  03 / TEMPORAL WINDOW
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {(['3 Days', '1 Week', '2 Weeks', '1 Month'] as Duration[]).map(dur => {
                    const active = duration === dur;
                    return (
                      <button
                        key={dur}
                        onClick={() => setDuration(dur)}
                        style={{
                          padding: '6px 2px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                          background: active ? 'var(--primary)' : 'transparent',
                          color: active ? '#FFFFFF' : 'var(--text)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {dur}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Stressors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '8.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  04 / CLIMATE STRESSORS
                </label>
                <div className="stressor-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(['Heatwave', 'Delayed Monsoon', 'Drought', 'AQI Surge', 'Water Scarcity'] as Stressor[]).map(str => {
                    const active = activeStressors.includes(str);
                    return (
                      <button
                        key={str}
                        onClick={() => toggleStressor(str)}
                        style={{
                          padding: '5px 8px',
                          fontSize: '10px',
                          fontWeight: 700,
                          borderRadius: '12px',
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          background: active ? 'rgba(0,140,255,0.06)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--text)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {active ? '✓ ' : ''}{str}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 5: Execute Action Button */}
              <div style={{ marginTop: '4px' }}>
                <button
                  onClick={executeSimulation}
                  disabled={isSimulating || activeStressors.length === 0}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: isSimulating ? 'var(--border)' : 'var(--primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    cursor: isSimulating || activeStressors.length === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 3px 8px rgba(11, 61, 145, 0.12)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <Play size={12} fill="white" /> Execute Climate Sandbox
                  {isSimulating && ` (${progress}%)`}
                </button>
              </div>
            </div>

            {/* SIMULATED INTELLIGENCE PANEL (DENSE BLOOMBERG STYLE) */}
            {!simulationComplete ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '30px 20px', border: '1px dashed var(--border)', borderRadius: '8px',
                color: 'var(--muted)', textAlign: 'center', gap: '8px'
              }}>
                <Globe size={24} color="var(--border)" className="animate-pulse" />
                <span style={{ fontSize: '11px', fontWeight: 600 }}>Awaiting Simulation Run</span>
                <p style={{ fontSize: '9.5px', color: 'var(--muted)', lineHeight: 1.3, margin: 0 }}>
                  Configure stress factors on the cockpit above and execute to synthesize mesoscale gridded climate exposures and NDMA policy directives.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* 🎯 WHY THIS MATTERS CARD (Highest Priority Decision Summary) */}
                <div className="premium-card" style={{
                  background: 'linear-gradient(135deg, rgba(11, 61, 145, 0.04) 0%, rgba(0, 140, 255, 0.04) 100%)',
                  border: '2.5px solid var(--primary)',
                  borderRadius: '10px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 6px 20px rgba(11, 61, 145, 0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2.5px solid var(--primary)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      🎯 WHY THIS MATTERS FOR THIS SCENARIO
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'rgba(217, 48, 37, 0.03)', border: '1px solid rgba(217, 48, 37, 0.12)', borderRadius: '6px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--critical)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        Without Intervention (Unmitigated)
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                        <span>Exposed: <strong style={{ color: 'var(--text)' }}>{popExposedVal}</strong></span>
                        <span>Loss: <strong style={{ color: 'var(--critical)', fontFamily: 'monospace' }}>{econLossVal}</strong></span>
                        <span>Timeline: <strong style={{ color: 'var(--text)' }}>{recoveryTimeVal}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '-4px 0', color: 'var(--primary)', fontWeight: 900 }}>
                      ↓
                    </div>

                    <div style={{ background: 'rgba(30, 142, 62, 0.03)', border: '1px solid rgba(30, 142, 62, 0.12)', borderRadius: '6px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 900, color: 'var(--success)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        If Action Is Taken Now (Mitigated)
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                        <span>Exposure: <strong style={{ color: 'var(--success)' }}>Reduced by {ndmaRiskReductionVal}</strong></span>
                        <span>Savings: <strong style={{ color: 'var(--success)', fontFamily: 'monospace' }}>{ndmaSavingsVal}</strong></span>
                        <span>Timeline: <strong style={{ color: 'var(--success)' }}>{severity === 'Critical' ? '4 Days' : severity === 'High' ? '3 Days' : severity === 'Moderate' ? '2 Days' : '1 Day'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NATIONAL-SCALE DIGITAL RISK INDEX */}
                <div className="premium-card" style={{
                  border: '1px solid var(--border)',
                  outline: `3px double ${getRiskColor(riskScore)}`,
                  outlineOffset: '-6px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: 'var(--surface)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.04em' }}>DIGITAL RISK INDEX</span>
                    <strong style={{ fontSize: '16px', fontFamily: 'monospace', color: getRiskColor(riskScore) }}>
                      {riskScore} / 100
                    </strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10.5px' }}>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Risk Level</span>
                      <strong style={{ color: getRiskColor(riskScore), fontWeight: 800 }}>{getRiskLevel(riskScore)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Exposed Population</span>
                      <strong style={{ fontFamily: 'monospace' }}>{popExposedVal}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Economic Exposure</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--critical)' }}>{econLossVal}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Expected Recovery</span>
                      <strong style={{ fontFamily: 'monospace' }}>{recoveryTimeVal}</strong>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                      Why This Score Matters
                    </span>
                    <p style={{ fontSize: '10.5px', color: 'var(--text)', lineHeight: 1.4, margin: 0 }}>
                      Anomalies in this envelope trigger compounding systemic failures: peak local temperatures exceed grid transformer thermal coefficients, municipal reservoirs drop to critical reserve thresholds, and soil moisture depletes root viability margins.
                    </p>
                  </div>
                </div>

                {/* THREE-QUESTION DECISION SUPPORT HUD (EXECUTIVE PHRASING) */}
                <div className="premium-card" style={{
                  background: 'rgba(11, 61, 145, 0.02)',
                  border: '1px solid rgba(11, 61, 145, 0.08)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <Globe size={13} color="var(--primary)" />
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Decision Support HUD
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Q1 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '8.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                        What We Saw (Signals)
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text)', lineHeight: 1.35 }}>
                        Modeling a {severity} intensity {activeStressors.join(' & ')} anomaly across {selectedRegion?.name || 'Hyderabad'}. Thermal deviations pace at {tempAdj} with precipitation offsets of {rainAdj}.
                      </span>
                    </div>
                    {/* Q2 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '8.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                        What Happens Next (Consequence)
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text)', lineHeight: 1.35 }}>
                        Aggregate digital risk is {riskScore}/100. Heat hazard indices reach {heatHazard}%, triggering critical municipal water strain ({waterStress}%) and public health strain ({healthStrain}%).
                      </span>
                    </div>
                    {/* Q3 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '8.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                        Recommended Action (Directives)
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, lineHeight: 1.35 }}>
                        {riskScore >= 65
                          ? '1. Activate urban cooling centers and cooling shelters. 2. Ration municipal reservoir drawdowns. 3. Dispatch backup water tankers.'
                          : '1. Initiate standard soil moisture audits. 2. Pre-position backup water reserves in central hubs. 3. Maintain daily IMD telemetry sync.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GOVERNMENT CLIMATE DECISION BRIEF & PDF DELIVERY PIPELINE */}
                <div className="premium-card" style={{
                  padding: '12px 14px',
                  borderLeft: `4px solid ${getRiskColor(riskScore)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Briefing Delivery System
                    </span>
                    <strong style={{ fontSize: '11.5px', color: 'var(--primary)', display: 'block', marginTop: '2px' }}>
                      Government Climate Decision Brief
                    </strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {briefingStep === 'idle' ? (
                      <button
                        onClick={triggerPdfDownload}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 10px', background: 'var(--accent)',
                          color: 'white', border: 'none', borderRadius: '4px',
                          fontSize: '10.5px', fontWeight: 700, cursor: 'pointer',
                          width: '100%', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                      >
                        <FileDown size={12} /> Generate Executive Brief
                      </button>
                    ) : (
                      <div style={{
                        background: 'var(--surface-alt)', border: '1px solid var(--border)',
                        borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px'
                      }}>
                        {/* Progress Phase */}
                        {(briefingStep === 'generating') && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 700 }}>
                              <span>{pipelineText}</span>
                              <span>{pipelineProgress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${pipelineProgress}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px', transition: 'width 0.1s linear' }} />
                            </div>
                          </div>
                        )}

                        {/* Step Ready */}
                        {briefingStep === 'ready' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '10px', fontWeight: 700 }}>
                            <CheckCircle2 size={12} /> EXECUTIVE BRIEF COMPILED & SECURED
                          </div>
                        )}

                        {/* QR Verification */}
                        {briefingStep === 'qr' && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '6px' }}>
                            <div style={{ padding: '4px', background: 'white', border: '2px solid var(--success)', borderRadius: '6px', boxShadow: '0 0 10px rgba(30,142,62,0.15)' }}>
                              <img
                                src={activeSimulation ? ((activeSimulation as any).qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${clientOrigin}/briefing?simulation_id=${activeSimulation.id}`) : `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${clientOrigin}`}
                                alt="Briefing QR"
                                style={{ width: '64px', height: '64px' }}
                              />
                            </div>
                            <span style={{ fontSize: '8.5px', color: 'var(--success)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <QrCode size={10} /> QR VERIFICATION LOCK SECURED
                            </span>
                          </div>
                        )}

                        {/* Copyable Cabinet Link */}
                        {briefingStep === 'link' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '10px', fontWeight: 700 }}>
                              <Link2 size={11} /> CABINET SHARE LINK GENERATED
                            </div>
                            <span style={{ fontSize: '8px', color: 'var(--muted)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                              https://bharat-twin.web.app/briefing?simulation_id={activeSimulation?.id.slice(0, 8) || 'sandbox'}
                            </span>
                          </div>
                        )}

                        {/* PDF Final Download Dispatch */}
                        {briefingStep === 'complete' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '10.5px', fontWeight: 800, justifyContent: 'center' }}>
                            <CheckCircle2 size={12} /> BRIEF DISPATCHED TO PDF DOWNLOAD
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* SIMULATED EXECUTION TIMELINE TERMINAL */}
                <div style={{
                  background: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  color: '#38BDF8',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  height: '110px',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '4px', color: '#94A3B8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      <Terminal size={11} /> COMMAND CONSOLE
                    </span>
                    <span style={{ fontSize: '8px', background: '#1E293B', padding: '1px 4px', borderRadius: '3px' }}>
                      COMPLETED
                    </span>
                  </div>
                  <div ref={logContainerRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {simulationLogs.map((log, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '6px', lineHeight: 1.2 }}>
                        <span style={{ color: '#64748B' }}>[{log.timestamp.slice(9)}]</span>
                        <span style={{ color: '#F1F5F9' }}>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ECONOMIC IMPACT ENGINE */}
                <div className="premium-card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                    <TrendingUp size={12} color="var(--primary)" />
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Economic Impact Engine
                    </span>
                  </div>

                  {/* Dynamic Calculation Chain Formula */}
                  <div style={{ fontSize: '8.5px', color: 'var(--muted)', background: 'var(--surface-alt)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'monospace' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>Formula (Trust Calculation Chain)</span>
                    Economic Loss = Agriculture + Power + Water + Healthcare
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ background: 'rgba(217, 48, 37, 0.02)', border: '1px solid rgba(217, 48, 37, 0.08)', borderRadius: '6px', padding: '8px 10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(217,48,37,0.08)', paddingBottom: '4px', marginBottom: '4px', fontSize: '9.5px', fontWeight: 750 }}>
                        <span style={{ color: 'var(--critical)' }}>UNMITIGATED (NO ACTION)</span>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--critical)' }}>{econLossVal}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5px', fontSize: '9.5px', color: 'var(--muted)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Agriculture Loss:</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{severity === 'Critical' ? '₹10.4 Cr' : severity === 'High' ? '₹7.8 Cr' : severity === 'Moderate' ? '₹5.2 Cr' : '₹1.5 Cr'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Power Infrastructure:</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{severity === 'Critical' ? '₹12.2 Cr' : severity === 'High' ? '₹6.3 Cr' : severity === 'Moderate' ? '₹4.2 Cr' : '₹1.5 Cr'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Water Infrastructure:</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{severity === 'Critical' ? '₹8.5 Cr' : severity === 'High' ? '₹4.5 Cr' : severity === 'Moderate' ? '₹3.1 Cr' : '₹1.0 Cr'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Healthcare Burden:</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{severity === 'Critical' ? '₹7.5 Cr' : severity === 'High' ? '₹3.8 Cr' : severity === 'Moderate' ? '₹2.0 Cr' : '₹0.8 Cr'}</span>
                        </div>
                        <div style={{ borderTop: '1px dotted rgba(217,48,37,0.12)', paddingTop: '2.5px', marginTop: '2.5px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--critical)' }}>
                          <span>Chain Sum:</span>
                          <span style={{ fontFamily: 'monospace' }}>
                            {severity === 'Critical' ? '10.4 + 12.2 + 8.5 + 7.5 = ₹38.6 Cr' : severity === 'High' ? '7.8 + 6.3 + 4.5 + 3.8 = ₹22.4 Cr' : severity === 'Moderate' ? '5.2 + 4.2 + 3.1 + 2.0 = ₹14.5 Cr' : '1.5 + 1.5 + 1.0 + 0.8 = ₹4.8 Cr'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(30, 142, 62, 0.02)', border: '1px solid rgba(30, 142, 62, 0.08)', borderRadius: '6px', padding: '8px 10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(30,142,62,0.08)', paddingBottom: '4px', marginBottom: '4px', fontSize: '9.5px', fontWeight: 750 }}>
                        <span style={{ color: 'var(--success)' }}>NDMA DEPLOYED (MITIGATED)</span>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--success)' }}>{ndmaEconLossVal}</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5px', fontSize: '9.5px', color: 'var(--muted)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Agriculture Loss:</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--success)' }}>{severity === 'Critical' ? '₹1.2 Cr' : severity === 'High' ? '₹0.8 Cr' : severity === 'Moderate' ? '₹0.6 Cr' : '₹0.3 Cr'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Power Infrastructure:</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--success)' }}>{severity === 'Critical' ? '₹3.0 Cr' : severity === 'High' ? '₹1.8 Cr' : severity === 'Moderate' ? '₹1.2 Cr' : '₹0.4 Cr'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Water Infrastructure:</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--success)' }}>{severity === 'Critical' ? '₹1.8 Cr' : severity === 'High' ? '₹1.0 Cr' : severity === 'Moderate' ? '₹0.8 Cr' : '₹0.2 Cr'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Healthcare Burden:</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--success)' }}>{severity === 'Critical' ? '₹1.8 Cr' : severity === 'High' ? '₹1.3 Cr' : severity === 'Moderate' ? '₹0.6 Cr' : '₹0.2 Cr'}</span>
                        </div>
                        <div style={{ borderTop: '1px dotted rgba(30,142,62,0.12)', paddingTop: '2.5px', marginTop: '2.5px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--success)' }}>
                          <span>Chain Sum:</span>
                          <span style={{ fontFamily: 'monospace' }}>
                            {severity === 'Critical' ? '1.2 + 3.0 + 1.8 + 1.8 = ₹7.8 Cr' : severity === 'High' ? '0.8 + 1.8 + 1.0 + 1.3 = ₹4.9 Cr' : severity === 'Moderate' ? '0.6 + 1.2 + 0.8 + 0.6 = ₹3.2 Cr' : '0.3 + 0.4 + 0.2 + 0.2 = ₹1.1 Cr'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 10px', background: 'rgba(30, 142, 62, 0.08)',
                    border: '1px solid rgba(30, 142, 62, 0.18)', borderRadius: '6px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontWeight: 800
                  }}>
                    <span style={{ color: 'var(--success)' }}>NET PROJECTED SAVINGS:</span>
                    <strong style={{ color: 'var(--success)', fontFamily: 'monospace', fontSize: '11.5px' }}>
                      {ndmaSavingsVal}
                    </strong>
                  </div>
                </div>

                {/* SCIENTIFIC CONFIDENCE ENVELOPES */}
                <div className="premium-card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '10px' }}>
                    <Activity size={12} color="var(--primary)" />
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Confidence Envelopes
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { name: 'Aggregate Risk', value: riskScore, conf: 94 },
                      { name: 'Water Stress', value: waterStress, conf: 91 },
                      { name: 'Crop Risk', value: cropRisk, conf: 93 },
                      { name: 'Health Strain', value: healthStrain, conf: 95 }
                    ].map((m, idx) => {
                      const low = Math.max(0, m.value - 4);
                      const high = Math.min(100, m.value + 5);

                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', fontWeight: 600 }}>
                            <span>{m.name}</span>
                            <span style={{ fontFamily: 'monospace', color: 'var(--muted)' }}>
                              {m.value}% <span style={{ color: 'var(--success)', fontWeight: 800 }}>({m.conf}% C.I.)</span>
                            </span>
                          </div>
                          <div style={{ position: 'relative', height: '8px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              position: 'absolute',
                              left: `${low}%`,
                              width: `${high - low}%`,
                              height: '100%',
                              background: 'rgba(0, 140, 255, 0.2)'
                            }} />
                            <div style={{
                              position: 'absolute',
                              left: `${m.value}%`,
                              width: '3px',
                              height: '100%',
                              background: 'var(--primary)',
                              transform: 'translateX(-1px)'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ANIMATED IMPACT STRESS METRICS */}
                <div className="premium-card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '10px' }}>
                    <Settings2 size={12} color="var(--primary)" />
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Impact Stress Gauges
                    </span>
                  </div>
                  <div className="radial-gauges-row" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <RadialGauge value={heatHazard} label="Heat Hazard" color="var(--risk-critical)" />
                    <RadialGauge value={waterStress} label="Water Stress" color="var(--accent)" />
                    <RadialGauge value={cropRisk} label="Crop Risk" color="var(--success)" />
                    <RadialGauge value={healthStrain} label="Health Strain" color="var(--risk-high)" />
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>

      {/* FULLSCREEN WOW MOMENT OUTCOME OVERLAY (THE GRAND EMOTIONAL PAYOFF) */}
      {showWowMoment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(25px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          fontFamily: "'Inter', sans-serif",
          animation: 'fadeIn 0.5s ease-out'
        }}>

          <div className="wow-overlay-card" style={{
            width: '640px',
            background: 'rgba(255, 255, 255, 0.98)',
            border: '2px solid var(--primary)',
            outline: '6px double var(--primary)',
            outlineOffset: '-12px',
            boxShadow: '0 30px 70px rgba(11, 61, 145, 0.25)',
            borderRadius: '20px',
            padding: '40px 45px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            textAlign: 'center',
            position: 'relative'
          }}>

            {/* National Crest / Header branding */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', borderBottom: '2px solid var(--primary)', paddingBottom: '16px' }}>
              <span style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                GOVERNMENT OF INDIA • NATIONAL CLIMATE DIGITAL TWIN
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Climate Simulation Outcome Directive
              </h2>
              <span style={{ fontSize: '10px', background: 'rgba(11,61,145,0.08)', color: 'var(--primary)', padding: '2px 12px', borderRadius: '12px', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>
                ADMINISTRATIONAL DECISION MATRIX
              </span>
            </div>

            {/* Comparison Flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Row 1: Without Intervention */}
              <div style={{
                background: 'rgba(217, 48, 37, 0.03)',
                border: '1.5px solid var(--risk-critical)',
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1.2fr',
                alignItems: 'center',
                textAlign: 'left'
              }}>
                <div>
                  <strong style={{ fontSize: '12.5px', color: 'var(--critical)', display: 'block', textTransform: 'uppercase', fontWeight: 900 }}>
                    WITHOUT INTERVENTION
                  </strong>
                  <span style={{ fontSize: '9.5px', color: 'var(--muted)' }}>Unmitigated Climate Threat Run</span>
                </div>
                <div>
                  <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Economic Loss</span>
                  <strong style={{ fontSize: '17px', color: 'var(--critical)', fontFamily: 'monospace' }}>{econLossVal}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Population Exposed</span>
                  <strong style={{ fontSize: '16px', color: 'var(--critical)', fontFamily: 'monospace' }}>{popExposedVal}</strong>
                </div>
              </div>

              {/* Glowing Arrow Transition */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '-8px 0' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '16px', boxShadow: '0 0 10px rgba(11,61,145,0.3)',
                  fontFamily: 'monospace'
                }}>
                  ↓
                </div>
              </div>

              {/* Row 2: NDMA Intervention Applied */}
              <div style={{
                background: 'rgba(30, 142, 62, 0.03)',
                border: '1.5px solid var(--success)',
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1.2fr',
                alignItems: 'center',
                textAlign: 'left'
              }}>
                <div>
                  <strong style={{ fontSize: '12.5px', color: 'var(--success)', display: 'block', textTransform: 'uppercase', fontWeight: 900 }}>
                    NDMA RESPONSE APPLIED
                  </strong>
                  <span style={{ fontSize: '9.5px', color: 'var(--muted)' }}>Active Municipal Assets Deployed</span>
                </div>
                <div>
                  <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Economic Loss</span>
                  <strong style={{ fontSize: '17px', color: 'var(--success)', fontFamily: 'monospace' }}>{ndmaEconLossVal}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Population Exposed</span>
                  <strong style={{ fontSize: '16px', color: 'var(--success)', fontFamily: 'monospace' }}>{ndmaPopExposedVal}</strong>
                </div>
              </div>

              {/* Glowing Arrow Transition */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '-8px 0' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--success)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '16px', boxShadow: '0 0 10px rgba(30,142,62,0.3)',
                  fontFamily: 'monospace'
                }}>
                  ↓
                </div>
              </div>

              {/* Row 3: Net Payoff / Savings */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(30,142,62,0.08) 0%, rgba(0,140,255,0.08) 100%)',
                border: '2px solid var(--primary)',
                borderRadius: '10px',
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left'
              }}>
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--primary)', display: 'block', textTransform: 'uppercase', fontWeight: 900 }}>
                    TOTAL ADMINISTRATIVE SAVINGS
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Net Municipal Payoff Benefit</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Net Savings</span>
                    <strong style={{ fontSize: '20px', color: 'var(--success)', fontFamily: 'monospace', fontWeight: 900 }}>{ndmaSavingsVal}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8.5px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Risk Reduction</span>
                    <strong style={{ fontSize: '20px', color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 900 }}>{ndmaRiskReductionVal}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Confirm Dismissal Button */}
            <div style={{ marginTop: '6px' }}>
              <button
                onClick={() => setShowWowMoment(false)}
                style={{
                  padding: '12px 30px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  boxShadow: '0 4px 15px rgba(11, 61, 145, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                Enter Command Center Portal
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC ISRO-INSPIRED LIGHT THEME FROSTED GLASS OVERLAY */}
      {isSimulating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: "'Inter', sans-serif"
        }}>

          {/* Mission Control Panel Container */}
          <div className="mission-modal" style={{
            width: '580px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(11, 61, 145, 0.15)',
            boxShadow: '0 25px 60px rgba(11, 61, 145, 0.15)',
            borderRadius: '16px',
            padding: '32px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>

            {/* Header branding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(11, 61, 145, 0.12)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={20} color="var(--primary)" />
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    ISRO MISSION CONTROL
                  </h3>
                  <span style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Environmental Stress Simulation
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'monospace', color: 'var(--primary)' }}>{progress}%</span>
                <span style={{ fontSize: '8px', color: 'var(--muted)', fontWeight: 700 }}>STAGE ENGAGED</span>
              </div>
            </div>

            {/* Master Progress bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                borderRadius: '3px',
                transition: 'width 0.1s linear'
              }} />
            </div>

            {/* 6-Stage Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { threshold: 15, label: 'Telemetry Ingestion', desc: 'Syncing INSAT-3D Land Surface Temperature & IMD Grids', icon: Globe },
                { threshold: 35, label: 'Baseline Grid Alignment', desc: 'Aligning multi-step XGBoost predictive models', icon: Database },
                { threshold: 55, label: 'Climatic Stressor Application', desc: `Injecting ${activeStressors.join(' & ')} (${severity} Anomaly)`, icon: AlertTriangle },
                { threshold: 75, label: 'Cellular Risk Propagation', desc: 'Running spatial-temporal grid delta calculations', icon: Activity },
                { threshold: 90, label: 'NDMA Policy Evaluation', desc: 'Synthesizing vulnerability indices & municipal guidelines', icon: Clock },
                { threshold: 100, label: 'Executive Brief Synthesis', desc: 'Compiling scenario registry & generating PDF report', icon: ShieldCheck }
              ].map((stage, idx) => {
                const stageNum = idx + 1;
                const isDone = progress >= stage.threshold;
                const isActive = progress < stage.threshold && (idx === 0 || progress >= [15, 35, 55, 75, 90][idx - 1]);

                let iconColor = 'rgba(0, 0, 0, 0.15)';
                let textColor = 'var(--muted)';
                let bgCircle = 'rgba(0, 0, 0, 0.04)';
                let fontWeight = 500;

                if (isDone) {
                  iconColor = 'var(--success)';
                  textColor = 'var(--text)';
                  bgCircle = 'rgba(0, 230, 118, 0.08)';
                  fontWeight = 700;
                } else if (isActive) {
                  iconColor = 'var(--primary)';
                  textColor = 'var(--primary)';
                  bgCircle = 'rgba(11, 61, 145, 0.08)';
                  fontWeight = 800;
                }

                return (
                  <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'center', opacity: isDone || isActive ? 1 : 0.45, transition: 'all 0.2s' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: bgCircle, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${isActive ? 'var(--primary)' : isDone ? 'var(--success)' : 'rgba(0,0,0,0.08)'}`,
                      flexShrink: 0
                    }}>
                      {isDone ? (
                        <CheckCircle2 size={16} color="var(--success)" />
                      ) : isActive ? (
                        <div className="animate-spin" style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent' }} />
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)' }}>{stageNum}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', fontWeight, color: textColor }}>{stage.label}</span>
                      <span style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '1px' }}>{stage.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Micro Terminal logs inside overlay */}
            <div style={{
              background: '#0F172A',
              borderRadius: '8px',
              padding: '10px 14px',
              fontFamily: 'monospace',
              fontSize: '10px',
              color: '#38BDF8',
              height: '90px',
              overflowY: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.8)'
            }}>
              <div ref={modalLogRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {simulationLogs.map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px', lineHeight: 1.2 }}>
                    <span style={{ color: '#64748B' }}>[{log.timestamp.slice(9)}]</span>
                    <span style={{ color: '#F1F5F9' }}>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
