import type { Metadata } from 'next';
import './globals.css';
import FirebaseInitializer from '@/components/FirebaseInitializer';

export const metadata: Metadata = {
  title: 'BHARAT-TWIN | Climate Decision Support Platform',
  description:
    'BHARAT-TWIN — AI-Powered Scalable Climate Digital Twin & Scenario Intelligence Platform. Spatial climate intelligence for forecasting, risk assessment, scenario planning, and decision support.',
  keywords: 'climate digital twin, IMD, INSAT, India climate, disaster management, ISRO, weather forecasting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ fontFamily: "'Inter', 'Source Sans Pro', 'Noto Sans', system-ui, sans-serif" }}>
        <FirebaseInitializer />
        {children}
      </body>
    </html>
  );
}
