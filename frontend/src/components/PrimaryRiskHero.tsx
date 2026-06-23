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
    composite: 64,
    level: 'High',
    trend: 'increasing',
    confidence: 82,
    whatIsHappening: 'Average regional max temperatures are projected to climb to 34.6°C (+1.8°C above seasonal baseline), with persistent moisture deficits extending the dry spell.',
    whyItMatters: 'Triggers agricultural thermal stress, increased municipal water stress, and elevates the Urban Heat Island (UHI) intensity in the metropolitan core.',
    whatActionToBeTaken: 'Pre-position emergency water tankers, enforce misting sprays, adjust crop irrigation schedules, and activate public heat advisories.'
  };

  const hasData = riskIndex && riskIndex.indices && riskIndex.indices.composite_risk;
  
  const score = hasData ? riskIndex.indices.composite_risk.score : fallbackData.composite;
  const level = hasData ? riskIndex.indices.composite_risk.level : fallbackData.level;
  const trend = hasData ? riskIndex.indices.composite_risk.trend : fallbackData.trend;
  const confidence = hasData ? riskIndex.indices.composite_risk.confidence : fallbackData.confidence;
  
  const whatIsHappening = hasData 
    ? (riskIndex.indices.heat_risk.impact_summary || fallbackData.whatIsHappening)
    : fallbackData.whatIsHappening;
  const whyItMatters = hasData
    ? (riskIndex.indices.climate_stress.impact_summary || fallbackData.whyItMatters)
    : fallbackData.whyItMatters;
  const whatActionToBeTaken = hasData
    ? (riskIndex.indices.composite_risk.impact_summary || fallbackData.whatActionToBeTaken)
    : fallbackData.whatActionToBeTaken;

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
      return <span style={{ ...style, color: 'var(--risk-critical)' }}><TrendingUp size={16} /> INCREASING</span>;
    }
    if (tr === 'decreasing') {
      return <span style={{ ...style, color: 'var(--risk-low)' }}><TrendingDown size={16} /> DECREASING</span>;
    }
    return <span style={{ ...style, color: 'var(--text-muted)' }}><Minus size={16} /> STABLE</span>;
  };

  return (
    <div style={{
      background: 'var(--neutral-100)',
      border: '1px solid var(--border)',
      borderLeft: `5px solid ${riskColor}`,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      display: 'grid',
      gridTemplateColumns: '150px 1fr 1.5fr',
      gap: '24px',
      alignItems: 'center',
      marginBottom: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle Background Glow */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        left: '-50px',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: riskColor,
        filter: 'blur(75px)',
        opacity: 0.15,
        pointerEvents: 'none'
      }} />

      {/* Circle Index Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: `4px solid ${riskColor}`,
          boxShadow: `0 0 16px ${riskColor}33`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-dark)',
          position: 'relative'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Risk Index</span>
          <span style={{ fontSize: '28px', fontWeight: 800, color: 'white', fontFamily: "'Noto Sans', monospace", lineHeight: 1.1 }}>{score}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100</span>
        </div>
        <div style={{
          marginTop: '10px',
          fontSize: '11px',
          fontWeight: 700,
          color: 'black',
          background: riskColor,
          padding: '2px 10px',
          borderRadius: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          {level}
        </div>
      </div>

      {/* Core Diagnostics & Trends */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '20px' }}>
        <div>
          <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', margin: '0 0 4px' }}>Active Target Area</h4>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: 0 }}>
            {selectedRegion?.name || 'Hyderabad Metropolitan Area'}
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <h5 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', margin: '0 0 2px' }}>Trend Direction</h5>
            {renderTrendIcon(trend)}
          </div>
          <div>
            <h5 style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', margin: '0 0 2px' }}>Assessment Confidence</h5>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: 'var(--gov-cyan)', fontSize: '13px', fontFamily: "'Noto Sans', monospace" }}>{confidence}%</span>
              <div style={{ width: '45px', height: '4px', background: 'var(--neutral-300)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${confidence}%`, height: '100%', background: 'var(--gov-cyan)' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--gov-green)' }}>
          <ShieldCheck size={12} />
          <span>NDMA Composite Framework V2.0</span>
        </div>
      </div>

      {/* Executive Quick-Read (3-Second Action Assessment) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--gov-cyan)', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>1. What is Happening?</strong>
          <span style={{ color: 'var(--text-primary)' }}>{whatIsHappening}</span>
        </div>
        <div style={{ fontSize: '11px', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--gov-saffron)', textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>2. Why Does it Matter?</strong>
          <span style={{ color: 'var(--text-secondary)' }}>{whyItMatters}</span>
        </div>
        <div style={{ fontSize: '11px', lineHeight: 1.4 }}>
          <strong style={{ color: riskColor, textTransform: 'uppercase', fontSize: '9.5px', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>3. What Action Should Be Taken?</strong>
          <span style={{ color: 'white', fontWeight: 500 }}>{whatActionToBeTaken}</span>
        </div>
      </div>
    </div>
  );
}
