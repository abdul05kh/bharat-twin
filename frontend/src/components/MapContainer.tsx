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
  activeLayer: 'rainfall' | 'max_temperature' | 'min_temperature' | 'lst_temperature' | 'delta';
  deltaMode?: 'max_temp' | 'rainfall';
  viewMode?: '2d' | '3d';
}

// Dynamically load ClimateMap with SSR disabled
const ClimateMap = dynamic(() => import('./ClimateMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#040914] border border-cyan-500/20 rounded-lg text-[#a5b8db]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-2 border-[#00f0ff] border-t-transparent animate-spin"></div>
        <p className="text-xs">Initializing Scientific Geospatial Grid Map...</p>
      </div>
    </div>
  )
});

// Dynamically load ClimateTwin3D with SSR disabled
const ClimateTwin3D = dynamic(() => import('./ClimateTwin3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#040914] border border-cyan-500/20 rounded-lg text-[#a5b8db]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-2 border-[#ff6600] border-t-transparent animate-spin"></div>
        <p className="text-xs">Generating 3D Climate Digital Twin Space...</p>
      </div>
    </div>
  )
});

export default function MapContainer({ cells, activeLayer, deltaMode, viewMode = '2d' }: MapContainerProps) {
  if (viewMode === '3d') {
    return <ClimateTwin3D cells={cells} activeLayer={activeLayer} deltaMode={deltaMode} />;
  }
  return <ClimateMap cells={cells} activeLayer={activeLayer} deltaMode={deltaMode} />;
}
