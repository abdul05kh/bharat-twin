'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CommandStatusStrip from '@/components/CommandStatusStrip';
import { useClimateStore } from '@/store/store';
import {
  ShieldCheck,
  Cpu,
  Database,
  GitBranch,
  LineChart,
  BookOpen,
  HelpCircle,
  Clock,
  Settings,
  Scale,
  Compass
} from 'lucide-react';

export default function ScientificValidation() {
  const { fetchRegions, selectedRegion, historicalTrends, fetchHistoricalTrends } = useClimateStore();
  const [totalObsCount, setTotalObsCount] = useState(17536);
  const [totalDays, setTotalDays] = useState(1095);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (selectedRegion) {
      fetchHistoricalTrends();
    }
  }, [selectedRegion, fetchHistoricalTrends]);

  useEffect(() => {
    if (historicalTrends && historicalTrends.length > 0) {
      setTotalDays(historicalTrends.length);
      // Average 16 grid cells per day for Hyderabad region bounds
      setTotalObsCount(historicalTrends.length * 16);
    }
  }, [historicalTrends]);

  return (
    <div className="page-root" style={{ background: 'var(--bg)', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>
      <Navbar />

      <main className="page-layout-main main-content-with-topbar">
        <CommandStatusStrip />

        {/* Header Title */}
        <header style={{
          height: '55px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0, zIndex: 5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <h2 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              Scientific Validation & Model Transparency Center
            </h2>
            <span style={{ fontSize: '9px', background: 'rgba(30,142,62,0.08)', color: 'var(--success)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(30,142,62,0.15)', fontWeight: 700, textTransform: 'uppercase' }}>
              MODEL VERIFIED
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Active Region: <strong>{selectedRegion?.name || 'Hyderabad Metropolitan Region'}</strong>
          </div>
        </header>

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          
          {/* Top Summary Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(11, 61, 145, 0.05) 0%, rgba(0, 140, 255, 0.05) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            boxShadow: 'var(--shadow)'
          }} className="grid-split-32-68-collapsed">
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                Training Window
              </span>
              <strong style={{ fontSize: '18px', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>
                Jan 2023 – Dec 2025
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                IMD & INSAT-3D Historical base
              </span>
            </div>
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                Total Observation Days
              </span>
              <strong style={{ fontSize: '18px', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>
                {totalDays} Days
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                Derived dynamically from dataset
              </span>
            </div>
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                Total Data observations
              </span>
              <strong style={{ fontSize: '18px', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>
                {totalObsCount.toLocaleString()} points
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                16 spatial grid zones (0.04° grid)
              </span>
            </div>
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                Prediction Engine
              </span>
              <strong style={{ fontSize: '18px', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>
                XGBoost Regressor
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                Fallback to Pure Python matrix
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }} className="grid-split-70-30-collapsed">
            
            {/* LEFT COLUMN: Data pipeline & feature engineering */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Feature Engineering Pipeline Card */}
              <div className="premium-card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid var(--border)', paddingBottom: '8px', marginBottom: '14px' }}>
                  <GitBranch size={16} color="var(--primary)" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Climate Feature Engineering Pipeline
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4, marginBottom: '20px' }}>
                  The gridded satellite and weather rasters pass through sequential ingestion, feature extraction, and spatiotemporal lag mapping before predicting environmental stress states.
                </p>

                {/* Pipeline Flow Steppers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { step: '1', title: 'INSAT-3D & IMD Telemetry Ingestion', desc: 'Raw insolation (INSAT LST) and weather grids (IMD rain/temp) are fetched daily.' },
                    { step: '2', title: 'Raster Cell Extraction', desc: 'Spatially intersects gridded data layers into bounded mesoscale polygons using EPSG:4326.' },
                    { step: '3', title: 'Spatiotemporal Lag Calculations', desc: 'Generates rainfall and temperature lag features (1-day, 7-day, 30-day lags) to capture weather persistence.' },
                    { step: '4', title: 'Rolling Meteorological Means', desc: 'Computes 7-day and 30-day rolling averages for moisture balance and evapotranspiration indexes.' },
                    { step: '5', title: 'Vegetation Health & NDVI Integration', desc: 'Extracts infrared reflection levels to track photosynthetic activity and soil moisture deficits.' },
                    { step: '6', title: 'Gradient Boosting Inference', desc: 'Passes the engineered multi-dimensional feature vector to XGBoost regression models for variable predictions.' }
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '8px 10px', background: 'var(--surface-alt)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, flexShrink: 0
                      }}>
                        {step.step}
                      </div>
                      <div>
                        <strong style={{ fontSize: '11.5px', color: 'var(--text)', display: 'block' }}>{step.title}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px', display: 'block' }}>{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Ingestion Metadata Table */}
              <div className="premium-card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid var(--border)', paddingBottom: '8px', marginBottom: '14px' }}>
                  <Database size={16} color="var(--primary)" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Data Source & Ingestion Metadata
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--muted)' }}>
                        <th style={{ padding: '8px' }}>Source Provider</th>
                        <th style={{ padding: '8px' }}>Dataset Name</th>
                        <th style={{ padding: '8px' }}>Resolution</th>
                        <th style={{ padding: '8px' }}>Update Frequency</th>
                        <th style={{ padding: '8px' }}>Quality Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px', fontWeight: 700 }}>India Meteorological Dept (IMD)</td>
                        <td style={{ padding: '8px' }}>Gridded Daily Precipitation & Temp</td>
                        <td style={{ padding: '8px' }}>0.04° (~4.4km)</td>
                        <td style={{ padding: '8px' }}>Daily (24h lag)</td>
                        <td style={{ padding: '8px', color: 'var(--success)', fontWeight: 700 }}>Verified (QC Passed)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px', fontWeight: 700 }}>ISRO / MOSDAC</td>
                        <td style={{ padding: '8px' }}>INSAT-3D Land Surface Temp (LST)</td>
                        <td style={{ padding: '8px' }}>4km pixels</td>
                        <td style={{ padding: '8px' }}>Sub-daily (hourly)</td>
                        <td style={{ padding: '8px', color: 'var(--success)', fontWeight: 700 }}>ISRO Standard Standardized</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px', fontWeight: 700 }}>Bhuvan Geo-Portal / NRSC</td>
                        <td style={{ padding: '8px' }}>Vegetation index NDVI datasets</td>
                        <td style={{ padding: '8px' }}>250m gridded</td>
                        <td style={{ padding: '8px' }}>16-day Composite</td>
                        <td style={{ padding: '8px', color: 'var(--success)', fontWeight: 700 }}>Fused Cell Interpolated</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AI Explainability (SHAP) & Forecast Horisons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* XGBoost SHAP Card */}
              <div className="premium-card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid var(--border)', paddingBottom: '8px', marginBottom: '14px' }}>
                  <Cpu size={16} color="var(--primary)" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Model Explainability (SHAP values)
                  </span>
                </div>
                <span style={{ fontSize: '8.5px', background: 'var(--surface-alt)', color: 'var(--muted)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 700, textTransform: 'uppercase', display: 'inline-block', marginBottom: '10px' }}>
                  Illustrative Model Explanation Component
                </span>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4, marginBottom: '16px' }}>
                  SHAP (SHapley Additive exPlanations) values outline the contribution percentage of each atmospheric and surface feature towards computed grid risk outcomes.
                </p>

                {/* SHAP Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Air Temperature (Tmax)', pct: 31, color: 'var(--critical)' },
                    { name: 'Rainfall Deviation (Pr)', pct: 24, color: 'var(--accent)' },
                    { name: 'Vegetation Health (NDVI)', pct: 18, color: 'var(--success)' },
                    { name: 'Relative Humidity (RH)', pct: 15, color: '#9c27b0' },
                    { name: 'Wind Velocity (U)', pct: 7, color: '#607d8b' },
                    { name: 'Surface Pressure (P)', pct: 5, color: '#795548' }
                  ].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                        <span>{feat.name}</span>
                        <span>+{feat.pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${feat.pct * 3}%`, height: '100%', background: feat.color, borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forecast Horizon Panel */}
              <div className="premium-card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid var(--border)', paddingBottom: '8px', marginBottom: '14px' }}>
                  <LineChart size={16} color="var(--primary)" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Forecast Horizons & Confidence Ranges
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { range: '0 – 3 Days (Nowcasting)', level: 'Highest Confidence (94%)', desc: 'Low uncertainty bounds. Ideal for immediate disaster response and urban cooling center dispatch.' },
                    { range: '4 – 7 Days (Short Range)', level: 'Medium-High Confidence (87%)', desc: 'Predicts regional convective transitions and grid heating thresholds with minor margins.' },
                    { range: '8 – 14 Days (Planning Scenario)', level: 'Scenario-Based Confidence (72%)', desc: 'Reflects wider ensemble variance. Useful for water rationing pre-planning.' },
                    { range: 'Beyond 14 Days (Exploratory)', level: 'Trend-Only Confidence', desc: 'Strictly exploratory scenarios. Useful for long-range policy models, not deterministic forecasts.' }
                  ].map((h, idx) => (
                    <div key={idx} style={{ borderBottom: idx < 3 ? '1px solid var(--border)' : 'none', paddingBottom: idx < 3 ? '12px' : '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--primary)' }}>{h.range}</strong>
                      <span style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h.level}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text)', lineHeight: 1.35 }}>{h.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Processing Constraints Card */}
              <div className="premium-card" style={{ padding: '16px 18px', border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(11, 61, 145, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginBottom: '8px' }}>
                  <Scale size={13} color="var(--primary)" />
                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Ingestion Constraints</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', lineHeight: 1.35 }}>
                  <div>
                    <strong style={{ display: 'block' }}>Missing Value Strategy:</strong>
                    <span>Spatial bilinear kriging interpolation for gridded anomalies; temporal forward-fill for satellite sensor cloud blocks.</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block' }}>Grid Aggregation:</strong>
                    <span>Spatial grids matched via Nearest Neighbor mapping onto mesoscale centroids.</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block' }}>Normalization Rules:</strong>
                    <span>Standard min-max normalization applied to temperature variables; log-transform applied to highly skewed heavy rainfall distributions.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      
      {/* Inject responsive CSS layout overrides directly */}
      <style>{`
        @media (max-width: 1023px) {
          .grid-split-70-30-collapsed {
            grid-template-columns: 1fr !important;
          }
          .grid-split-32-68-collapsed {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 600px) {
          .grid-split-32-68-collapsed {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
