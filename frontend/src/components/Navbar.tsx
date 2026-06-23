'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Monitor, Settings2, FileText, Info } from 'lucide-react';

// Simplified executive navigation (freeze-compliant)
const navSections = [
  {
    label: 'Primary',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Climate Twin', path: '/twin', icon: Monitor },
      { name: 'Scenarios', path: '/time-machine', icon: Settings2 },
      { name: 'Insights', path: '/insights', icon: FileText },
      { name: 'Reports', path: '/briefing', icon: FileText },
      { name: 'About', path: '/about', icon: Info },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '220px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        color: 'var(--text)',
        fontFamily: "'Inter', sans-serif",
        zIndex: 100,
        boxShadow: 'var(--shadow)'
      }}
    >
      {/* Branding */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)'
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
            <div style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.02em', color: 'var(--text)' }}>
              BHARAT-TWIN
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Climate Scenario Sandbox for Decision Makers
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {navSections.map((section) => (
          <div key={section.label} style={{ marginBottom: '6px' }}>
            <div style={{ padding: '8px 12px 6px', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link key={item.path} href={item.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', fontSize: '13px', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary)' : 'var(--text)', background: isActive ? 'var(--surface-alt)' : 'transparent', borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent', textDecoration: 'none', borderRadius: '4px', margin: '4px 8px' }}>
                  <Icon size={16} style={{ flexShrink: 0, color: isActive ? 'var(--primary)' : 'var(--muted)' }} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Data Badges Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>Data Sources</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['IMD', 'INSAT', 'MOSDAC', 'NRSC'].map(src => (
            <span key={src} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'var(--surface-alt)', color: 'var(--text)', border: '1px solid var(--border)' }}>{src}</span>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--muted)' }}>Hyderabad Metropolitan Region</div>
      </div>
    </aside>
  );
}
