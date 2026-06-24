import type { Metadata } from 'next';
import './globals.css';
import FirebaseInitializer from '@/components/FirebaseInitializer';

export const metadata: Metadata = {
  title: 'BHARAT-TWIN | Climate Scenario Sandbox for Decision Makers',
  description:
    'BHARAT-TWIN — Climate Scenario Sandbox for Decision Makers. Simulate climate events, predict impacts, and generate executive actions before damage occurs.',
  keywords: 'climate digital twin, IMD, INSAT, India climate, disaster management, ISRO, weather forecasting, scenario planning, climate sandbox',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ fontFamily: "'Inter', 'Source Sans Pro', 'Noto Sans', system-ui, sans-serif", overflowX: 'hidden' }}>
        {/* Global Climate Mood Engine Ambient Overlays */}
        <div className="climate-ambient-overlay heatwave-overlay" />
        <div className="climate-ambient-overlay rainfall-overlay" />
        <div className="climate-ambient-overlay aqi-overlay" />
        <div className="climate-ambient-overlay water-overlay" />
        
        <FirebaseInitializer />
        {children}
      </body>
    </html>
  );
}
