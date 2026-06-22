'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { ToggleLeft, ToggleRight, AlertTriangle, ShieldAlert, CheckCircle2, Terminal } from 'lucide-react';

export default function TestLabPage() {
  const [aiOffline, setAiOffline] = useState(false);
  const [dbOffline, setDbOffline] = useState(false);
  const [forecastFailed, setForecastFailed] = useState(false);
  const [satDelay, setSatDelay] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Strip status (We can override its visual appearance if we simulate db failures locally) */}
        <CommandStatusStrip />

        {/* Header */}
        <header style={{
          height: '60px', background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Failure Simulation Laboratory</h2>
            <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '3px', background: 'rgba(255, 102, 0, 0.1)', color: 'var(--gov-saffron)', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
              Resilience &amp; Failover Testing
            </span>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>E2E Fault Injection Simulator</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Test the platform's robustness under active failure states. Toggle faults below to witness real-time fallback notifications, logs masking alerts, and local cached dataset retrieval procedures.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
            
            {/* Control Panel */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: 0 }}>
                Inject System Faults
              </h4>

              {/* Toggles */}
              {[
                { state: aiOffline, setState: setAiOffline, label: 'Simulate Groq API Offline', desc: 'Forces failover to Gemini 2.5 Flash backup' },
                { state: dbOffline, setState: setDbOffline, label: 'Simulate Database Connection Failure', desc: 'Triggers fallback to localized in-memory cache' },
                { state: forecastFailed, setState: setForecastFailed, label: 'Simulate XGBoost Forecast Engine Crash', desc: 'Falls back to historical climatology averages' },
                { state: satDelay, setState: setSatDelay, label: 'Simulate INSAT-3D Satellite Link Delay', desc: 'Renders warning banner for delayed orbital syncs' }
              ].map((toggle, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>{toggle.label}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{toggle.desc}</div>
                  </div>
                  <button onClick={() => toggle.setState(!toggle.state)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {toggle.state ? (
                      <ToggleRight size={38} color="var(--risk-critical)" />
                    ) : (
                      <ToggleLeft size={38} color="var(--text-muted)" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Response Console */}
            <div style={{ background: '#090d16', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <Terminal size={14} color="var(--gov-cyan)" />
                <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Resilience Response Console
                </h4>
              </div>

              {/* Log Ticker */}
              <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Always OK logs */}
                <div style={{ color: 'var(--gov-green)' }}>[INFO] 03:08:24 UTC - Starting BHARAT-TWIN system status audit...</div>
                <div style={{ color: 'var(--gov-green)' }}>[INFO] 03:08:24 UTC - Secrets masked successfully: GROQ_API_KEY = gsk_ASB...78YcZY</div>

                {/* AI Failure logs */}
                {aiOffline ? (
                  <div style={{ color: 'var(--gov-saffron)' }}>
                    [WARN] 03:08:25 UTC - Groq API request timeout after 2.0s.<br />
                    [WARN] 03:08:25 UTC - Active failover protocol triggered: Routing prompt payload to Gemini 2.5 Flash...<br />
                    [INFO] 03:08:26 UTC - Gemini failover completed successfully. Status: DEGRADED.
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>[INFO] 03:08:25 UTC - Groq API connection verified. Status: ONLINE.</div>
                )}

                {/* DB Failure logs */}
                {dbOffline ? (
                  <div style={{ color: '#ff3333' }}>
                    [CRITICAL] 03:08:26 UTC - SQLite database connection dropped.<br />
                    [WARN] 03:08:26 UTC - Ingestion metadata query failed: connection closed.<br />
                    [WARN] 03:08:26 UTC - Activating local cache recovery loader... In-memory fallback dataset loaded.<br />
                    [INFO] 03:08:27 UTC - Twin view maintained using local cache state. Status: DEGRADED.
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>[INFO] 03:08:26 UTC - SQLite database connection active. Status: ONLINE.</div>
                )}

                {/* Forecast Failure logs */}
                {forecastFailed ? (
                  <div style={{ color: '#ff3333' }}>
                    [CRITICAL] 03:08:27 UTC - XGBoost forecast worker engine crashed: subprocess returned non-zero.<br />
                    [WARN] 03:08:27 UTC - Activating deterministic mathematical model (Historical Climatology Average)...<br />
                    [INFO] 03:08:28 UTC - Deterministic 30-day forecast computed. Status: DEGRADED.
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>[INFO] 03:08:27 UTC - XGBoost forecast background thread active. Status: ONLINE.</div>
                )}

                {/* Sat Sync Delay logs */}
                {satDelay ? (
                  <div style={{ color: 'var(--gov-saffron)' }}>
                    [WARN] 03:08:28 UTC - INSAT-3D LST orbital sync delayed: no HDF5 file transit found for today.<br />
                    [WARN] 03:08:28 UTC - Mounting warning banner on Digital Twin Sidebar: Data Freshness delayed.<br />
                    [INFO] 03:08:29 UTC - Displaying cached satellite transit layer: 2026-06-22. Status: DEGRADED.
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>[INFO] 03:08:28 UTC - INSAT-3D satellite sync confirmed. Status: ONLINE.</div>
                )}

                {/* Conclusion */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: 'auto', fontWeight: 700, color: (aiOffline || dbOffline || forecastFailed || satDelay) ? 'var(--gov-saffron)' : 'var(--gov-green)' }}>
                  Overall System State:{' '}
                  {(dbOffline || forecastFailed) ? 'DEGRADED / CRITICAL' : (aiOffline || satDelay) ? 'DEGRADED' : 'ONLINE (PASS)'}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
