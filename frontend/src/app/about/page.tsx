'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

// Team and roadmap were simplified into concise cards above; detailed arrays removed to avoid unused-vars lint errors.

export default function MissionDirectoratePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingLeft: '240px', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>
      <Navbar />
      <main style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '6px' }}>About BHARAT-TWIN</h1>
          <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Climate Scenario Sandbox for Decision Makers — executive summary, data provenance, and team.</div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', marginBottom: '28px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 8 }}>Mission</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Deliver a regional climate decision support platform enabling planners and emergency managers to simulate stress scenarios, assess impacts, and obtain clear recommended actions.</p>

            <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: 16 }}>What BHARAT-TWIN Does</h3>
            <ul style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              <li>Fuse multi-source climate observations into a unified mesoscale grid.</li>
              <li>Run rapid scenario perturbations and visualize operational impacts.</li>
              <li>Produce executive briefs with recommended actions and confidence.</li>
            </ul>

            <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: 16 }}>Why It Matters</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Enables evidence-led, timely decisions for heatwaves, drought, water stress, and public health interventions within the pilot region.</p>

            <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: 16 }}>Scientific Foundation</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Uses nearest-neighbor fusion, XGBoost recursive lag forecasting, and explainable LLM advisories. Not a numerical weather prediction system.</p>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>Data Sources</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--muted)' }}>
                <div>• IMD (Indian Meteorological Department)</div>
                <div>• INSAT (INSAT-3D LST satellite feeds)</div>
                <div>• MOSDAC (ISRO meteorological products)</div>
                <div>• NRSC (remote sensing derivatives)</div>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: 8 }}>Platform Limitations</div>
              <ul style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
                <li>Regional pilot coverage (Hyderabad Metropolitan Region).</li>
                <li>Forecast skill depends on historical observation density.</li>
                <li>Scenario exploration is not operational numerical weather prediction.</li>
                <li>Satellite sync relies on external agency availability.</li>
              </ul>
            </div>
          </aside>
        </section>

        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 12 }}>Team — Mission Directorate</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ padding: 12, background: 'var(--surface-alt)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700 }}>Akshay</div>
              <div style={{ color: 'var(--muted)' }}>Project Lead</div>
            </div>
            <div style={{ padding: 12, background: 'var(--surface-alt)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700 }}>Abdul Kalam Hussain</div>
              <div style={{ color: 'var(--muted)' }}>AI Systems Lead</div>
            </div>
            <div style={{ padding: 12, background: 'var(--surface-alt)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700 }}>Abhiram</div>
              <div style={{ color: 'var(--muted)' }}>Geospatial Systems Lead</div>
            </div>
            <div style={{ padding: 12, background: 'var(--surface-alt)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700 }}>Bhavana</div>
              <div style={{ color: 'var(--muted)' }}>Research & Validation Lead</div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 12 }}>
          <Link href="/briefing" style={{ padding: '10px 14px', background: 'var(--accent)', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>View Executive Climate Brief</Link>
        </section>
      </main>
    </div>
  );
}
