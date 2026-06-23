'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import PrimaryRiskHero from '@/components/PrimaryRiskHero';
import { useClimateStore } from '@/store/store';
import { FileText, ShieldAlert, AlertTriangle, MapPin, TrendingUp, Users, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ExecutiveClimateBriefingPage() {
  const { selectedRegion, apiBase, fetchRegions, latestForecast, fetchLatestForecast, insights, generateInsights } = useClimateStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchLatestForecast();
    }
  }, [selectedRegion]);

  const handleGenerate = async () => {
    if (!latestForecast) return;
    setLoading(true);
    try {
      await generateInsights(latestForecast.id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const summary = insights?.summary;
  const riskLevel = summary?.anomaly_level || 'Medium';
  const primaryThreat = summary?.primary_threat || 'Elevated land surface temperatures combined with localized precipitation deficit';
  const strategicAction = summary?.strategic_action || 'Issue local heat warning advisories and activate urban municipal watering systems.';
  
  const riskColors = {
    Low: { text: '#00ff66', bg: 'rgba(0, 255, 102, 0.1)', border: 'rgba(0, 255, 102, 0.3)' },
    Medium: { text: '#ffcc00', bg: 'rgba(255, 204, 0, 0.1)', border: 'rgba(255, 204, 0, 0.3)' },
    High: { text: '#ff6600', bg: 'rgba(255, 102, 0, 0.1)', border: 'rgba(255, 102, 0, 0.3)' },
    Critical: { text: '#ff3333', bg: 'rgba(255, 51, 51, 0.1)', border: 'rgba(255, 51, 51, 0.3)' }
  };

  const rc = riskColors[riskLevel as keyof typeof riskColors] || riskColors.Medium;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      <Navbar />
      <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CommandStatusStrip />

        {/* Header */}
        <header style={{
          height: '60px', background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Executive Climate Briefing</h2>
            <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '3px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--gov-cyan)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
              Regional Situation Briefing
            </span>
          </div>
          {latestForecast && !insights && (
            <button onClick={handleGenerate} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', background: 'var(--gov-saffron)', color: 'white',
              border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            }}>
              <RefreshCw size={12} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
              {loading ? 'Synthesizing...' : 'Generate Executive Summary'}
            </button>
          )}
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          
          <PrimaryRiskHero />

          {/* Situation Title */}
          <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>
              Regional Climate Situation Summary
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Active administration briefing for the <strong>Hyderabad Metropolitan Region</strong> grid bounds.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Alert Level Box */}
            <div style={{
              background: rc.bg,
              border: `1px solid ${rc.border}`,
              borderRadius: '6px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: rc.text, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  Current Alert Level
                </div>
                <h4 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: 0 }}>{riskLevel} Risk</h4>
              </div>
              <div style={{
                background: 'var(--surface-dark)',
                border: `2px solid ${rc.text}`,
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: 700,
                color: rc.text,
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                {riskLevel === 'Low' || riskLevel === 'Medium' ? 'PASS' : 'UNDER REVIEW'}
              </div>
            </div>

            {/* Metrics cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Primary Threat Card */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <ShieldAlert size={14} color="var(--gov-saffron)" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Primary Threat Vector
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {primaryThreat}
                </p>
              </div>

              {/* Vulnerable Zones Card */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <MapPin size={14} color="var(--gov-cyan)" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Most Vulnerable Zone
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  Hyderabad Urban Core (grid coordinates: 17.36°N, 78.48°E) due to elevated land surface temperature hotspots.
                </p>
              </div>
            </div>

            {/* Recommended Action Card */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', borderLeft: '4px solid var(--gov-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <AlertTriangle size={15} color="var(--gov-green)" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recommended Action Directives
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                {strategicAction}
              </p>
            </div>

            {/* Metadata Footer Card */}
            <div style={{
              background: 'var(--surface-dark)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}>
              <div>
                <span>Telemetry Source confidence: </span>
                <strong style={{ color: 'white' }}>{summary?.confidence_score ? `${Math.round(Number(summary.confidence_score) * 100)}%` : '84%'} (PASS)</strong>
              </div>
              <div>
                <span>Registry Last updated: </span>
                <strong style={{ color: 'white' }}>
                  {insights ? new Date(insights.created_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                </strong>
              </div>
            </div>

            {/* Link back */}
            {!insights && !latestForecast && (
              <div style={{ textAlign: 'center', padding: '24px', border: '1px dashed var(--border)', borderRadius: '6px' }}>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  No active climate forecasts detected in the database.
                </p>
                <Link href="/analytics" style={{
                  display: 'inline-block', padding: '8px 16px', background: 'var(--gov-saffron)', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700
                }}>
                  Execute Forecast Engine →
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
