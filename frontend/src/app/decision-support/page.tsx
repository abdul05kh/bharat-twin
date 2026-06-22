'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { useClimateStore } from '@/store/store';
import { ShieldAlert, AlertTriangle, Building2, Droplets, Wheat, Heart, Truck, Users, Waves, RefreshCw } from 'lucide-react';

const AUTHORITY_ICONS: Record<string, React.ReactNode> = {
  'Municipal Corporation': <Building2 size={16} />,
  'State Disaster Management Authority': <ShieldAlert size={16} />,
  'Agricultural Department': <Wheat size={16} />,
  'Water Resource Department': <Droplets size={16} />,
  'District Administration': <Users size={16} />,
  'Public Health Authority': <Heart size={16} />,
  'District Administration (Coastal)': <Waves size={16} />,
  'Infrastructure Authority': <Truck size={16} />,
  'Policy Directorate': <ShieldAlert size={16} />,
  'District Administration / SDMA': <Users size={16} />
};

const URGENCY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Immediate: { bg: 'rgba(255, 51, 51, 0.1)', color: '#ff3333', border: 'rgba(255, 51, 51, 0.3)' },
  'Short-term': { bg: 'rgba(255, 102, 0, 0.1)', color: '#ff6600', border: 'rgba(255, 102, 0, 0.3)' },
  'Medium-term': { bg: 'rgba(255, 204, 0, 0.1)', color: '#ffcc00', border: 'rgba(255, 204, 0, 0.3)' },
};

export default function ClimateDecisionSupportCentre() {
  const { fetchRegions, selectedRegion, latestForecast, fetchLatestForecast, generateInsights, insights, isLoading } = useClimateStore();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchLatestForecast();
    }
  }, [selectedRegion, fetchLatestForecast]);

  const handleGenerate = async () => {
    if (!latestForecast) return;
    setIsGenerating(true);
    try { await generateInsights(latestForecast.id); } finally { setIsGenerating(false); }
  };

  const summary = insights?.summary;
  const recommendedActions: Array<{ authority: string; action: string; urgency: string; estimated_benefit: string }> =
    Array.isArray(summary?.recommended_actions) ? summary.recommended_actions : [];
  const riskLevel = summary?.anomaly_level ?? 'Low';
  
  const riskBgMap: Record<string, string> = { 
    Low: 'rgba(0, 255, 102, 0.1)', 
    Medium: 'rgba(255, 204, 0, 0.1)', 
    High: 'rgba(255, 102, 0, 0.1)', 
    Critical: 'rgba(255, 51, 51, 0.1)' 
  };
  const riskColMap: Record<string, string> = { 
    Low: '#00ff66', 
    Medium: '#ffcc00', 
    High: '#ff6600', 
    Critical: '#ff3333' 
  };

  const AUTHORITY_ORDER = [
    'District Administration / SDMA',
    'Policy Directorate',
    'Municipal Corporation',
    'State Disaster Management Authority',
    'District Administration',
    'Agricultural Department',
    'Water Resource Department',
    'Public Health Authority',
  ];

  const orderedActions = AUTHORITY_ORDER.map(auth =>
    recommendedActions.find(a => a.authority.toLowerCase().includes(auth.toLowerCase().split(' ')[0]))
    ?? null
  ).filter(Boolean) as typeof recommendedActions;

  const displayActions = orderedActions.length > 0 ? orderedActions : recommendedActions;

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
            <ShieldAlert size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Climate Decision Support Centre</h2>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '3px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--gov-cyan)', border: '1px solid rgba(0, 240, 255, 0.2)', letterSpacing: '0.04em' }}>
              Multi-Agency Climate Action Coordination
            </span>
          </div>
          <button onClick={handleGenerate} disabled={isGenerating || isLoading || !latestForecast} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', background: 'var(--gov-saffron)', color: 'white',
            border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
            cursor: !latestForecast || isGenerating ? 'not-allowed' : 'pointer',
            opacity: !latestForecast ? 0.6 : 1,
            transition: 'background 0.2s',
          }}>
            <RefreshCw size={13} style={isGenerating ? { animation: 'spin 1s linear infinite' } : {}} />
            {isGenerating ? 'Generating Advisory...' : 'Generate Decision Support'}
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Prerequisites check */}
          {!latestForecast && (
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(255, 102, 0, 0.1)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={16} color="var(--gov-saffron)" />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                A baseline climate forecast is required. Please execute the forecast engine in the <Link href="/analytics" style={{ color: 'var(--gov-cyan)', fontWeight: 600 }}>Climate Intelligence Hub</Link> first.
              </span>
            </div>
          )}

          {/* Risk Summary Banner */}
          {summary && (
            <div style={{
              background: riskBgMap[riskLevel] ?? 'rgba(0, 255, 102, 0.1)',
              border: `1px solid ${riskColMap[riskLevel] ?? 'rgba(0, 255, 102, 0.3)'}`,
              borderRadius: '6px', padding: '16px 20px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: riskColMap[riskLevel] ?? '#00ff66', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  Composite Climate Risk — Hyderabad Metropolitan Region
                </div>
                <p style={{ fontSize: '13px', color: 'white', lineHeight: 1.6 }}>
                  {summary.executive_summary ?? summary.primary_threat ?? ''}
                </p>
              </div>
              <div style={{
                padding: '12px 20px', borderRadius: '6px',
                background: 'var(--surface-dark)', border: `2px solid ${riskColMap[riskLevel] ?? '#00ff66'}`,
                textAlign: 'center', flexShrink: 0,
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: riskColMap[riskLevel] ?? '#00ff66' }}>{riskLevel}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>Risk Level</div>
              </div>
            </div>
          )}

          {/* Authority Action Matrix */}
          {displayActions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Authority Action Matrix
              </h3>
              {displayActions.map((action, i) => {
                const us = URGENCY_STYLE[action.urgency] ?? URGENCY_STYLE['Medium-term'];
                return (
                  <div key={i} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderLeft: `4px solid var(--gov-saffron)`,
                    borderRadius: '6px', padding: '16px 20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--gov-cyan)' }}>
                          {AUTHORITY_ICONS[action.authority] ?? <Building2 size={16} />}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: 'white' }}>
                          {action.authority}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                          background: us.bg, color: us.color, border: `1px solid ${us.border}`,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>{action.urgency}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                          Recommended Action
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                          {action.action}
                        </p>
                      </div>
                      {action.estimated_benefit && (
                        <div style={{ background: 'rgba(0, 255, 102, 0.05)', border: '1px solid rgba(0, 255, 102, 0.2)', borderRadius: '5px', padding: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#00ff66', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                            Expected Benefit
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{action.estimated_benefit}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', border: '1px dashed var(--border)', borderRadius: '6px', color: 'var(--text-muted)' }}>
              <ShieldAlert size={40} color="var(--neutral-300)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontWeight: 600, fontSize: '15px', color: 'white', marginBottom: '6px' }}>
                No Decision Support Advisory Generated
              </h4>
              <p style={{ fontSize: '13px', maxWidth: '400px', margin: '0 auto 16px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                Click "Generate Decision Support" to produce authority-specific climate action recommendations from the current forecast data.
              </p>
              {!latestForecast && (
                <Link href="/analytics" style={{
                  display: 'inline-block', padding: '9px 20px', background: 'var(--gov-saffron)',
                  color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
                }}>
                  Open Climate Intelligence Hub →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
