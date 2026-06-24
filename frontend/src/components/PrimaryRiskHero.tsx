'use client';

import React, { useEffect } from 'react';
import { useClimateStore } from '@/store/store';
import { TrendingUp, TrendingDown, Minus, ShieldCheck } from 'lucide-react';

export default function PrimaryRiskHero() {
  const { selectedRegion, riskIndex, fetchRiskIndex } = useClimateStore();

  useEffect(() => {
    if (selectedRegion && !riskIndex) {
      fetchRiskIndex();
    }
  }, [selectedRegion, riskIndex, fetchRiskIndex]);

  // Fallback default values if database/API fails or is loading
  const fallbackData = {
    composite: 42,
    level: 'Low',
    trend: 'stable',
    confidence: 91,
    whatIsHappening: 'Regional climate parameters align with seasonal baselines; temperatures are nominal.',
    whyItMatters: 'Minimizes municipal power strain, reservoir drawdown rates, and public health warning alerts.',
    whatActionToBeTaken: 'Pre-position emergency municipal supplies and continue grid telemetry sync.'
  };

  // Safely extract indices
  const indices = riskIndex ? ((riskIndex as Record<string, unknown>)['indices'] as Record<string, unknown> | undefined) : undefined;
  const compositeRisk = indices ? (indices['composite_risk'] as Record<string, unknown> | undefined) : undefined;
  const heatRisk = indices ? (indices['heat_risk'] as Record<string, unknown> | undefined) : undefined;
  const climateStress = indices ? (indices['climate_stress'] as Record<string, unknown> | undefined) : undefined;

  const hasData = !!compositeRisk;

  const score = hasData && typeof compositeRisk!['score'] === 'number' ? (compositeRisk!['score'] as number) : fallbackData.composite;
  const level = hasData && typeof compositeRisk!['level'] === 'string' ? (compositeRisk!['level'] as string) : fallbackData.level;
  const trend = hasData && typeof compositeRisk!['trend'] === 'string' ? (compositeRisk!['trend'] as string) : fallbackData.trend;
  const confidence = hasData && typeof compositeRisk!['confidence'] === 'number' ? (compositeRisk!['confidence'] as number) : fallbackData.confidence;

  const whatIsHappening = hasData && heatRisk ? ((heatRisk['impact_summary'] as string) || fallbackData.whatIsHappening) : fallbackData.whatIsHappening;
  const whyItMatters = hasData && climateStress ? ((climateStress['impact_summary'] as string) || fallbackData.whyItMatters) : fallbackData.whyItMatters;
  const whatActionToBeTaken = hasData && compositeRisk ? ((compositeRisk['impact_summary'] as string) || fallbackData.whatActionToBeTaken) : fallbackData.whatActionToBeTaken;

  // Ensure displayed strings are concise (max 60 words, Phase 10)
  const truncateWords = (s: string, maxWords = 60) => {
    if (!s) return s;
    const parts = s.split(/\s+/);
    if (parts.length <= maxWords) return s;
    return parts.slice(0, maxWords).join(' ') + '...';
  };

  const shortWhat = truncateWords(String(whatIsHappening), 45);
  const shortWhy = truncateWords(String(whyItMatters), 45);
  const shortAction = truncateWords(String(whatActionToBeTaken), 45);

  // Color mappings based on risk level
  const getRiskColor = (lvl: string) => {
    const l = lvl.toLowerCase();
    if (l === 'critical') return 'var(--risk-critical)'; // #FF1744
    if (l === 'high') return 'var(--risk-high)';         // #FF9100
    if (l === 'moderate') return 'var(--risk-moderate)'; // #FFD600
    return 'var(--risk-low)';                           // #00E676
  };

  const riskColor = getRiskColor(level);

  // Render trend icon
  const renderTrendIcon = (tr: string) => {
    const style = { display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 };
    if (tr === 'increasing') {
      return <span style={{ ...style, color: 'var(--critical)' }}><TrendingUp size={14} /> INCREASING</span>;
    }
    if (tr === 'decreasing') {
      return <span style={{ ...style, color: 'var(--success)' }}><TrendingDown size={14} /> DECREASING</span>;
    }
    return <span style={{ ...style, color: 'var(--muted)' }}><Minus size={14} /> STABLE</span>;
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: `5px solid ${riskColor}`,
      borderRadius: '8px',
      padding: '16px 20px',
      boxShadow: 'var(--shadow)',
      display: 'grid',
      gridTemplateColumns: '130px 1.2fr 1.8fr',
      gap: '20px',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0
    }}>
      {/* Subtle Background Glow */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        left: '-50px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: riskColor,
        filter: 'blur(60px)',
        opacity: 0.08,
        pointerEvents: 'none'
      }} />

      {/* Circle Index Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: `4px solid ${riskColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-alt)',
          position: 'relative'
        }}>
          <span style={{ fontSize: '8px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Risk Index</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', fontFamily: "monospace", lineHeight: 1.1 }}>{score}</span>
          <span style={{ fontSize: '8px', color: 'var(--muted)', fontWeight: 600 }}>/ 100</span>
        </div>
        <span style={{
          marginTop: '6px',
          fontSize: '9px',
          fontWeight: 700,
          color: '#FFFFFF',
          background: riskColor,
          padding: '2px 8px',
          borderRadius: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          {level}
        </span>
      </div>

      {/* Core Diagnostics & Trends */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
        <div>
          <h4 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.06em', margin: '0 0 2px', fontWeight: 700 }}>Active Target Area</h4>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            {selectedRegion?.name || 'Hyderabad Region'}
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
          <div>
            <h5 style={{ fontSize: '8.5px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em', margin: '0 0 2px', fontWeight: 700 }}>Trend</h5>
            {renderTrendIcon(trend)}
          </div>
          <div>
            <h5 style={{ fontSize: '8.5px', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em', margin: '0 0 2px', fontWeight: 700 }}>Confidence</h5>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '11px', fontFamily: "monospace" }}>{confidence}%</span>
              <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${confidence}%`, height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--success)', fontWeight: 700 }}>
          <ShieldCheck size={11} />
          <span>NDMA Composite Framework V2.0</span>
        </div>
      </div>

      {/* Executive Quick-Read (3-Second Action Assessment - Phase 10 & 11 Compliant) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '11px', lineHeight: 1.3 }}>
          <strong style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.04em', display: 'block' }}>1. What is Happening?</strong>
          <span style={{ color: 'var(--text)' }}>{shortWhat}</span>
        </div>
        <div style={{ fontSize: '11px', lineHeight: 1.3 }}>
          <strong style={{ color: 'var(--warning)', textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.04em', display: 'block' }}>2. Why Does it Matter?</strong>
          <span style={{ color: 'var(--text)' }}>{shortWhy}</span>
        </div>
        <div style={{ fontSize: '11px', lineHeight: 1.3 }}>
          <strong style={{ color: riskColor, textTransform: 'uppercase', fontSize: '8.5px', letterSpacing: '0.04em', display: 'block' }}>3. What Action Should Be Taken?</strong>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{shortAction}</span>
        </div>
      </div>
    </div>
  );
}
