'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { Award, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function InnovationPage() {
  const innovations = [
    {
      category: 'Rainfall Ingestion',
      traditional: 'Separate binary files, fragmented grids with no co-location.',
      bt: 'Unified grid cell fusion matching 0.25° rainfall data with spatial distance indexes.',
      impact: 'Preserves native precipitation extremes instead of smoothing them out.'
    },
    {
      category: 'Temperature Grid matching',
      traditional: 'Broad 1.0° resolution temperature averages with no local bounds.',
      bt: 'Nearest-neighbor distance mapping (Euclidean distance matching) to co-locate temperatures.',
      impact: 'Enables micro-climate cell overlays at a uniform spatial index.'
    },
    {
      category: 'Satellite Monitoring',
      traditional: 'Static maps requiring manual GIS coordinates processing.',
      bt: 'Dynamic 3D WebGL projection of INSAT-3D orbits and radar sweep coverage.',
      impact: 'Sustained 60 FPS spatial digital twin visualizations.'
    },
    {
      category: 'Forecasting Engine',
      traditional: 'Request-blocking ML predictions that freeze user interfaces.',
      bt: 'ThreadPoolExecutor background worker queue running async XGBoost recursive forecasts.',
      impact: 'Eliminates server timeouts during high-horizon climate modeling.'
    },
    {
      category: 'Decision Advisories',
      traditional: 'Manual policy reports generated days after weather changes.',
      bt: 'Multi-tiered generative AI reasoning (llama-3.3 fallback to Gemini) mapping WMO thresholds.',
      impact: 'Automated, pre-positioned briefs delivered dynamically to stakeholders.'
    }
  ];

  return (
    <div className="page-root" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <main className="page-layout-main main-content-with-topbar">
        <CommandStatusStrip />

        {/* Header */}
        <header style={{
          height: '60px', background: 'var(--surface-alt)', borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={18} color="var(--gov-saffron)" />
            <h2 style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>Innovation &amp; Value Matrix</h2>
            <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '3px', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--gov-cyan)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
              Capability Differentiation
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="page-body-container-wide" style={{ flex: 1, overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>What Makes BHARAT-TWIN Different?</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              A technical capability breakdown showing how BHARAT-TWIN solves traditional gaps in meteorology data co-location, prediction delivery, and policy automation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Matrix Card */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '12px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Traditional Workflow</th>
                      <th style={{ padding: '12px 10px', color: 'var(--gov-cyan)', fontWeight: 700 }}>BHARAT-TWIN Advantage</th>
                      <th style={{ padding: '12px 10px', color: 'var(--gov-saffron)', fontWeight: 700 }}>Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {innovations.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 600, color: 'white' }}>{item.category}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.traditional}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.5 }}>{item.bt}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--gov-green)', fontWeight: 600, lineHeight: 1.5 }}>{item.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA */}
            <div className="flex-row-to-col" style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Zap size={16} color="var(--gov-cyan)" />
                <span style={{ fontSize: '12.5px', color: 'white', fontWeight: 600 }}>Ready to explore the operations dashboard?</span>
              </div>
              <Link href="/dashboard" style={{
                fontSize: '12px', fontWeight: 700, color: 'var(--gov-cyan)', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none'
              }}>
                Launch Operations Centre <ChevronRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
