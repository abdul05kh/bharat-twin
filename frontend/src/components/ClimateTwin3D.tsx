'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface GridCell {
  latitude: number;
  longitude: number;
  rainfall: number;
  max_temperature: number;
  min_temperature: number;
  rainfall_delta?: number;
  max_temp_delta?: number;
}

interface ClimateTwin3DProps {
  cells: GridCell[];
  activeLayer: 'rainfall' | 'max_temperature' | 'min_temperature' | 'lst_temperature' | 'delta';
  deltaMode?: 'max_temp' | 'rainfall';
}

export default function ClimateTwin3D({ cells, activeLayer, deltaMode = 'max_temp' }: ClimateTwin3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP SCENE ---
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#040914'); // Dark government theme

    // Fog for depth
    scene.fog = new THREE.FogExp2('#040914', 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 100, 150);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight('#1d2a4a', 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#00f0ff', 2);
    dirLight.position.set(50, 150, 50);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight('#ff6600', 3, 200);
    pointLight.position.set(-50, 50, -50);
    scene.add(pointLight);

    // --- GRID BASE ---
    // Hyderabad bounding box approximate bounds
    const minLat = 17.10, maxLat = 17.65;
    const minLon = 78.10, maxLon = 78.80;

    const mapRange = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
      return ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    };

    // Draw cyber grid floor
    const gridHelper = new THREE.GridHelper(160, 40, '#00f0ff', '#102046');
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Bounding Box outline
    const boxGeo = new THREE.BoxGeometry(160, 2, 160);
    const boxMat = new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const boundingBoxMesh = new THREE.Mesh(boxGeo, boxMat);
    boundingBoxMesh.position.y = 0;
    scene.add(boundingBoxMesh);

    // --- DYNAMIC BARS FOR CELLS ---
    const barsGroup = new THREE.Group();
    scene.add(barsGroup);

    // Color Helpers
    const getRainColor = (val: number) => {
      if (val === 0) return '#475569';
      if (val < 2.0) return '#00f0ff';
      if (val < 5.0) return '#0066cc';
      return '#0000ff';
    };

    const getTempColor = (val: number) => {
      if (val < 24.0) return '#00ff66';
      if (val < 30.0) return '#ffcc00';
      if (val < 35.0) return '#ff6600';
      return '#ff3333';
    };

    const getDeltaColor = (val: number, mode: 'max_temp' | 'rainfall') => {
      if (mode === 'max_temp') {
        if (val > 0) return '#ff3333';
        if (val < 0) return '#00f0ff';
        return '#475569';
      } else {
        if (val < 0) return '#ff6600';
        if (val > 0) return '#00ff66';
        return '#475569';
      }
    };

    // Keep references to bars for animation/updates
    const bars: { mesh: THREE.Mesh; cell: GridCell }[] = [];

    const rebuildBars = () => {
      // Clear previous bars
      while (barsGroup.children.length > 0) {
        const obj = barsGroup.children[0];
        barsGroup.remove(obj);
      }
      bars.length = 0;

      cells.forEach((cell) => {
        // Map latitude and longitude to X, Z coordinates (-80 to +80 range)
        const x = mapRange(cell.longitude, minLon, maxLon, -70, 70);
        const z = mapRange(cell.latitude, minLat, maxLat, 70, -70); // invert Z for map orientation

        let value = 0;
        let colorStr = '#94a3b8';

        if (activeLayer === 'rainfall') {
          value = cell.rainfall;
          colorStr = getRainColor(value);
        } else if (activeLayer === 'max_temperature') {
          value = cell.max_temperature;
          colorStr = getTempColor(value);
        } else if (activeLayer === 'min_temperature') {
          value = cell.min_temperature;
          colorStr = getTempColor(value);
        } else if (activeLayer === 'lst_temperature') {
          value = (cell as any).lst_temperature ?? cell.max_temperature;
          colorStr = getTempColor(value);
        } else if (activeLayer === 'delta') {
          if (deltaMode === 'max_temp') {
            value = Math.abs(cell.max_temp_delta ?? 0) * 10; // Scale delta for visibility
            colorStr = getDeltaColor(cell.max_temp_delta ?? 0, 'max_temp');
          } else {
            value = Math.abs(cell.rainfall_delta ?? 0) * 10;
            colorStr = getDeltaColor(cell.rainfall_delta ?? 0, 'rainfall');
          }
        }

        // Set bar geometry
        // Height proportional to climate value
        const minHeight = 2;
        let barHeight = value;
        if (activeLayer.includes('temperature')) {
          // Normalize temperature between 15°C and 45°C
          barHeight = mapRange(value, 15, 45, 5, 40);
        } else if (activeLayer === 'rainfall') {
          barHeight = mapRange(value, 0, 30, 2, 45);
        }

        if (isNaN(barHeight) || barHeight < minHeight) barHeight = minHeight;

        // Use custom cylinder or box geometry for nice geospatial pixel look
        const barGeo = new THREE.BoxGeometry(8, barHeight, 8);
        
        // Material with slight emission/glow
        const barMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorStr),
          roughness: 0.2,
          metalness: 0.8,
          emissive: new THREE.Color(colorStr),
          emissiveIntensity: 0.15,
          transparent: true,
          opacity: 0.85
        });

        const mesh = new THREE.Mesh(barGeo, barMat);
        // Position mesh base on the grid floor
        mesh.position.set(x, barHeight / 2, z);
        
        barsGroup.add(mesh);
        bars.push({ mesh, cell });
      });
    };

    rebuildBars();

    // --- SATELLITE ORBIT ---
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // Orbit Ring
    const ringGeo = new THREE.RingGeometry(110, 110.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#ff6600', side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const orbitRing = new THREE.Mesh(ringGeo, ringMat);
    orbitRing.rotation.x = Math.PI / 2.3;
    orbitGroup.add(orbitRing);

    // Satellite Sphere
    const satGeo = new THREE.SphereGeometry(3, 16, 16);
    const satMat = new THREE.MeshStandardMaterial({ color: '#ff6600', emissive: '#ff6600', emissiveIntensity: 1 });
    const satellite = new THREE.Mesh(satGeo, satMat);
    orbitGroup.add(satellite);

    // Satellite Signal Cone (Radar Sweep)
    const coneGeo = new THREE.ConeGeometry(8, 120, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: '#ff6600', transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const radarCone = new THREE.Mesh(coneGeo, coneMat);
    radarCone.rotation.x = Math.PI;
    radarCone.position.y = -60;
    satellite.add(radarCone);

    // --- PARTICLES (WEATHER EFFECT) ---
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
      velocities.push(0.2 + Math.random() * 0.5); // Fall speed
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: activeLayer === 'rainfall' ? '#00f0ff' : '#ffaa44',
      size: 1.5,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- INTERACTION: CAMERA ORBIT & ZOOM CONTROL ---
    let theta = 0.5;
    let phi = 1.0;
    let radius = 170;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        // Raycasting for cell highlights
        const rect = renderer.domElement.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
        
        const intersects = raycaster.intersectObjects(barsGroup.children);
        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const hitIdx = barsGroup.children.indexOf(hitMesh);
          if (hitIdx !== -1 && bars[hitIdx]) {
            setHoveredCell(bars[hitIdx].cell);
            // Flash scale slightly on hover
            hitMesh.scale.set(1.1, 1.0, 1.1);
          }
        } else {
          barsGroup.children.forEach(child => child.scale.set(1, 1, 1));
          setHoveredCell(null);
        }
        return;
      }

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      theta -= deltaX * 0.007;
      phi -= deltaY * 0.007;

      // Restrict phi to avoid flipping camera at poles
      phi = Math.max(0.1, Math.min(Math.PI / 2.1, phi));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius += e.deltaY * 0.1;
      radius = Math.max(80, Math.min(300, radius));
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    let satAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Orbital camera calculation
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 10, 0);

      // Animate Satellite Orbit
      satAngle += 0.015;
      satellite.position.x = 110 * Math.cos(satAngle);
      satellite.position.z = 110 * Math.sin(satAngle);
      satellite.position.y = 15 * Math.sin(satAngle * 1.5);
      satellite.lookAt(0, 0, 0);

      // Animate Particles
      const posArr = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] -= velocities[i]; // move down
        if (posArr[i * 3 + 1] < 0) {
          posArr[i * 3 + 1] = 100; // reset to top
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // --- HANDLE RESIZE ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('wheel', handleWheel);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [cells, activeLayer, deltaMode]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
      
      {/* Visual Instruction Overlay */}
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', pointerEvents: 'none', background: 'rgba(5, 12, 30, 0.85)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '10px', color: 'var(--text-secondary)' }}>
        <div style={{ fontWeight: 600, color: 'var(--gov-cyan)', marginBottom: '2px' }}>3D Controls Active</div>
        <div>Drag Mouse: Rotate Scene | Scroll: Zoom | Hover: Inspect Grid Cell</div>
      </div>

      {/* Hovered Cell Detail HUD */}
      {hoveredCell && (
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(5, 12, 30, 0.9)', padding: '12px', borderRadius: '6px', border: '2px solid var(--gov-cyan)', minWidth: '180px', pointerEvents: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>3D Node Coordinates</div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'white', marginBottom: '8px', fontFamily: 'monospace' }}>
            {hoveredCell.latitude.toFixed(2)}°N, {hoveredCell.longitude.toFixed(2)}°E
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Max Temp:</span>
              <span style={{ fontWeight: 700, color: '#ff3333' }}>{hoveredCell.max_temperature.toFixed(1)} °C</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Min Temp:</span>
              <span style={{ fontWeight: 700, color: '#00f0ff' }}>{hoveredCell.min_temperature.toFixed(1)} °C</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rainfall:</span>
              <span style={{ fontWeight: 700, color: '#00ff66' }}>{hoveredCell.rainfall.toFixed(2)} mm</span>
            </div>
            {(hoveredCell as any).lst_temperature !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>INSAT LST:</span>
                <span style={{ fontWeight: 700, color: '#ff9900' }}>{(hoveredCell as any).lst_temperature.toFixed(1)} °C</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
