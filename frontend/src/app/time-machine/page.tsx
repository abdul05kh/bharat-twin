'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyTimeMachineRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/scenario-sandbox');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F7F9FC',
      fontFamily: 'sans-serif',
      color: '#0B3D91'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', height: '40px', 
          borderRadius: '50%', border: '3px solid #0B3D91', 
          borderTopColor: 'transparent', margin: '0 auto 12px',
          animation: 'spin 1.0s linear infinite'
        }} />
        <h3 style={{ fontWeight: 600 }}>Redirecting to Climate Scenario Sandbox...</h3>
      </div>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
