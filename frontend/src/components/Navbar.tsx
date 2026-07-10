'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Monitor, Settings2, BrainCircuit, FileText, Info, Menu, X, ShieldCheck } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Climate Twin', path: '/twin', icon: Monitor },
  { name: 'Scenario Sandbox', path: '/scenario-sandbox', icon: Settings2 },
  { name: 'Intelligence', path: '/analytics', icon: BrainCircuit },
  { name: 'Reports', path: '/briefing', icon: FileText },
  { name: 'Validation', path: '/scientific-validation', icon: ShieldCheck },
  { name: 'About', path: '/about', icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(prev => !prev);
  const closeMobile = () => setMobileOpen(false);

  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Branding */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'var(--primary)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '14px', color: '#FFFFFF',
            letterSpacing: '0.05em', flexShrink: 0,
          }}>BT</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.02em', color: 'var(--primary)' }}>
              BHARAT-TWIN
            </div>
            <div style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              Scenario Sandbox
            </div>
          </div>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          onClick={closeMobile}
          aria-label="Close navigation"
          style={{
            display: 'none', // shown via CSS on mobile
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted)',
            padding: '4px',
            borderRadius: '4px',
          }}
          className="mobile-close-btn"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }}>
        <div style={{ padding: '0 12px 10px', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Decision Platform
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={closeMobile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text)',
                  background: isActive ? 'var(--surface-alt)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  minHeight: '44px', // mobile tap target
                }}
              >
                <Icon size={16} style={{ flexShrink: 0, color: isActive ? 'var(--primary)' : 'var(--muted)' }} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Data Provenance Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
          Live Provenance Link
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
          {['IMD', 'INSAT', 'MOSDAC', 'NRSC'].map(src => (
            <span
              key={src}
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '9px',
                fontWeight: 700,
                background: 'var(--surface)',
                color: 'var(--primary)',
                border: '1px solid var(--border)'
              }}
            >
              {src}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '9px', color: 'var(--muted)', lineHeight: 1.4 }}>
          <div>Status: <span style={{ color: 'var(--success)', fontWeight: 600 }}>Sync Active</span></div>
          <div>Quality: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>99.8% (ISRO Std)</span></div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ─── MOBILE HAMBURGER BUTTON ─── */}
      <button
        className="mobile-menu-btn"
        onClick={toggleMobile}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
      >
        <Menu size={20} />
      </button>

      {/* ─── OVERLAY BACKDROP (mobile only) ─── */}
      <div
        className={`mobile-overlay${mobileOpen ? ' open' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* ─── SIDEBAR (desktop: always visible; mobile: slide-in drawer) ─── */}
      <aside
        className={`sidebar-desktop${mobileOpen ? ' open' : ''}`}
        style={{
          width: '240px',
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
          zIndex: 150,
          boxShadow: 'var(--shadow)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Inject mobile close button CSS */}
      <style>{`
        @media (max-width: 1023px) {
          .mobile-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
