'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { useClimateStore } from '@/store/store';
import { Gauge, TrendingUp, TrendingDown, Minus, RefreshCw, Info } from 'lucide-react';
import Link from 'next/link';

interface RiskIndex {
  score: number;
  level: string;
  trend: string;
  confidence: number;
  impact_summary: string;
  threshold_reference: string;
}

interface RiskData {
  region_id: string;
  computed_at: string;
  data_sources: { observations_used: number; forecast_available: boolean };
  indices: {
    heat_risk: RiskIndex;
    rainfall_risk: RiskIndex;
    drought_risk: RiskIndex;
    climate_stress: RiskIndex;
    composite_risk: RiskIndex;
  };
}

const RISK_META = [
  { key: 'heat_risk', label: 'Heat Risk', desc: 'Temperature vs. IMD heatwave thresholds', color: '#ff3333', bg: 'rgba(255, 51, 51, 0.1)', border: 'rgba(255, 51, 51, 0.3)' },
  { key: 'rainfall_risk', label: 'Rainfall Risk', desc: 'Precipitation deficit/excess vs. climatological normal', color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.1)', border: 'rgba(0, 240, 255, 0.3)' },
  { key: 'drought_risk', label: 'Drought Risk', desc: 'SPI-proxy moisture deficit index', color: '#ff6600', bg: 'rgba(255, 102, 0, 0.1)', border: 'rgba(255, 102, 0, 0.3)' },
  { key: 'climate_stress', label: 'Climate Stress Index', desc: 'Combined thermal + moisture physiological stress', color: '#00ff66', bg: 'rgba(0, 255, 102, 0.1)', border: 'rgba(0, 255, 102, 0.3)' },
];

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Low: { bg: 'rgba(0, 255, 102, 0.1)', text: '#00ff66', border: 'rgba(0, 255, 102, 0.3)' },
  Moderate: { bg: 'rgba(255, 204, 0, 0.1)', text: '#ffcc00', border: 'rgba(255, 204, 0, 0.3)' },
  High: { bg: 'rgba(255, 102, 0, 0.1)', text: '#ff6600', border: 'rgba(255, 102, 0, 0.3)' },
  Critical: { bg: 'rgba(255, 51, 51, 0.1)', text: '#ff3333', border: 'rgba(255, 51, 51, 0.3)' },
};

function RiskGauge({ score, color }: { score: number; color: string }) {
  const angle = (score / 100) * 180 - 90;
  return (
    <div style={{ position: 'relative', width: '80px', height: '44px', overflow: 'hidden' }}>
      <svg viewBox="0 0 80 44" width="80" height="44">
        {/* Background arc */}
        <path d="M 4 40 A 36 36 0 0 1 76 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
        {/* Colored arc */}
        <path
          d="M 4 40 A 36 36 0 0 1 76 40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 113} 113`}
        />
        {/* Needle */}
        <line
          x1="40" y1="40"
          x2={40 + 28 * Math.cos((angle * Math.PI) / 180)}
          y2={40 + 28 * Math.sin((angle * Math.PI) / 180)}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="40" cy="40" r="3" fill="white" />
      </svg>
      <div style={{ position: 'absolute', bottom: '-2px', width: '100%', textAlign: 'center', fontFamily: "monospace", fontWeight: 700, fontSize: '14px', color }}>
        {score}
      </div>
    </div>
  );
}

export default function ClimateRiskObservatory() {
  const { selectedRegion, fetchRegions, apiBase } = useClimateStore();
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchRegions(); }, [fetchRegions]);
  useEffect(() => { if (selectedRegion) fetchRiskIndex(); }, [selectedRegion]);

  const fetchRiskIndex = async () => {
    if (!selectedRegion) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${apiBase}/risk-index/${selectedRegion.id}`);
      if (!res.ok) throw new Error(await res.text());
      setRiskData(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to compute risk index.');
    } finally {
      setLoading(false);
    }
  };

  const indices = riskData?.indices;
  const composite = indices?.composite_risk;

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'increasing') return <TrendingUp size={12} color="#ff3333" />;
    if (trend === 'decreasing') return <TrendingDown size={12} color="#00ff66" />;
    return <Minus size={12} color="var(--text-muted)" />;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />

        <header style={{
          height: '60px', background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Gauge size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Climate Risk Observatory</h2>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '3px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--gov-cyan)', border: '1px solid rgba(0, 240, 255, 0.2)', letterSpacing: '0.04em' }}>
              NDMA · WMO · IMD Thresholds
            </span>
          </div>
          <button onClick={fetchRiskIndex} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', background: 'var(--gov-saffron)', color: 'white',
            border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          }}>
            <RefreshCw size={12} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            {loading ? 'Computing...' : 'Refresh Index'}
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {error && (
            <div style={{ padding: '12px 16px', border: '1px solid rgba(255, 51, 51, 0.3)', background: 'rgba(255, 51, 51, 0.1)', borderRadius: '6px', color: '#ff3333', fontSize: '12px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Computing climate risk indices from {riskData?.data_sources.observations_used.toLocaleString('en-IN') ?? '...'} observations...
            </div>
          )}

          {riskData && !loading && (
            <div>
              {/* Composite Risk Banner */}
              {composite && (
                <div style={{
                  background: LEVEL_COLORS[composite.level]?.bg ?? 'rgba(0, 255, 102, 0.1)',
                  border: `1px solid ${LEVEL_COLORS[composite.level]?.border ?? 'rgba(0, 255, 102, 0.3)'}`,
                  borderRadius: '6px', padding: '20px 24px', marginBottom: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: LEVEL_COLORS[composite.level]?.text ?? '#00ff66', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                      Composite Climate Risk — Hyderabad Metropolitan Region
                    </div>
                    <p style={{ fontSize: '13px', color: 'white', lineHeight: 1.7 }}>
                      {composite.impact_summary}
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)', opacity: 0.7 }}>
                      Computed at: {new Date(riskData.computed_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                      · Based on {riskData.data_sources.observations_used.toLocaleString('en-IN')} IMD observations
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <RiskGauge score={composite.score} color={LEVEL_COLORS[composite.level]?.text ?? '#00ff66'} />
                    <div style={{
                      marginTop: '8px', padding: '4px 14px', borderRadius: '4px',
                      background: 'var(--surface-dark)', border: `2px solid ${LEVEL_COLORS[composite.level]?.border ?? 'rgba(0, 255, 102, 0.3)'}`,
                      fontWeight: 700, fontSize: '12px', color: LEVEL_COLORS[composite.level]?.text ?? '#00ff66',
                    }}>
                      {composite.level}
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Risk Cards */}
              <h3 style={{ fontWeight: 700, fontSize: '13px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                Risk Category Breakdown
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {RISK_META.map(({ key, label, desc, color, bg, border }) => {
                  const idx = indices?.[key as keyof typeof indices] as RiskIndex | undefined;
                  if (!idx) return null;
                  const lc = LEVEL_COLORS[idx.level] ?? LEVEL_COLORS.Low;
                  return (
                    <div key={key} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '18px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '13px', color: 'white', marginBottom: '2px' }}>{label}</h4>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{desc}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                            background: lc.bg, color: lc.text, border: `1px solid ${lc.border}`,
                          }}>{idx.level}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--text-muted)' }}>
                            <TrendIcon trend={idx.trend} /> {idx.trend}
                          </div>
                        </div>
                      </div>

                      {/* Gauge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                        <RiskGauge score={idx.score} color={color} />
                        <div style={{ flex: 1 }}>
                          {/* Score Bar */}
                          <div style={{ background: 'var(--neutral-100)', borderRadius: '3px', height: '6px', marginBottom: '4px' }}>
                            <div style={{ width: `${idx.score}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', fontFamily: "monospace" }}>
                            <span>0</span>
                            <span>Confidence: {idx.confidence}%</span>
                            <span>100</span>
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '8px' }}>
                        {idx.impact_summary}
                      </p>
                      <div style={{ padding: '6px 8px', background: bg, border: `1px solid ${border}`, borderRadius: '4px', display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                        <Info size={11} color={color} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', color, fontFamily: "monospace" }}>{idx.threshold_reference}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Risk Scale:</span>
                {[
                  { label: 'Low (0–25)', ...LEVEL_COLORS.Low },
                  { label: 'Moderate (26–50)', ...LEVEL_COLORS.Moderate },
                  { label: 'High (51–75)', ...LEVEL_COLORS.High },
                  { label: 'Critical (76–100)', ...LEVEL_COLORS.Critical },
                ].map(({ label, bg, text, border }) => (
                  <span key={label} style={{
                    padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                    background: bg, color: text, border: `1px solid ${border}`,
                  }}>{label}</span>
                ))}
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  Sources: NDMA, WMO, IMD, SPI methodology
                </span>
              </div>
            </div>
          )}

          {!riskData && !loading && !error && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <Gauge size={48} color="var(--neutral-300)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontWeight: 600, fontSize: '15px', color: 'white', marginBottom: '6px' }}>
                Risk Index Not Yet Computed
              </h4>
              <p style={{ fontSize: '13px', maxWidth: '360px', margin: '0 auto 16px' }}>
                Select a region and click "Refresh Index" to compute the Climate Risk Observatory indicators.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
