'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  X, 
  AlertTriangle,
  Sparkles,
  Layers,
  TrendingUp,
  DollarSign,
  TrendingDown
} from 'lucide-react';

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
  isSimulating?: boolean;
}

const districtPolygons = [
  { name: 'Medchal-Malkajgiri', center: [0, 45], id: 1, baseRisk: 45 },
  { name: 'Hyderabad Central', center: [0, 0], id: 2, baseRisk: 72 },
  { name: 'Rangareddy Sector', center: [0, -45], id: 3, baseRisk: 54 },
];

export default function ClimateTwin3D({ cells, activeLayer, showBoundaries, isSimulating = false }: ClimateTwin3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  // 3-Stage Storyboard Reveal State
  const [storyboardStage, setStoryboardStage] = useState<1 | 2 | 3>(1);

  // Simulation telemetry refs
  const isSimulatingRef = useRef(isSimulating);
  const shockwaveTimeRef = useRef(0);

  useEffect(() => {
    isSimulatingRef.current = isSimulating;
    if (isSimulating) {
      shockwaveTimeRef.current = 0;
    }
  }, [isSimulating]);
  
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

  // ─── Cinematic 5s Projection State ───
  const [isCinematic, setIsCinematic] = useState(false);
  const [cinematicPhase, setCinematicPhase] = useState<'none' | 'unmitigated' | 'mitigated'>('none');
  const isCinematicRef = useRef(false);
  const cinematicPhaseRef = useRef<'none' | 'unmitigated' | 'mitigated'>('none');

  useEffect(() => {
    isCinematicRef.current = isCinematic;
    cinematicPhaseRef.current = cinematicPhase;
  }, [isCinematic, cinematicPhase]);

  // ─── Holographic Side HUD State ───
  const [selectedDistrict, setSelectedDistrict] = useState<{
    name: string;
    temp: number;
    rain: number;
    risk: number;
    brief: string;
    directives: string[];
    whatIsHappening: string;
    whyItMatters: string;
    whatToDo: string;
    metrics: {
      noAction: {
        popExposed: string;
        waterDemand: string;
        cropLoss: string;
        powerDemand: string;
        healthRisk: string;
        economicLoss: string;
        recoveryTime: string;
        economicBreakdown: { agri: string; water: string; power: string; health: string };
      };
      ndmaDeployed: {
        popExposed: string;
        waterDemand: string;
        cropLoss: string;
        powerDemand: string;
        healthRisk: string;
        economicLoss: string;
        recoveryTime: string;
        savings: string;
      };
    };
  } | null>(null);

  // References for camera manipulation
  const cameraTargetRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.8,
    phi: 0.8,
    radius: 175
  });

  // Reset storyboard stage when a new district is focused or active layer changes
  useEffect(() => {
    setStoryboardStage(1);
  }, [activeLayer, selectedDistrict?.name]);

  // Autoplay loop sequencer
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setTimeStep(prev => (prev + 1) % 5);
      }, 1800); // 1.8s per frame
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying]);

  // Main Three.js Rendering Engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- SCENE SETUP ---
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F7F9FC'); // Sleek CartoDB Light color
    scene.fog = new THREE.FogExp2('#F7F9FC', 0.0032);

    // Camera perspective
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 1000);
    camera.position.set(0, 110, 175);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- LIGHTING (Sunlight Cycle & Sky Bounce) ---
    const ambientLight = new THREE.AmbientLight('#EBF1FA', 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#FFF9F0', 1.4); // High-fidelity warm sun
    sunLight.position.set(90, 140, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const skyBounceLight = new THREE.DirectionalLight('#008CFF', 0.4); // Volumetric sky fill
    skyBounceLight.position.set(-90, 40, -60);
    scene.add(skyBounceLight);

    // --- GEOSPATIAL PARAMETERS ---
    const minLat = 17.10, maxLat = 17.65;
    const minLon = 78.10, maxLon = 78.80;
    const size = 165;

    const mapRange = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
      return ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    };

    // Realistic Deccan Plateau DEM height generator
    const getTerrainHeight = (x: number, z: number) => {
      const freq1 = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 14.5; // Plateau base
      const freq2 = Math.cos(x * 0.06) * Math.sin(z * 0.06) * 4.5;   // Deccan hills
      const freq3 = Math.sin(x * 0.14) * Math.cos(z * 0.14) * 1.2;   // Local ridges
      const reservoirVal = -8.5 * Math.exp(-((x * x + z * z) / 3200)); // Osman Sagar Basin
      return freq1 + freq2 + freq3 + reservoirVal;
    };

    // --- ATMOSPHERE GLOW DOME (Holographic Envelope) ---
    const atmosGeo = new THREE.SphereGeometry(105, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: '#008CFF',
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    atmosMesh.rotateX(-Math.PI / 2);
    scene.add(atmosMesh);

    // --- TERRAIN MESH ---
    const segments = 100;
    const terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
    terrainGeo.rotateX(-Math.PI / 2);

    const vertices = terrainGeo.attributes.position;
    const colors = new Float32Array(vertices.count * 3);

    // Populate displacements
    for (let i = 0; i < vertices.count; i++) {
      const vx = vertices.getX(i);
      const vz = vertices.getZ(i);
      const vy = getTerrainHeight(vx, vz);
      vertices.setY(i, vy);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      roughness: 0.82,
      metalness: 0.06,
      vertexColors: true,
      flatShading: true,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);

    // --- HOLOGRAPHIC GRID FLOOR UNDERLAY ---
    const gridHelper = new THREE.GridHelper(size, 16, '#008CFF', 'rgba(0, 140, 255, 0.15)');
    gridHelper.position.y = -15;
    scene.add(gridHelper);

    // --- RESERVOIR WATER LAYER (Osman Sagar) ---
    const waterGeo = new THREE.PlaneGeometry(50, 50, 8, 8);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#0066CC',
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.9
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotateX(-Math.PI / 2);
    waterMesh.position.set(0, -3.4, 0); // Sits in basin
    scene.add(waterMesh);

    // --- VOLUMETRIC PUFFY CLOUDS GROUP ---
    const cloudsGroup = new THREE.Group();
    scene.add(cloudsGroup);

    const createCloudVolume = () => {
      const group = new THREE.Group();
      const numSpheres = 5 + Math.floor(Math.random() * 4);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.55,
        roughness: 0.95,
        flatShading: true
      });

      for (let i = 0; i < numSpheres; i++) {
        const radius = 3.5 + Math.random() * 3;
        const sphereGeo = new THREE.SphereGeometry(radius, 6, 6);
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        
        // Overlap offsets to form puffy shapes
        sphere.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 8
        );
        group.add(sphere);
      }
      return group;
    };

    // Spawn floating cloud structures
    const cloudsList: THREE.Group[] = [];
    for (let i = 0; i < 5; i++) {
      const cloud = createCloudVolume();
      cloud.position.set(
        (Math.random() - 0.5) * 110,
        28 + Math.random() * 6,
        (Math.random() - 0.5) * 110
      );
      cloudsGroup.add(cloud);
      cloudsList.push(cloud);
    }

    // --- AQI PARTICULATE HAZE SYSTEM ---
    const dustParticles = new THREE.Group();
    const dustCount = 45;
    const dustGeo = new THREE.SphereGeometry(1.0, 4, 4);
    const dustMat = new THREE.MeshBasicMaterial({
      color: '#9B59B6', // Atmospheric Purple Haze
      transparent: true,
      opacity: 0.22
    });
    for (let i = 0; i < dustCount; i++) {
      const dust = new THREE.Mesh(dustGeo, dustMat);
      dust.position.set(
        (Math.random() - 0.5) * 130,
        7 + Math.random() * 14,
        (Math.random() - 0.5) * 130
      );
      dustParticles.add(dust);
    }
    scene.add(dustParticles);

    // --- FALLING RAIN STREAKS & SPLASH RIPPLES ---
    const rainParticles = new THREE.Group();
    const rainCount = 100;
    const rainLines: THREE.Line[] = [];
    const rainMat = new THREE.LineBasicMaterial({
      color: '#00D2FF',
      transparent: true,
      opacity: 0.5
    });

    for (let i = 0; i < rainCount; i++) {
      const rx = (Math.random() - 0.5) * 140;
      const rz = (Math.random() - 0.5) * 140;
      const ry = 8 + Math.random() * 32;

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -2.2, 0) // rain streak length
      ]);
      const line = new THREE.Line(lineGeo, rainMat);
      line.position.set(rx, ry, rz);
      rainParticles.add(line);
      rainLines.push(line);
    }
    scene.add(rainParticles);

    // Concentric splash ripples on the water plane
    const ripplesGroup = new THREE.Group();
    scene.add(ripplesGroup);
    const rippleCount = 6;
    const ripplesList: { mesh: THREE.Mesh; scale: number; maxScale: number; speed: number }[] = [];

    const ringGeo = new THREE.RingGeometry(0.1, 1.8, 12);
    ringGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < rippleCount; i++) {
      const ripMat = new THREE.MeshBasicMaterial({
        color: '#33C2FF',
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ripMesh = new THREE.Mesh(ringGeo, ripMat);
      
      // Random co-locations on the water plane coordinates
      ripMesh.position.set(
        (Math.random() - 0.5) * 35,
        -3.35, // sits slightly above water mesh to avoid z-fighting
        (Math.random() - 0.5) * 35
      );
      ripplesGroup.add(ripMesh);
      ripplesList.push({
        mesh: ripMesh,
        scale: 0.1 + Math.random() * 0.8,
        maxScale: 1.5 + Math.random() * 1.0,
        speed: 0.8 + Math.random() * 0.7
      });
    }

    // --- DYNAMIC CLIMATE RISK DOMES & glowing BEACONS ---
    const riskDomesGroup = new THREE.Group();
    scene.add(riskDomesGroup);

    const domeDomes: { solid: THREE.Mesh; wire: THREE.Mesh; beacon: THREE.Mesh; distId: number }[] = [];

    const getRiskColor = (riskVal: number) => {
      if (riskVal >= 70) return new THREE.Color('#FF1744'); // Critical Red
      if (riskVal >= 52) return new THREE.Color('#FF9100'); // High Orange
      if (riskVal >= 42) return new THREE.Color('#FFD600'); // Moderate Yellow
      return new THREE.Color('#00E676'); // Low Green
    };

    districtPolygons.forEach(dist => {
      const dx = dist.center[0];
      const dz = dist.center[1];
      const dy = getTerrainHeight(dx, dz) - 0.5;

      const domeGroup = new THREE.Group();
      domeGroup.position.set(dx, dy, dz);

      // 1. Solid Translucent Hemisphere
      const domeGeo = new THREE.SphereGeometry(22, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshBasicMaterial({
        color: '#00E676',
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending
      });
      const solidDome = new THREE.Mesh(domeGeo, domeMat);
      solidDome.rotateX(-Math.PI / 2);
      domeGroup.add(solidDome);

      // 2. Glowing Digital Wireframe Envelope
      const wireMat = new THREE.MeshBasicMaterial({
        color: '#00E676',
        transparent: true,
        opacity: 0.32,
        wireframe: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const wireDome = new THREE.Mesh(domeGeo, wireMat);
      wireDome.rotateX(-Math.PI / 2);
      domeGroup.add(wireDome);

      // 3. Central Glowing Beacon (Indicator Pillar)
      const beaconGeo = new THREE.CylinderGeometry(1.2, 1.2, 32, 12, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: '#00E676',
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 16; // Centers vertical cylinder
      domeGroup.add(beacon);

      riskDomesGroup.add(domeGroup);
      domeDomes.push({
        solid: solidDome,
        wire: wireDome,
        beacon: beacon,
        distId: dist.id
      });
    });

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

    // Calculate vertex colors based on forecast progression (timeStep)
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

        if (isCinematicRef.current) {
          if (cinematicPhaseRef.current === 'unmitigated') {
            // Hot unmitigated future (magenta/red)
            targetCol = new THREE.Color('#FF1744').clone().lerp(new THREE.Color('#D50000'), vx / 100);
          } else {
            // Mitigated future (cool green/blue)
            targetCol = new THREE.Color('#00E676').clone().lerp(new THREE.Color('#008CFF'), vx / 100);
          }
        } else if (!nearestCell) {
          targetCol = baseColor;
        } else if (activeLayer === 'temperature') {
          // Heatwave anomaly expands over timeStep
          const distFromCenter = Math.sqrt(vx*vx + vz*vz);
          const expansionFactor = Math.max(0, 1 - (distFromCenter / 90));
          const waveSpread = timeStep * 1.5 * expansionFactor;
          const temp = (nearestCell.max_temperature || 32) + waveSpread;

          targetCol = interpolateColor(temp, 22, 43, [colorSuccess, colorWarning, colorCritical]);
        } else if (activeLayer === 'rainfall') {
          // Rainstorm cell sweeps across terrain
          const stormCenter = -60 + timeStep * 30;
          const stormSpread = 0.12;
          const rainSweep = Math.max(0, 12 * Math.exp(-Math.pow((nearestCell.longitude - stormCenter) / stormSpread, 2)));
          const rain = Math.max(0, nearestCell.rainfall + rainSweep - timeStep * 0.4);

          targetCol = interpolateColor(rain, 0, 12, [baseColor, colorAccent, colorPrimary]);
        } else if (activeLayer === 'aqi') {
          // Particulate plume drifts south-east
          const plumeCenterX = -30 + timeStep * 16;
          const plumeCenterZ = -30 + timeStep * 16;
          const distToPlume = Math.sqrt(Math.pow(vx - plumeCenterX, 2) + Math.pow(vz - plumeCenterZ, 2));
          const plumeVal = Math.max(0, 95 * Math.exp(-Math.pow(distToPlume / 24, 2)));
          const aqiVal = (nearestCell.max_temperature * 3.2) + plumeVal;

          targetCol = interpolateColor(aqiVal, 60, 160, [colorSuccess, colorWarning, colorCritical]);
        } else if (activeLayer === 'stress') {
          // General resource stress crawls outward over time
          const stressVal = (nearestCell.max_temperature * 1.8) + (timeStep * 6.8);
          targetCol = interpolateColor(stressVal, 50, 99, [colorPrimary, colorWarning, colorCritical]);
        }

        targetColors[i * 3] = targetCol.r;
        targetColors[i * 3 + 1] = targetCol.g;
        targetColors[i * 3 + 2] = targetCol.b;
      }
    };

    updateTargetColors();
    for (let i = 0; i < currentColors.length; i++) currentColors[i] = targetColors[i];
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

    // --- INTERACTIVE MOUSE CONTROLS (Camera & Raycasting) ---
    let theta = 0.8;
    let phi = 0.8;
    let radius = 175;
    
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

      // Raycaster for Hover Inspect HUD
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObject(terrainMesh);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        
        // Find nearest cell
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
        
        // Find containing district
        let containerName = 'Hyderabad Unmapped Bounds';
        for (const dist of districtPolygons) {
          const distFromCenter = Math.sqrt((point.x - dist.center[0])**2 + (point.z - dist.center[1])**2);
          if (distFromCenter < 35) {
            containerName = dist.name;
            break;
          }
        }

        if (nearest) {
          setHoveredInfo(
            `📍 ${containerName} HUD | ${nearest.latitude.toFixed(2)}°N, ${nearest.longitude.toFixed(2)}°E | Temp: ${nearest.max_temperature.toFixed(1)}°C | Rain: ${nearest.rainfall.toFixed(1)}mm`
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

        // Click District Domes → Cinematic Fly-to Sweeps & DECISION ENGINE HUD Launch
        const handleMouseClick = (e: MouseEvent) => {
          const rect = renderer.domElement.getBoundingClientRect();
          const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
          const intersects = raycaster.intersectObject(terrainMesh);
    
          if (intersects.length > 0) {
            const point = intersects[0].point;
            
            // Match clicked point to district center dome
            let clickedDist = districtPolygons[1]; // default center
            let minDist = Infinity;
            districtPolygons.forEach(dist => {
              const distVal = Math.sqrt((point.x - dist.center[0])**2 + (point.z - dist.center[1])**2);
              if (distVal < minDist) {
                minDist = distVal;
                clickedDist = dist;
              }
            });
    
            // Trigger Cinematic Fly-to sweeps
            console.log(`[TELEMETRY] Cinematic camera fly-to triggered: ${clickedDist.name}`);
            
            const angle = Math.atan2(clickedDist.center[0], clickedDist.center[1]);
            cameraTargetRef.current.theta = angle + 0.35; // orbit offset angle
            cameraTargetRef.current.phi = 0.52;          // lower dramatic pitch
            cameraTargetRef.current.radius = 90;         // zoom in closer
    
            // Compute local metrics in sync with the active timeStep
            const isHeat = activeLayer === 'temperature';
            const isRain = activeLayer === 'rainfall';
            
            const localTemp = 36.4 + (clickedDist.id * 1.1) + (isHeat ? timeStep * 1.5 : 0);
            const localRain = Math.max(0, 4.8 - (clickedDist.id * 1.4) + (isRain ? timeStep * 1.8 : 0));
            
            let localRisk = clickedDist.baseRisk + (timeStep * 4);
            if (isHeat && clickedDist.id === 2) localRisk += 12; // central heat island
            localRisk = Math.min(99, localRisk);
    
            // Pre-defined Decision Engine Comparative Metrics (Requirement 1 & 4)
            const allMetrics = {
              1: { // Medchal-Malkajgiri
                noAction: {
                  popExposed: '210,000+',
                  waterDemand: '+24%',
                  cropLoss: '-12%',
                  powerDemand: '+15%',
                  healthRisk: 'High (68/100)',
                  economicLoss: '₹14.5 Cr',
                  recoveryTime: '10 Days',
                  economicBreakdown: { agri: '₹5.2 Cr', water: '₹3.1 Cr', power: '₹4.2 Cr', health: '₹2.0 Cr' }
                },
                ndmaDeployed: {
                  popExposed: '45,000',
                  waterDemand: '+6%',
                  cropLoss: '-2%',
                  powerDemand: '+3%',
                  healthRisk: 'Low (18/100)',
                  economicLoss: '₹3.2 Cr',
                  recoveryTime: '2 Days',
                  savings: '₹11.3 Cr'
                }
              },
              2: { // Hyderabad Central
                noAction: {
                  popExposed: '482,000+',
                  waterDemand: '+35.2%',
                  cropLoss: '-18.0%',
                  powerDemand: '+22.0%',
                  healthRisk: 'Critical (82/100)',
                  economicLoss: '₹38.6 Cr',
                  recoveryTime: '18 Days',
                  economicBreakdown: { agri: '₹10.4 Cr', water: '₹8.5 Cr', power: '₹12.2 Cr', health: '₹7.5 Cr' }
                },
                ndmaDeployed: {
                  popExposed: '115,000',
                  waterDemand: '+8.5%',
                  cropLoss: '-3.2%',
                  powerDemand: '+4.8%',
                  healthRisk: 'Low (28/100)',
                  economicLoss: '₹7.8 Cr',
                  recoveryTime: '4 Days',
                  savings: '₹30.8 Cr'
                }
              },
              3: { // Rangareddy Sector
                noAction: {
                  popExposed: '310,000+',
                  waterDemand: '+28%',
                  cropLoss: '-14%',
                  powerDemand: '+18%',
                  healthRisk: 'High (72/100)',
                  economicLoss: '₹22.4 Cr',
                  recoveryTime: '14 Days',
                  economicBreakdown: { agri: '₹7.8 Cr', water: '₹4.5 Cr', power: '₹6.3 Cr', health: '₹3.8 Cr' }
                },
                ndmaDeployed: {
                  popExposed: '62,000',
                  waterDemand: '+7%',
                  cropLoss: '-2.5%',
                  powerDemand: '+4%',
                  healthRisk: 'Low (22/100)',
                  economicLoss: '₹4.9 Cr',
                  recoveryTime: '3 Days',
                  savings: '₹17.5 Cr'
                }
              }
            };
    
            const districtMetrics = allMetrics[clickedDist.id as 1 | 2 | 3] || allMetrics[2];
            setStoryboardStage(1); // Always reset to Stage 1 on select
    
            // Standard dynamic decision supporting summaries (answering What, Why, and Do)
            setSelectedDistrict({
              name: clickedDist.name,
              temp: localTemp,
              rain: localRain,
              risk: localRisk,
              brief: clickedDist.id === 1 
                ? 'Rolling topography exhibits accelerating soil moisture evaporation and agricultural deficits.'
                : clickedDist.id === 2 
                ? 'Urban core concrete absorption has heavily pronounced heat dome effects, triggering high risk grids.'
                : 'Reservoir pools are stable but showing signs of high municipal drawdowns.',
              directives: clickedDist.id === 2 
                ? ['Activate urban cooling centers', 'Ration reservoir drawdowns', 'Enforce power grid balancing'] 
                : ['Adjust micro-irrigation schedules', 'Pre-position water tankers', 'Monitor daily grid telemetry'],
              metrics: districtMetrics,
              whatIsHappening: isHeat 
                ? `Severe land surface thermal anomalies detected. Temperatures are pacing at ${localTemp.toFixed(1)}°C (Exceeding seasonal standard by +${(localTemp - 32).toFixed(1)}°C).`
                : isRain
                ? `Precipitation front is active. Rainfall of ${localRain.toFixed(1)} mm is recorded, indicating localized runoff risks.`
                : `Integrated climate stressors are elevating local vulnerability indexes to ${localRisk}%.`,
              whyItMatters: clickedDist.id === 2
                ? 'Critical Risk. High-density urban population exposure increases heatstroke hazards and municipal power grid transformer failure states.'
                : 'High Risk. Rapid agricultural soil moisture depletion threatens crop yields and village drinking reserves.',
              whatToDo: clickedDist.id === 2
                ? '⚠️ ACTION DIRECTIVE: Activate urban cooled centers, distribute hydration reserves, and enforce grid load-offsets.'
                : '✓ ACTION DIRECTIVE: Adjust regional micro-irrigation schedules and pre-position backup water tankers.'
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
      cameraTargetRef.current.radius = Math.max(45, Math.min(230, cameraTargetRef.current.radius));
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', handleMouseDown);
    canvasEl.addEventListener('click', handleMouseClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Cinematic Auto-Orbit (starts if idle for 7s)
      if (elapsedTime - lastInteractionTime > 7) {
        cameraTargetRef.current.theta += 0.03 * delta; // slow orbit sweep
        cameraTargetRef.current.radius = 135 + Math.sin(elapsedTime * 0.18) * 12; // gentle breathing zoom
      }

      // Smooth camera lerp transitions
      theta += (cameraTargetRef.current.theta - theta) * 0.08;
      phi += (cameraTargetRef.current.phi - phi) * 0.08;
      radius += (cameraTargetRef.current.radius - radius) * 0.08;

      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 5, 0);

      // Climate Shock Wave WebGL Animation
      if (isSimulatingRef.current) {
        shockwaveTimeRef.current += delta * 25.0; // propagation speed
        const t = shockwaveTimeRef.current;
        
        const posAttr = terrainGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const vx = posAttr.getX(i);
          const vz = posAttr.getZ(i);
          const dist = Math.sqrt(vx * vx + vz * vz);
          
          // An expanding shock wave ripple originating from Hyderabad Central [0, 0]
          const waveFront = dist - t;
          if (Math.abs(waveFront) < 12) {
            const ripple = Math.sin(waveFront * 0.5) * 5.0 * Math.exp(-dist * 0.015) * (1 - Math.min(1.0, t / 70));
            posAttr.setY(i, getTerrainHeight(vx, vz) + ripple);
            
            // Flash color red/orange as the wave passes
            const intensity = (12 - Math.abs(waveFront)) / 12;
            targetColors[i * 3] = 1.0;
            targetColors[i * 3 + 1] = 0.3 * (1.0 - intensity) + 0.9 * intensity;
            targetColors[i * 3 + 2] = 0.1;
          } else {
            // Restore normal height
            posAttr.setY(i, getTerrainHeight(vx, vz));
          }
        }
        posAttr.needsUpdate = true;
        terrainGeo.computeVertexNormals();
        
        // Contract reservoir water mesh in sync with the shockwave
        const waterScale = Math.max(0.2, 1.0 - (t / 60) * 0.75);
        waterMesh.scale.set(waterScale, 1, waterScale);
      }

      // Smooth terrain color interpolation (0.5s rate)
      const colorAttr = terrainGeo.attributes.color;
      const colorArr = colorAttr.array as Float32Array;
      const lerpSpeed = Math.min(1.0, delta * 2.0);

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

      // Volumetric Cloud drifting
      cloudsList.forEach((cloud, idx) => {
        cloud.position.x += 1.6 * delta * (1 + (idx % 2) * 0.4);
        cloud.rotation.y += 0.05 * delta;
        if (cloud.position.x > 85) {
          cloud.position.x = -85;
          cloud.position.z = (Math.random() - 0.5) * 110;
        }
      });

      // Particulate AQI dust plume animation
      if (activeLayer === 'aqi') {
        dustParticles.visible = true;
        dustParticles.children.forEach((dust, idx) => {
          dust.position.x += 2.2 * delta * Math.sin(elapsedTime * 0.45 + idx);
          dust.position.z += 2.2 * delta * Math.cos(elapsedTime * 0.45 + idx);
          dust.position.y = 6 + Math.abs(Math.sin(elapsedTime * 0.18 + idx)) * 14;
        });
      } else {
        dustParticles.visible = false;
      }

      // Falling Rain Streaks animation
      if (activeLayer === 'rainfall') {
        rainParticles.visible = true;
        rainLines.forEach(line => {
          line.position.y -= 26 * delta; // falling speed
          if (line.position.y < 2) {
            line.position.y = 35 + Math.random() * 8;
            line.position.x = (Math.random() - 0.5) * 130;
            line.position.z = (Math.random() - 0.5) * 130;
          }
        });

        // Splash ripples animation on the water plane
        ripplesGroup.visible = true;
        ripplesList.forEach(rip => {
          rip.scale += rip.speed * delta;
          rip.mesh.scale.set(rip.scale, 1, rip.scale);
          
          // Fade out as scale increases
          const ripMat = rip.mesh.material as THREE.MeshBasicMaterial;
          ripMat.opacity = Math.max(0, 0.65 * (1 - rip.scale / rip.maxScale));

          if (rip.scale >= rip.maxScale) {
            rip.scale = 0.1;
            rip.mesh.position.set(
              (Math.random() - 0.5) * 35,
              -3.35,
              (Math.random() - 0.5) * 35
            );
          }
        });
      } else {
        rainParticles.visible = false;
        ripplesGroup.visible = false;
      }

      // Reservoir Water plane contraction animation (Water Stress visual)
      let targetWaterScale = 1.0;
      if (isCinematicRef.current) {
        if (cinematicPhaseRef.current === 'unmitigated') {
          targetWaterScale = 0.2; // severe reservoir depletion
        } else {
          targetWaterScale = 1.25; // restored reservoir water
        }
      } else if (activeLayer === 'stress' || activeLayer === 'aqi') {
        targetWaterScale = 0.48; // reservoir contracts significantly during high stress
      }
      const scaleSpeed = 1.6 * delta;
      waterMesh.scale.x += (targetWaterScale - waterMesh.scale.x) * scaleSpeed;
      waterMesh.scale.y += (targetWaterScale - waterMesh.scale.y) * scaleSpeed;

      // Update Climate Risk Domes & glowing Beacons
      domeDomes.forEach(dome => {
        // Calculate risk dynamically
        const dist = districtPolygons[dome.distId - 1];
        let localRisk = dist.baseRisk + (timeStep * 4.5);
        if (activeLayer === 'temperature' && dist.id === 2) localRisk += 10;
        localRisk = Math.min(99, localRisk);

        let targetColor = getRiskColor(localRisk);
        let targetHeightScale = 0.4 + (localRisk / 100) * 1.2;

        if (isCinematicRef.current) {
          if (cinematicPhaseRef.current === 'unmitigated') {
            targetColor = new THREE.Color('#FF1744'); // critical red
            targetHeightScale = 2.0; // maximum beacon height
          } else {
            targetColor = new THREE.Color('#00E676'); // safe green
            targetHeightScale = 0.3; // low height
          }
        }
        
        // Dynamic Lerping for Domes & Beacons
        const solidMat = dome.solid.material as THREE.MeshBasicMaterial;
        solidMat.color.lerp(targetColor, 0.1);
        // Pulsate Solid Domes in opacity
        solidMat.opacity = isCinematicRef.current && cinematicPhaseRef.current === 'unmitigated'
          ? 0.32 + 0.15 * Math.sin(elapsedTime * 8.0) // double speed pulse
          : 0.13 + 0.08 * Math.sin(elapsedTime * 3.4 + dome.distId);

        const wireMat = dome.wire.material as THREE.MeshBasicMaterial;
        wireMat.color.lerp(targetColor, 0.1);
        // Pulsate Wire Domes in opacity
        wireMat.opacity = isCinematicRef.current && cinematicPhaseRef.current === 'unmitigated'
          ? 0.58 + 0.25 * Math.sin(elapsedTime * 8.0) // double speed pulse
          : 0.28 + 0.12 * Math.sin(elapsedTime * 3.4 + dome.distId);

        const beaconMat = dome.beacon.material as THREE.MeshBasicMaterial;
        beaconMat.color.lerp(targetColor, 0.1);
        beaconMat.opacity = 0.38 + 0.15 * Math.sin(elapsedTime * 3.4 + dome.distId);

        // Scale beacon height in sync with the risk index
        dome.beacon.scale.y += (targetHeightScale - dome.beacon.scale.y) * 0.1;
        dome.beacon.position.y = 16 * dome.beacon.scale.y;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Trigger target color updates when layer or timeStep shifts
    updateTargetColors();

    // Resize Handler
    const handleResize = () => {
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup Three.js memory allocations
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
  }, [cells, activeLayer, timeStep]);

  // Handle selected district updates when the timeStep changes
  useEffect(() => {
    if (selectedDistrict) {
      const dist = districtPolygons.find(d => d.name === selectedDistrict.name);
      if (dist) {
        const isHeat = activeLayer === 'temperature';
        const isRain = activeLayer === 'rainfall';
        
        const localTemp = 36.4 + (dist.id * 1.1) + (isHeat ? timeStep * 1.5 : 0);
        const localRain = Math.max(0, 4.8 - (dist.id * 1.4) + (isRain ? timeStep * 1.8 : 0));
        
        let localRisk = dist.baseRisk + (timeStep * 4.5);
        if (isHeat && dist.id === 2) localRisk += 12;
        localRisk = Math.min(99, localRisk);

        setSelectedDistrict(prev => prev ? {
          ...prev,
          temp: localTemp,
          rain: localRain,
          risk: localRisk,
          whatIsHappening: isHeat 
            ? `Severe land surface thermal anomalies detected. Temperatures are pacing at ${localTemp.toFixed(1)}°C (Exceeding seasonal standard by +${(localTemp - 32).toFixed(1)}°C).`
            : isRain
            ? `Precipitation front is active. Rainfall of ${localRain.toFixed(1)} mm is recorded, indicating localized runoff risks.`
            : `Integrated climate stressors are elevating local vulnerability indexes to ${localRisk}%.`,
        } : null);
      }
    }
  }, [timeStep, activeLayer]);

  // Cinematic 5-Second Projection Mode (Requirement 6)
  const runCinematicProjection = () => {
    console.log('[TELEMETRY] 5s Cinematic Future State Projection triggered');
    setIsCinematic(true);
    setCinematicPhase('unmitigated');
    setTimeStep(4); // Day +30 unmitigated forecast
    setIsPlaying(false);

    // T = 2.5s: Switch to Mitigated with NDMA Applied
    setTimeout(() => {
      setCinematicPhase('mitigated');
    }, 2500);

    // T = 5.0s: End projection and reset
    setTimeout(() => {
      setIsCinematic(false);
      setCinematicPhase('none');
      setTimeStep(0); // Today
    }, 5000);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#F7F9FC' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '430px' }} />
      
      {/* Cinematic Projection Overlay (Requirement 6) */}
      {isCinematic && (
        <div style={{
          position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
          padding: '8px 20px', borderRadius: '24px',
          background: cinematicPhase === 'unmitigated' ? 'rgba(255, 23, 68, 0.9)' : 'rgba(0, 230, 118, 0.9)',
          color: '#FFFFFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'background-color 0.3s ease'
        }}>
          <Sparkles size={13} className="animate-spin" />
          <span>
            {cinematicPhase === 'unmitigated' 
              ? '⚠️ UNMITIGATED FUTURE — ECONOMIC LOSS ESCALATING (₹38.6 Cr) — POPULATION EXPOSED: 482,000+'
              : '✓ NDMA INTERVENTION APPLIED — RISKS MITIGATED — ECONOMIC SAVINGS: ₹30.8 Cr (79% SAVED)'}
          </span>
        </div>
      )}

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
        <div>Drag: Orbit · Scroll: Zoom · Click Climate Dome: Focus inspect</div>
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

      {/* Futuristic Side-Docked Holographic HUD Panel & DECISION ENGINE */}
      {selectedDistrict && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          width: '375px', background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)', border: '2px solid var(--primary)',
          borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column',
          gap: '12px', boxShadow: '0 8px 32px rgba(11, 61, 145, 0.18)', zIndex: 10,
          maxHeight: '92%', overflowY: 'auto', fontFamily: "'Inter', sans-serif"
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Activity size={13} /> Decision Storyboard Node
            </span>
            <button 
              onClick={() => setSelectedDistrict(null)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
            >
              <X size={15} />
            </button>
          </div>

          {/* District Identifiers */}
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: '2px' }}>
              {selectedDistrict.name}
            </div>
            <span style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Telangana pilot sector • 0.25° grid bounds
            </span>
          </div>

          {/* Core Decision Impact Summary Card (Immediate Decision Value) */}
          <div style={{
            background: 'var(--surface-alt)',
            border: '1.5px solid var(--primary)',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <span style={{ fontSize: '8.5px', color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🎯 IMMEDIATE DECISION VALUE
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Citizens Affected</span>
                <strong style={{ color: 'var(--text)' }}>{selectedDistrict.metrics.noAction.popExposed}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Economic Loss</span>
                <strong style={{ color: 'var(--critical)', fontFamily: 'monospace' }}>{selectedDistrict.metrics.noAction.economicLoss}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Recovery Time</span>
                <strong style={{ color: 'var(--text)' }}>{selectedDistrict.metrics.noAction.recoveryTime}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: '8px', textTransform: 'uppercase' }}>Mitigated Savings</span>
                <strong style={{ color: 'var(--success)', fontFamily: 'monospace' }}>{selectedDistrict.metrics.ndmaDeployed.savings}</strong>
              </div>
            </div>
            <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ color: 'var(--primary)', display: 'block', fontSize: '8.5px', fontWeight: 800, textTransform: 'uppercase' }}>Recommended Action</span>
              <strong style={{ color: 'var(--primary)', fontSize: '11px', display: 'block', marginTop: '1px' }}>
                {selectedDistrict.directives[0] || 'Deploy municipal cooling and rationing assets'}
              </strong>
            </div>
          </div>

          {/* Animated 3-Stage Storyboard Navigation Breadcrumbs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px',
            background: 'var(--surface-alt)',
            padding: '4px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            {[
              { num: 1, label: '1. Current' },
              { num: 2, label: '2. Unmitigated' },
              { num: 3, label: '3. Mitigated' }
            ].map(stage => {
              const active = storyboardStage === stage.num;
              return (
                <button
                  key={stage.num}
                  onClick={() => setStoryboardStage(stage.num as 1 | 2 | 3)}
                  style={{
                    padding: '6px 2px',
                    fontSize: '10px',
                    fontWeight: active ? 800 : 500,
                    borderRadius: '4px',
                    border: 'none',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>

          {/* STAGE CONTENT REVEAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s ease' }}>
            
            {/* STAGE 1: Current Situation */}
            {storyboardStage === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  STAGE 1: CURRENT BASELINE SITUATION
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--surface-alt)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Temp (Forecast)</span>
                    <strong style={{ fontSize: '13.5px', color: 'var(--text)', fontFamily: 'monospace', display: 'block' }}>{selectedDistrict.temp.toFixed(1)} °C</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '8px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>Baseline Risk</span>
                    <strong style={{ fontSize: '13.5px', color: 'var(--risk-moderate)', fontFamily: 'monospace', display: 'block' }}>{selectedDistrict.risk - 10}%</strong>
                  </div>
                </div>

                <div style={{ background: 'rgba(11, 61, 145, 0.02)', border: '1px solid rgba(11, 61, 145, 0.08)', padding: '10px 12px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '8px', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                    What We Saw (Observed Signals)
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--text)', lineHeight: 1.4, margin: 0 }}>
                    {selectedDistrict.whatIsHappening}
                  </p>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '8px', color: 'var(--text)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                    Regional Description
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4, margin: 0 }}>
                    {selectedDistrict.brief} Baseline physical indicators are normal, but seasonal forecast models predict thermal accumulations.
                  </p>
                </div>

                <button
                  onClick={() => setStoryboardStage(2)}
                  style={{
                    width: '100%', padding: '10px', background: 'var(--primary)', color: 'white',
                    border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '11px',
                    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em',
                    boxShadow: '0 4px 10px rgba(11,61,145,0.12)'
                  }}
                >
                  Simulate Unmitigated Future (No Action) →
                </button>
              </div>
            )}

            {/* STAGE 2: If Nothing Changes */}
            {storyboardStage === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--risk-critical)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  STAGE 2: IF NOTHING CHANGES (UNMITIGATED)
                </span>

                {/* DIGITAL RISK INDEX EXPLAINED */}
                <div style={{
                  background: 'rgba(217, 48, 37, 0.03)',
                  border: '1.5px solid var(--risk-critical)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  boxShadow: '0 4px 15px rgba(217, 48, 37, 0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(217,48,37,0.15)', paddingBottom: '6px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--risk-critical)', textTransform: 'uppercase' }}>DIGITAL RISK INDEX</span>
                    <strong style={{ fontSize: '15px', fontFamily: 'monospace', color: 'var(--risk-critical)' }}>{selectedDistrict.risk} / 100</strong>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Risk Level:</span>
                      <strong style={{ color: 'var(--risk-critical)' }}>HIGH</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Population Exposed:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{selectedDistrict.metrics.noAction.popExposed}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Economic Exposure:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{selectedDistrict.metrics.noAction.economicLoss}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Expected Recovery Time:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{selectedDistrict.metrics.noAction.recoveryTime}</strong>
                    </div>
                  </div>

                  {/* Economic Exposure Calculation Chain */}
                  <div style={{ borderTop: '1px dashed rgba(217, 48, 37, 0.15)', marginTop: '6px', paddingTop: '6px', fontSize: '8.5px', color: 'var(--muted)' }}>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '2px', color: 'var(--critical)' }}>Economic Exposure Chain</span>
                    <span style={{ fontFamily: 'monospace', display: 'block', color: 'var(--text)', lineHeight: 1.2 }}>
                      Agri ({selectedDistrict.metrics.noAction.economicBreakdown.agri}) + 
                      Power ({selectedDistrict.metrics.noAction.economicBreakdown.power}) + 
                      Water ({selectedDistrict.metrics.noAction.economicBreakdown.water}) + 
                      Health ({selectedDistrict.metrics.noAction.economicBreakdown.health})
                    </span>
                  </div>
                </div>

                <div style={{ background: 'rgba(249, 171, 0, 0.03)', border: '1px solid rgba(249,171,0,0.2)', padding: '10px 12px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '8px', color: '#B78103', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                    Why It Matters (So-What Consequence)
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--text)', lineHeight: 1.4, margin: 0 }}>
                    {selectedDistrict.whyItMatters} Without early intervention, municipal power grids fail under peak cooling loads and reservoir depletion triggers drinking deficits.
                  </p>
                </div>

                <button
                  onClick={() => setStoryboardStage(3)}
                  style={{
                    width: '100%', padding: '10px', background: 'var(--accent)', color: 'white',
                    border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '11px',
                    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em',
                    boxShadow: '0 4px 10px rgba(0,140,255,0.15)'
                  }}
                >
                  Apply NDMA Response Assets →
                </button>
              </div>
            )}

            {/* STAGE 3: If Action Is Taken */}
            {storyboardStage === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '9.5px', color: 'var(--success)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  STAGE 3: IF ACTION IS TAKEN (MITIGATED)
                </span>

                {/* MITIGATED OUTCOMES CARD */}
                <div style={{
                  background: 'rgba(30, 142, 62, 0.03)',
                  border: '1.5px solid var(--success)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  boxShadow: '0 4px 15px rgba(30, 142, 62, 0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30,142,62,0.15)', paddingBottom: '6px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--success)', textTransform: 'uppercase' }}>NDMA DEPLOYED OUTCOMES</span>
                    <strong style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--success)' }}>78% RISK REDUCTION</strong>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '3px' }}>
                      <span style={{ color: 'var(--muted)' }}>Economic Loss:</span>
                      <strong style={{ color: 'var(--success)', fontFamily: 'monospace' }}>{selectedDistrict.metrics.ndmaDeployed.economicLoss} <span style={{ color: 'var(--muted)', textDecoration: 'line-through', fontWeight: 400, marginLeft: '4px' }}>{selectedDistrict.metrics.noAction.economicLoss}</span></strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '3px' }}>
                      <span style={{ color: 'var(--muted)' }}>Population Exposed:</span>
                      <strong style={{ color: 'var(--success)', fontFamily: 'monospace' }}>{selectedDistrict.metrics.ndmaDeployed.popExposed} <span style={{ color: 'var(--muted)', textDecoration: 'line-through', fontWeight: 400, marginLeft: '4px' }}>{selectedDistrict.metrics.noAction.popExposed}</span></strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.05)', paddingBottom: '3px' }}>
                      <span style={{ color: 'var(--muted)' }}>Expected Recovery:</span>
                      <strong style={{ color: 'var(--success)', fontFamily: 'monospace' }}>{selectedDistrict.metrics.ndmaDeployed.recoveryTime} <span style={{ color: 'var(--muted)', textDecoration: 'line-through', fontWeight: 400, marginLeft: '4px' }}>{selectedDistrict.metrics.noAction.recoveryTime}</span></strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--success)', paddingTop: '2px' }}>
                      <span>Net Municipal Savings:</span>
                      <span style={{ fontFamily: 'monospace' }}>{selectedDistrict.metrics.ndmaDeployed.savings}</span>
                    </div>
                  </div>
                </div>

                {/* Directives Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--surface-alt)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '8.5px', color: 'var(--primary)', fontWeight: 850, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    NDMA-Approved Directives
                  </span>
                  {selectedDistrict.directives.map((dir, i) => (
                    <div key={i} style={{ fontSize: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 900 }}>✓</span>
                      <span style={{ color: 'var(--text)' }}>{dir}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStoryboardStage(1)}
                  style={{
                    width: '100%', padding: '8px', background: 'transparent', color: 'var(--muted)',
                    border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 700, fontSize: '11px',
                    cursor: 'pointer', textTransform: 'uppercase'
                  }}
                >
                  ← Back to Current Situation
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Windy-style Glassy Playback Deck Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 14px',
        width: '270px',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        boxShadow: '0 4px 20px rgba(11, 61, 145, 0.08)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '8.5px', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px', textTransform: 'uppercase' }}>
            <Layers size={10} /> 3D Forecast Timeline
          </span>
          <span style={{ fontSize: '8.5px', fontWeight: 700, color: 'var(--muted)', fontFamily: 'monospace' }}>
            {stepsList[timeStep].label}
          </span>
        </div>

        {/* Controls, Slider and Cinematic trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => {
              console.log(`[TELEMETRY] 3D Playback toggle clicked: ${!isPlaying ? 'PLAY' : 'PAUSE'}`);
              setIsPlaying(!isPlaying);
            }}
            style={{
              border: 'none', background: 'var(--primary)', color: 'white',
              width: '20px', height: '20px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 4px rgba(11,61,145,0.2)',
              transition: 'background 0.2s'
            }}
          >
            {isPlaying ? <Pause size={8} fill="white" /> : <Play size={8} fill="white" style={{ marginLeft: '1px' }} />}
          </button>

          <input 
            type="range" 
            min="0" 
            max="4" 
            value={timeStep} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              console.log(`[TELEMETRY] 3D Timeline slider adjusted to step: ${val}`);
              setTimeStep(val);
              setIsPlaying(false);
            }}
            style={{
              flex: 1,
              height: '3px',
              background: 'var(--border)',
              borderRadius: '2px',
              outline: 'none',
              cursor: 'pointer',
              accentColor: 'var(--primary)'
            }}
          />

          <button 
            onClick={() => {
              console.log('[TELEMETRY] 3D Playback reset to Today');
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
            <RotateCcw size={10} />
          </button>

          <button 
            onClick={runCinematicProjection}
            disabled={isCinematic}
            style={{
              border: 'none', background: 'var(--accent)', color: 'white',
              padding: '2px 6px', borderRadius: '4px', fontSize: '8px', fontWeight: 800,
              cursor: isCinematic ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '2px',
              boxShadow: '0 2px 4px rgba(0,140,255,0.2)'
            }}
          >
            <Sparkles size={8} /> 5s Projection
          </button>
        </div>
      </div>

    </div>
  );
}
