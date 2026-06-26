'use client';

import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, RotateCcw, Calendar } from 'lucide-react';

interface GridCell {
  latitude: number;
  longitude: number;
  rainfall: number;
  max_temperature: number;
  min_temperature: number;
  rainfall_delta?: number;
  max_temp_delta?: number;
}

interface ClimateMapProps {
  cells: GridCell[];
  activeLayer: any;
  deltaMode?: 'max_temp' | 'rainfall';
}

export default function ClimateMap({ cells, activeLayer, deltaMode = 'max_temp' }: ClimateMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // ─── Playback Deck State ───
  const [timeStep, setTimeStep] = useState(0); // 0: Today, 1: +3d, 2: +7d, 3: +14d, 4: +30d
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stepsList = [
    { label: 'Today', offsetDays: 0 },
    { label: 'Day +3', offsetDays: 3 },
    { label: 'Day +7', offsetDays: 7 },
    { label: 'Day +14', offsetDays: 14 },
    { label: 'Day +30', offsetDays: 30 },
  ];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Hyderabad coordinates
    const map = L.map(mapContainerRef.current, {
      center: [17.3850, 78.4867],
      zoom: 10,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Light basemap tiles (sleek, high-contrast light theme)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Add boundaries (Hyderabad pilot perimeter)
    const hydBoundary = [
      [17.10, 78.10],
      [17.65, 78.10],
      [17.65, 78.80],
      [17.10, 78.80]
    ];
    L.polygon(hydBoundary as L.LatLngExpression[], {
      color: '#0B3D91',
      fillColor: 'transparent',
      weight: 1.5,
      dashArray: '4, 4'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;

    // Setup ResizeObserver to trigger map size recalculation on container size changes or orientation changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Autoplay loop sequencer
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setTimeStep(prev => (prev + 1) % 5);
      }, 1500); // 1.5s per frame
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying]);

  // Render Grid Footprint with Risk/Climate Propagation over Time
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Standard McKinsey-style palettes
    const getRainColor = (val: number) => {
      if (val === 0) return '#E5E7EB';
      if (val < 2.0) return '#93C5FD'; // Light blue
      if (val < 5.0) return '#3B82F6'; // Medium blue
      return '#1D4ED8';        // Deep blue
    };

    const getTempColor = (val: number) => {
      if (val < 26.0) return '#1E8E3E';  // Safe Green
      if (val < 32.0) return '#FFD600';  // Warning Yellow
      if (val < 38.0) return '#FF9100';  // High Orange
      return '#FF1744';                  // Critical Red
    };

    const getDeltaColor = (val: number, mode: 'max_temp' | 'rainfall') => {
      if (mode === 'max_temp') {
        if (val > 0) return '#FF1744';
        if (val < 0) return '#008CFF';
        return '#9CA3AF';
      } else {
        if (val < 0) return '#FF9100';
        if (val > 0) return '#1E8E3E';
        return '#9CA3AF';
      }
    };

    cells.forEach((cell) => {
      let fillColor = '#9CA3AF';
      const opacity = 0.55;
      let label = '';
      
      const layer = String(activeLayer).toLowerCase();

      // Center point of regional heatwave expansion
      const distance = Math.sqrt((cell.latitude - 17.385)**2 + (cell.longitude - 78.4867)**2);
      
      // Calculate dynamic propagation based on active timeStep (Risk Spread Simulation)
      let dynamicTemp = cell.max_temperature;
      let dynamicRain = cell.rainfall;
      let dynamicAQI = Math.round((cell.max_temperature * 3.5) + (cell.rainfall * -2));
      let dynamicStress = Math.round((cell.max_temperature * 2.0) + (cell.rainfall < 1.0 ? 20 : 0));

      if (layer.includes('temperature') || layer.includes('temp')) {
        // Heatwave propagates radially outward from the city center over time
        const multiplier = Math.max(0, 1 - distance * 1.5);
        const tempOffset = timeStep * 1.6 * multiplier;
        dynamicTemp += tempOffset;
        fillColor = getTempColor(dynamicTemp);
        label = `Max Temp: ${dynamicTemp.toFixed(1)} °C`;
      } 
      else if (layer.includes('rainfall')) {
        // Rainstorm cell sweeps from west to east
        const stormCenter = 78.2 + timeStep * 0.15;
        const stormSpread = 0.12;
        const rainSweep = Math.max(0, 12 * Math.exp(-Math.pow((cell.longitude - stormCenter) / stormSpread, 2)));
        dynamicRain = Math.max(0, cell.rainfall + rainSweep - timeStep * 0.4);
        fillColor = getRainColor(dynamicRain);
        label = `Rainfall: ${dynamicRain.toFixed(2)} mm`;
      } 
      else if (layer.includes('aqi')) {
        // Particulate pollution plume drifts along south-east direction
        const plumeCenterLat = 17.25 + timeStep * 0.05;
        const plumeCenterLon = 78.35 + timeStep * 0.08;
        const plumeDist = Math.sqrt((cell.latitude - plumeCenterLat)**2 + (cell.longitude - plumeCenterLon)**2);
        const plumeEffect = Math.max(0, 80 * Math.exp(-Math.pow(plumeDist / 0.15, 2)));
        dynamicAQI += Math.round(plumeEffect);
        fillColor = getTempColor(dynamicAQI);
        label = `AQI Index: ${dynamicAQI}`;
      } 
      else if (layer.includes('stress')) {
        // General resource stress crawls outward over time
        const stressOffset = timeStep * 7.5;
        dynamicStress = Math.min(99, dynamicStress + Math.round(stressOffset));
        fillColor = getTempColor(dynamicStress);
        label = `Resource Stress: ${dynamicStress}%`;
      } 
      else if (layer.includes('delta')) {
        if (deltaMode === 'max_temp') {
          const delta = (cell.max_temp_delta ?? 0) + timeStep * 0.4;
          fillColor = getDeltaColor(delta, 'max_temp');
          label = `Max Temp Delta: ${delta > 0 ? '+' : ''}${delta.toFixed(1)} °C`;
        } else {
          const delta = (cell.rainfall_delta ?? 0) - timeStep * 0.15;
          fillColor = getDeltaColor(delta, 'rainfall');
          label = `Rainfall Delta: ${delta > 0 ? '+' : ''}${delta.toFixed(2)} mm`;
        }
      }

      // Compute contiguous rectangular grid aligned bounds (0.25° grids = ~27.5 km)
      const halfSize = 0.125;
      const bounds: L.LatLngBoundsExpression = [
        [cell.latitude - halfSize, cell.longitude - halfSize],
        [cell.latitude + halfSize, cell.longitude + halfSize]
      ];

      // Render rectangular grid overlay (Windy/ArcGIS style grid)
      const rect = L.rectangle(bounds, {
        fillColor,
        fillOpacity: opacity,
        color: 'rgba(255, 255, 255, 0.4)',
        weight: 1
      });

      // Localized exposure calculations for Hover Intelligence Card
      const popExposed = Math.round((1.2 - distance) * 480000 + timeStep * 20000);
      const waterDeficit = Math.round(distance * 45000 + timeStep * 8500);

      const tooltipContent = `
        <div style="font-family: 'Inter', sans-serif; font-size: 11px; color: #111827; padding: 6px; width: 180px; line-height: 1.4;">
          <div style="font-weight: 800; color: #0B3D91; border-bottom: 1px solid #E5E7EB; padding-bottom: 3px; margin-bottom: 4px;">
            📍 Grid Cell [0.25° Res]
          </div>
          <strong>Coordinates:</strong> ${cell.latitude.toFixed(2)}° N, ${cell.longitude.toFixed(2)}° E<br/>
          <strong>${label}</strong><br/>
          <div style="margin-top: 4px; border-top: 1px solid #F3F4F6; padding-top: 4px; font-size: 9.5px; color: #4B5563;">
            • Exposed Pop: <strong>${popExposed.toLocaleString()}</strong><br/>
            • Water Deficit: <strong>${waterDeficit.toLocaleString()} m³</strong><br/>
            • 7-Day Trend: <strong>${timeStep > 0 ? '↗ Escalating' : '→ Stable'}</strong>
          </div>
        </div>
      `;

      rect.bindTooltip(tooltipContent, { permanent: false, direction: 'top', className: 'leaflet-tooltip-custom' });
      rect.addTo(layerGroup);
    });
  }, [cells, activeLayer, deltaMode, timeStep]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" style={{ minHeight: '400px', height: '100%' }} />

      {/* Windy-style Glassy Playback Deck Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 18px',
        width: '85%',
        maxWidth: '480px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 4px 24px rgba(11, 61, 145, 0.12)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
            <Calendar size={11} /> Scenario Timeline Playback
          </span>
          <span style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--muted)', fontFamily: 'monospace' }}>
            {stepsList[timeStep].label} (Forecast Envelopes)
          </span>
        </div>

        {/* Controls and Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Play/Pause Trigger with Telemetry */}
          <button 
            onClick={() => {
              console.log(`[TELEMETRY] Playback toggle clicked: ${!isPlaying ? 'PLAY' : 'PAUSE'}`);
              setIsPlaying(!isPlaying);
            }}
            style={{
              border: 'none', background: 'var(--primary)', color: 'white',
              width: '24px', height: '24px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(11,61,145,0.25)',
              transition: 'background 0.2s'
            }}
          >
            {isPlaying ? <Pause size={10} fill="white" /> : <Play size={10} fill="white" style={{ marginLeft: '1px' }} />}
          </button>

          {/* Timeline Slider */}
          <input 
            type="range" 
            min="0" 
            max="4" 
            value={timeStep} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              console.log(`[TELEMETRY] Timeline slider adjusted to step: ${val}`);
              setTimeStep(val);
              setIsPlaying(false);
            }}
            style={{
              flex: 1,
              height: '4px',
              background: 'var(--border)',
              borderRadius: '2px',
              outline: 'none',
              cursor: 'pointer',
              accentColor: 'var(--primary)'
            }}
          />

          {/* Reset button */}
          <button 
            onClick={() => {
              console.log('[TELEMETRY] Playback reset to Today');
              setTimeStep(0);
              setIsPlaying(false);
            }}
            style={{
              border: 'none', background: 'transparent', color: 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Reset Timeline"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
