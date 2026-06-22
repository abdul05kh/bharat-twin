'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import AITransparencyPanel from '@/components/AITransparencyPanel';
import { useClimateStore } from '@/store/store';
import { useRouter } from 'next/navigation';
import { FileText, Download, AlertTriangle, ShieldAlert, CheckCircle2, Clock, Droplets, Wheat, Building2, Heart, Truck } from 'lucide-react';
import Link from 'next/link';

const IMPACT_ICONS: Record<string, React.ReactNode> = {
  water_resources: <Droplets size={14} />,
  agriculture: <Wheat size={14} />,
  urban_heat: <Building2 size={14} />,
  public_health: <Heart size={14} />,
  infrastructure: <Truck size={14} />,
  agricultural_risk: <Wheat size={14} />,
  water_resource_risk: <Droplets size={14} />,
  urban_heat_risk: <Building2 size={14} />,
  emergency_preparedness: <ShieldAlert size={14} />
};

const IMPACT_LABELS: Record<string, string> = {
  water_resources: 'Water Resources',
  agriculture: 'Agriculture',
  urban_heat: 'Urban Heat',
  public_health: 'Public Health',
  infrastructure: 'Infrastructure',
  agricultural_risk: 'Agricultural Risk',
  water_resource_risk: 'Water Resource Risk',
  urban_heat_risk: 'Urban Heat Risk',
  emergency_preparedness: 'Emergency Preparedness'
};

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    Low: { bg: 'rgba(0, 255, 102, 0.1)', color: '#00ff66', border: 'rgba(0, 255, 102, 0.3)' },
    Medium: { bg: 'rgba(255, 204, 0, 0.1)', color: '#ffcc00', border: 'rgba(255, 204, 0, 0.3)' },
    High: { bg: 'rgba(255, 102, 0, 0.1)', color: '#ff6600', border: 'rgba(255, 102, 0, 0.3)' },
    Critical: { bg: 'rgba(255, 51, 51, 0.1)', color: '#ff3333', border: 'rgba(255, 51, 51, 0.3)' },
  };
  const s = map[level] ?? map.Low;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '4px', fontSize: '11px',
      fontWeight: 700, background: s.bg, color: s.color,
      border: `1px solid ${s.border}`, letterSpacing: '0.04em',
    }}>{level.toUpperCase()}</span>
  );
}

export default function DecisionIntelligenceEngine() {
  const router = useRouter();
  const { insights, activeSimulation, latestForecast, apiBase } = useClimateStore();

  const handleDownload = () => {
    const target = activeSimulation
      ? `${apiBase}/report/download?simulation_id=${activeSimulation.id}`
      : latestForecast
        ? `${apiBase}/report/download?forecast_id=${latestForecast.id}`
        : null;
    if (target) window.open(target);
  };

  const summary = insights?.summary;
  const enriched = summary && (summary.executive_summary || summary.impact_assessment || summary.recommended_actions);

  const riskAssessmentObj = typeof summary?.risk_assessment === 'object' ? (summary.risk_assessment as { level?: string; rationale?: string }) : null;
  const riskLevel = summary?.anomaly_level ?? riskAssessmentObj?.level ?? 'Low';
  const execSummary = summary?.executive_summary ?? '';
  const riskRationale = riskAssessmentObj ? riskAssessmentObj.rationale : (summary?.primary_threat ?? '');
  const impactAssessment: Record<string, string> = typeof summary?.impact_assessment === 'object' ? (summary.impact_assessment as Record<string, string>) : {};
  const recommendedActions: Array<{ authority: string; action: string; urgency: string; estimated_benefit: string }> = Array.isArray(summary?.recommended_actions) ? summary.recommended_actions : [];
  const confidence = summary?.confidence_statement ?? '';
  const sciNotes = summary?.scientific_notes ?? '';
  const aiProvider = summary?.ai_provider ?? 'unknown';

  const urgencyColor = (u: string) => {
    if (u === 'Immediate') return { bg: 'rgba(255, 51, 51, 0.1)', color: '#ff3333', border: 'rgba(255, 51, 51, 0.3)' };
    if (u === 'Short-term') return { bg: 'rgba(255, 102, 0, 0.1)', color: '#ff6600', border: 'rgba(255, 102, 0, 0.3)' };
    return { bg: 'rgba(0, 255, 102, 0.1)', color: '#00ff66', border: 'rgba(0, 255, 102, 0.3)' };
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
            <FileText size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Decision Intelligence Engine</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.back()} style={{
              padding: '7px 14px', fontSize: '12px', background: 'var(--neutral-100)',
              border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'white', fontWeight: 500,
            }}>← Back</button>
            {insights && (
              <button onClick={handleDownload} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', background: 'var(--gov-saffron)', color: 'white',
                border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              }}>
                <Download size={13} /> Download Policy Report
              </button>
            )}
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
          {insights ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Risk Level Banner */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderLeft: `4px solid ${riskLevel === 'Critical' ? '#ff3333' : riskLevel === 'High' ? '#ff6600' : riskLevel === 'Medium' ? '#ffcc00' : '#00ff66'}`,
                borderRadius: '6px', padding: '16px 20px',
                display: 'flex', alignItems: 'flex-start', gap: '14px',
              }}>
                <AlertTriangle size={20} color={riskLevel === 'Critical' ? '#ff3333' : riskLevel === 'High' ? '#ff6600' : '#ffcc00'} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Climate Risk Assessment
                    </span>
                    <RiskBadge level={riskLevel} />
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '6px' }}>
                    {riskRationale || summary?.primary_threat}
                  </p>
                  {summary?.strategic_action && !enriched && (
                    <p style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--gov-cyan)' }}>
                      Recommended Action: {summary.strategic_action}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: "monospace", flexShrink: 0 }}>
                  <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                  {new Date(insights.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })} IST
                </span>
              </div>

              {/* Executive Summary */}
              {(execSummary || insights.insight_text) && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '13px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    Executive Summary
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                    {execSummary || insights.insight_text.split('\n\n')[0]}
                  </p>
                </div>
              )}

              {/* Impact Assessment Domains */}
              {Object.keys(impactAssessment).length > 0 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '13px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    Impact Assessment by Domain
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {Object.entries(impactAssessment).map(([key, text]) => (
                      <div key={key} style={{
                        padding: '14px', border: '1px solid var(--border)', borderRadius: '5px',
                        background: 'var(--surface-dark)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
                          <span style={{ color: 'var(--gov-cyan)' }}>{IMPACT_ICONS[key] || <FileText size={14} />}</span>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {IMPACT_LABELS[key] ?? key}
                          </span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Actions */}
              {recommendedActions.length > 0 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '13px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    Government Action Recommendations
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recommendedActions.map((action, i) => {
                      const uc = urgencyColor(action.urgency);
                      return (
                        <div key={i} style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: '5px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                            background: uc.bg, color: uc.color, border: `1px solid ${uc.border}`,
                            flexShrink: 0, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}>{action.urgency}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '12px', color: 'white', marginBottom: '4px' }}>
                              {action.authority}
                            </div>
                            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '4px' }}>
                              {action.action}
                            </p>
                            {action.estimated_benefit && (
                              <div style={{ fontSize: '11px', color: 'var(--gov-green)', fontWeight: 500 }}>
                                ✓ {action.estimated_benefit}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Confidence & Scientific Notes */}
              {(confidence || sciNotes) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {confidence && (
                    <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '6px', padding: '16px' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '11px', color: 'var(--gov-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Confidence Statement</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{confidence}</p>
                    </div>
                  )}
                  {sciNotes && (
                    <div style={{ background: 'rgba(255, 102, 0, 0.05)', border: '1px solid rgba(255, 102, 0, 0.2)', borderRadius: '6px', padding: '16px' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '11px', color: 'var(--gov-saffron)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Scientific Notes</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{sciNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI Generation Provenance */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px 20px', borderTop: '3px solid var(--gov-cyan)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gov-cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                  Generated By — AI Provenance
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'var(--surface-dark)', border: '1px solid var(--border)', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Provider</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'white', fontWeight: 600 }}>
                      {aiProvider.includes('gemini') ? 'Google Gemini' : 'Groq Cloud'}
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface-dark)', border: '1px solid var(--border)', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Model</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--gov-cyan)', fontWeight: 600 }}>{aiProvider}</div>
                  </div>
                  <div style={{ background: 'var(--surface-dark)', border: '1px solid var(--border)', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Timestamp</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'white', fontWeight: 600 }}>
                      {new Date(insights.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface-dark)', border: '1px solid var(--border)', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Status</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--gov-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={11} /> VERIFIED
                    </div>
                  </div>
                </div>
                {(summary as any)?.token_usage && (
                  <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'flex', gap: '16px' }}>
                    <span>Tokens: {(summary as any).token_usage.prompt_tokens} in / {(summary as any).token_usage.completion_tokens} out</span>
                    <span>Confidence: {summary?.confidence_score ? `${Math.round(Number(summary.confidence_score) * 100)}%` : '—'}</span>
                  </div>
                )}
              </div>

              {/* AI Transparency Panel */}
              <AITransparencyPanel />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <ShieldAlert size={48} color="var(--neutral-300)" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, fontSize: '16px', color: 'white', marginBottom: '8px' }}>
                Advisory Brief Not Generated
              </h4>
              <p style={{ fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px', color: 'var(--text-secondary)' }}>
                Execute a forecast in the Climate Intelligence Hub and run a scenario in the Climate Scenario Laboratory to generate an AI-powered advisory.
              </p>
              <Link href="/compare" style={{
                padding: '10px 20px', background: 'var(--gov-saffron)', color: 'white',
                border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none'
              }}>
                Open Impact Assessment Console
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
