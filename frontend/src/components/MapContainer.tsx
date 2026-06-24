'use client';

import React from 'react';
import dynamic from 'next/dynamic';

interface GridCell {
  latitude: number;
  longitude: number;
  rainfall: number;
  max_temperature: number;
  min_temperature: number;
  rainfall_delta?: number;
  max_temp_delta?: number;
}

interface MapContainerProps {
  cells: GridCell[];
  activeLayer: any; // Flexible type to support various layer structures across dashboard & twin pages
  deltaMode?: 'max_temp' | 'rainfall';
  viewMode?: '2d' | '3d';
  showBoundaries?: boolean;
  isSimulating?: boolean;
}

// Dynamically load ClimateMap with SSR disabled
const ClimateMap = dynamic(() => import('./ClimateMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F9FC', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div className="animate-spin" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent' }} />
        <p style={{ fontSize: '11px', fontWeight: 600 }}>Initializing Scientific Geospatial Grid Map...</p>
      </div>
    </div>
  )
});

// Dynamically load ClimateTwin3D with SSR disabled
const ClimateTwin3D = dynamic(() => import('./ClimateTwin3D'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F9FC', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div className="animate-spin" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent' }} />
        <p style={{ fontSize: '11px', fontWeight: 600 }}>Generating 3D Climate Digital Twin Space...</p>
      </div>
    </div>
  )
});

export default function MapContainer({ cells, activeLayer, deltaMode, viewMode = '2d', showBoundaries = true, isSimulating = false }: MapContainerProps) {
  if (viewMode === '3d') {
    // Map dashboard or console layer tags to matches expected by Three.js Twin
    let mappedLayer: 'temperature' | 'rainfall' | 'aqi' | 'stress' = 'temperature';
    if (activeLayer === 'rainfall') mappedLayer = 'rainfall';
    else if (activeLayer === 'aqi') mappedLayer = 'aqi';
    else if (activeLayer === 'stress') mappedLayer = 'stress';
    
    return <ClimateTwin3D cells={cells} activeLayer={mappedLayer} showBoundaries={showBoundaries} isSimulating={isSimulating} />;
  }
  
  // 2D Leaflet Map
  return <ClimateMap cells={cells} activeLayer={activeLayer} deltaMode={deltaMode} />;
}
