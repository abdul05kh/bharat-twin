'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  activeLayer: 'rainfall' | 'max_temperature' | 'min_temperature' | 'lst_temperature' | 'delta';
  deltaMode?: 'max_temp' | 'rainfall';
}

export default function ClimateMap({ cells, activeLayer, deltaMode = 'max_temp' }: ClimateMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

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

    // Dark styled map tiles (Scientific command center feel)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Add boundaries (Approx Hyderabad Box)
    const hydBoundary = [
      [17.10, 78.10],
      [17.65, 78.10],
      [17.65, 78.80],
      [17.10, 78.80]
    ];
    L.polygon(hydBoundary as L.LatLngExpression[], {
      color: '#1F2937',
      fillColor: 'transparent',
      weight: 1.5,
      dashArray: '5, 5'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Layers when cells or activeLayer changes
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Color Scales
    const getRainColor = (val: number) => {
      if (val === 0) return '#475569'; // slate grey
      if (val < 2.0) return '#38BDF8';  // Sky
      if (val < 5.0) return '#0284C7';  // Blue
      if (val < 10.0) return '#0369A1'; // Dark Blue
      return '#1E3A8A';                 // Navy
    };

    const getTempColor = (val: number) => {
      if (val < 24.0) return '#22C55E';  // Cool Green
      if (val < 30.0) return '#EAB308';  // Warm Yellow
      if (val < 35.0) return '#F97316';  // Orange
      return '#EF4444';                  // Critical Red
    };

    const getDeltaColor = (val: number, mode: 'max_temp' | 'rainfall') => {
      if (mode === 'max_temp') {
        if (val > 0) return '#EF4444'; // Hotter (Red)
        if (val < 0) return '#38BDF8'; // Cooler (Blue)
        return '#94A3B8';
      } else {
        if (val < 0) return '#F59E0B'; // Drier (Orange)
        if (val > 0) return '#22C55E'; // Wetter (Green)
        return '#94A3B8';
      }
    };

    cells.forEach((cell) => {
      let fillColor = '#94A3B8';
      const opacity = 0.5;
      let label = '';
      
      let radius = 13800; // 0.25° grid default (Rainfall)
      
      if (activeLayer === 'rainfall') {
        fillColor = getRainColor(cell.rainfall);
        label = `Rainfall: ${cell.rainfall.toFixed(2)} mm`;
        radius = 13800;
      } else if (activeLayer === 'max_temperature') {
        fillColor = getTempColor(cell.max_temperature);
        label = `Max Temp: ${cell.max_temperature.toFixed(1)} °C`;
        radius = 55000; // 1.0° native weather station temperature cell footprint
      } else if (activeLayer === 'min_temperature') {
        fillColor = getTempColor(cell.min_temperature);
        label = `Min Temp: ${cell.min_temperature.toFixed(1)} °C`;
        radius = 55000; // 1.0° native weather station temperature cell footprint
      } else if (activeLayer === 'lst_temperature') {
        const lst_val = (cell as unknown as { lst_temperature?: number }).lst_temperature ?? cell.max_temperature;
        fillColor = getTempColor(lst_val);
        label = `INSAT LST: ${lst_val.toFixed(1)} °C`;
        radius = 2200;  // ~0.04° native INSAT satellite pixel footprint
      } else if (activeLayer === 'delta') {
        if (deltaMode === 'max_temp') {
          const delta = cell.max_temp_delta ?? 0;
          fillColor = getDeltaColor(delta, 'max_temp');
          label = `Max Temp Delta: ${delta > 0 ? '+' : ''}${delta.toFixed(1)} °C`;
        } else {
          const delta = cell.rainfall_delta ?? 0;
          fillColor = getDeltaColor(delta, 'rainfall');
          label = `Rainfall Delta: ${delta > 0 ? '+' : ''}${delta.toFixed(2)} mm`;
        }
      }

      // Draw grid footprint at native resolution
      const circle = L.circle([cell.latitude, cell.longitude], {
        radius,
        fillColor,
        fillOpacity: opacity,
        color: '#1F2937',
        weight: 1
      });

      const tooltipContent = `
        <div style="font-family: Inter, sans-serif; font-size: 11px; color: #1E293B;">
          <strong>Coordinates:</strong> ${cell.latitude.toFixed(2)}°N, ${cell.longitude.toFixed(2)}°E<br/>
          <strong>${label}</strong><br/>
          <span style="color: #64748B;">Grid Cell: 0.25° × 0.25°</span>
        </div>
      `;
      circle.bindTooltip(tooltipContent, { permanent: false, direction: 'top' });
      circle.addTo(layerGroup);
    });
  }, [cells, activeLayer, deltaMode]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" style={{ minHeight: '400px' }} />;
}
