'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Activity, AlertTriangle, ShieldCheck, X } from 'lucide-react';

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
  activeLayer: 'temperature' | 'rainfall' | 'aqi' | 'stress';
  showBoundaries: boolean;
}

export default function ClimateTwin3D({ cells, activeLayer, showBoundaries }: ClimateTwin3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);
  
  // ─── Holographic Side HUD State ───
  const [selectedDistrict, setSelectedDistrict] = useState<{
    name: string;
    temp: number;
    rain: number;
    risk: number;
    brief: string;
    directives: string[];
  } | null>(null);

  // References for camera manipulation
  const cameraTargetRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.8,
    phi: 0.8,
    radius: 180
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- SCENE SETUP ---
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F7F9FC');
    // Volumetric high-quality height fog
    scene.fog = new THREE.FogExp2('#F7F9FC', 0.0035);

    // Camera perspective
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 1000);
    camera.position.set(0, 110, 180);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- LIGHTING (Sunlight Cycle & Bounce) ---
    const ambientLight = new THREE.AmbientLight('#FFFFFF', 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#FFF9E6', 1.3); // Warm sunlight
    sunLight.position.set(80, 130, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const atmosphericLight = new THREE.DirectionalLight('#008CFF', 0.35); // Soft sky bounce
    atmosphericLight.position.set(-80, 40, -50);
    scene.add(atmosphericLight);

    // --- TELANGANA DECCAN PLATEAU DEM TOPOGRAPHY ---
    const minLat = 17.10, maxLat = 17.65;
    const minLon = 78.10, maxLon = 78.80;
    const size = 170;

    const mapRange = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
      return ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    };

    // Realistic Deccan Plateau DEM Topography combining Perlin-like fractal frequencies
    const getTerrainHeight = (x: number, z: number) => {
      const freq1 = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 15; // broad plateau elevations
      const freq2 = Math.cos(x * 0.065) * Math.sin(z * 0.065) * 5; // rolling Deccan hills
      const freq3 = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 1.5; // localized ridges
      const reservoirBasin = -9 * Math.exp(-((x * x + z * z) / 3600)); // Osman Sagar valley depression
      return freq1 + freq2 + freq3 + reservoirBasin;
    };

    // --- TERRAIN MESH ---
    const segments = 100;
    const terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
    terrainGeo.rotateX(-Math.PI / 2);

    const vertices = terrainGeo.attributes.position;
    const colors = new Float32Array(vertices.count * 3);

    // Apply elevation displacements
    for (let i = 0; i < vertices.count; i++) {
      const vx = vertices.getX(i);
      const vz = vertices.getZ(i);
      const vy = getTerrainHeight(vx, vz);
      vertices.setY(i, vy);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.08,
      vertexColors: true,
      flatShading: true,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);

    // --- RESERVOIR WATER LAYER ( Osman Sagar Simulation ) ---
    const waterGeo = new THREE.PlaneGeometry(55, 55, 10, 10);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#008CFF',
      transparent: true,
      opacity: 0.65,
      roughness: 0.15,
      metalness: 0.85
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotateX(-Math.PI / 2);
    waterMesh.position.set(0, -3.2, 0); // sits in the reservoir basin depression
    scene.add(waterMesh);

    // --- VOLUMETRIC CLOUDS LAYER ---
    const cloudsGroup = new THREE.Group();
    const cloudGeo = new THREE.BoxGeometry(15, 4, 15);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.45,
      roughness: 0.9,
      flatShading: true
    });
    
    // Position floating clouds above terrain
    for (let i = 0; i < 6; i++) {
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set((Math.random() - 0.5) * 120, 25 + Math.random() * 8, (Math.random() - 0.5) * 120);
      cloudsGroup.add(cloud);
    }
    scene.add(cloudsGroup);

    // --- AQI PARTICULATE PLUME / DUST SYSTEM ---
    const dustParticles = new THREE.Group();
    const dustGeo = new THREE.SphereGeometry(1.2, 5, 5);
    const dustMat = new THREE.MeshBasicMaterial({
      color: '#8E44AD',
      transparent: true,
      opacity: 0.25
    });
    
    for (let i = 0; i < 40; i++) {
      const dust = new THREE.Mesh(dustGeo, dustMat);
      dust.position.set((Math.random() - 0.5) * 140, 6 + Math.random() * 15, (Math.random() - 0.5) * 140);
      dustParticles.add(dust);
    }
    scene.add(dustParticles);

    // --- RAIN PARTICLE OVERLAY ---
    const rainParticles = new THREE.Group();
    const rainCount = 120;
    const rainPointsGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i*3] = (Math.random() - 0.5) * 160;
      rainPos[i*3+1] = 10 + Math.random() * 40;
      rainPos[i*3+2] = (Math.random() - 0.5) * 160;
    }
    rainPointsGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainPointsMat = new THREE.PointsMaterial({
      color: '#00A86B',
      size: 0.75,
      transparent: true,
      opacity: 0.6
    });
    const rainSystem = new THREE.Points(rainPointsGeo, rainPointsMat);
    rainParticles.add(rainSystem);
    scene.add(rainParticles);

    // --- COLOR PALETTE DEFINITIONS (Light-first themes) ---
    const targetColors = new Float32Array(vertices.count * 3);
    const currentColors = new Float32Array(vertices.count * 3);

    const colorPrimary = new THREE.Color('#0B3D91');
    const colorAccent = new THREE.Color('#008CFF');
    const colorSuccess = new THREE.Color('#1E8E3E');
    const colorWarning = new THREE.Color('#F9AB00');
    const colorCritical = new THREE.Color('#D93025');
    const colorBg = new THREE.Color('#FFFFFF');

    const interpolateColor = (val: number, minVal: number, maxVal: number, scale: THREE.Color[]) => {
      const pct = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
      if (pct <= 0) return scale[0].clone();
      if (pct >= 1) return scale[scale.length - 1].clone();
      
      const idx = pct * (scale.length - 1);
      const lowIdx = Math.floor(idx);
      const highIdx = Math.ceil(idx);
      const subPct = idx - lowIdx;
      
      return scale[lowIdx].clone().lerp(scale[highIdx], subPct);
    };

    // Calculate vertex colors
    const updateTargetColors = () => {
      for (let i = 0; i < vertices.count; i++) {
        const vx = vertices.getX(i);
        const vz = vertices.getZ(i);

        let nearestCell = cells[0];
        let minDist = Infinity;
        cells.forEach(cell => {
          const cx = mapRange(cell.longitude, minLon, maxLon, -size / 2, size / 2);
          const cz = mapRange(cell.latitude, minLat, maxLat, size / 2, -size / 2);
          const dist = Math.pow(vx - cx, 2) + Math.pow(vz - cz, 2);
          if (dist < minDist) {
            minDist = dist;
            nearestCell = cell;
          }
        });

        let targetCol = new THREE.Color();
        const baseColor = colorBg.clone().lerp(colorPrimary, 0.05);

        if (!nearestCell) {
          targetCol = baseColor;
        } else if (activeLayer === 'temperature') {
          const temp = nearestCell.max_temperature || 30;
          targetCol = interpolateColor(temp, 22, 42, [colorSuccess, colorWarning, colorCritical]);
        } else if (activeLayer === 'rainfall') {
          const rain = nearestCell.rainfall || 0;
          targetCol = interpolateColor(rain, 0, 12, [baseColor, colorAccent, colorPrimary]);
        } else if (activeLayer === 'aqi') {
          const aqiVal = (nearestCell.max_temperature * 3.5) + (nearestCell.rainfall * -2);
          targetCol = interpolateColor(aqiVal, 60, 150, [colorSuccess, colorWarning, colorCritical]);
        } else if (activeLayer === 'stress') {
          const stressVal = (nearestCell.max_temperature * 2.0) + (nearestCell.rainfall < 1.0 ? 20 : 0);
          targetCol = interpolateColor(stressVal, 50, 95, [colorPrimary, colorWarning, colorCritical]);
        }

        targetColors[i * 3] = targetCol.r;
        targetColors[i * 3 + 1] = targetCol.g;
        targetColors[i * 3 + 2] = targetCol.b;
      }
    };

    updateTargetColors();
    for (let i = 0; i < currentColors.length; i++) currentColors[i] = targetColors[i];
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

    // --- EXTRUDED 3D GLASS DISTRICT BOUNDARY WALLS ---
    const boundariesGroup = new THREE.Group();
    scene.add(boundariesGroup);

    // Bounding polygons representing districts
    const districtPolygons = [
      { name: 'Medchal-Malkajgiri', points: [[-65, 30], [55, 30], [35, 75], [-55, 75], [-65, 30]], center: [0, 45], id: 1 },
      { name: 'Hyderabad Central', points: [[-25, -25], [25, -25], [25, 25], [-25, 25], [-25, -25]], center: [0, 0], id: 2 },
      { name: 'Rangareddy Sector', points: [[-70, -70], [70, -70], [70, -30], [-70, -30], [-70, -70]], center: [0, -45], id: 3 },
    ];

    districtPolygons.forEach(dist => {
      // 1. Render glowing wall lines
      const linePoints: THREE.Vector3[] = [];
      dist.points.forEach(([px, pz]) => {
        const py = getTerrainHeight(px, pz) + 0.8;
        linePoints.push(new THREE.Vector3(px, py, pz));
      });

      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: '#008CFF',
        linewidth: 3,
        transparent: true,
        opacity: 0.8
      });
      const line = new THREE.Line(lineGeo, lineMat);
      boundariesGroup.add(line);

      // 2. Render extruded glassy boundary walls
      dist.points.forEach((pt, idx) => {
        if (idx === dist.points.length - 1) return;
        const p1 = pt;
        const p2 = dist.points[idx+1];
        
        const y1_base = getTerrainHeight(p1[0], p1[1]);
        const y2_base = getTerrainHeight(p2[0], p2[1]);
        
        const wallHeight = 4.0; // Extrusion height
        
        // Wall segment geometry
        const wallGeo = new THREE.BufferGeometry();
        const wallVertices = new Float32Array([
          p1[0], y1_base, p1[1],
          p1[0], y1_base + wallHeight, p1[1],
          p2[0], y2_base + wallHeight, p2[1],
          
          p1[0], y1_base, p1[1],
          p2[0], y2_base + wallHeight, p2[1],
          p2[0], y2_base, p2[1],
        ]);
        wallGeo.setAttribute('position', new THREE.BufferAttribute(wallVertices, 3));
        const wallMat = new THREE.MeshBasicMaterial({
          color: '#008CFF',
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide
        });
        const wallMesh = new THREE.Mesh(wallGeo, wallMat);
        boundariesGroup.add(wallMesh);
      });
    });

    // --- INTERACTIVE SYSTEM CONTROLS (Cinematic Camera Lerps) ---
    let theta = 0.8;
    let phi = 0.8;
    let radius = 180;
    
    let isDragging = false;
    let lastInteractionTime = 0;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastInteractionTime = clock.getElapsedTime();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycaster for Hover District Inspect HUD
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObject(terrainMesh);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        
        // Find nearest coordinate cell
        let nearest = cells[0];
        let minDist = Infinity;
        cells.forEach(cell => {
          const cx = mapRange(cell.longitude, minLon, maxLon, -size / 2, size / 2);
          const cz = mapRange(cell.latitude, minLat, maxLat, size / 2, -size / 2);
          const dist = Math.pow(point.x - cx, 2) + Math.pow(point.z - cz, 2);
          if (dist < minDist) {
            minDist = dist;
            nearest = cell;
          }
        });
        
        // Find containing district polygon name
        let containerName = 'Hyderabad Unmapped Bounds';
        for (const dist of districtPolygons) {
          // Check if coordinate sits approximately in district radius
          const distFromCenter = Math.sqrt((point.x - dist.center[0])**2 + (point.z - dist.center[1])**2);
          if (distFromCenter < 35) {
            containerName = dist.name;
            break;
          }
        }

        if (nearest) {
          setHoveredInfo(
            `${containerName} HUD | ${nearest.latitude.toFixed(2)}°N, ${nearest.longitude.toFixed(2)}°E | Temp: ${nearest.max_temperature.toFixed(1)}°C | Rain: ${nearest.rainfall.toFixed(1)}mm`
          );
        }
      } else {
        setHoveredInfo(null);
      }

      if (!isDragging) return;
      lastInteractionTime = clock.getElapsedTime();

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cameraTargetRef.current.theta -= deltaX * 0.005;
      cameraTargetRef.current.phi -= deltaY * 0.005;
      cameraTargetRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2.2, cameraTargetRef.current.phi));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    // Raycaster for District Selection & Cinematic Fly-to Zoom
    const handleMouseClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObject(terrainMesh);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        
        // Match clicked point to district center
        let clickedDist = districtPolygons[1]; // default center
        let minDist = Infinity;
        districtPolygons.forEach(dist => {
          const distVal = Math.sqrt((point.x - dist.center[0])**2 + (point.z - dist.center[1])**2);
          if (distVal < minDist) {
            minDist = distVal;
            clickedDist = dist;
          }
        });

        // Trigger Cinematic Fly-to targeting selected district (WOW Moment #2)
        console.log(`[TELEMETRY] Cinematic camera fly-to triggered: ${clickedDist.name}`);
        
        // Calculate new camera angles targeting the clicked district
        const angle = Math.atan2(clickedDist.center[0], clickedDist.center[1]);
        cameraTargetRef.current.theta = angle + 0.4; // offset slightly for dramatic orbit view
        cameraTargetRef.current.phi = 0.55;          // lower pitch angle
        cameraTargetRef.current.radius = 95;        // zoom in closer

        // Formulate dynamic local summary for holographic HUD panel
        setSelectedDistrict({
          name: clickedDist.name,
          temp: 36.8 + (clickedDist.id * 1.2),
          rain: Math.max(0, 4.5 - (clickedDist.id * 1.5)),
          risk: clickedDist.id === 1 ? 58 : clickedDist.id === 2 ? 74 : 45,
          brief: clickedDist.id === 1 
            ? 'Rolling topography reports escalating water evaporation rates with high moisture deficits.'
            : clickedDist.id === 2 
            ? 'Urban heat island effects are heavily pronounced. Hydrological deficits exceeding standards.'
            : 'Slightly stable seasonal trends. Reservoir pools are stable but showing signs of high extraction.',
          directives: clickedDist.id === 1
            ? ['Adjust micro-irrigation frequencies', 'Deploy moisture sensors']
            : clickedDist.id === 2
            ? ['Open municipal cooling centers', 'Load-balance electricity grids', 'Ration water supply']
            : ['Synchronize grid telemetry logs', 'Pre-position emergency water backup']
        });
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      lastInteractionTime = clock.getElapsedTime();
      cameraTargetRef.current.radius += e.deltaY * 0.15;
      cameraTargetRef.current.radius = Math.max(50, Math.min(240, cameraTargetRef.current.radius));
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', handleMouseDown);
    canvasEl.addEventListener('click', handleMouseClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });

    // --- ANIMATION LOOP (0.5s lerp color, rain, cloud drifting, cinematic orbit) ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Cinematic Idle Auto-Orbit (if no user interaction for 6s)
      if (elapsedTime - lastInteractionTime > 6) {
        cameraTargetRef.current.theta += 0.035 * delta; // slow cinematic orbit rotation
        cameraTargetRef.current.radius = 140 + Math.sin(elapsedTime * 0.2) * 15; // slow zoom swell
      }

      // Camera smooth lerp zoom & orbit transition
      theta += (cameraTargetRef.current.theta - theta) * 0.08;
      phi += (cameraTargetRef.current.phi - phi) * 0.08;
      radius += (cameraTargetRef.current.radius - radius) * 0.08;

      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 4, 0);

      // Smooth color interpolation
      const colorAttr = terrainGeo.attributes.color;
      const colorArr = colorAttr.array as Float32Array;
      const lerpSpeed = Math.min(1.0, delta * 2.0); // 0.5s transition rate

      let colorUpdated = false;
      for (let i = 0; i < colorArr.length; i++) {
        const diff = targetColors[i] - colorArr[i];
        if (Math.abs(diff) > 0.001) {
          colorArr[i] += diff * lerpSpeed;
          colorUpdated = true;
        } else {
          colorArr[i] = targetColors[i];
        }
      }
      if (colorUpdated) colorAttr.needsUpdate = true;

      // Volumetric clouds drift
      cloudsGroup.children.forEach((cloud, idx) => {
        cloud.position.x += 1.5 * delta * (1 + (idx % 2));
        if (cloud.position.x > 85) cloud.position.x = -85;
      });

      // AQI Dust plume drift animation
      if (activeLayer === 'aqi') {
        dustParticles.visible = true;
        dustParticles.children.forEach((dust, idx) => {
          dust.position.x += 2 * delta * Math.sin(elapsedTime * 0.5 + idx);
          dust.position.z += 2 * delta * Math.cos(elapsedTime * 0.5 + idx);
          dust.position.y = 6 + Math.abs(Math.sin(elapsedTime * 0.2 + idx)) * 12;
        });
      } else {
        dustParticles.visible = false;
      }

      // Rainfall particles animation
      if (activeLayer === 'rainfall') {
        rainParticles.visible = true;
        const positions = rainSystem.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          positions[i*3+1] -= 25 * delta; // falling speed
          if (positions[i*3+1] < -3) {
            positions[i*3+1] = 40 + Math.random() * 10;
          }
        }
        rainSystem.geometry.attributes.position.needsUpdate = true;
      } else {
        rainParticles.visible = false;
      }

      // Reservoir Water plane contraction animation (Water Stress wow moment)
      let targetWaterScale = 1.0;
      if (activeLayer === 'stress' || activeLayer === 'aqi') {
        targetWaterScale = 0.45; // reservoir contracts significantly during high stress
      }
      const scaleSpeed = 1.5 * delta;
      waterMesh.scale.x += (targetWaterScale - waterMesh.scale.x) * scaleSpeed;
      waterMesh.scale.y += (targetWaterScale - waterMesh.scale.y) * scaleSpeed;

      // Layer Visibility Toggles
      boundariesGroup.visible = showBoundaries;

      renderer.render(scene, camera);
    };

    animate();

    // Trigger target color updates
    updateTargetColors();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('mousedown', handleMouseDown);
      canvasEl.removeEventListener('click', handleMouseClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('wheel', handleWheel);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [cells, activeLayer, showBoundaries]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#F7F9FC' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '420px' }} />
      
      {/* 3D Flight Controls HUD */}
      <div style={{ 
        position: 'absolute', bottom: '12px', left: '12px', 
        pointerEvents: 'none', background: 'rgba(255, 255, 255, 0.9)', 
        padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', 
        fontSize: '9.5px', color: 'var(--text)', boxShadow: 'var(--shadow)',
        zIndex: 5
      }}>
        <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          3D Digital Earth Flight Console
        </div>
        <div>Drag: Orbit · Scroll: Zoom · Click District: Fly-to Inspect</div>
      </div>

      {/* Hover Node Inspect HUD */}
      {hoveredInfo && (
        <div style={{ 
          position: 'absolute', top: '12px', left: '12px', 
          pointerEvents: 'none', background: 'rgba(11, 61, 145, 0.95)', 
          padding: '8px 14px', borderRadius: '6px', 
          fontSize: '11px', color: '#FFFFFF', fontWeight: 600, 
          boxShadow: 'var(--shadow)', fontFamily: 'monospace',
          zIndex: 5
        }}>
          {hoveredInfo}
        </div>
      )}

      {/* Futuristic Side-Docked Holographic HUD Panel */}
      {selectedDistrict && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          width: '280px', background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)', border: '2px solid var(--primary)',
          borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column',
          gap: '10px', boxShadow: '0 4px 30px rgba(11, 61, 145, 0.15)', zIndex: 10,
          animation: 'countUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
              <Activity size={13} /> Local District HUD
            </span>
            <button 
              onClick={() => setSelectedDistrict(null)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Body stats */}
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
              {selectedDistrict.name}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <div>
                <span style={{ fontSize: '8.5px', color: 'var(--muted)', textTransform: 'uppercase' }}>Forecast Temp</span>
                <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'monospace' }}>{selectedDistrict.temp.toFixed(1)} °C</div>
              </div>
              <div>
                <span style={{ fontSize: '8.5px', color: 'var(--muted)', textTransform: 'uppercase' }}>Risk Index</span>
                <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'monospace', color: selectedDistrict.risk > 60 ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
                  {selectedDistrict.risk}%
                </div>
              </div>
            </div>
          </div>

          {/* AI Assessment */}
          <div style={{ background: 'var(--surface-alt)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '8.5px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
              Local AI Assessment
            </span>
            <p style={{ fontSize: '10.5px', color: 'var(--text)', lineHeight: 1.3 }}>
              {selectedDistrict.brief}
            </p>
          </div>

          {/* NDMA Directives */}
          <div>
            <span style={{ fontSize: '8.5px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
              Local NDMA Action Directives
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {selectedDistrict.directives.map((dir, idx) => (
                <span key={idx} style={{ fontSize: '10px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={11} color="var(--success)" /> {dir}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
