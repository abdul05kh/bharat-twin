'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Monitor,
  TrendingUp,
  Settings2,
  BarChart2,
  FileText,
  ShieldAlert,
  Gauge,
  Info,
  Users,
  BookOpen,
  Home,
  Award,
  AlertTriangle,
  Layers,
} from 'lucide-react';

const navSections = [
  {
    label: 'Command Centre',
    items: [
      { name: 'Overview', path: '/', icon: Home },
      { name: 'Climate Operations Centre', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Climate Digital Twin Console', path: '/twin', icon: Monitor },
      { name: 'Hackathon Judge Mode', path: '/judge-mode', icon: Users },
    ],
  },
  {
    label: 'Intelligence Systems',
    items: [
      { name: 'Climate Intelligence Hub', path: '/analytics', icon: TrendingUp },
      { name: 'Climate Scenario Laboratory', path: '/time-machine', icon: Settings2 },
      { name: 'Impact Assessment Console', path: '/compare', icon: BarChart2 },
    ],
  },
  {
    label: 'Decision Systems',
    items: [
      { name: 'Decision Support Centre', path: '/decision-support', icon: ShieldAlert },
      { name: 'Decision Intelligence Engine', path: '/insights', icon: FileText },
      { name: 'Climate Risk Observatory', path: '/risk-index', icon: Gauge },
      { name: 'Executive Climate Briefing', path: '/briefing', icon: FileText },
    ],
  },
  {
    label: 'Operational Diagnostics',
    items: [
      { name: 'Data Health & Security', path: '/data-health', icon: ShieldAlert },
      { name: 'Data Provenance Registry', path: '/provenance', icon: BookOpen },
      { name: 'Platform Architecture', path: '/architecture', icon: Layers },
      { name: 'Innovation & Value Matrix', path: '/innovation', icon: Award },
      { name: 'Failure Simulation Lab', path: '/test-lab', icon: AlertTriangle },
    ],
  },
  {
    label: 'About Platform',
    items: [
      { name: 'Mission Directorate', path: '/about', icon: Info },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '240px',
        background: 'var(--gov-blue)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        color: 'white',
        fontFamily: "'Inter', sans-serif",
        zIndex: 100,
      }}
    >
      {/* Branding */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'var(--gov-saffron)',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '12px', color: 'var(--gov-blue)',
            letterSpacing: '0.05em', flexShrink: 0,
          }}>BT</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em', color: 'white' }}>
              BHARAT-TWIN
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Climate Digital Twin
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {navSections.map((section) => (
          <div key={section.label} style={{ marginBottom: '4px' }}>
            <div style={{
              padding: '8px 16px 4px',
              fontSize: '9px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                    background: isActive
                      ? 'rgba(255,153,51,0.18)'
                      : 'transparent',
                    borderLeft: isActive
                      ? '3px solid var(--gov-saffron)'
                      : '3px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    lineHeight: '1.2',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLElement).style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
                    }
                  }}
                >
                  <Icon size={13} style={{ flexShrink: 0 }} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Data Badges Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
          Data Sources
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {['IMD', 'INSAT', 'MOSDAC', 'NRSC'].map(src => (
            <span key={src} style={{
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '9px',
              fontWeight: 600,
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              letterSpacing: '0.06em',
            }}>{src}</span>
          ))}
        </div>
        <div style={{ marginTop: '8px', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
          Hyderabad Metropolitan Region
        </div>
      </div>
    </aside>
  );
}
