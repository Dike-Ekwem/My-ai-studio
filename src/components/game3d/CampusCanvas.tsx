import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CampusPOI, CAMPUS_POIS, CampusPOI as POIType, CAMPUS_FILLER_BUILDINGS } from '../../data/campusLocations';
import { sounds } from '../../utils/audio';
import { MonopolyVariant, createMonopolyHead } from './monopolyFace';
import { Compass, Maximize2, Minimize2, Navigation } from 'lucide-react';
import { WorldEvolutionState } from '../../types/revolution';

export interface CampusRide {
  id?: string;
  destinationPOI: CampusPOI;
  fare: number;
  vehicleType: 'keke' | 'shuttle';
}

interface CampusCanvasProps {
  playerPosition: { x: number; y: number; z: number };
  onPositionChange: (pos: { x: number; y: number; z: number }) => void;
  onNearPOI: (poi: CampusPOI | null) => void;
  onTriggerPOI: (poi: CampusPOI) => void;
  isPaused: boolean;
  isRidingKeke?: boolean;
  timeOfDay: number; // in minutes (0 to 1440)
  activeRide?: CampusRide | null;
  onFinishRide?: () => void;
  onCurfewIntercept?: (officerName: string, location: string) => void;
  worldEvolution?: WorldEvolutionState;
}

export const CampusCanvas: React.FC<CampusCanvasProps> = ({
  playerPosition,
  onPositionChange,
  onNearPOI,
  onTriggerPOI,
  isPaused,
  isRidingKeke = false,
  timeOfDay,
  activeRide = null,
  onFinishRide,
  onCurfewIntercept,
  worldEvolution
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const worldEvolutionGroupRef = useRef<THREE.Group | null>(null);
  const evolutionCollidersRef = useRef<THREE.Box3[]>([]);

  // Synchronized Mutable Refs for High-Performance Animation Loop
  const posRef = useRef(playerPosition);
  posRef.current = playerPosition;

  const timeOfDayRef = useRef(timeOfDay);
  timeOfDayRef.current = timeOfDay;

  const onCurfewInterceptRef = useRef(onCurfewIntercept);
  onCurfewInterceptRef.current = onCurfewIntercept;

  const hasTriggeredCurfewRef = useRef<boolean>(false);

  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;

  const onNearPOIRef = useRef(onNearPOI);
  onNearPOIRef.current = onNearPOI;

  const onTriggerPOIRef = useRef(onTriggerPOI);
  onTriggerPOIRef.current = onTriggerPOI;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const isRidingKekeRef = useRef(isRidingKeke);
  isRidingKekeRef.current = isRidingKeke;

  const activeRideRef = useRef(activeRide);
  activeRideRef.current = activeRide;

  const onFinishRideRef = useRef(onFinishRide);
  onFinishRideRef.current = onFinishRide;

  const nearestPOIRef = useRef<CampusPOI | null>(null);

  // Three.js Core Handles
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerMeshRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Character Limb References for Procedural Walking Animations
  const leftLegRef = useRef<THREE.Mesh | null>(null);
  const rightLegRef = useRef<THREE.Mesh | null>(null);
  const leftArmRef = useRef<THREE.Mesh | null>(null);
  const rightArmRef = useRef<THREE.Mesh | null>(null);
  const torsoRef = useRef<THREE.Mesh | null>(null);
  const wasWalkingRef = useRef<boolean>(false);

  // Active Conveyance Ride State
  const rideVehicleMeshRef = useRef<THREE.Group | null>(null);
  const rideWaypointsRef = useRef<[number, number][]>([]);
  const rideCurrentIndexRef = useRef<number>(0);
  const isConveyingRef = useRef<boolean>(false);

  // World Simulation Collections
  const vehiclesRef = useRef<
    {
      mesh: THREE.Group;
      type: 'keke' | 'shuttle';
      speed: number;
      waypointIndex: number;
      waypoints: [number, number][];
      stopTimer: number;
    }[]
  >([]);

  const npcsRef = useRef<
    {
      mesh: THREE.Group;
      leftLeg: THREE.Mesh;
      rightLeg: THREE.Mesh;
      leftArm: THREE.Mesh;
      rightArm: THREE.Mesh;
      speed: number;
      waypoints: [number, number][];
      currentWaypoint: number;
      stuckTime: number;
      lastPos: THREE.Vector2;
    }[]
  >([]);

  const securityNpcsRef = useRef<
    {
      mesh: THREE.Group;
      leftLeg: THREE.Mesh;
      rightLeg: THREE.Mesh;
      spotlight: THREE.SpotLight;
      speed: number;
      waypoints: [number, number][];
      currentWaypoint: number;
      officerName: string;
      zoneName: string;
    }[]
  >([]);

  const floatingIndicatorsRef = useRef<{ mesh: THREE.Mesh; poi: CampusPOI; baseY: number }[]>([]);
  const collidersRef = useRef<THREE.Box3[]>([]);

  // Input State
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera Orbit Settings (Smooth, stable follow angle)
  const cameraAngle = useRef<{ theta: number; phi: number }>({
    theta: Math.PI,
    phi: 0.38
  });
  const cameraDistanceRef = useRef<number>(24);
  const [zoomLevel, setZoomLevel] = useState<number>(24);

  // Reset Camera to standard behind-character orientation
  const handleResetCamera = useCallback(() => {
    sounds.playClick();
    if (playerMeshRef.current) {
      cameraAngle.current.theta = playerMeshRef.current.rotation.y + Math.PI;
    } else {
      cameraAngle.current.theta = Math.PI;
    }
    cameraAngle.current.phi = 0.38;
    cameraDistanceRef.current = 24;
    setZoomLevel(24);
  }, []);

  const handleZoom = useCallback((delta: number) => {
    sounds.playClick();
    const newDist = Math.max(10, Math.min(65, cameraDistanceRef.current + delta));
    cameraDistanceRef.current = newDist;
    setZoomLevel(newDist);
  }, []);

  // -------------------------------------------------------------------------
  // PROCEDURAL CANVAS TEXTURE BUILDERS
  // -------------------------------------------------------------------------
  const createSignboardTexture = (text: string, subtitle: string): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Green Background with Gold Border
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    // University Seal Badge
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(48, 64, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FUO', 48, 64);

    // Title
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(text.slice(0, 28), 96, 50);

    // Subtitle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(subtitle.slice(0, 38), 96, 85);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const createIndicatorTexture = (poi: CampusPOI): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 176, 28);
    ctx.fill();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(poi.category.toUpperCase(), 256, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(poi.label.slice(0, 24), 256, 96);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 26px sans-serif';
    const actionLabel =
      poi.interactionType === 'lecture' ? '[E] Enter Lecture Hall' :
      poi.interactionType === 'hostel' ? '[E] Enter Residence' :
      poi.interactionType === 'shop' ? '[E] Enter Supermarket' :
      poi.interactionType === 'food_joint' ? '[E] Enter Food Eatery' :
      poi.interactionType === 'service' ? '[E] Enter Service Shop' :
      poi.interactionType === 'football' ? '[E] Enter Stadium Pitch' :
      poi.interactionType === 'basketball' ? '[E] Enter Basketball Arena' :
      poi.interactionType === 'keke' ? '[E] Board Keke / Shuttle' :
      poi.interactionType === 'clinic' ? '[E] Enter Health Centre' :
      poi.interactionType === 'sug' ? '[E] Enter SUG Secretariat' :
      poi.interactionType === 'admin' ? '[E] Enter Administrative Chamber' :
      '[E] Enter Building';

    ctx.fillText(actionLabel, 256, 148);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  // -------------------------------------------------------------------------
  // BATCH 1: MATHEMATICALLY EXACT SYMMETRICAL ROOF GEOMETRY GENERATORS
  // -------------------------------------------------------------------------
  const createGableRoofGeometry = (
    gw: number,
    gd: number,
    roofHeight: number,
    eaveX = 0.8,
    eaveZ = 0.6
  ): THREE.BufferGeometry => {
    const hw = gw / 2 + eaveX;
    const hd = gd / 2 + eaveZ;
    const geom = new THREE.BufferGeometry();

    const positions: number[] = [
      // Left Slope (2 triangles)
      0, roofHeight, hd,    -hw, 0, hd,    -hw, 0, -hd,
      0, roofHeight, hd,    -hw, 0, -hd,    0, roofHeight, -hd,

      // Right Slope (2 triangles)
      0, roofHeight, hd,     0, roofHeight, -hd,    hw, 0, -hd,
      0, roofHeight, hd,     hw, 0, -hd,            hw, 0, hd,

      // Front Gable Triangle
      0, roofHeight, hd,    -hw, 0, hd,     hw, 0, hd,

      // Back Gable Triangle
      0, roofHeight, -hd,    hw, 0, -hd,   -hw, 0, -hd,

      // Bottom Soffit Closure (2 triangles)
      -hw, 0, hd,    hw, 0, hd,     hw, 0, -hd,
      -hw, 0, hd,    hw, 0, -hd,   -hw, 0, -hd
    ];

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.computeVertexNormals();
    return geom;
  };

  const createHippedRoofGeometry = (
    gw: number,
    gd: number,
    roofHeight: number,
    eave = 0.8
  ): THREE.BufferGeometry => {
    const hw = gw / 2 + eave;
    const hd = gd / 2 + eave;
    const geom = new THREE.BufferGeometry();

    const isDepthLonger = gd >= gw;
    const ridgeLen = Math.max(1.5, isDepthLonger ? (hd - hw) * 1.5 : (hw - hd) * 1.5);
    const hr = ridgeLen / 2;

    const positions: number[] = [];

    if (isDepthLonger) {
      const pF: [number, number, number] = [0, roofHeight, hr];
      const pB: [number, number, number] = [0, roofHeight, -hr];
      const cLF: [number, number, number] = [-hw, 0, hd];
      const cRF: [number, number, number] = [hw, 0, hd];
      const cLB: [number, number, number] = [-hw, 0, -hd];
      const cRB: [number, number, number] = [hw, 0, -hd];

      // Front Triangle
      positions.push(...pF, ...cLF, ...cRF);
      // Back Triangle
      positions.push(...pB, ...cRB, ...cLB);
      // Left Slope (Trapezoid)
      positions.push(...pF, ...pB, ...cLB);
      positions.push(...pF, ...cLB, ...cLF);
      // Right Slope (Trapezoid)
      positions.push(...pF, ...cRF, ...cRB);
      positions.push(...pF, ...cRB, ...pB);
      // Bottom Soffit
      positions.push(...cLF, ...cRF, ...cRB);
      positions.push(...cLF, ...cRB, ...cLB);
    } else {
      const pL: [number, number, number] = [-hr, roofHeight, 0];
      const pR: [number, number, number] = [hr, roofHeight, 0];
      const cLF: [number, number, number] = [-hw, 0, hd];
      const cRF: [number, number, number] = [hw, 0, hd];
      const cLB: [number, number, number] = [-hw, 0, -hd];
      const cRB: [number, number, number] = [hw, 0, -hd];

      // Left Triangle
      positions.push(...pL, ...cLB, ...cLF);
      // Right Triangle
      positions.push(...pR, ...cRF, ...cRB);
      // Front Slope
      positions.push(...pL, ...cLF, ...cRF);
      positions.push(...pL, ...cRF, ...pR);
      // Back Slope
      positions.push(...pR, ...cRB, ...cLB);
      positions.push(...pR, ...cLB, ...pL);
      // Bottom Soffit
      positions.push(...cLF, ...cRF, ...cRB);
      positions.push(...cLF, ...cRB, ...cLB);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.computeVertexNormals();
    return geom;
  };

  const createPyramidalRoofGeometry = (
    gw: number,
    gd: number,
    roofHeight: number,
    eave = 0.8
  ): THREE.BufferGeometry => {
    const hw = gw / 2 + eave;
    const hd = gd / 2 + eave;
    const geom = new THREE.BufferGeometry();

    const apex: [number, number, number] = [0, roofHeight, 0];
    const cLF: [number, number, number] = [-hw, 0, hd];
    const cRF: [number, number, number] = [hw, 0, hd];
    const cRB: [number, number, number] = [hw, 0, -hd];
    const cLB: [number, number, number] = [-hw, 0, -hd];

    const positions: number[] = [
      ...apex, ...cLF, ...cRF,
      ...apex, ...cRF, ...cRB,
      ...apex, ...cRB, ...cLB,
      ...apex, ...cLB, ...cLF,
      ...cLF, ...cRF, ...cRB,
      ...cLF, ...cRB, ...cLB
    ];

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.computeVertexNormals();
    return geom;
  };

  // Helper: Build Keke Vehicle
  const createKekeVehicle = (yellowColor = '#facc15'): THREE.Group => {
    const keke = new THREE.Group();
    const cabinMat = new THREE.MeshLambertMaterial({ color: yellowColor });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.5, 1.5), cabinMat);
    cabin.position.set(0.1, 1.05, 0);
    cabin.castShadow = true;
    keke.add(cabin);

    const windshieldFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.0, 1.3),
      new THREE.MeshLambertMaterial({ color: '#171717' })
    );
    windshieldFrame.position.set(1.0, 1.7, 0);
    keke.add(windshieldFrame);

    const tireMat = new THREE.MeshLambertMaterial({ color: '#171717' });
    const wheelF = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12), tireMat);
    wheelF.rotation.z = Math.PI / 2;
    wheelF.position.set(1.2, 0.35, 0);
    keke.add(wheelF);

    [-0.75, 0.75].forEach((wz) => {
      const wheelR = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.2, 12), tireMat);
      wheelR.rotation.z = Math.PI / 2;
      wheelR.position.set(-0.85, 0.38, wz);
      keke.add(wheelR);
    });

    return keke;
  };

  // Helper: Build University Shuttle Bus
  const createShuttleBus = (): THREE.Group => {
    const bus = new THREE.Group();
    const busMat = new THREE.MeshLambertMaterial({ color: '#047857' });
    const body = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2.3, 2.2), busMat);
    body.position.set(0, 1.6, 0);
    bus.add(body);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(5.9, 0.3, 2.25),
      new THREE.MeshLambertMaterial({ color: '#f8fafc' })
    );
    roof.position.set(0, 2.8, 0);
    bus.add(roof);

    const tireMat = new THREE.MeshLambertMaterial({ color: '#171717' });
    [[-1.8, -1.05], [-1.8, 1.05], [1.8, -1.05], [1.8, 1.05]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 14), tireMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.45, wz);
      bus.add(wheel);
    });

    return bus;
  };

  // Helper: Create Student NPC Model with Monopoly Guy Face and Diverse Melanin Tones
  const createNPCStudent = (shirtColor: string, pantsColor: string, variant: MonopolyVariant, skinColor?: string) => {
    const npcGroup = new THREE.Group();
    const legMat = new THREE.MeshLambertMaterial({ color: pantsColor });

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), legMat);
    legL.position.set(-0.24, 0.48, 0);
    npcGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), legMat);
    legR.position.set(0.24, 0.48, 0);
    npcGroup.add(legR);

    const armMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.85, 0.22), armMat);
    armL.position.set(-0.52, 1.42, 0);
    npcGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.85, 0.22), armMat);
    armR.position.set(0.52, 1.42, 0);
    npcGroup.add(armR);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.45), armMat);
    torso.position.y = 1.45;
    npcGroup.add(torso);

    const head = createMonopolyHead(variant, skinColor);
    head.position.y = 2.25;
    npcGroup.add(head);

    return { group: npcGroup, legL, legR, armL, armR };
  };

  // Helper: Create Campus Security Patrol Officer with Reflective Vest & Flashlight
  const createNPCSecurity = (officerName: string) => {
    const guardGroup = new THREE.Group();
    const pantsMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.3), pantsMat);
    legL.position.set(-0.25, 0.48, 0);
    guardGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.3), pantsMat);
    legR.position.set(0.25, 0.48, 0);
    guardGroup.add(legR);

    // Neon Reflective Safety Vest
    const vestMat = new THREE.MeshLambertMaterial({ color: '#84cc16' });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.15, 0.48), vestMat);
    torso.position.y = 1.48;
    guardGroup.add(torso);

    // Silver Reflective Stripes
    const stripeMat = new THREE.MeshBasicMaterial({ color: '#f8fafc' });
    const stripeH = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.12, 0.49), stripeMat);
    stripeH.position.y = 1.45;
    guardGroup.add(stripeH);

    // Gold Security Shield Badge
    const badgeMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.04), badgeMat);
    badge.position.set(-0.22, 1.68, 0.25);
    guardGroup.add(badge);

    // Arms
    const armMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), armMat);
    armL.position.set(-0.54, 1.42, 0);
    guardGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), armMat);
    armR.position.set(0.54, 1.42, 0);
    guardGroup.add(armR);

    // Head with Peaked Cap
    const head = createMonopolyHead('npc_walrus');
    head.position.y = 2.28;

    const capMat = new THREE.MeshLambertMaterial({ color: '#020617' });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.45, 0.16, 16), capMat);
    cap.position.y = 0.5;
    head.add(cap);
    guardGroup.add(head);

    // Flashlight & Beam
    const flashlightGroup = new THREE.Group();
    flashlightGroup.position.set(0.52, 1.15, 0.35);

    const torchBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.05, 0.32, 12),
      new THREE.MeshLambertMaterial({ color: '#171717' })
    );
    torchBody.rotation.x = Math.PI / 2;
    flashlightGroup.add(torchBody);

    const torchLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.06, 0.04, 12),
      new THREE.MeshBasicMaterial({ color: '#fef08a' })
    );
    torchLens.position.z = 0.16;
    torchLens.rotation.x = Math.PI / 2;
    flashlightGroup.add(torchLens);

    // Forward Spotlight Conical Beam
    const spotlight = new THREE.SpotLight('#fef08a', 0, 30, Math.PI / 5, 0.5, 1.2);
    spotlight.position.set(0, 0, 0.2);
    spotlight.target.position.set(0, -0.8, 10);
    flashlightGroup.add(spotlight);
    flashlightGroup.add(spotlight.target);

    guardGroup.add(flashlightGroup);

    return { group: guardGroup, legL, legR, spotlight };
  };

  // -------------------------------------------------------------------------
  // HELPER: BUILD LARGE MASCOT STATUE (Monopoly-style gentleman in suit & top hat)
  // -------------------------------------------------------------------------
  const createMascotStatue = (x: number, z: number, rotationY = 0, plaqueTitle = 'FUO INSTITUTIONAL MASCOT'): THREE.Group => {
    const statueGroup = new THREE.Group();
    statueGroup.position.set(x, 0, z);
    statueGroup.rotation.y = rotationY;

    // 1. Ornate Multi-Tiered Stone Pedestal
    const stonePedestalMat = new THREE.MeshLambertMaterial({ color: '#334155' });
    const goldTrimMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
    const bronzeMat = new THREE.MeshLambertMaterial({ color: '#b45309' });

    const baseTier = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 2.4), stonePedestalMat);
    baseTier.position.y = 0.25;
    baseTier.castShadow = true;
    statueGroup.add(baseTier);

    const midTier = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 2.0), stonePedestalMat);
    midTier.position.y = 1.1;
    midTier.castShadow = true;
    statueGroup.add(midTier);

    const topCap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 2.2), goldTrimMat);
    topCap.position.y = 1.82;
    statueGroup.add(topCap);

    // Bronze Plaque on Front of Pedestal
    const plaqueCanvas = document.createElement('canvas');
    plaqueCanvas.width = 256;
    plaqueCanvas.height = 128;
    const pCtx = plaqueCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#b45309';
      pCtx.fillRect(0, 0, 256, 128);
      pCtx.strokeStyle = '#fde68a';
      pCtx.lineWidth = 6;
      pCtx.strokeRect(6, 6, 244, 116);
      pCtx.fillStyle = '#fef08a';
      pCtx.font = 'bold 20px serif';
      pCtx.textAlign = 'center';
      pCtx.fillText('FEDERAL UNIVERSITY', 128, 42);
      pCtx.fillText('OF OMO', 128, 70);
      pCtx.font = 'bold 13px sans-serif';
      pCtx.fillStyle = '#ffffff';
      pCtx.fillText(plaqueTitle.slice(0, 24), 128, 102);
    }
    const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
    const plaqueMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.7),
      new THREE.MeshBasicMaterial({ map: plaqueTex })
    );
    plaqueMesh.position.set(0, 1.1, 1.02);
    statueGroup.add(plaqueMesh);

    // 2. Monopoly Gentleman Mascot Statue (Height ~2.6m on top of 1.9m pedestal = ~4.5m total!)
    const suitMat = new THREE.MeshLambertMaterial({ color: '#0f172a' }); // Formal dark tailcoat
    const shirtMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' }); // Crisp white shirt
    const goldChainMat = new THREE.MeshLambertMaterial({ color: '#facc15' }); // Gold pocket watch chain

    // Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.1, 0.35), suitMat);
    legL.position.set(-0.28, 1.95 + 0.55, 0);
    statueGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.1, 0.35), suitMat);
    legR.position.set(0.28, 1.95 + 0.55, 0);
    statueGroup.add(legR);

    // Formal Suit Torso
    const statueTorso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.25, 0.55), suitMat);
    statueTorso.position.y = 1.95 + 1.1 + 0.62;
    statueGroup.add(statueTorso);

    // White Shirt Inlay & Red Bowtie
    const shirtInlay = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.05), shirtMat);
    shirtInlay.position.set(0, 1.95 + 1.1 + 0.72, 0.28);
    statueGroup.add(shirtInlay);

    const bowtie = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.14, 0.08),
      new THREE.MeshLambertMaterial({ color: '#dc2626' })
    );
    bowtie.position.set(0, 1.95 + 1.1 + 1.05, 0.3);
    statueGroup.add(bowtie);

    // Gold Pocket Watch Chain Arc
    const chainArc = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 12, Math.PI), goldChainMat);
    chainArc.position.set(0.18, 1.95 + 1.1 + 0.45, 0.29);
    statueGroup.add(chainArc);

    // Mascot Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.95, 0.26), suitMat);
    armL.position.set(-0.62, 1.95 + 1.1 + 0.6, 0);
    statueGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.95, 0.26), suitMat);
    armR.position.set(0.62, 1.95 + 1.1 + 0.6, 0);
    statueGroup.add(armR);

    // Walking Cane in Right Hand
    const caneMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const caneShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 8), caneMat);
    caneShaft.position.set(0.72, 1.95 + 0.85, 0.35);
    statueGroup.add(caneShaft);

    const caneHandle = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), goldTrimMat);
    caneHandle.position.set(0.72, 1.95 + 1.72, 0.35);
    statueGroup.add(caneHandle);

    // Head with Iconic White Handlebar Moustache
    const mascotHead = createMonopolyHead('papa');
    mascotHead.position.y = 1.95 + 1.1 + 1.25 + 0.55;
    statueGroup.add(mascotHead);

    // Tall Dignified Top Hat
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 1.95 + 1.1 + 1.25 + 1.05, 0);

    const hatBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 0.06, 16),
      new THREE.MeshLambertMaterial({ color: '#09090b' })
    );
    hatGroup.add(hatBrim);

    const hatCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.5, 0.85, 16),
      new THREE.MeshLambertMaterial({ color: '#09090b' })
    );
    hatCrown.position.y = 0.42;
    hatGroup.add(hatCrown);

    const hatBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.51, 0.16, 16),
      goldTrimMat
    );
    hatBand.position.y = 0.12;
    hatGroup.add(hatBand);

    statueGroup.add(hatGroup);

    return statueGroup;
  };

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // ROAD NETWORK GRAPH DEFINITION & VEHICLE PATHFINDING
  // -------------------------------------------------------------------------
  interface CampusRoadNode {
    id: string;
    x: number;
    z: number;
    neighbors: string[];
  }

  const ROAD_GRAPH: Record<string, CampusRoadNode> = {
    // Off-Campus Town Network (South of Main Gate)
    town_w2: { id: 'town_w2', x: -110, z: 175, neighbors: ['town_w1'] },
    town_w1: { id: 'town_w1', x: -60, z: 175, neighbors: ['town_w2', 'town_center'] },
    town_center: { id: 'town_center', x: 0, z: 175, neighbors: ['town_w1', 'town_e1', 'highway_mid'] },
    town_e1: { id: 'town_e1', x: 60, z: 175, neighbors: ['town_center', 'town_e2'] },
    town_e2: { id: 'town_e2', x: 110, z: 175, neighbors: ['town_e1'] },
    highway_mid: { id: 'highway_mid', x: 0, z: 155, neighbors: ['town_center', 'main_gate'] },

    // Main Gate & South Boulevard Corridor
    main_gate: { id: 'main_gate', x: 0, z: 140, neighbors: ['highway_mid', 'south_blvd_lower'] },
    south_blvd_lower: { id: 'south_blvd_lower', x: 0, z: 125, neighbors: ['main_gate', 'pond_south'] },
    pond_south: { id: 'pond_south', x: 0, z: 110, neighbors: ['south_blvd_lower', 'pond_east_mid', 'pond_west_mid'] },
    pond_east_mid: { id: 'pond_east_mid', x: 26, z: 80, neighbors: ['pond_south', 'pond_north'] },
    pond_west_mid: { id: 'pond_west_mid', x: -26, z: 80, neighbors: ['pond_south', 'pond_north'] },
    pond_north: { id: 'pond_north', x: 0, z: 50, neighbors: ['pond_east_mid', 'pond_west_mid', 'south_blvd_upper'] },
    south_blvd_upper: { id: 'south_blvd_upper', x: 0, z: 36, neighbors: ['pond_north', 'roundabout_s'] },

    // Central Roundabout Driveable Ring (Avoiding central monument)
    roundabout_s: { id: 'roundabout_s', x: 0, z: 22, neighbors: ['south_blvd_upper', 'roundabout_se', 'roundabout_sw'] },
    roundabout_se: { id: 'roundabout_se', x: 15.5, z: 15.5, neighbors: ['roundabout_s', 'roundabout_e', 'east_comm_w'] },
    roundabout_e: { id: 'roundabout_e', x: 22, z: 0, neighbors: ['roundabout_se', 'roundabout_ne', 'east_main_w'] },
    roundabout_ne: { id: 'roundabout_ne', x: 15.5, z: -15.5, neighbors: ['roundabout_e', 'roundabout_n', 'east_service_w'] },
    roundabout_n: { id: 'roundabout_n', x: 0, z: -22, neighbors: ['roundabout_ne', 'roundabout_nw', 'senate_blvd_s'] },
    roundabout_nw: { id: 'roundabout_nw', x: -15.5, z: -15.5, neighbors: ['roundabout_n', 'roundabout_w', 'west_acad_e'] },
    roundabout_w: { id: 'roundabout_w', x: -22, z: 0, neighbors: ['roundabout_nw', 'roundabout_sw', 'west_main_e'] },
    roundabout_sw: { id: 'roundabout_sw', x: -15.5, z: 15.5, neighbors: ['roundabout_w', 'roundabout_s', 'west_hostel_e'] },

    // North Sector (Senate Way)
    senate_blvd_s: { id: 'senate_blvd_s', x: 0, z: -50, neighbors: ['roundabout_n', 'senate_blvd_mid'] },
    senate_blvd_mid: { id: 'senate_blvd_mid', x: 0, z: -90, neighbors: ['senate_blvd_s', 'senate_dropoff'] },
    senate_dropoff: { id: 'senate_dropoff', x: 0, z: -148, neighbors: ['senate_blvd_mid'] },

    // East Sector - Main Avenue (z = 0)
    east_main_w: { id: 'east_main_w', x: 30, z: 0, neighbors: ['roundabout_e', 'east_main_mid1'] },
    east_main_mid1: { id: 'east_main_mid1', x: 60, z: 0, neighbors: ['east_main_w', 'east_main_mid2', 'east_conn_law_clinic', 'east_conn_sug_supermarket'] },
    east_main_mid2: { id: 'east_main_mid2', x: 105, z: 0, neighbors: ['east_main_mid1', 'stadium_ave_cross', 'east_conn_bank_chapel', 'east_conn_conv_bukkas'] },
    stadium_ave_cross: { id: 'stadium_ave_cross', x: 135, z: 0, neighbors: ['east_main_mid2', 'stadium_ave_mid', 'stadium_ave_s'] },

    // East Sector - North-South Stadium & Arena Avenue (x = 135)
    stadium_ave_mid: { id: 'stadium_ave_mid', x: 135, z: -25, neighbors: ['stadium_ave_cross', 'stadium_turnstiles', 'basketball_gate_spur'] },
    basketball_gate_spur: { id: 'basketball_gate_spur', x: 145, z: -10, neighbors: ['stadium_ave_mid'] },
    stadium_turnstiles: { id: 'stadium_turnstiles', x: 135, z: -55, neighbors: ['stadium_ave_mid', 'east_service_chapel'] },
    stadium_ave_s: { id: 'stadium_ave_s', x: 135, z: 26, neighbors: ['stadium_ave_cross', 'stadium_ave_comm'] },
    stadium_ave_comm: { id: 'stadium_ave_comm', x: 135, z: 52, neighbors: ['stadium_ave_s', 'east_comm_bukkas', 'east_comm_far'] },

    // East Sector - Service Road (z = -48)
    east_service_w: { id: 'east_service_w', x: 30, z: -48, neighbors: ['roundabout_ne', 'east_service_clinic'] },
    east_service_clinic: { id: 'east_service_clinic', x: 60, z: -48, neighbors: ['east_service_w', 'east_service_chapel', 'east_conn_law_clinic'] },
    east_service_chapel: { id: 'east_service_chapel', x: 105, z: -48, neighbors: ['east_service_clinic', 'stadium_turnstiles', 'east_conn_bank_chapel'] },

    // East Sector - Commercial Road (z = 52)
    east_comm_w: { id: 'east_comm_w', x: 30, z: 52, neighbors: ['roundabout_se', 'east_comm_supermarket'] },
    east_comm_supermarket: { id: 'east_comm_supermarket', x: 60, z: 52, neighbors: ['east_comm_w', 'east_comm_bukkas', 'east_conn_sug_supermarket'] },
    east_comm_bukkas: { id: 'east_comm_bukkas', x: 100, z: 52, neighbors: ['east_comm_supermarket', 'stadium_ave_comm', 'east_conn_conv_bukkas'] },
    east_comm_far: { id: 'east_comm_far', x: 170, z: 52, neighbors: ['stadium_ave_comm'] },

    // East Connectors
    east_conn_law_clinic: { id: 'east_conn_law_clinic', x: 60, z: -24, neighbors: ['east_service_clinic', 'east_main_mid1'] },
    east_conn_bank_chapel: { id: 'east_conn_bank_chapel', x: 105, z: -24, neighbors: ['east_service_chapel', 'east_main_mid2'] },
    east_conn_sug_supermarket: { id: 'east_conn_sug_supermarket', x: 60, z: 26, neighbors: ['east_main_mid1', 'east_comm_supermarket'] },
    east_conn_conv_bukkas: { id: 'east_conn_conv_bukkas', x: 100, z: 26, neighbors: ['east_main_mid2', 'east_comm_bukkas'] },

    // West Sector - Main Avenue (z = 0)
    west_main_e: { id: 'west_main_e', x: -30, z: 0, neighbors: ['roundabout_w', 'west_main_mid1'] },
    west_main_mid1: { id: 'west_main_mid1', x: -48, z: 0, neighbors: ['west_main_e', 'west_main_mid2', 'west_conn_lib_comm', 'west_conn_hostel_a'] },
    west_main_mid2: { id: 'west_main_mid2', x: -95, z: 0, neighbors: ['west_main_mid1', 'west_main_far', 'west_conn_eng_arts', 'west_conn_hostel_b'] },
    west_main_far: { id: 'west_main_far', x: -140, z: 0, neighbors: ['west_main_mid2', 'west_conn_sci_tet', 'west_conn_hostel_c'] },

    // West Sector - Academic Loop (z = -48)
    west_acad_e: { id: 'west_acad_e', x: -30, z: -48, neighbors: ['roundabout_nw', 'west_acad_lib'] },
    west_acad_lib: { id: 'west_acad_lib', x: -48, z: -48, neighbors: ['west_acad_e', 'west_acad_eng', 'west_conn_lib_comm'] },
    west_acad_eng: { id: 'west_acad_eng', x: -95, z: -48, neighbors: ['west_acad_lib', 'west_acad_sci', 'west_conn_eng_arts'] },
    west_acad_sci: { id: 'west_acad_sci', x: -140, z: -48, neighbors: ['west_acad_eng', 'west_conn_sci_tet'] },

    // West Sector - Hostels Loop (z = 55)
    west_hostel_e: { id: 'west_hostel_e', x: -30, z: 55, neighbors: ['roundabout_sw', 'west_hostel_a'] },
    west_hostel_a: { id: 'west_hostel_a', x: -48, z: 55, neighbors: ['west_hostel_e', 'west_hostel_b', 'west_conn_hostel_a'] },
    west_hostel_b: { id: 'west_hostel_b', x: -95, z: 55, neighbors: ['west_hostel_a', 'west_hostel_c', 'west_conn_hostel_b'] },
    west_hostel_c: { id: 'west_hostel_c', x: -140, z: 55, neighbors: ['west_hostel_b', 'west_conn_hostel_c'] },

    // West Connectors
    west_conn_lib_comm: { id: 'west_conn_lib_comm', x: -48, z: -24, neighbors: ['west_acad_lib', 'west_main_mid1'] },
    west_conn_eng_arts: { id: 'west_conn_eng_arts', x: -95, z: -24, neighbors: ['west_acad_eng', 'west_main_mid2'] },
    west_conn_sci_tet: { id: 'west_conn_sci_tet', x: -140, z: -24, neighbors: ['west_acad_sci', 'west_main_far'] },
    west_conn_hostel_a: { id: 'west_conn_hostel_a', x: -48, z: 27.5, neighbors: ['west_main_mid1', 'west_hostel_a'] },
    west_conn_hostel_b: { id: 'west_conn_hostel_b', x: -95, z: 27.5, neighbors: ['west_main_mid2', 'west_hostel_b'] },
    west_conn_hostel_c: { id: 'west_conn_hostel_c', x: -140, z: 27.5, neighbors: ['west_main_far', 'west_hostel_c'] }
  };

  const getTargetRoadNodeForPOI = (poi: CampusPOI): string => {
    switch (poi.id) {
      case 'football_pitch':
        return 'stadium_turnstiles';
      case 'basketball_court':
        return 'basketball_gate_spur';
      case 'admin_senate':
        return 'senate_dropoff';
      case 'library':
        return 'west_acad_lib';
      case 'fac_eng':
        return 'west_acad_eng';
      case 'fac_sci':
        return 'west_acad_sci';
      case 'fac_comm':
        return 'west_acad_lib';
      case 'fac_arts':
        return 'west_acad_eng';
      case 'fac_med':
        return 'west_acad_eng';
      case 'hostel_a':
        return 'west_hostel_a';
      case 'hostel_b':
        return 'west_hostel_b';
      case 'hostel_c':
        return 'west_hostel_c';
      case 'hostel_d':
        return 'west_hostel_b';
      case 'hostel_common':
        return 'west_hostel_a';
      case 'hostel_pg':
        return 'west_hostel_c';
      case 'campus_clinic':
        return 'east_service_clinic';
      case 'chapel_mosque':
        return 'east_service_chapel';
      case 'supermarket_store':
        return 'east_comm_supermarket';
      case 'food_buka_nkechi':
        return 'east_comm_bukkas';
      case 'food_buka_basira':
        return 'stadium_ave_comm';
      case 'food_akara':
        return 'east_comm_far';
      case 'food_cafe':
        return 'stadium_ave_s';
      case 'sug_building':
        return 'east_main_mid1';
      case 'service_barber':
        return 'stadium_ave_s';
      case 'service_cybercafe':
        return 'east_main_mid1';
      case 'service_laundry':
        return 'east_comm_w';
      case 'service_phoneshop':
        return 'east_comm_supermarket';
      case 'service_minimart':
        return 'east_main_w';
      case 'off_campus_a':
        return 'town_w2';
      case 'off_campus_b':
        return 'town_center';
      case 'off_campus_c':
        return 'town_e2';
      case 'main_gate':
        return 'main_gate';
      default: {
        // Fallback: pick geographically nearest node
        let bestId = 'roundabout_s';
        let minDist = Infinity;
        for (const [id, node] of Object.entries(ROAD_GRAPH)) {
          const d = Math.hypot(node.x - poi.position[0], node.z - poi.position[2]);
          if (d < minDist) {
            minDist = d;
            bestId = id;
          }
        }
        return bestId;
      }
    }
  };

  // -------------------------------------------------------------------------
  // ACTIVE RIDE CONVEYANCE SETUP (STRICTLY ON-ROAD PATHFINDING)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current) return;

    if (activeRide) {
      if (rideVehicleMeshRef.current) {
        sceneRef.current.remove(rideVehicleMeshRef.current);
        rideVehicleMeshRef.current = null;
      }

      const startX = posRef.current.x;
      const startZ = posRef.current.z;
      const destPOI = activeRide.destinationPOI;
      const targetNodeId = getTargetRoadNodeForPOI(destPOI);

      // Find nearest starting road node
      let startNodeId = 'roundabout_s';
      let minDist = Infinity;
      for (const [id, node] of Object.entries(ROAD_GRAPH)) {
        const d = Math.hypot(node.x - startX, node.z - startZ);
        if (d < minDist) {
          minDist = d;
          startNodeId = id;
        }
      }

      // BFS on ROAD_GRAPH to determine shortest route along visible road network
      const queue: string[] = [startNodeId];
      const visited = new Set<string>([startNodeId]);
      const parent = new Map<string, string>();

      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (curr === targetNodeId) break;

        const node = ROAD_GRAPH[curr];
        if (!node) continue;

        for (const nId of node.neighbors) {
          if (!visited.has(nId)) {
            visited.add(nId);
            parent.set(nId, curr);
            queue.push(nId);
          }
        }
      }

      const pathNodes: [number, number][] = [];
      let trace: string | undefined = targetNodeId;
      while (trace && trace !== startNodeId) {
        const n = ROAD_GRAPH[trace];
        if (n) pathNodes.unshift([n.x, n.z]);
        trace = parent.get(trace);
      }
      const sNode = ROAD_GRAPH[startNodeId];
      if (sNode) pathNodes.unshift([sNode.x, sNode.z]);

      // Complete waypoints: start position -> start road node -> path -> dropoff
      const waypoints: [number, number][] = [];
      waypoints.push([startX, startZ]);
      pathNodes.forEach((pt) => waypoints.push(pt));

      rideWaypointsRef.current = waypoints;
      rideCurrentIndexRef.current = 0;
      isConveyingRef.current = true;

      const vehicle = activeRide.vehicleType === 'keke' ? createKekeVehicle('#eab308') : createShuttleBus();
      vehicle.position.set(startX, 0, startZ);
      sceneRef.current.add(vehicle);
      rideVehicleMeshRef.current = vehicle;

      sounds.playKekeHorn();
    } else {
      if (rideVehicleMeshRef.current && sceneRef.current) {
        sceneRef.current.remove(rideVehicleMeshRef.current);
        rideVehicleMeshRef.current = null;
      }
      isConveyingRef.current = false;
      rideCurrentIndexRef.current = 0;
    }
  }, [activeRide]);

  // -------------------------------------------------------------------------
  // REVOLUTION II: DYNAMIC 3D WORLD EVOLUTION STRUCTURES
  // Renovated Quad, Stadium Trophy Vitrine, Tech Pedestal, Solar Lamps, Festival Pavilion, Drainage Canal
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clean up previous world evolution group if present
    if (worldEvolutionGroupRef.current) {
      scene.remove(worldEvolutionGroupRef.current);
      worldEvolutionGroupRef.current = null;
    }
    evolutionCollidersRef.current = [];

    if (!worldEvolution) return;

    const evoGroup = new THREE.Group();
    evoGroup.name = 'WorldEvolutionStructures';

    // 1. Renovated Academic Quad Solar Pergola Lounge
    if (worldEvolution.quadPavilionRenovated) {
      const quadGroup = new THREE.Group();
      quadGroup.position.set(-92, 0, -50);

      // Stone base
      const baseMat = new THREE.MeshLambertMaterial({ color: '#e2e8f0' });
      const base = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 9), baseMat);
      base.position.y = 0.2;
      base.receiveShadow = true;
      quadGroup.add(base);

      // Cedar wood pillars & beams
      const woodMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
      const pillars = [[-4.8, -3.8], [4.8, -3.8], [-4.8, 3.8], [4.8, 3.8], [-4.8, 0], [4.8, 0]];
      pillars.forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.8, 0.35), woodMat);
        pillar.position.set(px, 1.9, pz);
        quadGroup.add(pillar);
      });

      // Pergola louvers
      for (let lz = -3.8; lz <= 3.8; lz += 0.8) {
        const louver = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.15, 0.35), woodMat);
        louver.position.set(0, 3.85, lz);
        quadGroup.add(louver);
      }

      // Solar Panel Array on top
      const solarMat = new THREE.MeshLambertMaterial({ color: '#1e3a8a' });
      const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.12, 6.8), solarMat);
      solarPanel.position.set(0, 4.0, 0);
      solarPanel.rotation.x = 0.08;
      quadGroup.add(solarPanel);

      // Ergonomic Quad Benching
      const benchMat = new THREE.MeshLambertMaterial({ color: '#b45309' });
      const bench1 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.5, 0.9), benchMat);
      bench1.position.set(0, 0.45, -2.6);
      quadGroup.add(bench1);

      const bench2 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.5, 0.9), benchMat);
      bench2.position.set(0, 0.45, 2.6);
      quadGroup.add(bench2);

      // Charging Hub Kiosk with LED indicator
      const kiosk = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.9), new THREE.MeshLambertMaterial({ color: '#0f172a' }));
      kiosk.position.set(0, 1.0, 0);
      quadGroup.add(kiosk);

      const ledIndicator = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.92), new THREE.MeshBasicMaterial({ color: '#06b6d4' }));
      ledIndicator.position.set(0, 1.4, 0);
      quadGroup.add(ledIndicator);

      // Bronze Inscription Plaque
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 128;
      const pctx = plaqueCanvas.getContext('2d')!;
      pctx.fillStyle = '#064e3b';
      pctx.fillRect(0, 0, 512, 128);
      pctx.fillStyle = '#f59e0b';
      pctx.font = 'bold 26px sans-serif';
      pctx.textAlign = 'center';
      pctx.fillText('★ RENOVATED ACADEMIC QUAD ★', 256, 50);
      pctx.fillStyle = '#ffffff';
      pctx.font = 'bold 19px sans-serif';
      pctx.fillText('SOLAR STUDY PERGOLA • 2026 INITIATIVE', 256, 95);
      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: plaqueTex }));
      plaqueMesh.position.set(0, 2.8, 4.02);
      quadGroup.add(plaqueMesh);

      const light = new THREE.PointLight('#fef08a', 1.2, 14);
      light.position.set(0, 3.4, 0);
      quadGroup.add(light);

      evoGroup.add(quadGroup);

      const quadCol = new THREE.Box3();
      quadCol.setFromCenterAndSize(new THREE.Vector3(-92, 2, -50), new THREE.Vector3(10.5, 4, 8.5));
      evolutionCollidersRef.current.push(quadCol);
    }

    // 2. Stadium NUGA Gold Champions Trophy Showcase
    if (worldEvolution.stadiumTrophyShowcase) {
      const trophyGroup = new THREE.Group();
      trophyGroup.position.set(82, 0, -12);

      // Black marble pedestal
      const ped = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 3.2), new THREE.MeshLambertMaterial({ color: '#09090b' }));
      ped.position.y = 0.6;
      trophyGroup.add(ped);

      // Glass vitrine
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.8, 2.4),
        new THREE.MeshLambertMaterial({ color: '#38bdf8', transparent: true, opacity: 0.4 })
      );
      glass.position.y = 2.6;
      trophyGroup.add(glass);

      // Golden Cup Trophy inside
      const goldMat = new THREE.MeshLambertMaterial({ color: '#eab308' });
      const cupBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.4, 16), goldMat);
      cupBase.position.y = 1.4;
      trophyGroup.add(cupBase);

      const cupStem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12), goldMat);
      cupStem.position.y = 1.9;
      trophyGroup.add(cupStem);

      const cupBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.25, 1.0, 16), goldMat);
      cupBowl.position.y = 2.6;
      trophyGroup.add(cupBowl);

      // Gold handles
      const handleL = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 8, 16, Math.PI), goldMat);
      handleL.position.set(-0.65, 2.6, 0);
      handleL.rotation.z = Math.PI / 2;
      trophyGroup.add(handleL);

      const handleR = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 8, 16, Math.PI), goldMat);
      handleR.position.set(0.65, 2.6, 0);
      handleR.rotation.z = -Math.PI / 2;
      trophyGroup.add(handleR);

      // Inscription Plaque
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 128;
      const pctx = plaqueCanvas.getContext('2d')!;
      pctx.fillStyle = '#b45309';
      pctx.fillRect(0, 0, 512, 128);
      pctx.fillStyle = '#fef08a';
      pctx.font = 'bold 24px sans-serif';
      pctx.textAlign = 'center';
      pctx.fillText('🏆 NUGA 2026 GOLD TROPHY 🏆', 256, 48);
      pctx.fillStyle = '#ffffff';
      pctx.font = 'bold 18px sans-serif';
      pctx.fillText('FUO INTER-VARSITY ATHLETICS CHAMPIONS', 256, 92);
      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: plaqueTex }));
      plaqueMesh.position.set(0, 0.6, 1.62);
      trophyGroup.add(plaqueMesh);

      const spot = new THREE.SpotLight('#fef08a', 2.0, 16, Math.PI / 4, 0.5);
      spot.position.set(0, 6, 0);
      spot.target.position.set(0, 2, 0);
      trophyGroup.add(spot);
      trophyGroup.add(spot.target);

      evoGroup.add(trophyGroup);

      const trophyCol = new THREE.Box3();
      trophyCol.setFromCenterAndSize(new THREE.Vector3(82, 2, -12), new THREE.Vector3(3.2, 4, 3.2));
      evolutionCollidersRef.current.push(trophyCol);
    }

    // 3. Tech Hub & Engineering Innovation Showcase Pedestal
    if (worldEvolution.techHubInnovationPedestal) {
      const techGroup = new THREE.Group();
      techGroup.position.set(-56, 0, -32);

      // Pedestal
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 2.6), new THREE.MeshLambertMaterial({ color: '#334155' }));
      base.position.y = 0.55;
      techGroup.add(base);

      // Inverter Prototype Model
      const invBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.7), new THREE.MeshLambertMaterial({ color: '#1e293b' }));
      invBody.position.set(-0.9, 1.35, 0);
      techGroup.add(invBody);

      const miniSolar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.6), new THREE.MeshLambertMaterial({ color: '#0284c7' }));
      miniSolar.position.set(-0.9, 1.62, 0);
      miniSolar.rotation.x = 0.2;
      techGroup.add(miniSolar);

      // Biometric Sensor Beacon Model
      const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.4, 16), new THREE.MeshLambertMaterial({ color: '#0f172a' }));
      beaconBase.position.set(0.9, 1.3, 0);
      techGroup.add(beaconBase);

      const beaconLens = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshBasicMaterial({ color: '#06b6d4' }));
      beaconLens.position.set(0.9, 1.6, 0);
      techGroup.add(beaconLens);

      const cyanLight = new THREE.PointLight('#06b6d4', 1.8, 8);
      cyanLight.position.set(0.9, 1.8, 0);
      techGroup.add(cyanLight);

      // Inscription Plaque
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 128;
      const pctx = plaqueCanvas.getContext('2d')!;
      pctx.fillStyle = '#0f172a';
      pctx.fillRect(0, 0, 512, 128);
      pctx.fillStyle = '#38bdf8';
      pctx.font = 'bold 24px sans-serif';
      pctx.textAlign = 'center';
      pctx.fillText('⚙ TETFUND INNOVATION EXHIBIT ⚙', 256, 48);
      pctx.fillStyle = '#f8fafc';
      pctx.font = 'bold 18px sans-serif';
      pctx.fillText('FUO FACULTY OF ENGINEERING PROTOTYPES', 256, 92);
      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: plaqueTex }));
      plaqueMesh.position.set(0, 0.55, 1.32);
      techGroup.add(plaqueMesh);

      evoGroup.add(techGroup);

      const techCol = new THREE.Box3();
      techCol.setFromCenterAndSize(new THREE.Vector3(-56, 1.5, -32), new THREE.Vector3(3.6, 3, 2.6));
      evolutionCollidersRef.current.push(techCol);
    }

    // 4. Solar Streetlamps along West & Central Walkway
    if (worldEvolution.solarStreetlightsInstalled) {
      const lampPositions: [number, number][] = [
        [4, 32], [-4, 16], [4, -8], [-4, -32], [-40, -48], [-75, -48]
      ];
      const poleMat = new THREE.MeshLambertMaterial({ color: '#171717' });
      const solarMat = new THREE.MeshLambertMaterial({ color: '#0369a1' });
      const luminaireMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });

      lampPositions.forEach(([lx, lz]) => {
        const lampGroup = new THREE.Group();
        lampGroup.position.set(lx, 0, lz);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8), poleMat);
        pole.position.y = 3.75;
        lampGroup.add(pole);

        // Angled solar mini roof
        const pv = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.9), solarMat);
        pv.position.set(0, 7.8, 0);
        pv.rotation.x = 0.25;
        lampGroup.add(pv);

        // Luminaire Head
        const lum = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.4), poleMat);
        lum.position.set(0, 7.4, 0.35);
        lampGroup.add(lum);

        const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.25), luminaireMat);
        bulb.position.set(0, 7.28, 0.35);
        lampGroup.add(bulb);

        const spot = new THREE.SpotLight('#fef08a', 1.8, 20, Math.PI / 4, 0.5);
        spot.position.set(lx, 7.3, lz + 0.35);
        spot.target.position.set(lx, 0, lz + 0.35);
        lampGroup.add(spot);
        lampGroup.add(spot.target);

        evoGroup.add(lampGroup);

        const lampCol = new THREE.Box3();
        lampCol.setFromCenterAndSize(new THREE.Vector3(lx, 3.5, lz), new THREE.Vector3(0.6, 7.5, 0.6));
        evolutionCollidersRef.current.push(lampCol);
      });
    }

    // 5. Cultural Festival Bandstand Commons Pavilion
    if (worldEvolution.culturalFestivalPavilion) {
      const galaGroup = new THREE.Group();
      galaGroup.position.set(22, 0, 22);

      // Octagonal timber stage
      const stageGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.6, 8);
      const stageMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
      const stage = new THREE.Mesh(stageGeo, stageMat);
      stage.position.y = 0.3;
      stage.receiveShadow = true;
      galaGroup.add(stage);

      // Festive Ankara Banners & Posts
      const ankaraMat = new THREE.MeshLambertMaterial({ color: '#ea580c' });
      const tealMat = new THREE.MeshLambertMaterial({ color: '#0d9488' });
      const goldMat = new THREE.MeshLambertMaterial({ color: '#eab308' });

      [[-3.8, -3.8], [3.8, -3.8], [-3.8, 3.8], [3.8, 3.8]].forEach(([px, pz], idx) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.2, 0.3), idx % 2 === 0 ? ankaraMat : tealMat);
        post.position.set(px, 2.1, pz);
        galaGroup.add(post);
      });

      // Overhead crossbeams
      const beam1 = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.2, 0.2), goldMat);
      beam1.position.set(0, 4.1, 0);
      galaGroup.add(beam1);

      const beam2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 8.2), goldMat);
      beam2.position.set(0, 4.1, 0);
      galaGroup.add(beam2);

      // Sound speakers
      [-4.0, 4.0].forEach((sx) => {
        const speaker = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.9), new THREE.MeshLambertMaterial({ color: '#09090b' }));
        speaker.position.set(sx, 1.5, -3.0);
        galaGroup.add(speaker);
      });

      // Festival Stage Banner
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 128;
      const pctx = plaqueCanvas.getContext('2d')!;
      pctx.fillStyle = '#dc2626';
      pctx.fillRect(0, 0, 512, 128);
      pctx.fillStyle = '#fef08a';
      pctx.font = 'bold 26px sans-serif';
      pctx.textAlign = 'center';
      pctx.fillText('🎶 FUO CULTURAL GALA STAGE 🎶', 256, 50);
      pctx.fillStyle = '#ffffff';
      pctx.font = 'bold 20px sans-serif';
      pctx.fillText('AFROBEATS & HERITAGE BANDSTAND', 256, 95);
      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshBasicMaterial({ map: plaqueTex }));
      plaqueMesh.position.set(0, 3.2, 4.2);
      galaGroup.add(plaqueMesh);

      const spot = new THREE.SpotLight('#f59e0b', 2.0, 18, Math.PI / 3, 0.5);
      spot.position.set(0, 5, 0);
      spot.target.position.set(0, 0.5, 0);
      galaGroup.add(spot);
      galaGroup.add(spot.target);

      evoGroup.add(galaGroup);

      const galaCol = new THREE.Box3();
      galaCol.setFromCenterAndSize(new THREE.Vector3(22, 2, 22), new THREE.Vector3(8.5, 4.5, 8.5));
      evolutionCollidersRef.current.push(galaCol);
    }

    // 6. Reinforced Stone Drainage Canal & Culvert at Pond
    if (worldEvolution.drainageCanalReinforced) {
      const canalGroup = new THREE.Group();
      canalGroup.position.set(88, 0, -32);

      const stoneMat = new THREE.MeshLambertMaterial({ color: '#475569' });
      const concreteMat = new THREE.MeshLambertMaterial({ color: '#94a3b8' });

      // Retaining stone walls on both sides of canal
      const wallL = new THREE.Mesh(new THREE.BoxGeometry(16, 2.0, 1.2), stoneMat);
      wallL.position.set(0, 1.0, -3.2);
      canalGroup.add(wallL);

      const wallR = new THREE.Mesh(new THREE.BoxGeometry(16, 2.0, 1.2), stoneMat);
      wallR.position.set(0, 1.0, 3.2);
      canalGroup.add(wallR);

      // Culvert Arch
      const arch = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.5, 7.0), concreteMat);
      arch.position.set(0, 1.25, 0);
      canalGroup.add(arch);

      // Resilience Taskforce Banner
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 128;
      const pctx = plaqueCanvas.getContext('2d')!;
      pctx.fillStyle = '#065f46';
      pctx.fillRect(0, 0, 512, 128);
      pctx.fillStyle = '#fde68a';
      pctx.font = 'bold 24px sans-serif';
      pctx.textAlign = 'center';
      pctx.fillText('🌊 REINFORCED DRAINAGE CANAL 🌊', 256, 48);
      pctx.fillStyle = '#ffffff';
      pctx.font = 'bold 18px sans-serif';
      pctx.fillText('RESILIENCE TASKFORCE EROSION CONTROL', 256, 92);
      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.8), new THREE.MeshBasicMaterial({ map: plaqueTex }));
      plaqueMesh.position.set(0, 2.2, 3.55);
      canalGroup.add(plaqueMesh);

      evoGroup.add(canalGroup);

      const canalCol = new THREE.Box3();
      canalCol.setFromCenterAndSize(new THREE.Vector3(88, 1.5, -32), new THREE.Vector3(16, 3, 7.5));
      evolutionCollidersRef.current.push(canalCol);
    }

    worldEvolutionGroupRef.current = evoGroup;
    scene.add(evoGroup);
  }, [worldEvolution]);

  // -------------------------------------------------------------------------
  // MAIN THREE.JS MOUNT EFFECT (BUILDS THE EXPANDED VAST CAMPUS WORLD)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0284c7');
    scene.fog = new THREE.FogExp2('#0284c7', 0.007);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 550);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Sunlight & Ambience
    const dirLight = new THREE.DirectionalLight('#ffffff', 1.35);
    dirLight.position.set(65, 110, 75);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 380;
    dirLight.shadow.camera.left = -180;
    dirLight.shadow.camera.right = 180;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -180;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const hemiLight = new THREE.HemisphereLight('#67e8f9', '#15803d', 0.65);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // 2. EXPANDED VAST CAMPUS TERRAIN (520m x 520m)
    const grassGeo = new THREE.PlaneGeometry(520, 520);
    const grassMat = new THREE.MeshLambertMaterial({ color: '#2d6a4f' });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0;
    grass.receiveShadow = true;
    scene.add(grass);

    // ============================================================
    // 3. MASTER PLAN ROAD NETWORK (NO ROAD OVERLAPS ANY BUILDING!)
    // ============================================================
    const roadMat = new THREE.MeshLambertMaterial({ color: '#334155' });
    const roadStripeMat = new THREE.MeshBasicMaterial({ color: '#facc15' });

    // 3A. Central Roundabout Road Ring around the Central Landmark Tower
    // Driveable asphalt ring with Outer Radius = 24m, Inner Radius = 14m (width = 10m)
    const roundaboutRingGeo = new THREE.RingGeometry(14, 24, 48);
    const roundaboutRing = new THREE.Mesh(roundaboutRingGeo, roadMat);
    roundaboutRing.rotation.x = -Math.PI / 2;
    roundaboutRing.position.set(0, 0.02, 0);
    roundaboutRing.receiveShadow = true;
    scene.add(roundaboutRing);

    // Inner island curb
    const innerCurb = new THREE.Mesh(
      new THREE.CylinderGeometry(14.2, 14.2, 0.25, 48),
      new THREE.MeshLambertMaterial({ color: '#94a3b8' })
    );
    innerCurb.position.set(0, 0.12, 0);
    scene.add(innerCurb);

    // Central Lawn Island (Radius = 14m)
    const centerLawn = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 0.35, 48),
      new THREE.MeshLambertMaterial({ color: '#166534' })
    );
    centerLawn.position.set(0, 0.18, 0);
    scene.add(centerLawn);

    // 3B. North Boulevard (Senate Way: from Roundabout z=-24 to z=-145)
    const northBoulevard = new THREE.Mesh(new THREE.PlaneGeometry(10, 122), roadMat);
    northBoulevard.rotation.x = -Math.PI / 2;
    northBoulevard.position.set(0, 0.02, -85);
    northBoulevard.receiveShadow = true;
    scene.add(northBoulevard);

    // Senate Plaza Drop-Off Turnaround Loop (z = -140 to -155, x ∈ [-24, 24])
    const senateDropOff = new THREE.Mesh(new THREE.PlaneGeometry(48, 14), roadMat);
    senateDropOff.rotation.x = -Math.PI / 2;
    senateDropOff.position.set(0, 0.02, -148);
    senateDropOff.receiveShadow = true;
    scene.add(senateDropOff);

    // 3C. South Boulevard (from Roundabout z=24 to Pond North z=50)
    const southBoulevardUpper = new THREE.Mesh(new THREE.PlaneGeometry(10, 26), roadMat);
    southBoulevardUpper.rotation.x = -Math.PI / 2;
    southBoulevardUpper.position.set(0, 0.02, 37);
    southBoulevardUpper.receiveShadow = true;
    scene.add(southBoulevardUpper);

    // Pond Bypass Roads (Dual Driveable Road Corridors at x = ±26, z ∈ [50, 110])
    const pondEastBypass = new THREE.Mesh(new THREE.PlaneGeometry(10, 60), roadMat);
    pondEastBypass.rotation.x = -Math.PI / 2;
    pondEastBypass.position.set(26, 0.02, 80);
    pondEastBypass.receiveShadow = true;
    scene.add(pondEastBypass);

    const pondWestBypass = new THREE.Mesh(new THREE.PlaneGeometry(10, 60), roadMat);
    pondWestBypass.rotation.x = -Math.PI / 2;
    pondWestBypass.position.set(-26, 0.02, 80);
    pondWestBypass.receiveShadow = true;
    scene.add(pondWestBypass);

    // Diagonal bypass connectors connecting (0, 50) and (0, 110)
    [[-13, 50], [13, 50], [-13, 110], [13, 110]].forEach(([cx, cz]) => {
      const conn = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), roadMat);
      conn.rotation.x = -Math.PI / 2;
      conn.position.set(cx, 0.02, cz);
      scene.add(conn);
    });

    // South Boulevard Lower (from Pond South z=110 to Main Gate z=140)
    const southBoulevardLower = new THREE.Mesh(new THREE.PlaneGeometry(12, 30), roadMat);
    southBoulevardLower.rotation.x = -Math.PI / 2;
    southBoulevardLower.position.set(0, 0.02, 125);
    southBoulevardLower.receiveShadow = true;
    scene.add(southBoulevardLower);

    // 3D. Off-Campus Highway (South of Gate: z = 140 to z = 215, OUTSIDE PERIMETER)
    const offCampusHighway = new THREE.Mesh(new THREE.PlaneGeometry(12, 75), roadMat);
    offCampusHighway.rotation.x = -Math.PI / 2;
    offCampusHighway.position.set(0, 0.02, 177.5);
    offCampusHighway.receiveShadow = true;
    scene.add(offCampusHighway);

    // Off-Campus Town Junction & Lodge Access Lanes (at z = 175 and 195)
    const offCampusCross = new THREE.Mesh(new THREE.PlaneGeometry(140, 9), roadMat);
    offCampusCross.rotation.x = -Math.PI / 2;
    offCampusCross.position.set(0, 0.02, 175);
    offCampusCross.receiveShadow = true;
    scene.add(offCampusCross);

    // 3E. West Main Avenue (x = -24 to -155, z = 0, width = 10m)
    const westMainAvenue = new THREE.Mesh(new THREE.PlaneGeometry(131, 10), roadMat);
    westMainAvenue.rotation.x = -Math.PI / 2;
    westMainAvenue.position.set(-89.5, 0.02, 0);
    westMainAvenue.receiveShadow = true;
    scene.add(westMainAvenue);

    // West Secondary Academic Loop (z = -48, x ∈ [-40, -145], width = 9m)
    const westAcademicLoop = new THREE.Mesh(new THREE.PlaneGeometry(110, 9), roadMat);
    westAcademicLoop.rotation.x = -Math.PI / 2;
    westAcademicLoop.position.set(-92.5, 0.02, -48);
    westAcademicLoop.receiveShadow = true;
    scene.add(westAcademicLoop);

    // West Secondary Hostels Loop (z = 55, x ∈ [-40, -150], width = 9m)
    const westHostelsLoop = new THREE.Mesh(new THREE.PlaneGeometry(115, 9), roadMat);
    westHostelsLoop.rotation.x = -Math.PI / 2;
    westHostelsLoop.position.set(-95, 0.02, 55);
    westHostelsLoop.receiveShadow = true;
    scene.add(westHostelsLoop);

    // Connectors linking West Main Avenue to Academic Loop & Hostels Loop
    [
      [-48, -24, 10, 48], // East end connector to Academic
      [-95, -24, 10, 48], // Central connector to Academic
      [-140, -24, 10, 48], // Far west connector to Academic
      [-48, 27.5, 10, 55], // East end connector to Hostels
      [-95, 27.5, 10, 55], // Central connector to Hostels
      [-140, 27.5, 10, 55] // Far west connector to Hostels
    ].forEach(([cx, cz, cw, cd]) => {
      const conn = new THREE.Mesh(new THREE.PlaneGeometry(cw, cd), roadMat);
      conn.rotation.x = -Math.PI / 2;
      conn.position.set(cx, 0.02, cz);
      scene.add(conn);
    });

    // 3F. East Main Avenue (x = 24 to 135, z = 0, width = 10m)
    // Connects Roundabout Ring to the North-South Stadium Avenue at x = 135
    const eastMainAvenue = new THREE.Mesh(new THREE.PlaneGeometry(111, 10), roadMat);
    eastMainAvenue.rotation.x = -Math.PI / 2;
    eastMainAvenue.position.set(79.5, 0.02, 0);
    eastMainAvenue.receiveShadow = true;
    scene.add(eastMainAvenue);

    // East Secondary Service Road (Health & Chapel: z = -48, x ∈ [24, 135], width = 9m)
    // Stops cleanly at the Stadium West Turnstiles Gate without crossing into the pitch!
    const eastServiceLoop = new THREE.Mesh(new THREE.PlaneGeometry(111, 9), roadMat);
    eastServiceLoop.rotation.x = -Math.PI / 2;
    eastServiceLoop.position.set(79.5, 0.02, -48);
    eastServiceLoop.receiveShadow = true;
    scene.add(eastServiceLoop);

    // North-South Stadium & Arena Avenue (x = 135, z ∈ [-55, 52], width = 10m, length = 107m)
    // Interlinks East Service Road (z = -48), East Main Avenue (z = 0), and East Commercial Loop (z = 52)
    const stadiumAvenue = new THREE.Mesh(new THREE.PlaneGeometry(10, 107), roadMat);
    stadiumAvenue.rotation.x = -Math.PI / 2;
    stadiumAvenue.position.set(135, 0.02, -1.5);
    stadiumAvenue.receiveShadow = true;
    scene.add(stadiumAvenue);

    // Football Stadium Entrance Drop-off Turnaround Plaza (at x = 135, z = -55, 18m x 14m)
    const stadiumPlaza = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), roadMat);
    stadiumPlaza.rotation.x = -Math.PI / 2;
    stadiumPlaza.position.set(135, 0.02, -55);
    stadiumPlaza.receiveShadow = true;
    scene.add(stadiumPlaza);

    // Basketball Arena Entrance Drop-off Spur Road (branches from x = 135 to x = 145 at z = -10, width = 8m)
    const basketballSpur = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), roadMat);
    basketballSpur.rotation.x = -Math.PI / 2;
    basketballSpur.position.set(140, 0.02, -10);
    basketballSpur.receiveShadow = true;
    scene.add(basketballSpur);

    // East Secondary Commercial Road (Supermarket & Food Bukkas: z = 52, x ∈ [24, 175], width = 9m)
    const eastCommercialLoop = new THREE.Mesh(new THREE.PlaneGeometry(151, 9), roadMat);
    eastCommercialLoop.rotation.x = -Math.PI / 2;
    eastCommercialLoop.position.set(99.5, 0.02, 52);
    eastCommercialLoop.receiveShadow = true;
    scene.add(eastCommercialLoop);

    // Connectors linking East Main Avenue to Service Loop & Commercial Loop (Clear of all buildings!)
    [
      [60, -24, 10, 48], // Between Law & Clinic
      [105, -24, 10, 48], // Between Bank & Chapel
      [60, 26, 10, 52],  // Between SUG & Supermarket
      [100, 26, 10, 52]  // Between Convocation & Bukkas
    ].forEach(([cx, cz, cw, cd]) => {
      const conn = new THREE.Mesh(new THREE.PlaneGeometry(cw, cd), roadMat);
      conn.rotation.x = -Math.PI / 2;
      conn.position.set(cx, 0.02, cz);
      scene.add(conn);
    });

    // ============================================================
    // 3G. MASTER PLAN PAVED PEDESTRIAN WALKWAY NETWORK
    // Clean stone walkways connecting road corridors to every building entrance
    // ============================================================
    const walkwayMat = new THREE.MeshLambertMaterial({ color: '#94a3b8' });
    const walkwayCurbMat = new THREE.MeshLambertMaterial({ color: '#64748b' });
    const zebraMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

    const createWalkwayStrip = (x: number, startZ: number, endZ: number, width = 3.2) => {
      const length = Math.abs(endZ - startZ);
      if (length < 0.5) return;
      const centerZ = (startZ + endZ) / 2;

      // Paved walkway surface slightly elevated at y = 0.035 to eliminate z-fighting
      const walk = new THREE.Mesh(new THREE.PlaneGeometry(width, length), walkwayMat);
      walk.rotation.x = -Math.PI / 2;
      walk.position.set(x, 0.035, centerZ);
      walk.receiveShadow = true;
      scene.add(walk);

      // Raised stone curb edging
      [-width / 2, width / 2].forEach((cx) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, length), walkwayCurbMat);
        curb.position.set(x + cx, 0.04, centerZ);
        scene.add(curb);
      });
    };

    const createHorizontalWalkwayStrip = (z: number, startX: number, endX: number, width = 3.2) => {
      const length = Math.abs(endX - startX);
      if (length < 0.5) return;
      const centerX = (startX + endX) / 2;

      const walk = new THREE.Mesh(new THREE.PlaneGeometry(length, width), walkwayMat);
      walk.rotation.x = -Math.PI / 2;
      walk.position.set(centerX, 0.035, z);
      walk.receiveShadow = true;
      scene.add(walk);

      [-width / 2, width / 2].forEach((cz) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(length, 0.05, 0.18), walkwayCurbMat);
        curb.position.set(centerX, 0.04, z + cz);
        scene.add(curb);
      });
    };

    // 1. West Academic Quadrangle Walkways (Connecting road at z = -48)
    createWalkwayStrip(-50, -48, -70.5, 3.6);  // Central Library
    createWalkwayStrip(-95, -48, -71.5, 3.4);  // Engineering Faculty
    createWalkwayStrip(-135, -48, -71.5, 3.4); // Science Faculty
    createWalkwayStrip(-50, -48, -34.5, 3.2);  // Commerce Faculty
    createWalkwayStrip(-95, -48, -34.5, 3.2);  // Arts Faculty
    createWalkwayStrip(-95, -71.5, -113.5, 3.2); // College of Medicine
    createWalkwayStrip(-135, -48, -35.0, 3.0); // TETFund Mega Complex

    // 2. West Hostels Village Walkways (Connecting road at z = 55)
    createWalkwayStrip(-60, 55, 77.5, 3.4);   // Moremi Hall (Hostel A)
    createWalkwayStrip(-105, 55, 77.5, 3.4);  // Independence Hall (Hostel B)
    createWalkwayStrip(-145, 55, 79.5, 3.2);  // Palm Lodge (Private Inside)
    createWalkwayStrip(-135, 55, 40.0, 3.0);  // Architecture Studios

    // 3. East Commercial Village Walkways (Connecting road at z = 52)
    createWalkwayStrip(60, 52, 68.5, 3.6);    // Central Supermarket
    createWalkwayStrip(100, 52, 71.5, 3.0);   // Mama Nkechi Bukka
    createWalkwayStrip(126, 52, 72.0, 3.0);   // Iya Basira Snacks
    createWalkwayStrip(150, 52, 72.0, 3.0);   // Campus Grills & Shawarma
    createWalkwayStrip(172, 52, 72.5, 2.8);   // Mama Bimpe Akara
    createWalkwayStrip(36, 52, 72.5, 2.8);    // Campus Laundromat
    createWalkwayStrip(80, 52, 72.5, 2.8);    // Gadgets Mobile Hub
    createWalkwayStrip(60, 52, 35.5, 3.2);    // SUG Secretariat
    createWalkwayStrip(86, 52, 34.0, 3.0);    // Cybercafé & Print Hub
    createWalkwayStrip(140, 52, 34.0, 2.8);   // Executive Barber & Salon
    createWalkwayStrip(165, 52, 34.0, 3.0);   // Campus Oasis Café
    createWalkwayStrip(38, 52, 34.0, 2.8);    // Village Express Mini-Mart
    createWalkwayStrip(110, 52, 37.0, 3.4);   // Convocation Auditorium

    // 4. East Health, Worship & Sports Walkways (Connecting road at z = -48)
    createWalkwayStrip(60, -48, -68.5, 3.2);  // Health Centre & Pharmacy
    createWalkwayStrip(105, -48, -67.5, 3.6); // Interfaith Chapel & Mosque
    createWalkwayStrip(60, -48, -34.0, 3.0);  // Faculty of Law
    createWalkwayStrip(105, -48, -32.0, 2.8); // Microfinance Bank
    createHorizontalWalkwayStrip(-50, 132, 145, 3.4); // Football Stadium Turnstiles
    createHorizontalWalkwayStrip(-10, 145, 151, 3.0); // Basketball Arena Entrance

    // 5. Senate Building Ceremonial Esplanade (Connecting Drop-off Loop at z = -155 to Portico)
    createWalkwayStrip(0, -155, -158.5, 7.5);

    // 6. Pedestrian Zebra Crossings at Major Intersections
    const createZebraCrossing = (cx: number, cz: number, orientation: 'h' | 'v' = 'h') => {
      const stripes = 6;
      for (let i = 0; i < stripes; i++) {
        const offset = (i - (stripes - 1) / 2) * 1.1;
        const stripe = new THREE.Mesh(
          orientation === 'h' ? new THREE.PlaneGeometry(0.55, 3.8) : new THREE.PlaneGeometry(3.8, 0.55),
          zebraMat
        );
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(
          orientation === 'h' ? cx + offset : cx,
          0.026,
          orientation === 'h' ? cz : cz + offset
        );
        scene.add(stripe);
      }
    };

    // Zebra Crossings at Roundabout & Intersections
    createZebraCrossing(0, 24, 'h');
    createZebraCrossing(0, -24, 'h');
    createZebraCrossing(23, 0, 'v');
    createZebraCrossing(-23, 0, 'v');
    createZebraCrossing(-50, -48, 'h');
    createZebraCrossing(-60, 55, 'h');
    createZebraCrossing(60, 52, 'h');
    createZebraCrossing(60, -48, 'h');

    // ============================================================
    // 4. CENTRAL LANDMARK TOWER (AT CENTER OF ROUNDABOUT x=0, z=0)
    // Towering castle-inspired architectural landmark with university crest
    // ============================================================
    const landmarkTower = new THREE.Group();
    landmarkTower.position.set(0, 0, 0);

    const stoneTowerMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const greenTowerMat = new THREE.MeshLambertMaterial({ color: '#064e3b' });
    const goldTowerMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
    const creamTowerMat = new THREE.MeshLambertMaterial({ color: '#fef3c7' });

    // Tier 1: Monumental Stepped Base
    const baseP1 = new THREE.Mesh(new THREE.BoxGeometry(10, 1.6, 10), stoneTowerMat);
    baseP1.position.y = 0.8;
    baseP1.castShadow = true;
    landmarkTower.add(baseP1);

    const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.35, 10.4), goldTowerMat);
    baseTrim.position.y = 1.7;
    landmarkTower.add(baseTrim);

    // Tier 2: Lower Tower Body with 4 Grand Archway Portals
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 8), greenTowerMat);
    lowerBody.position.y = 5.8;
    lowerBody.castShadow = true;
    landmarkTower.add(lowerBody);

    // 4 Corner Quoins on Lower Body
    [[-4, -4], [-4, 4], [4, -4], [4, 4]].forEach(([qx, qz]) => {
      const quoin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 8, 0.8), goldTowerMat);
      quoin.position.set(qx, 5.8, qz);
      landmarkTower.add(quoin);
    });

    // Commemorative Bronze Plaque for The Omo Tower
    const towerPlaqueCanvas = document.createElement('canvas');
    towerPlaqueCanvas.width = 512;
    towerPlaqueCanvas.height = 160;
    const tpCtx = towerPlaqueCanvas.getContext('2d');
    if (tpCtx) {
      tpCtx.fillStyle = '#b45309';
      tpCtx.fillRect(0, 0, 512, 160);
      tpCtx.strokeStyle = '#fef08a';
      tpCtx.lineWidth = 8;
      tpCtx.strokeRect(8, 8, 496, 144);
      tpCtx.fillStyle = '#fef08a';
      tpCtx.font = 'bold 36px serif';
      tpCtx.textAlign = 'center';
      tpCtx.fillText('THE OMO TOWER', 256, 60);
      tpCtx.fillStyle = '#ffffff';
      tpCtx.font = 'bold 20px sans-serif';
      tpCtx.fillText('FEDERAL UNIVERSITY OF OMO', 256, 105);
      tpCtx.fillStyle = '#fde68a';
      tpCtx.font = 'bold 15px serif';
      tpCtx.fillText('CENTRAL ROUNDABOUT MONUMENT • EST. 1926', 256, 138);
    }
    const towerPlaqueTex = new THREE.CanvasTexture(towerPlaqueCanvas);
    [
      [0, 2.4, 4.05, 0],
      [0, 2.4, -4.05, Math.PI],
      [4.05, 2.4, 0, Math.PI / 2],
      [-4.05, 2.4, 0, -Math.PI / 2]
    ].forEach(([px, py, pz, rotY]) => {
      const plaqueMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.6, 1.2),
        new THREE.MeshBasicMaterial({ map: towerPlaqueTex })
      );
      plaqueMesh.position.set(px, py, pz);
      plaqueMesh.rotation.y = rotY;
      landmarkTower.add(plaqueMesh);
    });

    // 4 Upward Spotlights on Roundabout Lawn illuminating The Omo Tower
    [[-8, 8], [8, 8], [-8, -8], [8, -8]].forEach(([lx, lz]) => {
      const upSpot = new THREE.SpotLight('#f59e0b', 1.8, 38, Math.PI / 4, 0.5);
      upSpot.position.set(lx, 0.4, lz);
      upSpot.target.position.set(0, 18, 0);
      scene.add(upSpot);
      scene.add(upSpot.target);
    });

    // Tier 3: Mid Tower Body with Official University Crest Emblem
    const midTrim = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.5, 8.6), goldTowerMat);
    midTrim.position.y = 10.0;
    landmarkTower.add(midTrim);

    const midBody = new THREE.Mesh(new THREE.BoxGeometry(6.6, 9, 6.6), stoneTowerMat);
    midBody.position.y = 14.5;
    midBody.castShadow = true;
    landmarkTower.add(midBody);

    // University Logo Crest Emblems on all 4 faces of Tier 3
    const crestCanvas = document.createElement('canvas');
    crestCanvas.width = 256;
    crestCanvas.height = 256;
    const cCtx = crestCanvas.getContext('2d');
    if (cCtx) {
      cCtx.fillStyle = '#064e3b';
      cCtx.fillRect(0, 0, 256, 256);
      cCtx.strokeStyle = '#f59e0b';
      cCtx.lineWidth = 10;
      cCtx.strokeRect(8, 8, 240, 240);
      cCtx.fillStyle = '#f59e0b';
      cCtx.beginPath();
      cCtx.arc(128, 128, 90, 0, Math.PI * 2);
      cCtx.fill();
      cCtx.fillStyle = '#064e3b';
      cCtx.beginPath();
      cCtx.arc(128, 128, 78, 0, Math.PI * 2);
      cCtx.fill();
      cCtx.fillStyle = '#fef08a';
      cCtx.font = 'bold 36px serif';
      cCtx.textAlign = 'center';
      cCtx.textBaseline = 'middle';
      cCtx.fillText('★ FUO ★', 128, 128);
    }
    const crestTex = new THREE.CanvasTexture(crestCanvas);
    [
      [0, 14.5, 3.32, 0],
      [0, 14.5, -3.32, Math.PI],
      [3.32, 14.5, 0, Math.PI / 2],
      [-3.32, 14.5, 0, -Math.PI / 2]
    ].forEach(([cx, cy, cz, rotY]) => {
      const emblemMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 3.5),
        new THREE.MeshBasicMaterial({ map: crestTex })
      );
      emblemMesh.position.set(cx, cy, cz);
      emblemMesh.rotation.y = rotY;
      landmarkTower.add(emblemMesh);
    });

    // Tier 4: Clock Tower Chamber with 4 Glowing Clock Dials
    const clockCornice = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.6, 7.2), goldTowerMat);
    clockCornice.position.y = 19.3;
    landmarkTower.add(clockCornice);

    const clockChamber = new THREE.Mesh(new THREE.BoxGeometry(5.4, 6.5, 5.4), creamTowerMat);
    clockChamber.position.y = 22.8;
    clockChamber.castShadow = true;
    landmarkTower.add(clockChamber);

    const clockFaceMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    [
      [0, 22.8, 2.72, 0],
      [0, 22.8, -2.72, Math.PI],
      [2.72, 22.8, 0, Math.PI / 2],
      [-2.72, 22.8, 0, -Math.PI / 2]
    ].forEach(([cx, cy, cz, rotY]) => {
      const dial = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), clockFaceMat);
      dial.position.set(cx, cy, cz);
      dial.rotation.y = rotY;
      landmarkTower.add(dial);
    });

    // Tier 5: Castle Crenellations / Battlements & High Gold-Tipped Spire
    const battlementRoof = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.4, 6.2), stoneTowerMat);
    battlementRoof.position.y = 26.25;
    landmarkTower.add(battlementRoof);

    // Crenellation teeth
    [
      [-2.8, 26.8, -2.8], [0, 26.8, -2.8], [2.8, 26.8, -2.8],
      [-2.8, 26.8, 2.8], [0, 26.8, 2.8], [2.8, 26.8, 2.8],
      [-2.8, 26.8, 0], [2.8, 26.8, 0]
    ].forEach(([bx, by, bz]) => {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), goldTowerMat);
      tooth.position.set(bx, by, bz);
      landmarkTower.add(tooth);
    });

    // Elegant Slender Spire reaching to y = 36m!
    const spireMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
    const spire = new THREE.Mesh(new THREE.ConeGeometry(2.4, 8.5, 8), spireMat);
    spire.position.y = 30.7;
    landmarkTower.add(spire);

    const finialSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 16),
      new THREE.MeshBasicMaterial({ color: '#fef08a' })
    );
    finialSphere.position.y = 35.3;
    landmarkTower.add(finialSphere);

    scene.add(landmarkTower);

    // Collider for Central Landmark Tower
    const towerCol = new THREE.Box3();
    towerCol.setFromCenterAndSize(new THREE.Vector3(0, 15, 0), new THREE.Vector3(12, 35, 12));
    collidersRef.current.push(towerCol);

    // ============================================================
    // 5. FOUR LARGE MASCOT STATUES (MONOPOLY GUY IN SUIT & TOP HAT)
    // ============================================================
    // 1. Main Entrance Gate Plaza (welcoming incoming students)
    const statueGate = createMascotStatue(0, 126, Math.PI, 'ENTRANCE MONUMENT');
    scene.add(statueGate);
    const statueGateCol = new THREE.Box3();
    statueGateCol.setFromCenterAndSize(new THREE.Vector3(0, 2.5, 126), new THREE.Vector3(3, 5, 3));
    collidersRef.current.push(statueGateCol);

    // 2. Central Roundabout Terrace Plaza (south of landmark tower)
    const statueRoundabout = createMascotStatue(0, 9, Math.PI, 'FOUNDING VISITOR');
    scene.add(statueRoundabout);
    const statueRoundCol = new THREE.Box3();
    statueRoundCol.setFromCenterAndSize(new THREE.Vector3(0, 2.5, 9), new THREE.Vector3(3, 5, 3));
    collidersRef.current.push(statueRoundCol);

    // 3. Academic Quadrangle Grand Plaza (between Library & Faculties)
    const statueAcademic = createMascotStatue(-80, -48, 0, 'SEAT OF SCHOLARSHIP');
    scene.add(statueAcademic);
    const statueAcadCol = new THREE.Box3();
    statueAcadCol.setFromCenterAndSize(new THREE.Vector3(-80, 2.5, -48), new THREE.Vector3(3, 5, 3));
    collidersRef.current.push(statueAcadCol);

    // 4. Commercial & Recreation Promenade Plaza
    const statueCommercial = createMascotStatue(80, 18, -Math.PI / 2, 'COMMERCE & YOUTH');
    scene.add(statueCommercial);
    const statueCommCol = new THREE.Box3();
    statueCommCol.setFromCenterAndSize(new THREE.Vector3(80, 2.5, 18), new THREE.Vector3(3, 5, 3));
    collidersRef.current.push(statueCommCol);

    // ============================================================
    // 6. CONTINUOUS PERIMETER FENCE & GATES (SECTION 8)
    // Encloses on-campus grounds; Off-campus hostels are strictly OUTSIDE!
    // ============================================================
    const fenceGroup = new THREE.Group();
    const pillarStoneMat = new THREE.MeshLambertMaterial({ color: '#064e3b' });
    const goldPillarCapMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
    const railingIronMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });

    const createFencePillar = (px: number, pz: number) => {
      const p = new THREE.Group();
      p.position.set(px, 0, pz);

      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 1.2), pillarStoneMat);
      pillar.position.y = 1.8;
      pillar.castShadow = true;
      p.add(pillar);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 1.4), goldPillarCapMat);
      cap.position.y = 3.65;
      p.add(cap);

      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), goldPillarCapMat);
      sphere.position.y = 3.95;
      p.add(sphere);

      return p;
    };

    // North Perimeter Fence (z = -195, x ∈ [-185, 220] - Housing all campus buildings & stadium)
    for (let fx = -185; fx <= 220; fx += 15) {
      fenceGroup.add(createFencePillar(fx, -195));
      if (fx < 220) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(13.8, 2.8, 0.2), railingIronMat);
        rail.position.set(fx + 7.5, 1.8, -195);
        fenceGroup.add(rail);
      }
    }
    const northFenceCol = new THREE.Box3();
    northFenceCol.setFromCenterAndSize(new THREE.Vector3(17.5, 2, -195), new THREE.Vector3(410, 4, 3));
    collidersRef.current.push(northFenceCol);

    // West Perimeter Fence (x = -185, z ∈ [-195, 140])
    for (let fz = -195; fz <= 140; fz += 15) {
      fenceGroup.add(createFencePillar(-185, fz));
      if (fz < 140) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 13.8), railingIronMat);
        rail.position.set(-185, 1.8, fz + 7.5);
        fenceGroup.add(rail);
      }
    }
    const westFenceCol = new THREE.Box3();
    westFenceCol.setFromCenterAndSize(new THREE.Vector3(-185, 2, -27.5), new THREE.Vector3(3, 4, 340));
    collidersRef.current.push(westFenceCol);

    // East Perimeter Fence (x = 220, z ∈ [-195, 140] - Completely encloses Stadium & Sports Complex)
    for (let fz = -195; fz <= 140; fz += 15) {
      fenceGroup.add(createFencePillar(220, fz));
      if (fz < 140) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 13.8), railingIronMat);
        rail.position.set(220, 1.8, fz + 7.5);
        fenceGroup.add(rail);
      }
    }
    const eastFenceCol = new THREE.Box3();
    eastFenceCol.setFromCenterAndSize(new THREE.Vector3(220, 2, -27.5), new THREE.Vector3(3, 4, 340));
    collidersRef.current.push(eastFenceCol);

    // South Perimeter Fence (z = 140, on left and right of Main Gate x ∈ [-18, 18])
    // Left Wing (x = -185 to x = -18)
    for (let fx = -185; fx <= -18; fx += 15) {
      fenceGroup.add(createFencePillar(fx, 140));
      if (fx < -18) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(13.8, 2.8, 0.2), railingIronMat);
        rail.position.set(fx + 7.5, 1.8, 140);
        fenceGroup.add(rail);
      }
    }
    const southLeftCol = new THREE.Box3();
    southLeftCol.setFromCenterAndSize(new THREE.Vector3(-101.5, 2, 140), new THREE.Vector3(170, 4, 3));
    collidersRef.current.push(southLeftCol);

    // Right Wing (x = 18 to x = 220)
    for (let fx = 18; fx <= 220; fx += 15) {
      fenceGroup.add(createFencePillar(fx, 140));
      if (fx < 220) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(13.8, 2.8, 0.2), railingIronMat);
        rail.position.set(fx + 7.5, 1.8, 140);
        fenceGroup.add(rail);
      }
    }
    const southRightCol = new THREE.Box3();
    southRightCol.setFromCenterAndSize(new THREE.Vector3(119, 2, 140), new THREE.Vector3(205, 4, 3));
    collidersRef.current.push(southRightCol);

    scene.add(fenceGroup);

    // ============================================================
    // 7. SCENIC CAMPUS POND & TREADABLE ARCHED FOOTBRIDGE (AT z = 80)
    // ============================================================
    const pondGroup = new THREE.Group();
    pondGroup.position.set(0, 0, 80);

    const pondWaterMat = new THREE.MeshLambertMaterial({
      color: '#0284c7',
      transparent: true,
      opacity: 0.88
    });
    const pondWater = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.04, 36), pondWaterMat);
    pondWater.position.set(0, 0.015, 0);
    pondGroup.add(pondWater);

    // River Stone Rim around Pond
    const stoneRimMat = new THREE.MeshLambertMaterial({ color: '#64748b' });
    for (let a = 0; a < Math.PI * 2; a += 0.25) {
      const sx = Math.cos(a) * 18.2;
      const sz = Math.sin(a) * 18.2;
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65), stoneRimMat);
      stone.position.set(sx, 0.3, sz);
      pondGroup.add(stone);
    }

    // Water Lily Pads & Blossoms
    const lilyMat = new THREE.MeshLambertMaterial({ color: '#15803d' });
    const flowerMat = new THREE.MeshLambertMaterial({ color: '#f43f5e' });
    [[-8, 6], [-10, -5], [9, 7], [11, -6], [-4, -9], [7, -10]].forEach(([lx, lz]) => {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(1.2, 12), lilyMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(lx, 0.035, lz);
      pondGroup.add(pad);

      const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), flowerMat);
      blossom.position.set(lx, 0.25, lz);
      pondGroup.add(blossom);
    });

    // 7B. TREADABLE ARCHED FOOTBRIDGE (Pedestrians walk across at x=0, z ∈ [62, 98])
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, 0, 0);

    const woodPlankMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const railWoodMat = new THREE.MeshLambertMaterial({ color: '#b45309' });

    for (let pz = -17; pz <= 17; pz += 1.0) {
      const progress = 1 - Math.abs(pz) / 18;
      const archY = 0.08 + progress * 0.42;

      const plank = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 0.9), woodPlankMat);
      plank.position.set(0, archY, pz);
      plank.receiveShadow = true;
      bridgeGroup.add(plank);

      [-2.1, 2.1].forEach((rx) => {
        const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.95, 6), railWoodMat);
        baluster.position.set(rx, archY + 0.48, pz);
        bridgeGroup.add(baluster);
      });
    }

    [-2.1, 2.1].forEach((rx) => {
      const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 35), railWoodMat);
      handrail.position.set(rx, 0.9, 0);
      bridgeGroup.add(handrail);
    });

    pondGroup.add(bridgeGroup);
    scene.add(pondGroup);

    // ============================================================
    // 8. ARCHITECTURAL BUILDINGS (DOORS, WINDOWS, HEIGHTS, ROOFS)
    // ============================================================
    collidersRef.current = [];
    floatingIndicatorsRef.current = [];

    // CUSTOM GRAND CAMPUS MAIN GATE COMPLEX (SECTION 2C & PHASE 2C)
    // Full Monumental Archway with exact inscription:
    // "WELCOME TO FEDERAL UNIVERSITY OF OMO SURULERE CAMPUS"
    const createMainGateComplex = (poi: CampusPOI) => {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(0, 0, 140);

      const stoneGreenMat = new THREE.MeshLambertMaterial({ color: '#064e3b' });
      const goldTrimMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
      const darkSlateMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });

      // 1. Left & Right Monumental Gatehouse Towers
      // Flanking the central 15m roadway corridor
      [-13, 13].forEach((tx) => {
        const tower = new THREE.Group();
        tower.position.set(tx, 0, 0);

        // Tower Body: width 8.5, height 8.0, depth 6.0
        const body = new THREE.Mesh(new THREE.BoxGeometry(8.5, 8.0, 6.0), stoneGreenMat);
        body.position.y = 4.0;
        body.castShadow = true;
        body.receiveShadow = true;
        tower.add(body);

        // Gold Corner Quoins (Rusticated stone accents)
        [[-4.25, -3.0], [-4.25, 3.0], [4.25, -3.0], [4.25, 3.0]].forEach(([qx, qz]) => {
          const quoin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 8.0, 0.8), goldTrimMat);
          quoin.position.set(qx, 4.0, qz);
          tower.add(quoin);
        });

        // Cornice Stringcourse & Parapet Battlements
        const cornice = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.4, 6.5), goldTrimMat);
        cornice.position.y = 8.2;
        tower.add(cornice);

        const parapet = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.2, 6.3), stoneGreenMat);
        parapet.position.y = 9.0;
        tower.add(parapet);

        // Parapet Crenellation Teeth
        [-3.6, -1.2, 1.2, 3.6].forEach((cx) => {
          [-3.0, 3.0].forEach((cz) => {
            const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.4), goldTrimMat);
            tooth.position.set(cx, 9.9, cz);
            tower.add(tooth);
          });
        });

        // Observation Windows on front and back
        [-1.8, 1.8].forEach((wx) => {
          [-3.05, 3.05].forEach((wz) => {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
            win.position.set(wx, 4.2, wz);
            if (wz < 0) win.rotation.y = Math.PI;
            tower.add(win);

            const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.1), darkSlateMat);
            frame.position.set(wx, 4.2, wz > 0 ? wz - 0.05 : wz + 0.05);
            tower.add(frame);
          });
        });

        // Security Doorway
        const door = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.2, 0.15), darkSlateMat);
        door.position.set(0, 1.6, 3.08);
        tower.add(door);

        // Flagpole on top of tower (11.5m above ground)
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.5, 8), goldTrimMat);
        pole.position.set(0, 11.5, 0);
        tower.add(pole);

        // Flag canvas: Nigerian Flag on Left Tower, FUO Crest Flag on Right Tower
        const flagCanvas = document.createElement('canvas');
        flagCanvas.width = 256;
        flagCanvas.height = 160;
        const fCtx = flagCanvas.getContext('2d')!;
        if (tx < 0) {
          // Nigerian Green-White-Green Flag
          fCtx.fillStyle = '#16a34a';
          fCtx.fillRect(0, 0, 85, 160);
          fCtx.fillStyle = '#ffffff';
          fCtx.fillRect(85, 0, 86, 160);
          fCtx.fillStyle = '#16a34a';
          fCtx.fillRect(171, 0, 85, 160);
        } else {
          // FUO Crest Flag
          fCtx.fillStyle = '#064e3b';
          fCtx.fillRect(0, 0, 256, 160);
          fCtx.strokeStyle = '#f59e0b';
          fCtx.lineWidth = 8;
          fCtx.strokeRect(6, 6, 244, 148);
          fCtx.fillStyle = '#f59e0b';
          fCtx.beginPath();
          fCtx.arc(128, 80, 50, 0, Math.PI * 2);
          fCtx.fill();
          fCtx.fillStyle = '#064e3b';
          fCtx.font = 'bold 24px sans-serif';
          fCtx.textAlign = 'center';
          fCtx.textBaseline = 'middle';
          fCtx.fillText('FUO', 128, 80);
        }
        const flagTex = new THREE.CanvasTexture(flagCanvas);
        const flagMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(2.4, 1.5),
          new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide })
        );
        flagMesh.position.set(1.25, 12.8, 0);
        tower.add(flagMesh);

        gateGroup.add(tower);
      });

      // 2. Grand Monumental Overarching Archway Lintel Spanning Road (x ∈ [-8.75, 8.75])
      // Total span = 17.5m, Height = 3.2m, Bottom at y = 6.0m (clearance 6.0m!), Top at y = 9.2m
      const archLintel = new THREE.Mesh(new THREE.BoxGeometry(17.5, 3.2, 4.0), stoneGreenMat);
      archLintel.position.set(0, 7.6, 0);
      archLintel.castShadow = true;
      gateGroup.add(archLintel);

      // Gold Trim molding along the arch lintel
      const archTrimBottom = new THREE.Mesh(new THREE.BoxGeometry(17.8, 0.35, 4.2), goldTrimMat);
      archTrimBottom.position.set(0, 6.0, 0);
      gateGroup.add(archTrimBottom);

      const archTrimTop = new THREE.Mesh(new THREE.BoxGeometry(18.0, 0.45, 4.4), goldTrimMat);
      archTrimTop.position.set(0, 9.35, 0);
      gateGroup.add(archTrimTop);

      // Pediment Crown on top of Central Arch
      const pediment = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 7.0, 2.2, 3),
        stoneGreenMat
      );
      pediment.rotation.z = Math.PI / 2;
      pediment.rotation.y = Math.PI / 2;
      pediment.position.set(0, 10.6, 0);
      gateGroup.add(pediment);

      const pedimentGoldBorder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 7.3, 0.25, 3),
        goldTrimMat
      );
      pedimentGoldBorder.rotation.z = Math.PI / 2;
      pedimentGoldBorder.rotation.y = Math.PI / 2;
      pedimentGoldBorder.position.set(0, 10.6, 2.05);
      gateGroup.add(pedimentGoldBorder);

      // Official University Medallion Badge in Pediment Center
      const sealCanvas = document.createElement('canvas');
      sealCanvas.width = 256;
      sealCanvas.height = 256;
      const sCtx = sealCanvas.getContext('2d')!;
      sCtx.fillStyle = '#f59e0b';
      sCtx.beginPath();
      sCtx.arc(128, 128, 120, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.fillStyle = '#064e3b';
      sCtx.beginPath();
      sCtx.arc(128, 128, 105, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.fillStyle = '#fef08a';
      sCtx.font = 'bold 36px serif';
      sCtx.textAlign = 'center';
      sCtx.textBaseline = 'middle';
      sCtx.fillText('★ FUO ★', 128, 110);
      sCtx.font = 'bold 18px sans-serif';
      sCtx.fillText('1926', 128, 150);
      const sealTex = new THREE.CanvasTexture(sealCanvas);

      [2.15, -2.15].forEach((sz) => {
        const sealMesh = new THREE.Mesh(
          new THREE.CircleGeometry(1.4, 24),
          new THREE.MeshBasicMaterial({ map: sealTex })
        );
        sealMesh.position.set(0, 10.6, sz);
        if (sz < 0) sealMesh.rotation.y = Math.PI;
        gateGroup.add(sealMesh);
      });

      // 3. High-Resolution Inscription Banners (South Face & North Face)
      // EXACT REQUIRED TEXT: "WELCOME TO FEDERAL UNIVERSITY OF OMO SURULERE CAMPUS"
      const createGateBannerTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;

        // Emerald Green Institutional Field
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, 1024, 256);

        // Rich Gold Borders
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, 1004, 236);

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.strokeRect(18, 18, 988, 220);

        // Corner Filigree Emblems
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 28px serif';
        ctx.textAlign = 'left';
        ctx.fillText('◆', 30, 48);
        ctx.textAlign = 'right';
        ctx.fillText('◆', 994, 48);

        // Line 1: Primary Salutation & University Name
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fef08a';
        ctx.font = '900 44px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 10;
        ctx.fillText('WELCOME TO FEDERAL UNIVERSITY OF OMO', 512, 90);

        // Line 2: Campus Designation & Location
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 36px sans-serif';
        ctx.fillText('SURULERE CAMPUS', 512, 146);

        // Line 3: Institutional Motto
        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 22px serif';
        ctx.fillText('◆ EST. 1926 • DISCIPLINE, DIGNITY & ACADEMIC EXCELLENCE ◆', 512, 202);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
      };

      const bannerTex = createGateBannerTexture();

      // South Face Banner (Facing incoming traffic from outside gate at z = 142)
      const southBanner = new THREE.Mesh(
        new THREE.PlaneGeometry(16.5, 2.7),
        new THREE.MeshBasicMaterial({ map: bannerTex })
      );
      southBanner.position.set(0, 7.6, 2.05);
      gateGroup.add(southBanner);

      // North Face Banner (Facing outgoing traffic inside campus at z = 138)
      const northBanner = new THREE.Mesh(
        new THREE.PlaneGeometry(16.5, 2.7),
        new THREE.MeshBasicMaterial({ map: bannerTex })
      );
      northBanner.position.set(0, 7.6, -2.05);
      northBanner.rotation.y = Math.PI;
      gateGroup.add(northBanner);

      // 4. Center Security Sentry Island & Open Boom Barriers
      const centerIsland = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.35, 7.0),
        new THREE.MeshLambertMaterial({ color: '#94a3b8' })
      );
      centerIsland.position.set(0, 0.18, 0);
      gateGroup.add(centerIsland);

      const sentryBooth = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 3.2, 2.4),
        stoneGreenMat
      );
      sentryBooth.position.set(0, 1.75, 0);
      gateGroup.add(sentryBooth);

      const sentryRoof = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.35, 2.8),
        goldTrimMat
      );
      sentryRoof.position.set(0, 3.45, 0);
      gateGroup.add(sentryRoof);

      // Security boom gates (yellow-and-black hazard warning)
      [-4.0, 4.0].forEach((bx) => {
        const boom = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8),
          new THREE.MeshLambertMaterial({ color: '#facc15' })
        );
        boom.rotation.z = Math.PI / 4; // Tilted upwards in open transit position
        boom.position.set(bx * 0.35, 2.2, 1.6);
        gateGroup.add(boom);
      });

      // 5. Illumination Spotlights on Gate
      const gateSpotL = new THREE.SpotLight('#fef08a', 2.0, 30, Math.PI / 4, 0.4);
      gateSpotL.position.set(-8, 9.5, 4.5);
      gateSpotL.target.position.set(0, 7.6, 2);
      gateGroup.add(gateSpotL);
      gateGroup.add(gateSpotL.target);

      const gateSpotR = new THREE.SpotLight('#fef08a', 2.0, 30, Math.PI / 4, 0.4);
      gateSpotR.position.set(8, 9.5, 4.5);
      gateSpotR.target.position.set(0, 7.6, 2);
      gateGroup.add(gateSpotR);
      gateGroup.add(gateSpotR.target);

      // 6. Floating 3D Interaction Indicator
      const indTex = createIndicatorTexture(poi);
      const indMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(8.5, 3.4),
        new THREE.MeshBasicMaterial({ map: indTex, transparent: true })
      );
      indMesh.position.set(0, 13.8, 0);
      gateGroup.add(indMesh);
      floatingIndicatorsRef.current.push({ mesh: indMesh, poi, baseY: 13.8 });

      scene.add(gateGroup);

      // Precise Physics Colliders (Towers & Sentry only; Roadway is 100% CLEAR!)
      const leftTowerCol = new THREE.Box3();
      leftTowerCol.setFromCenterAndSize(new THREE.Vector3(-13, 4.0, 140), new THREE.Vector3(9.0, 8.5, 6.8));
      collidersRef.current.push(leftTowerCol);

      const rightTowerCol = new THREE.Box3();
      rightTowerCol.setFromCenterAndSize(new THREE.Vector3(13, 4.0, 140), new THREE.Vector3(9.0, 8.5, 6.8));
      collidersRef.current.push(rightTowerCol);

      const sentryCol = new THREE.Box3();
      sentryCol.setFromCenterAndSize(new THREE.Vector3(0, 1.8, 140), new THREE.Vector3(1.5, 3.6, 2.6));
      collidersRef.current.push(sentryCol);
    };

    // ============================================================
    // BATCH 2: FULL REALISTIC FOOTBALL STADIUM ARCHITECTURE
    // Full-size association pitch, grass stripes, markings, goalposts,
    // covered grandstand, team dugouts, perimeter LED boards, floodlights
    // ============================================================
    const createFootballStadiumComplex = (poi: CampusPOI) => {
      const [bx, by, bz] = poi.position;
      const stadiumGroup = new THREE.Group();
      stadiumGroup.position.set(bx, 0, bz);

      const whiteLineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const grassDark = new THREE.MeshLambertMaterial({ color: '#15803d' });
      const grassLight = new THREE.MeshLambertMaterial({ color: '#16a34a' });
      const postWhite = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
      const netMat = new THREE.MeshBasicMaterial({ color: '#e2e8f0', wireframe: true });
      const concreteMat = new THREE.MeshLambertMaterial({ color: '#334155' });
      const seatGreenMat = new THREE.MeshLambertMaterial({ color: '#047857' });
      const seatGoldMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
      const roofMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });
      const steelMat = new THREE.MeshLambertMaterial({ color: '#94a3b8' });

      // 1. Mowed Pitch Turf with 10 Alternating Emerald Stripes (60m x 36m)
      const stripeWidth = 6.0;
      for (let i = 0; i < 10; i++) {
        const sx = -27 + i * stripeWidth;
        const stripeMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(stripeWidth, 36),
          i % 2 === 0 ? grassDark : grassLight
        );
        stripeMesh.rotation.x = -Math.PI / 2;
        stripeMesh.position.set(sx, 0.02, 0);
        stripeMesh.receiveShadow = true;
        stadiumGroup.add(stripeMesh);
      }

      // Perimeter Apron (Running track surround: 68m x 44m)
      const trackMat = new THREE.MeshLambertMaterial({ color: '#b91c1c' }); // Terracotta athletic track
      const track = new THREE.Mesh(new THREE.PlaneGeometry(70, 46), trackMat);
      track.rotation.x = -Math.PI / 2;
      track.position.set(0, 0.01, 0);
      track.receiveShadow = true;
      stadiumGroup.add(track);

      // 2. Geometrically Exact Pitch Markings
      // Touchlines (North & South: z = +/- 18, length = 60m)
      [-18, 18].forEach((tz) => {
        const tLine = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.18), whiteLineMat);
        tLine.rotation.x = -Math.PI / 2;
        tLine.position.set(0, 0.025, tz);
        stadiumGroup.add(tLine);
      });

      // Goal lines (West & East: x = +/- 30, length = 36m)
      [-30, 30].forEach((gx) => {
        const gLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 36), whiteLineMat);
        gLine.rotation.x = -Math.PI / 2;
        gLine.position.set(gx, 0.025, 0);
        stadiumGroup.add(gLine);
      });

      // Halfway line (x = 0, length = 36m)
      const halfLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 36), whiteLineMat);
      halfLine.rotation.x = -Math.PI / 2;
      halfLine.position.set(0, 0.025, 0);
      stadiumGroup.add(halfLine);

      // Center Circle (Radius = 5.5m)
      const centerCircle = new THREE.Mesh(new THREE.RingGeometry(5.4, 5.58, 36), whiteLineMat);
      centerCircle.rotation.x = -Math.PI / 2;
      centerCircle.position.set(0, 0.026, 0);
      stadiumGroup.add(centerCircle);

      const centerSpot = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), whiteLineMat);
      centerSpot.rotation.x = -Math.PI / 2;
      centerSpot.position.set(0, 0.027, 0);
      stadiumGroup.add(centerSpot);

      // Penalty Boxes at West (x = -30) & East (x = +30)
      [-1, 1].forEach((dir) => {
        const bx = dir * 30;
        // 16.5m depth, 20m width
        const boxFront = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 20), whiteLineMat);
        boxFront.rotation.x = -Math.PI / 2;
        boxFront.position.set(bx - dir * 16.5, 0.025, 0);
        stadiumGroup.add(boxFront);

        [-10, 10].forEach((bz) => {
          const boxSide = new THREE.Mesh(new THREE.PlaneGeometry(16.5, 0.18), whiteLineMat);
          boxSide.rotation.x = -Math.PI / 2;
          boxSide.position.set(bx - dir * 8.25, 0.025, bz);
          stadiumGroup.add(boxSide);
        });

        // 6-Yard Box (5.5m depth, 11m width)
        const sixFront = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 11), whiteLineMat);
        sixFront.rotation.x = -Math.PI / 2;
        sixFront.position.set(bx - dir * 5.5, 0.025, 0);
        stadiumGroup.add(sixFront);

        [-5.5, 5.5].forEach((sz) => {
          const sixSide = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 0.18), whiteLineMat);
          sixSide.rotation.x = -Math.PI / 2;
          sixSide.position.set(bx - dir * 2.75, 0.025, sz);
          stadiumGroup.add(sixSide);
        });

        // Penalty Spot (11m from goal line)
        const penSpot = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), whiteLineMat);
        penSpot.rotation.x = -Math.PI / 2;
        penSpot.position.set(bx - dir * 11, 0.026, 0);
        stadiumGroup.add(penSpot);

        // Penalty Arc (D-Box)
        const dArc = new THREE.Mesh(
          new THREE.RingGeometry(5.4, 5.58, 24, 1, dir > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI),
          whiteLineMat
        );
        dArc.rotation.x = -Math.PI / 2;
        dArc.position.set(bx - dir * 11, 0.026, 0);
        stadiumGroup.add(dArc);
      });

      // Corner Arcs at all 4 corners
      [[-30, -18], [-30, 18], [30, -18], [30, 18]].forEach(([cx, cz]) => {
        const arc = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.05, 12), whiteLineMat);
        arc.rotation.x = -Math.PI / 2;
        arc.position.set(cx, 0.026, cz);
        stadiumGroup.add(arc);
      });

      // 3. Regulation Goals with Netting at West & East
      const createGoal = (gx: number, facingDir: number) => {
        const goal = new THREE.Group();
        goal.position.set(gx, 0, 0);

        // Left post & Right post (7.32m apart, 2.44m high)
        [-3.66, 3.66].forEach((pz) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.44, 16), postWhite);
          post.position.set(0, 1.22, pz);
          post.castShadow = true;
          goal.add(post);

          // Rear ground support
          const rearBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 12), postWhite);
          rearBar.rotation.x = Math.PI / 2;
          rearBar.position.set(-facingDir * 0.9, 0.06, pz);
          goal.add(rearBar);
        });

        // Crossbar
        const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.32, 16), postWhite);
        crossbar.rotation.x = Math.PI / 2;
        crossbar.position.set(0, 2.44, 0);
        crossbar.castShadow = true;
        goal.add(crossbar);

        // Triangular Net Box
        const netBack = new THREE.Mesh(new THREE.PlaneGeometry(7.32, 2.44), netMat);
        netBack.rotation.y = facingDir > 0 ? -Math.PI / 2 : Math.PI / 2;
        netBack.position.set(-facingDir * 1.8, 1.22, 0);
        goal.add(netBack);

        const netTop = new THREE.Mesh(new THREE.PlaneGeometry(7.32, 1.8), netMat);
        netTop.rotation.x = Math.PI / 2;
        netTop.position.set(-facingDir * 0.9, 2.44, 0);
        goal.add(netTop);

        stadiumGroup.add(goal);
      };

      createGoal(-30, 1);
      createGoal(30, -1);

      // 4. North Main Covered Grandstand (Length = 52m, Tiers = 4)
      const grandstand = new THREE.Group();
      grandstand.position.set(0, 0, -22);

      for (let t = 0; t < 5; t++) {
        const tierStep = new THREE.Mesh(
          new THREE.BoxGeometry(54, 0.65, 1.4),
          concreteMat
        );
        tierStep.position.set(0, 0.32 + t * 0.65, -t * 1.3);
        tierStep.castShadow = true;
        grandstand.add(tierStep);

        // Rows of individual seats
        for (let s = -25; s <= 25; s += 1.4) {
          const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.45, 0.55),
            s % 3 === 0 ? seatGoldMat : seatGreenMat
          );
          seat.position.set(s, 0.72 + t * 0.65, -t * 1.3 + 0.1);
          grandstand.add(seat);
        }
      }

      // Grandstand Cantilever Roof Canopy
      const roofCanopy = new THREE.Mesh(
        new THREE.BoxGeometry(56, 0.4, 10),
        roofMat
      );
      roofCanopy.position.set(0, 6.8, -3.2);
      roofCanopy.rotation.x = 0.12;
      grandstand.add(roofCanopy);

      // Steel Support Pillars
      [-26, -13, 0, 13, 26].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6.8, 12), steelMat);
        pillar.position.set(px, 3.4, -6.8);
        grandstand.add(pillar);
      });

      // Stadium VIP Glass Box
      const vipBox = new THREE.Mesh(
        new THREE.BoxGeometry(18, 2.2, 3.5),
        new THREE.MeshLambertMaterial({ color: '#047857' })
      );
      vipBox.position.set(0, 4.2, -6.5);
      grandstand.add(vipBox);

      stadiumGroup.add(grandstand);

      // South Open Spectator Stands (Length = 48m, Tiers = 3)
      const southStand = new THREE.Group();
      southStand.position.set(0, 0, 22);
      for (let t = 0; t < 3; t++) {
        const tier = new THREE.Mesh(new THREE.BoxGeometry(50, 0.6, 1.4), concreteMat);
        tier.position.set(0, 0.3 + t * 0.6, t * 1.3);
        southStand.add(tier);

        for (let s = -23; s <= 23; s += 1.4) {
          const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.45, 0.55),
            seatGreenMat
          );
          seat.position.set(s, 0.68 + t * 0.6, t * 1.3 - 0.1);
          southStand.add(seat);
        }
      }
      stadiumGroup.add(southStand);

      // East End Bleachers
      const eastStand = new THREE.Group();
      eastStand.position.set(34, 0, 0);
      for (let t = 0; t < 3; t++) {
        const tier = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 26), concreteMat);
        tier.position.set(t * 1.3, 0.3 + t * 0.6, 0);
        eastStand.add(tier);
      }
      stadiumGroup.add(eastStand);

      // 5. Team Dugouts on South Touchline (x = +/- 8, z = 19)
      [-9, 9].forEach((dx) => {
        const dugout = new THREE.Group();
        dugout.position.set(dx, 0, 19.5);

        const shelter = new THREE.Mesh(
          new THREE.BoxGeometry(5.2, 2.2, 1.8),
          new THREE.MeshLambertMaterial({ color: '#1e293b', transparent: true, opacity: 0.85 })
        );
        shelter.position.y = 1.1;
        dugout.add(shelter);

        const bench = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.45, 0.6), seatGoldMat);
        bench.position.set(0, 0.45, 0);
        dugout.add(bench);

        stadiumGroup.add(dugout);
      });

      // 6. Perimeter LED Advertising Boards
      const adCanvas = document.createElement('canvas');
      adCanvas.width = 1024;
      adCanvas.height = 128;
      const actx = adCanvas.getContext('2d')!;
      actx.fillStyle = '#0f172a';
      actx.fillRect(0, 0, 1024, 128);
      actx.fillStyle = '#f59e0b';
      actx.font = 'bold 32px sans-serif';
      actx.fillText('★ FUO WARRIORS ★ OMO-PAY TRANSFERS ★ MAMA NKECHI BUKKA ★ VC CUP 2026 ★', 24, 76);
      const adTex = new THREE.CanvasTexture(adCanvas);

      const adBoardNorth = new THREE.Mesh(new THREE.PlaneGeometry(62, 1.0), new THREE.MeshBasicMaterial({ map: adTex }));
      adBoardNorth.position.set(0, 0.5, -19);
      stadiumGroup.add(adBoardNorth);

      const adBoardSouth = new THREE.Mesh(new THREE.PlaneGeometry(62, 1.0), new THREE.MeshBasicMaterial({ map: adTex }));
      adBoardSouth.rotation.y = Math.PI;
      adBoardSouth.position.set(0, 0.5, 18.2);
      stadiumGroup.add(adBoardSouth);

      // 7. Electronic Scoreboard Tower at East
      const scoreTower = new THREE.Group();
      scoreTower.position.set(36, 0, 0);

      const scoreBase = new THREE.Mesh(new THREE.BoxGeometry(3.0, 9.0, 8.0), concreteMat);
      scoreBase.position.y = 4.5;
      scoreTower.add(scoreBase);

      const scoreCanvas = document.createElement('canvas');
      scoreCanvas.width = 512;
      scoreCanvas.height = 256;
      const sctx = scoreCanvas.getContext('2d')!;
      sctx.fillStyle = '#020617';
      sctx.fillRect(0, 0, 512, 256);
      sctx.strokeStyle = '#f59e0b';
      sctx.lineWidth = 8;
      sctx.strokeRect(4, 4, 504, 248);
      sctx.fillStyle = '#fef08a';
      sctx.font = 'bold 30px sans-serif';
      sctx.textAlign = 'center';
      sctx.fillText('FUO STADIUM • VC CUP', 256, 55);
      sctx.fillStyle = '#22c55e';
      sctx.font = 'bold 54px monospace';
      sctx.fillText('FUO  3 - 1  LAW', 256, 140);
      sctx.fillStyle = '#f97316';
      sctx.font = 'bold 32px monospace';
      sctx.fillText('84:20  •  2ND HALF', 256, 210);
      const scoreTex = new THREE.CanvasTexture(scoreCanvas);

      const screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(7.6, 4.2),
        new THREE.MeshBasicMaterial({ map: scoreTex })
      );
      screenMesh.rotation.y = -Math.PI / 2;
      screenMesh.position.set(-1.52, 6.2, 0);
      scoreTower.add(screenMesh);

      stadiumGroup.add(scoreTower);

      // 8. 4 Stadium Floodlight Pylons (18m tall at 4 corners)
      [[-32, -22], [32, -22], [-32, 22], [32, 22]].forEach(([lx, lz]) => {
        const pylon = new THREE.Group();
        pylon.position.set(lx, 0, lz);

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 17, 8), steelMat);
        mast.position.y = 8.5;
        pylon.add(mast);

        // Floodlight bank head
        const head = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.5), concreteMat);
        head.position.y = 17;
        head.rotation.y = Math.atan2(-lz, -lx);
        pylon.add(head);

        const lampMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
        for (let rx = -0.8; rx <= 0.8; rx += 0.8) {
          const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.3, 8), lampMat);
          bulb.position.set(rx, 17, 0.26);
          head.add(bulb);
        }

        // Night Spotlight onto pitch
        const spot = new THREE.SpotLight('#fef08a', 2.0, 55, Math.PI / 4, 0.5);
        spot.position.set(lx, 17, lz);
        spot.target.position.set(0, 0, 0);
        stadiumGroup.add(spot);
        stadiumGroup.add(spot.target);

        stadiumGroup.add(pylon);

        const pylonCol = new THREE.Box3();
        pylonCol.setFromCenterAndSize(new THREE.Vector3(bx + lx, 8, bz + lz), new THREE.Vector3(2, 17, 2));
        collidersRef.current.push(pylonCol);
      });

      // 9. West Entrance Gate & Turnstiles (Facing campus walkway at x = -31)
      const turnstile = new THREE.Group();
      turnstile.position.set(-33, 0, 0);

      const arch = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.5, 9.0), concreteMat);
      arch.position.y = 2.25;
      turnstile.add(arch);

      const bannerCanvas = document.createElement('canvas');
      bannerCanvas.width = 512;
      bannerCanvas.height = 128;
      const bctx = bannerCanvas.getContext('2d')!;
      bctx.fillStyle = '#064e3b';
      bctx.fillRect(0, 0, 512, 128);
      bctx.fillStyle = '#f59e0b';
      bctx.font = 'bold 28px sans-serif';
      bctx.textAlign = 'center';
      bctx.fillText('★ UNIVERSITY STADIUM ★', 256, 50);
      bctx.fillStyle = '#ffffff';
      bctx.font = 'bold 22px sans-serif';
      bctx.fillText('MAIN TURNSTILE ENTRANCE', 256, 95);
      const bTex = new THREE.CanvasTexture(bannerCanvas);

      const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 2.0), new THREE.MeshBasicMaterial({ map: bTex }));
      bannerMesh.rotation.y = -Math.PI / 2;
      bannerMesh.position.set(-0.62, 3.2, 0);
      turnstile.add(bannerMesh);

      stadiumGroup.add(turnstile);

      // Floating 3D Interaction Indicator
      const indTex = createIndicatorTexture(poi);
      const indMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(8.5, 3.4),
        new THREE.MeshBasicMaterial({ map: indTex, transparent: true })
      );
      indMesh.position.set(-33, 8.5, 0);
      stadiumGroup.add(indMesh);
      floatingIndicatorsRef.current.push({ mesh: indMesh, poi, baseY: 8.5 });

      scene.add(stadiumGroup);

      // Stadium Physics Colliders (North grandstand & South stand)
      const northStandCol = new THREE.Box3();
      northStandCol.setFromCenterAndSize(new THREE.Vector3(bx, 3.5, bz - 25), new THREE.Vector3(58, 8, 8));
      collidersRef.current.push(northStandCol);

      const southStandCol = new THREE.Box3();
      southStandCol.setFromCenterAndSize(new THREE.Vector3(bx, 2.0, bz + 24), new THREE.Vector3(52, 5, 6));
      collidersRef.current.push(southStandCol);

      const eastStandCol = new THREE.Box3();
      eastStandCol.setFromCenterAndSize(new THREE.Vector3(bx + 35, 3.5, bz), new THREE.Vector3(6, 8, 28));
      collidersRef.current.push(eastStandCol);
    };

    // ============================================================
    // BATCH 2: FULL REALISTIC BASKETBALL ARENA ARCHITECTURE
    // Tournament acrylic court, regulation lines, dual stanchions with glass
    // backboards, breakaway rims, bleachers, courtside shot clock, floodlights
    // ============================================================
    const createBasketballArenaComplex = (poi: CampusPOI) => {
      const [bx, by, bz] = poi.position;
      const arenaGroup = new THREE.Group();
      arenaGroup.position.set(bx, 0, bz);

      const courtBlue = new THREE.MeshLambertMaterial({ color: '#0284c7' });
      const apronNavy = new THREE.MeshLambertMaterial({ color: '#0369a1' });
      const terracottaKey = new THREE.MeshLambertMaterial({ color: '#c2410c' });
      const whiteLine = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const rimOrange = new THREE.MeshLambertMaterial({ color: '#ea580c' });
      const steelDark = new THREE.MeshLambertMaterial({ color: '#0f172a' });
      const concreteMat = new THREE.MeshLambertMaterial({ color: '#334155' });
      const seatGoldMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
      const netMat = new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true });

      // 1. Basketball Court Floor (Apron: 32m x 19m, Main Court: 28m x 15m)
      const apron = new THREE.Mesh(new THREE.PlaneGeometry(32, 19), apronNavy);
      apron.rotation.x = -Math.PI / 2;
      apron.position.y = 0.02;
      apron.receiveShadow = true;
      arenaGroup.add(apron);

      const court = new THREE.Mesh(new THREE.PlaneGeometry(28, 15), courtBlue);
      court.rotation.x = -Math.PI / 2;
      court.position.y = 0.025;
      court.receiveShadow = true;
      arenaGroup.add(court);

      // Terracotta Key Lanes at West (x = -14) and East (x = 14)
      [-1, 1].forEach((dir) => {
        const key = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.9), terracottaKey);
        key.rotation.x = -Math.PI / 2;
        key.position.set(dir * (14 - 2.9), 0.027, 0);
        arenaGroup.add(key);
      });

      // 2. Geometrically Exact Basketball Court Markings
      // Outer Boundary (28m x 15m)
      [-7.5, 7.5].forEach((sy) => {
        const sideLine = new THREE.Mesh(new THREE.PlaneGeometry(28, 0.15), whiteLine);
        sideLine.rotation.x = -Math.PI / 2;
        sideLine.position.set(0, 0.03, sy);
        arenaGroup.add(sideLine);
      });
      [-14, 14].forEach((ex) => {
        const baseLine = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 15), whiteLine);
        baseLine.rotation.x = -Math.PI / 2;
        baseLine.position.set(ex, 0.03, 0);
        arenaGroup.add(baseLine);
      });

      // Half-Court Line
      const halfLine = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 15), whiteLine);
      halfLine.rotation.x = -Math.PI / 2;
      halfLine.position.set(0, 0.03, 0);
      arenaGroup.add(halfLine);

      // Center Circle (Radius = 1.8m)
      const centerCircle = new THREE.Mesh(new THREE.RingGeometry(1.72, 1.88, 32), whiteLine);
      centerCircle.rotation.x = -Math.PI / 2;
      centerCircle.position.set(0, 0.031, 0);
      arenaGroup.add(centerCircle);

      // Three-Point Arcs (Radius = 6.75m from basket at x = +/- 12.4m)
      [-1, 1].forEach((dir) => {
        const basketX = dir * 12.4;
        const threeArc = new THREE.Mesh(
          new THREE.RingGeometry(6.65, 6.82, 32, 1, dir > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI),
          whiteLine
        );
        threeArc.rotation.x = -Math.PI / 2;
        threeArc.position.set(basketX, 0.031, 0);
        arenaGroup.add(threeArc);

        // Free Throw Line (at distance 5.8m from baseline)
        const ftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 4.9), whiteLine);
        ftLine.rotation.x = -Math.PI / 2;
        ftLine.position.set(dir * (14 - 5.8), 0.031, 0);
        arenaGroup.add(ftLine);

        // Free Throw Circle (Radius = 1.8m)
        const ftCircle = new THREE.Mesh(new THREE.RingGeometry(1.72, 1.88, 24), whiteLine);
        ftCircle.rotation.x = -Math.PI / 2;
        ftCircle.position.set(dir * (14 - 5.8), 0.031, 0);
        arenaGroup.add(ftCircle);
      });

      // 3. Dual Regulation Basketball Stanchions
      const createStanchion = (sx: number, dir: number) => {
        const stanchion = new THREE.Group();
        stanchion.position.set(sx, 0, 0);

        // Padded Heavy-duty base
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), steelDark);
        base.position.set(dir * 1.5, 0.6, 0);
        stanchion.add(base);

        // Angled Cantilever Steel Arm
        const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 0.22), steelDark);
        arm.position.set(dir * 0.6, 3.2, 0);
        arm.rotation.z = dir * 0.28;
        stanchion.add(arm);

        // Mast
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3.8, 12), steelDark);
        mast.position.set(dir * 1.5, 1.9, 0);
        stanchion.add(mast);

        // Tempered Glass Backboard (1.8m x 1.05m at height 3.2m)
        const board = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 1.05, 1.8),
          new THREE.MeshLambertMaterial({ color: '#e0f2fe', transparent: true, opacity: 0.85 })
        );
        board.position.set(0, 3.25, 0);
        stanchion.add(board);

        // Shooter's Red Square on Backboard
        const redBox = new THREE.Mesh(
          new THREE.RingGeometry(0.32, 0.38, 4),
          new THREE.MeshBasicMaterial({ color: '#dc2626', side: THREE.DoubleSide })
        );
        redBox.rotation.y = Math.PI / 2;
        redBox.rotation.z = Math.PI / 4;
        redBox.position.set(-dir * 0.05, 3.2, 0);
        stanchion.add(redBox);

        // Regulation Breakaway Rim (Height = 3.05m, Diameter = 0.45m)
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.035, 12, 24), rimOrange);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(-dir * 0.48, 3.05, 0);
        stanchion.add(rim);

        // White Net
        const net = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.18, 0.45, 12, 1, true), netMat);
        net.position.set(-dir * 0.48, 2.8, 0);
        stanchion.add(net);

        arenaGroup.add(stanchion);
      };

      createStanchion(-14, -1);
      createStanchion(14, 1);

      // 4. North Bleachers (3 Tiers, Length = 26m)
      const bleachers = new THREE.Group();
      bleachers.position.set(0, 0, -10.5);
      for (let t = 0; t < 3; t++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(26, 0.55, 1.3), concreteMat);
        step.position.set(0, 0.28 + t * 0.55, -t * 1.2);
        bleachers.add(step);

        for (let s = -11; s <= 11; s += 1.4) {
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.4, 0.5), seatGoldMat);
          seat.position.set(s, 0.65 + t * 0.55, -t * 1.2 + 0.1);
          bleachers.add(seat);
        }
      }
      arenaGroup.add(bleachers);

      // 5. South Team Bench & Courtside Table
      const benchGroup = new THREE.Group();
      benchGroup.position.set(0, 0, 10.5);

      const bench = new THREE.Mesh(new THREE.BoxGeometry(16, 0.45, 0.7), concreteMat);
      bench.position.y = 0.25;
      benchGroup.add(bench);

      // Water Cooler Station
      const cooler = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12), new THREE.MeshLambertMaterial({ color: '#0284c7' }));
      cooler.position.set(9.5, 0.5, 0);
      benchGroup.add(cooler);

      arenaGroup.add(benchGroup);

      // 6. Courtside Scoreboard & 24s Shot Clock Console
      const scoreBoardGroup = new THREE.Group();
      scoreBoardGroup.position.set(0, 0, 10.2);

      const bbCanvas = document.createElement('canvas');
      bbCanvas.width = 512;
      bbCanvas.height = 160;
      const bbctx = bbCanvas.getContext('2d')!;
      bbctx.fillStyle = '#0f172a';
      bbctx.fillRect(0, 0, 512, 160);
      bbctx.strokeStyle = '#38bdf8';
      bbctx.lineWidth = 6;
      bbctx.strokeRect(4, 4, 504, 152);
      bbctx.fillStyle = '#fef08a';
      bbctx.font = 'bold 26px sans-serif';
      bbctx.textAlign = 'center';
      bbctx.fillText('FUO BASKETBALL ARENA', 256, 40);
      bbctx.fillStyle = '#22c55e';
      bbctx.font = 'bold 44px monospace';
      bbctx.fillText('WARRIORS 84 - 78 TITANS', 256, 95);
      bbctx.fillStyle = '#ef4444';
      bbctx.font = 'bold 30px monospace';
      bbctx.fillText('SHOT CLOCK: 14s • Q4 02:45', 256, 140);
      const bbTex = new THREE.CanvasTexture(bbCanvas);

      const bbMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 2.2), new THREE.MeshBasicMaterial({ map: bbTex }));
      bbMesh.position.set(0, 2.2, 0);
      scoreBoardGroup.add(bbMesh);

      arenaGroup.add(scoreBoardGroup);

      // 7. 4 Floodlight Corner Stanchions (9m tall)
      [[-15, -9], [15, -9], [-15, 9], [15, 9]].forEach(([fx, fz]) => {
        const lightPole = new THREE.Group();
        lightPole.position.set(fx, 0, fz);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 9, 8), steelDark);
        pole.position.y = 4.5;
        lightPole.add(pole);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), new THREE.MeshBasicMaterial({ color: '#fef08a' }));
        bulb.position.y = 9.0;
        lightPole.add(bulb);

        const spot = new THREE.SpotLight('#fef08a', 1.6, 28, Math.PI / 4, 0.4);
        spot.position.set(fx, 9, fz);
        spot.target.position.set(0, 0, 0);
        arenaGroup.add(spot);
        arenaGroup.add(spot.target);

        arenaGroup.add(lightPole);
      });

      // Floating 3D Interaction Indicator
      const indTex = createIndicatorTexture(poi);
      const indMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(8.2, 3.2),
        new THREE.MeshBasicMaterial({ map: indTex, transparent: true })
      );
      indMesh.position.set(-14, 6.5, 0);
      arenaGroup.add(indMesh);
      floatingIndicatorsRef.current.push({ mesh: indMesh, poi, baseY: 6.5 });

      scene.add(arenaGroup);

      // Colliders for Bleachers & Backboards
      const bleacherCol = new THREE.Box3();
      bleacherCol.setFromCenterAndSize(new THREE.Vector3(bx, 1.5, bz - 11.5), new THREE.Vector3(28, 4, 4));
      collidersRef.current.push(bleacherCol);

      const stanchionL = new THREE.Box3();
      stanchionL.setFromCenterAndSize(new THREE.Vector3(bx - 15.5, 2, bz), new THREE.Vector3(3, 4, 3));
      collidersRef.current.push(stanchionL);

      const stanchionR = new THREE.Box3();
      stanchionR.setFromCenterAndSize(new THREE.Vector3(bx + 15.5, 2, bz), new THREE.Vector3(3, 4, 3));
      collidersRef.current.push(stanchionR);
    };

    const createArchitecturalBuilding = (poi: CampusPOI) => {
      if (poi.id === 'main_gate') {
        createMainGateComplex(poi);
        return;
      }
      if (poi.id === 'football_pitch') {
        createFootballStadiumComplex(poi);
        return;
      }
      if (poi.id === 'basketball_court') {
        createBasketballArenaComplex(poi);
        return;
      }

      const [bx, by, bz] = poi.position;
      const [gw, gh, gd] = poi.size;
      const floors = poi.floors || (gh > 15 ? 4 : gh > 9 ? 3 : 2);
      const roofType = poi.roofType || 'flat';

      const buildingGroup = new THREE.Group();
      buildingGroup.position.set(bx, 0, bz);

      const wallMat = new THREE.MeshLambertMaterial({ color: poi.color });
      const roofMat = new THREE.MeshLambertMaterial({ color: poi.roofColor });
      const trimMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
      const windowGlassMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
      const windowFrameMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
      const doorMat = new THREE.MeshLambertMaterial({ color: '#78350f' });

      // 1. Main Structural Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, gd), wallMat);
      body.position.y = gh / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      buildingGroup.add(body);

      // Floor Division String Courses / Cornices
      for (let f = 1; f < floors; f++) {
        const floorY = (gh / floors) * f;
        const stringCourse = new THREE.Mesh(new THREE.BoxGeometry(gw + 0.3, 0.25, gd + 0.3), trimMat);
        stringCourse.position.y = floorY;
        buildingGroup.add(stringCourse);
      }

      // 2. Structured Multi-Storey Windows (Front & Sides)
      const windowWidth = 1.4;
      const windowHeight = 1.6;
      const xSpacing = gw / Math.floor(gw / 3.2);

      for (let f = 0; f < floors; f++) {
        const winY = (gh / floors) * f + (gh / floors) * 0.55;

        // Front Windows
        for (let wx = -gw / 2 + 2.4; wx <= gw / 2 - 2.4; wx += xSpacing) {
          // Avoid window directly inside main entrance door on ground floor
          if (f === 0 && Math.abs(wx) < 2.5) continue;

          // Window Frame
          const frame = new THREE.Mesh(new THREE.BoxGeometry(windowWidth + 0.2, windowHeight + 0.2, 0.1), windowFrameMat);
          frame.position.set(wx, winY, gd / 2 + 0.05);
          buildingGroup.add(frame);

          // Window Glass
          const pane = new THREE.Mesh(new THREE.PlaneGeometry(windowWidth, windowHeight), windowGlassMat);
          pane.position.set(wx, winY, gd / 2 + 0.11);
          buildingGroup.add(pane);
        }

        // Back Windows
        for (let wx = -gw / 2 + 2.4; wx <= gw / 2 - 2.4; wx += xSpacing) {
          const pane = new THREE.Mesh(new THREE.PlaneGeometry(windowWidth, windowHeight), windowGlassMat);
          pane.rotation.y = Math.PI;
          pane.position.set(wx, winY, -gd / 2 - 0.05);
          buildingGroup.add(pane);
        }
      }

      // 3. Clearly Identifiable Main Entrance Portico & Double Doors (Section 4.1)
      const entranceOffset = poi.entranceOffset || [0, 0, gd / 2];
      const doorGroup = new THREE.Group();
      doorGroup.position.set(entranceOffset[0], 0, entranceOffset[2]);

      // Entrance Steps / Landing
      const step = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 2.2), new THREE.MeshLambertMaterial({ color: '#94a3b8' }));
      step.position.y = 0.15;
      doorGroup.add(step);

      // Entrance Pillars
      [-1.8, 1.8].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.8, 0.45), trimMat);
        pillar.position.set(px, 1.9, 0.9);
        doorGroup.add(pillar);
      });

      // Overhead Portico Canopy & Pediment
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.35, 2.2), roofMat);
      canopy.position.set(0, 3.8, 0);
      doorGroup.add(canopy);

      // Double Doors
      const doubleDoor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.15), doorMat);
      doubleDoor.position.set(0, 1.6, 0.05);
      doorGroup.add(doubleDoor);

      // Brass Door Handles
      [-0.15, 0.15].forEach((hx) => {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), trimMat);
        handle.position.set(hx, 1.5, 0.16);
        doorGroup.add(handle);
      });

      buildingGroup.add(doorGroup);

      // 4. Architecturally Varied Roofs (Batch 1 Symmetrical Geometric Construction)
      const roofGroup = new THREE.Group();
      roofGroup.position.y = gh;

      if (roofType === 'gable') {
        const roofHeight = Math.max(3.2, Math.min(6.2, gw * 0.28));
        const eaveX = 0.8;
        const eaveZ = 0.6;
        const gableGeo = createGableRoofGeometry(gw, gd, roofHeight, eaveX, eaveZ);
        const gableMesh = new THREE.Mesh(gableGeo, roofMat);
        gableMesh.castShadow = true;
        gableMesh.receiveShadow = true;
        roofGroup.add(gableMesh);

        // Ridge Cap linear trim running along the top apex
        const ridgeCap = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.16, gd + 2 * eaveZ + 0.1),
          trimMat
        );
        ridgeCap.position.set(0, roofHeight + 0.08, 0);
        roofGroup.add(ridgeCap);

        // Eaves Fascia Boards
        [-gw / 2 - eaveX, gw / 2 + eaveX].forEach((fx) => {
          const fascia = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.35, gd + 2 * eaveZ),
            trimMat
          );
          fascia.position.set(fx, 0, 0);
          roofGroup.add(fascia);
        });
      } else if (roofType === 'hipped') {
        const roofHeight = Math.max(3.2, Math.min(5.8, Math.min(gw, gd) * 0.32));
        const eave = 0.8;
        const hippedGeo = createHippedRoofGeometry(gw, gd, roofHeight, eave);
        const hippedMesh = new THREE.Mesh(hippedGeo, roofMat);
        hippedMesh.castShadow = true;
        hippedMesh.receiveShadow = true;
        roofGroup.add(hippedMesh);

        // Eaves Fascia Perimeter
        const fasciaPerim = new THREE.Mesh(
          new THREE.BoxGeometry(gw + 2 * eave + 0.1, 0.3, gd + 2 * eave + 0.1),
          trimMat
        );
        fasciaPerim.position.y = 0;
        roofGroup.add(fasciaPerim);
      } else if (roofType === 'pyramidal') {
        const roofHeight = Math.max(4.0, Math.min(7.0, Math.max(gw, gd) * 0.35));
        const eave = 0.8;
        const pyrGeo = createPyramidalRoofGeometry(gw, gd, roofHeight, eave);
        const pyrMesh = new THREE.Mesh(pyrGeo, roofMat);
        pyrMesh.castShadow = true;
        pyrMesh.receiveShadow = true;
        roofGroup.add(pyrMesh);

        // Gold Pinnacle Spire atop apex
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 2.8, 8), trimMat);
        spire.position.y = roofHeight + 1.4;
        roofGroup.add(spire);

        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), trimMat);
        finial.position.y = roofHeight + 2.8;
        roofGroup.add(finial);
      } else if (roofType === 'dome') {
        // Cylindrical Drum Base
        const drumRadius = gw * 0.36;
        const drum = new THREE.Mesh(
          new THREE.CylinderGeometry(drumRadius, drumRadius, 1.4, 24),
          wallMat
        );
        drum.position.y = 0.7;
        roofGroup.add(drum);

        const drumCornice = new THREE.Mesh(
          new THREE.CylinderGeometry(drumRadius + 0.3, drumRadius + 0.3, 0.35, 24),
          trimMat
        );
        drumCornice.position.y = 1.4;
        roofGroup.add(drumCornice);

        // Hemispherical Ribbed Dome
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(drumRadius, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          roofMat
        );
        dome.position.y = 1.4;
        roofGroup.add(dome);

        // Lantern Cupola
        const cupola = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 1.8, 8), trimMat);
        cupola.position.y = 1.4 + drumRadius + 0.9;
        roofGroup.add(cupola);

        const cupolaDome = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), roofMat);
        cupolaDome.position.y = 1.4 + drumRadius + 1.8;
        roofGroup.add(cupolaDome);

        const domeFinial = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), trimMat);
        domeFinial.position.y = 1.4 + drumRadius + 2.8;
        roofGroup.add(domeFinial);
      } else {
        // Flat Roof with Protective Parapet, Rooftop Service Penthouse & AC Chillers
        const parapet = new THREE.Mesh(new THREE.BoxGeometry(gw + 0.5, 1.1, gd + 0.5), roofMat);
        parapet.position.y = 0.55;
        roofGroup.add(parapet);

        const parapetCap = new THREE.Mesh(new THREE.BoxGeometry(gw + 0.7, 0.15, gd + 0.7), trimMat);
        parapetCap.position.y = 1.15;
        roofGroup.add(parapetCap);

        const innerRoof = new THREE.Mesh(new THREE.BoxGeometry(gw - 0.4, 0.2, gd - 0.4), new THREE.MeshLambertMaterial({ color: '#475569' }));
        innerRoof.position.y = 0.2;
        roofGroup.add(innerRoof);

        // Rooftop stairwell access penthouse
        const penthouse = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.4, 4.5), wallMat);
        penthouse.position.set(gw * 0.25, 1.2, 0);
        roofGroup.add(penthouse);

        const penthouseDoor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.1), doorMat);
        penthouseDoor.position.set(gw * 0.25, 1.0, 2.3);
        roofGroup.add(penthouseDoor);

        // AC Cooling Chillers
        [-gw * 0.25, -gw * 0.1].forEach((cx) => {
          const chiller = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 2.2), new THREE.MeshLambertMaterial({ color: '#64748b' }));
          chiller.position.set(cx, 0.8, 0);
          roofGroup.add(chiller);
        });
      }

      buildingGroup.add(roofGroup);

      // 5. Signboard
      const signTex = createSignboardTexture(poi.name, poi.label);
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 2.2),
        new THREE.MeshBasicMaterial({ map: signTex })
      );
      signMesh.position.set(entranceOffset[0], gh + 1.8, entranceOffset[2] > 0 ? gd / 2 + 0.15 : -gd / 2 - 0.15);
      if (entranceOffset[2] < 0) signMesh.rotation.y = Math.PI;
      buildingGroup.add(signMesh);

      // 6. Floating 3D Interaction Indicator (Oriented at Entrance)
      const indTex = createIndicatorTexture(poi);
      const indMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(7.5, 3.0),
        new THREE.MeshBasicMaterial({ map: indTex, transparent: true })
      );
      const baseY = gh + 4.8;
      indMesh.position.set(entranceOffset[0], baseY, entranceOffset[2]);
      buildingGroup.add(indMesh);

      floatingIndicatorsRef.current.push({
        mesh: indMesh,
        poi,
        baseY
      });

      scene.add(buildingGroup);

      // Physics Collider Box (Strict bounding box matching the actual visible building walls)
      const colBox = new THREE.Box3();
      colBox.setFromCenterAndSize(
        new THREE.Vector3(bx, gh / 2, bz),
        new THREE.Vector3(gw, gh + 2, gd)
      );
      collidersRef.current.push(colBox);
    };

    // Instantiate all Interactive Campus POIs
    CAMPUS_POIS.forEach(createArchitecturalBuilding);

    // Instantiate Functional Filler Buildings
    CAMPUS_FILLER_BUILDINGS.forEach((fb) => {
      createArchitecturalBuilding({
        ...fb,
        interactionRadius: 0,
        entranceOffset: [0, 0, fb.size[2] / 2]
      } as CampusPOI);
    });

    // ============================================================
    // 9. STUDENT NPCS WITH PROVEN OBSTACLE AVOIDANCE & ROUTE RECOVERY
    // ============================================================
    // 9. DIVERSE STUDENT NPCS WITH REALISTIC NIGERIAN HAIRSTYLES & MELANIN TONES
    // ============================================================
    npcsRef.current = [];
    const npcConfigs: {
      shirt: string;
      pants: string;
      variant: MonopolyVariant;
      skin?: string;
      waypoints: [number, number][];
      speed: number;
    }[] = [
      // Academic Quadrangle & Science Walkers
      { shirt: '#2563eb', pants: '#1e293b', variant: 'student_boy_fade', skin: '#4e342e', waypoints: [[-65, -48], [-110, -48], [-65, -48]], speed: 3.2 },
      { shirt: '#ea580c', pants: '#374151', variant: 'student_girl_braids', skin: '#5d4037', waypoints: [[-110, -48], [-140, -48], [-110, -48]], speed: 2.9 },
      { shirt: '#059669', pants: '#111827', variant: 'student_boy_dreads', skin: '#3e2723', waypoints: [[-80, -20], [-80, -70], [-80, -20]], speed: 3.0 },
      { shirt: '#0284c7', pants: '#1e293b', variant: 'student_girl_afro_puff', skin: '#6d4c41', waypoints: [[-125, -70], [-140, -70], [-125, -70]], speed: 2.8 },
      { shirt: '#6366f1', pants: '#334155', variant: 'student_boy_afro', skin: '#503225', waypoints: [[-45, -70], [-58, -70], [-45, -70]], speed: 3.1 },
      { shirt: '#8b5cf6', pants: '#1e1b4b', variant: 'student_girl_hijab', skin: '#795548', waypoints: [[-85, -28], [-60, -28], [-85, -28]], speed: 2.9 },
      { shirt: '#0d9488', pants: '#111827', variant: 'student_beanie', skin: '#4e342e', waypoints: [[-130, -32], [-115, -32], [-130, -32]], speed: 3.0 },
      { shirt: '#f43f5e', pants: '#1e293b', variant: 'student_girl_braids', skin: '#5d4037', waypoints: [[-95, -60], [-95, -85], [-95, -60]], speed: 2.9 },
      { shirt: '#eab308', pants: '#0f172a', variant: 'student_boy_fade', skin: '#6d4c41', waypoints: [[-50, -35], [-70, -35], [-50, -35]], speed: 3.1 },

      // Central Senate Boulevard Promenade & Monument
      { shirt: '#d97706', pants: '#1f2937', variant: 'student_boy_dreads', skin: '#5d4037', waypoints: [[0, 36], [0, 15], [0, -40], [0, 15]], speed: 3.1 },
      { shirt: '#7c3aed', pants: '#1e3a8a', variant: 'student_girl_gele', skin: '#6d4c41', waypoints: [[4, 45], [4, 15], [4, -50], [4, 15]], speed: 2.8 },
      { shirt: '#ec4899', pants: '#18181b', variant: 'student_girl_afro_puff', skin: '#4e342e', waypoints: [[-3, 30], [-3, 0], [-3, -30], [-3, 0]], speed: 2.9 },
      { shirt: '#10b981', pants: '#0284c7', variant: 'student_boy_afro', skin: '#503225', waypoints: [[6, 10], [6, -20], [6, 10]], speed: 3.0 },
      { shirt: '#f97316', pants: '#1e293b', variant: 'student_girl_hijab', skin: '#795548', waypoints: [[-6, 15], [-6, -25], [-6, 15]], speed: 2.8 },

      // Hostels Village Residents & Courtyard
      { shirt: '#dc2626', pants: '#1e293b', variant: 'student_boy_fade', skin: '#4e342e', waypoints: [[-60, 55], [-120, 55], [-60, 55]], speed: 2.9 },
      { shirt: '#0891b2', pants: '#334155', variant: 'student_girl_braids', skin: '#6d4c41', waypoints: [[-95, 35], [-95, 75], [-95, 35]], speed: 2.7 },
      { shirt: '#f97316', pants: '#1e293b', variant: 'student_boy_dreads', skin: '#5d4037', waypoints: [[-60, 75], [-75, 75], [-60, 75]], speed: 2.8 },
      { shirt: '#14b8a6', pants: '#374151', variant: 'student_girl_afro_puff', skin: '#503225', waypoints: [[-110, 75], [-135, 75], [-110, 75]], speed: 3.0 },
      { shirt: '#a855f7', pants: '#18181b', variant: 'student_beanie', skin: '#4e342e', waypoints: [[-70, 45], [-70, 70], [-70, 45]], speed: 3.0 },
      { shirt: '#06b6d4', pants: '#1e293b', variant: 'student_girl_hijab', skin: '#795548', waypoints: [[-125, 45], [-125, 65], [-125, 45]], speed: 2.8 },
      { shirt: '#84cc16', pants: '#0f172a', variant: 'student_boy_afro', skin: '#5d4037', waypoints: [[-85, 65], [-105, 65], [-85, 65]], speed: 3.1 },

      // Commercial Hub, Food Square & Supermarket
      { shirt: '#16a34a', pants: '#1e1b4b', variant: 'student_girl_braids', skin: '#503225', waypoints: [[60, 52], [120, 52], [60, 52]], speed: 2.8 },
      { shirt: '#b45309', pants: '#1e293b', variant: 'student_boy_fade', skin: '#4e342e', waypoints: [[100, 35], [100, 70], [100, 35]], speed: 2.6 },
      { shirt: '#e11d48', pants: '#18181b', variant: 'student_girl_afro_puff', skin: '#6d4c41', waypoints: [[85, 72], [130, 72], [85, 72]], speed: 2.9 },
      { shirt: '#4f46e5', pants: '#1e293b', variant: 'student_boy_dreads', skin: '#5d4037', waypoints: [[55, 68], [70, 68], [55, 68]], speed: 2.7 },
      { shirt: '#15803d', pants: '#334155', variant: 'student_girl_gele', skin: '#795548', waypoints: [[65, 30], [55, 15], [65, 30]], speed: 2.8 },
      { shirt: '#d97706', pants: '#1e293b', variant: 'student_boy_afro', skin: '#4e342e', waypoints: [[75, 45], [95, 45], [75, 45]], speed: 3.0 },
      { shirt: '#ec4899', pants: '#18181b', variant: 'student_girl_hijab', skin: '#5d4037', waypoints: [[115, 40], [115, 65], [115, 40]], speed: 2.9 },
      { shirt: '#0284c7', pants: '#1e1b4b', variant: 'student_beanie', skin: '#6d4c41', waypoints: [[80, 58], [95, 58], [80, 58]], speed: 3.2 },

      // Health Clinic & Interfaith Walkway
      { shirt: '#0284c7', pants: '#1e1b4b', variant: 'student_girl_hijab', skin: '#795548', waypoints: [[60, -68], [75, -68], [60, -68]], speed: 2.8 },
      { shirt: '#10b981', pants: '#111827', variant: 'student_boy_fade', skin: '#4e342e', waypoints: [[100, -68], [115, -68], [100, -68]], speed: 2.9 },
      { shirt: '#8b5cf6', pants: '#1e293b', variant: 'student_girl_braids', skin: '#5d4037', waypoints: [[85, -55], [85, -80], [85, -55]], speed: 2.7 },
      { shirt: '#f59e0b', pants: '#0f172a', variant: 'student_boy_afro', skin: '#6d4c41', waypoints: [[70, -75], [90, -75], [70, -75]], speed: 3.0 },

      // Natural Pond & Footbridge Strollers
      { shirt: '#065f46', pants: '#1e293b', variant: 'student_girl_braids', skin: '#4e342e', waypoints: [[0, 62], [0, 80], [0, 98], [0, 80]], speed: 2.3 },
      { shirt: '#ea580c', pants: '#18181b', variant: 'student_boy_dreads', skin: '#5d4037', waypoints: [[0, 95], [0, 80], [0, 65], [0, 80]], speed: 2.4 },

      // Sports Stadium Complex, Basketball Arena & Avenue
      { shirt: '#f59e0b', pants: '#18181b', variant: 'student_boy_fade', skin: '#4e342e', waypoints: [[145, -30], [145, 10], [145, -30]], speed: 3.0 },
      { shirt: '#84cc16', pants: '#1e293b', variant: 'student_boy_afro', skin: '#5d4037', waypoints: [[155, -45], [170, -45], [155, -45]], speed: 3.2 },
      { shirt: '#3b82f6', pants: '#1e1b4b', variant: 'student_girl_afro_puff', skin: '#6d4c41', waypoints: [[135, -15], [135, 15], [135, -15]], speed: 2.9 },
      { shirt: '#ef4444', pants: '#18181b', variant: 'student_boy_dreads', skin: '#503225', waypoints: [[160, -10], [175, -10], [160, -10]], speed: 3.3 },
      { shirt: '#06b6d4', pants: '#1e293b', variant: 'student_girl_braids', skin: '#4e342e', waypoints: [[140, -50], [140, -25], [140, -50]], speed: 2.8 },
      { shirt: '#8b5cf6', pants: '#0f172a', variant: 'student_beanie', skin: '#5d4037', waypoints: [[150, -60], [165, -60], [150, -60]], speed: 3.1 },

      // Main Gate & Security Archway
      { shirt: '#3b82f6', pants: '#1e1b4b', variant: 'student_boy_fade', skin: '#4e342e', waypoints: [[15, 125], [30, 125], [15, 125]], speed: 2.7 },
      { shirt: '#10b981', pants: '#1e293b', variant: 'student_girl_hijab', skin: '#795548', waypoints: [[-15, 125], [-30, 125], [-15, 125]], speed: 2.8 },
      { shirt: '#f97316', pants: '#18181b', variant: 'student_girl_afro_puff', skin: '#6d4c41', waypoints: [[8, 132], [22, 132], [8, 132]], speed: 2.9 },
      { shirt: '#ec4899', pants: '#0f172a', variant: 'student_girl_gele', skin: '#5d4037', waypoints: [[-8, 132], [-22, 132], [-8, 132]], speed: 2.7 }
    ];

    npcConfigs.forEach((cfg) => {
      const npcData = createNPCStudent(cfg.shirt, cfg.pants, cfg.variant, cfg.skin);
      npcData.group.position.set(cfg.waypoints[0][0], 0, cfg.waypoints[0][1]);
      scene.add(npcData.group);
      npcsRef.current.push({
        mesh: npcData.group,
        leftLeg: npcData.legL,
        rightLeg: npcData.legR,
        leftArm: npcData.armL,
        rightArm: npcData.armR,
        speed: cfg.speed,
        waypoints: cfg.waypoints,
        currentWaypoint: 0,
        stuckTime: 0,
        lastPos: new THREE.Vector2(cfg.waypoints[0][0], cfg.waypoints[0][1])
      });
    });

    // ============================================================
    // 9.1 CAMPUS SECURITY PATROL OFFICERS (NIGHT CURFEW ENFORCERS)
    // ============================================================
    securityNpcsRef.current = [];
    const secConfigs = [
      {
        name: 'Officer Balogun',
        zone: 'Hostels Village Quadrangle',
        waypoints: [[-50, 58], [-95, 58], [-135, 58], [-95, 58]],
        speed: 2.6
      },
      {
        name: 'Officer Danjuma',
        zone: 'Central Senate Boulevard & Roundabout',
        waypoints: [[0, 15], [0, 60], [0, -35], [0, 15]],
        speed: 2.8
      },
      {
        name: 'Officer Okafor',
        zone: 'Academic Quadrangle & Library Walkway',
        waypoints: [[-65, -45], [-115, -45], [-65, -45]],
        speed: 2.5
      }
    ];

    secConfigs.forEach((cfg) => {
      const secData = createNPCSecurity(cfg.name);
      secData.group.position.set(cfg.waypoints[0][0], 0, cfg.waypoints[0][1]);
      scene.add(secData.group);
      securityNpcsRef.current.push({
        mesh: secData.group,
        leftLeg: secData.legL,
        rightLeg: secData.legR,
        spotlight: secData.spotlight,
        speed: cfg.speed,
        waypoints: cfg.waypoints as [number, number][],
        currentWaypoint: 0,
        officerName: cfg.name,
        zoneName: cfg.zone
      });
    });

    // ============================================================
    // 10. BACKGROUND CAMPUS VEHICLES (KEKE & SHUTTLES ON ROAD NETWORK)
    // ============================================================
    vehiclesRef.current = [];

    const keke1 = createKekeVehicle('#facc15');
    scene.add(keke1);
    vehiclesRef.current.push({
      mesh: keke1,
      type: 'keke',
      speed: 12.0,
      waypointIndex: 0,
      stopTimer: 0,
      waypoints: [
        [4.5, 135], [4.5, 110], [26, 80], [4.5, 50], [4.5, 24],
        [16, 12], [18, 0], [4.5, -24], [4.5, -120],
        [-4.5, -120], [-4.5, -24], [-18, 0], [-16, 12], [-4.5, 24],
        [-4.5, 50], [-26, 80], [-4.5, 110], [-4.5, 135]
      ]
    });

    const shuttle = createShuttleBus();
    scene.add(shuttle);
    vehiclesRef.current.push({
      mesh: shuttle,
      type: 'shuttle',
      speed: 13.5,
      waypointIndex: 0,
      stopTimer: 0,
      waypoints: [
        [4.5, 135], [26, 80], [4.5, 24], [18, 0], [60, 0], [105, 0], [135, 0], [135, -25], [135, -55],
        [135, 0], [60, 0], [18, 0], [4.5, -24], [4.5, -135],
        [-4.5, -135], [-4.5, -24], [-18, 0], [-48, 0], [-95, 0], [-95, -48],
        [-95, 0], [-48, 0], [-18, 0], [-4.5, 24], [-26, 80], [-4.5, 135]
      ]
    });

    // ============================================================
    // 11. CAMPUS ROYAL PALMS, WILLOWS & FLOWERBEDS
    // ============================================================
    const trunkMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const palmMat = new THREE.MeshLambertMaterial({ color: '#15803d' });

    // Royal Palm Rows lining avenues
    const palmCoords = [
      [-6, 125], [-6, 105], [-6, 38], [-6, -30], [-6, -60], [-6, -90], [-6, -120],
      [6, 125], [6, 105], [6, 38], [6, -30], [6, -60], [6, -90], [6, -120],
      [-35, 10], [-65, 10], [-115, 10], [35, 10], [65, 10], [115, 10]
    ];
    palmCoords.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 5.0, 8), trunkMat);
      trunk.position.y = 2.5;
      tree.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8), palmMat);
      crown.position.y = 5.6;
      tree.add(crown);

      scene.add(tree);
    });

    // ============================================================
    // 12. 3D STUDENT PLAYER MODEL (FEET TOUCHING GROUND AT y=0)
    // ============================================================
    const playerGroup = new THREE.Group();
    playerGroup.position.set(posRef.current.x, 0, posRef.current.z);

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.15, 0.5),
      new THREE.MeshLambertMaterial({ color: '#047857' })
    );
    torso.position.y = 1.48;
    torso.castShadow = true;
    playerGroup.add(torso);
    torsoRef.current = torso;

    const backpack = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.85, 0.36),
      new THREE.MeshLambertMaterial({ color: '#ea580c' })
    );
    backpack.position.set(0, 1.45, -0.42);
    backpack.castShadow = true;
    playerGroup.add(backpack);

    const legMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.32), legMat);
    legL.position.set(-0.25, 0.48, 0);
    legL.castShadow = true;
    playerGroup.add(legL);
    leftLegRef.current = legL;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.32), legMat);
    legR.position.set(0.25, 0.48, 0);
    legR.castShadow = true;
    playerGroup.add(legR);
    rightLegRef.current = legR;

    const armMat = new THREE.MeshLambertMaterial({ color: '#047857' });
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.85, 0.25), armMat);
    armL.position.set(-0.55, 1.45, 0);
    playerGroup.add(armL);
    leftArmRef.current = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.85, 0.25), armMat);
    armR.position.set(0.55, 1.45, 0);
    playerGroup.add(armR);
    rightArmRef.current = armR;

    const monopolyHead = createMonopolyHead('student');
    monopolyHead.position.y = 2.35;
    playerGroup.add(monopolyHead);

    scene.add(playerGroup);
    playerMeshRef.current = playerGroup;

    // -------------------------------------------------------------------------
    // INPUT LISTENERS & MOUSE DRAG ORBIT
    // -------------------------------------------------------------------------
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      }
      keysPressed.current[e.key.toLowerCase()] = true;

      // E Key interacts with nearest designated entrance
      if ((e.key === 'e' || e.key === 'E') && nearestPOIRef.current && !isPausedRef.current) {
        onTriggerPOIRef.current(nearestPOIRef.current);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      cameraAngle.current.theta += deltaX * 0.005;
      cameraAngle.current.phi = Math.max(0.12, Math.min(1.25, cameraAngle.current.phi - deltaY * 0.005));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newDist = Math.max(10, Math.min(65, cameraDistanceRef.current + e.deltaY * 0.035));
      cameraDistanceRef.current = newDist;
      setZoomLevel(newDist);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // -------------------------------------------------------------------------
    // ANIMATION & GAMEPLAY SIMULATION LOOP
    // -------------------------------------------------------------------------
    let animationFrameId: number;
    let lastTime = performance.now();
    let stepSoundTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const time = now * 0.001;

      // If active ride conveyance is driving, conveyance loop updates position
      const isPlayerRiding = isConveyingRef.current && activeRideRef.current && rideVehicleMeshRef.current;

      // Movement Vector
      let moveX = 0;
      let moveZ = 0;

      if (!isPausedRef.current && !isPlayerRiding) {
        const k = keysPressed.current;
        if (k['w'] || k['arrowup']) moveZ -= 1;
        if (k['s'] || k['arrowdown']) moveZ += 1;
        if (k['a'] || k['arrowleft']) moveX -= 1;
        if (k['d'] || k['arrowright']) moveX += 1;
      }

      const isWalking = moveX !== 0 || moveZ !== 0;

      if (isWalking && playerMeshRef.current && cameraRef.current) {
        const moveVec = new THREE.Vector2(moveX, moveZ).normalize();

        // Calculate movement relative to Camera Theta
        const forward = new THREE.Vector2(-Math.sin(cameraAngle.current.theta), -Math.cos(cameraAngle.current.theta));
        const right = new THREE.Vector2(Math.cos(cameraAngle.current.theta), -Math.sin(cameraAngle.current.theta));

        const targetVelocity = new THREE.Vector2()
          .addScaledVector(forward, -moveVec.y)
          .addScaledVector(right, moveVec.x)
          .normalize();

        const isRunning = keysPressed.current['shift'];
        const speed = (isRunning ? 11.5 : 6.8) * delta;

        const nextX = posRef.current.x + targetVelocity.x * speed;
        const nextZ = posRef.current.z + targetVelocity.y * speed;

        // Player Collision Detection (Building Boxes & Perimeter Fence)
        const playerBox = new THREE.Box3(
          new THREE.Vector3(nextX - 0.5, 0, nextZ - 0.5),
          new THREE.Vector3(nextX + 0.5, 2.2, nextZ + 0.5)
        );

        let isBlocked = false;
        for (const col of collidersRef.current) {
          if (col.intersectsBox(playerBox)) {
            isBlocked = true;
            break;
          }
        }
        if (!isBlocked) {
          for (const col of evolutionCollidersRef.current) {
            if (col.intersectsBox(playerBox)) {
              isBlocked = true;
              break;
            }
          }
        }

        // Pond Water Collision (Pond at z=80, Radius=18m, Footbridge at x ∈ [-2.2, 2.2])
        const distToPondCenter = Math.hypot(nextX, nextZ - 80);
        if (distToPondCenter < 18.2 && Math.abs(nextX) > 2.2) {
          isBlocked = true;
        }

        if (!isBlocked) {
          posRef.current.x = nextX;
          posRef.current.z = nextZ;

          // Arched footbridge traversal elevation
          if (distToPondCenter < 18.2 && Math.abs(nextX) <= 2.2) {
            const progress = 1 - Math.abs(nextZ - 80) / 18.2;
            posRef.current.y = 0.08 + progress * 0.42;
          } else {
            posRef.current.y = 0;
          }

          playerMeshRef.current.position.set(posRef.current.x, posRef.current.y, posRef.current.z);

          // Rotate character smoothly to face walking direction
          const targetRotation = Math.atan2(targetVelocity.x, targetVelocity.y);
          playerMeshRef.current.rotation.y = THREE.MathUtils.lerp(
            playerMeshRef.current.rotation.y,
            targetRotation,
            0.25
          );

          // Animate Limbs
          const walkCycle = time * (isRunning ? 16 : 10);
          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.85;
            rightLegRef.current.rotation.x = -Math.sin(walkCycle) * 0.85;
          }
          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.rotation.x = -Math.sin(walkCycle) * 0.75;
            rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.75;
          }
          if (torsoRef.current) {
            torsoRef.current.position.y = 1.48 + Math.abs(Math.sin(walkCycle)) * 0.08;
          }

          stepSoundTimer += delta;
          if (stepSoundTimer > (isRunning ? 0.28 : 0.42)) {
            sounds.playFootstep();
            stepSoundTimer = 0;
          }

          wasWalkingRef.current = true;
          onPositionChangeRef.current({ x: posRef.current.x, y: posRef.current.y, z: posRef.current.z });
        }
      } else {
        // Idle animation
        if (wasWalkingRef.current) {
          wasWalkingRef.current = false;
          onPositionChangeRef.current({ x: posRef.current.x, y: posRef.current.y, z: posRef.current.z });
        }

        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.2);
          rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.2);
        }
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.2);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.2);
        }
        if (torsoRef.current) {
          torsoRef.current.position.y = 1.48 + Math.sin(time * 2.2) * 0.03;
        }
      }

      // ACTIVE RIDE VEHICULAR CONVEYANCE THROUGH ROAD NETWORK
      if (activeRideRef.current && isConveyingRef.current && rideVehicleMeshRef.current) {
        const waypoints = rideWaypointsRef.current;
        const targetIndex = rideCurrentIndexRef.current + 1;

        if (targetIndex < waypoints.length) {
          const nextWp = waypoints[targetIndex];
          const currVeh = rideVehicleMeshRef.current;
          const targetV = new THREE.Vector2(nextWp[0], nextWp[1]);
          const currV = new THREE.Vector2(currVeh.position.x, currVeh.position.z);
          const dist = currV.distanceTo(targetV);

          const rideSpeed = (activeRideRef.current.vehicleType === 'keke' ? 18.0 : 22.0) * delta;

          if (dist < 1.6) {
            rideCurrentIndexRef.current += 1;
            if (rideCurrentIndexRef.current + 1 >= waypoints.length) {
              if (onFinishRideRef.current) {
                onFinishRideRef.current();
              }
            }
          } else {
            const dir = targetV.sub(currV).normalize();
            currVeh.position.x += dir.x * rideSpeed;
            currVeh.position.z += dir.y * rideSpeed;

            const targetRot = Math.atan2(dir.x, dir.y);
            currVeh.rotation.y = THREE.MathUtils.lerp(currVeh.rotation.y, targetRot, 0.2);

            // Carry player inside vehicle
            posRef.current.x = currVeh.position.x;
            posRef.current.y = 0.35;
            posRef.current.z = currVeh.position.z;

            if (playerMeshRef.current) {
              playerMeshRef.current.position.set(currVeh.position.x, 0.35, currVeh.position.z);
              playerMeshRef.current.rotation.y = targetRot;
            }

            // Cinematic Chase Camera following along road
            const camDist = activeRideRef.current.vehicleType === 'keke' ? 14.0 : 19.0;
            const camHeight = activeRideRef.current.vehicleType === 'keke' ? 5.5 : 7.0;
            const targetCamX = currVeh.position.x - Math.sin(currVeh.rotation.y) * camDist;
            const targetCamY = camHeight;
            const targetCamZ = currVeh.position.z - Math.cos(currVeh.rotation.y) * camDist;

            cameraRef.current!.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.14);
            cameraRef.current!.lookAt(currVeh.position.x, currVeh.position.y + 1.5, currVeh.position.z);
          }
        } else {
          if (onFinishRideRef.current) {
            onFinishRideRef.current();
          }
        }
      } else {
        // Standard Orbit Camera Follow: Stable distance and angle!
        const camDist = cameraDistanceRef.current;
        const targetCamX = posRef.current.x + Math.sin(cameraAngle.current.theta) * camDist * Math.cos(cameraAngle.current.phi);
        const targetCamY = posRef.current.y + 2.0 + Math.sin(cameraAngle.current.phi) * camDist;
        const targetCamZ = posRef.current.z + Math.cos(cameraAngle.current.theta) * camDist * Math.cos(cameraAngle.current.phi);

        cameraRef.current!.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
        cameraRef.current!.lookAt(posRef.current.x, posRef.current.y + 1.5, posRef.current.z);
      }

      // Check Nearest POI for interaction prompt (Strictly at Designated Entrance Point per Section 4.1)
      let closestPOI: CampusPOI | null = null;
      let minDistance = Infinity;

      for (const poi of CAMPUS_POIS) {
        const entranceX = poi.position[0] + (poi.entranceOffset ? poi.entranceOffset[0] : 0);
        const entranceZ = poi.position[2] + (poi.entranceOffset ? poi.entranceOffset[2] : 0);
        const dist = Math.hypot(posRef.current.x - entranceX, posRef.current.z - entranceZ);

        // Required: Interaction prompt only active when approaching designated entrance!
        const interactionMaxDist = poi.category === 'transport' ? 8.0 : 5.8;
        if (dist <= interactionMaxDist && dist < minDistance) {
          minDistance = dist;
          closestPOI = poi;
        }
      }

      if (closestPOI !== nearestPOIRef.current) {
        nearestPOIRef.current = closestPOI;
        onNearPOIRef.current(closestPOI);
      }

      // Orient floating indicators toward camera
      floatingIndicatorsRef.current.forEach(({ mesh, poi, baseY }) => {
        mesh.quaternion.copy(cameraRef.current!.quaternion);
        mesh.position.y = baseY + Math.sin(time * 2.8 + poi.position[0]) * 0.35;
      });

      // Animate Background Vehicles along road network
      vehiclesRef.current.forEach((veh) => {
        const nextWp = veh.waypoints[(veh.waypointIndex + 1) % veh.waypoints.length];
        const targetV = new THREE.Vector2(nextWp[0], nextWp[1]);
        const currV = new THREE.Vector2(veh.mesh.position.x, veh.mesh.position.z);

        const dist = currV.distanceTo(targetV);
        if (dist < 1.8) {
          veh.waypointIndex = (veh.waypointIndex + 1) % veh.waypoints.length;
        } else {
          const dir = targetV.sub(currV).normalize();
          veh.mesh.position.x += dir.x * veh.speed * delta;
          veh.mesh.position.z += dir.y * veh.speed * delta;

          const targetRot = Math.atan2(dir.x, dir.y);
          veh.mesh.rotation.y = THREE.MathUtils.lerp(veh.mesh.rotation.y, targetRot, 0.15);
        }
      });

      // Animate Walking NPC Students with Obstacle Avoidance & Route Recovery (Section 9)
      npcsRef.current.forEach((npc) => {
        const nextWp = npc.waypoints[(npc.currentWaypoint + 1) % npc.waypoints.length];
        const targetV = new THREE.Vector2(nextWp[0], nextWp[1]);
        const currV = new THREE.Vector2(npc.mesh.position.x, npc.mesh.position.z);

        // Yield to traffic
        let vehicleBlocking = false;
        for (const veh of vehiclesRef.current) {
          if (currV.distanceTo(new THREE.Vector2(veh.mesh.position.x, veh.mesh.position.z)) < 3.2) {
            vehicleBlocking = true;
            break;
          }
        }
        if (rideVehicleMeshRef.current && currV.distanceTo(new THREE.Vector2(rideVehicleMeshRef.current.position.x, rideVehicleMeshRef.current.position.z)) < 3.5) {
          vehicleBlocking = true;
        }
        if (currV.distanceTo(new THREE.Vector2(posRef.current.x, posRef.current.z)) < 1.4) {
          vehicleBlocking = true;
        }

        const distToWp = currV.distanceTo(targetV);

        if (distToWp < 1.4) {
          // Reached waypoint! Advance cleanly
          npc.currentWaypoint = (npc.currentWaypoint + 1) % npc.waypoints.length;
          npc.stuckTime = 0;
          npc.lastPos.set(currV.x, currV.y);
        } else if (vehicleBlocking) {
          // Temporarily paused to yield to vehicle/player
          npc.stuckTime += delta;
          if (npc.stuckTime > 1.8) {
            // Step aside slightly
            const sidestep = new THREE.Vector2(0.8, 0);
            npc.mesh.position.x += sidestep.x * delta;
          }
        } else {
          // Attempt forward move
          const dir = targetV.clone().sub(currV).normalize();
          let nextNpcX = npc.mesh.position.x + dir.x * npc.speed * delta;
          let nextNpcZ = npc.mesh.position.z + dir.y * npc.speed * delta;

          // Physical check: Cannot pass through building walls
          const npcBox = new THREE.Box3(
            new THREE.Vector3(nextNpcX - 0.45, 0, nextNpcZ - 0.45),
            new THREE.Vector3(nextNpcX + 0.45, 2.0, nextNpcZ + 0.45)
          );
          let npcBlocked = false;
          for (const col of collidersRef.current) {
            if (col.intersectsBox(npcBox)) {
              npcBlocked = true;
              break;
            }
          }

          // Pond check: cannot walk on pond water outside bridge
          const npcDistToPond = Math.hypot(nextNpcX, nextNpcZ - 80);
          if (npcDistToPond < 18.2 && Math.abs(nextNpcX) > 2.2) {
            npcBlocked = true;
          }

          if (npcBlocked) {
            // OBSTACLE AVOIDANCE & ROUTE RECOVERY (Section 9.1)
            npc.stuckTime += delta;

            // Attempt perpendicular detour around the obstacle
            const detourDir = new THREE.Vector2(-dir.y, dir.x);
            const detourX = npc.mesh.position.x + detourDir.x * npc.speed * delta * 0.8;
            const detourZ = npc.mesh.position.z + detourDir.y * npc.speed * delta * 0.8;
            const detourBox = new THREE.Box3(
              new THREE.Vector3(detourX - 0.45, 0, detourZ - 0.45),
              new THREE.Vector3(detourX + 0.45, 2.0, detourZ + 0.45)
            );
            let detourClear = true;
            for (const col of collidersRef.current) {
              if (col.intersectsBox(detourBox)) {
                detourClear = false;
                break;
              }
            }

            if (detourClear && !(Math.hypot(detourX, detourZ - 80) < 18.2 && Math.abs(detourX) > 2.2)) {
              npc.mesh.position.x = detourX;
              npc.mesh.position.z = detourZ;
            }

            // If stuck for > 1.4 seconds, recover by advancing to next waypoint!
            if (npc.stuckTime > 1.4) {
              npc.currentWaypoint = (npc.currentWaypoint + 1) % npc.waypoints.length;
              npc.stuckTime = 0;
            }
          } else {
            // Clean move forward
            npc.stuckTime = 0;
            npc.mesh.position.x = nextNpcX;
            npc.mesh.position.z = nextNpcZ;

            // Negotiate bridge arch elevation
            if (npcDistToPond < 18.2 && Math.abs(nextNpcX) <= 2.2) {
              const progress = 1 - Math.abs(nextNpcZ - 80) / 18.2;
              npc.mesh.position.y = 0.08 + progress * 0.42;
            } else {
              npc.mesh.position.y = 0;
            }

            const targetRot = Math.atan2(dir.x, dir.y);
            npc.mesh.rotation.y = targetRot;

            // Leg & Arm swinging animation with LOD distance culling (anti-stutter for smooth 60fps)
            const distToPlayer = Math.hypot(npc.mesh.position.x - posRef.current.x, npc.mesh.position.z - posRef.current.z);
            if (distToPlayer < 55) {
              const npcCycle = time * 8;
              npc.leftLeg.rotation.x = Math.sin(npcCycle) * 0.75;
              npc.rightLeg.rotation.x = -Math.sin(npcCycle) * 0.75;
              npc.leftArm.rotation.x = -Math.sin(npcCycle) * 0.65;
              npc.rightArm.rotation.x = Math.sin(npcCycle) * 0.65;
            }
          }
        }
      });

      // ============================================================
      // 10. DYNAMIC NIGHT CURFEW ATMOSPHERE & SECURITY PATROL (10 PM - 6 AM)
      // ============================================================
      const isNightCurfew = timeOfDayRef.current >= 1320 || timeOfDayRef.current < 360;

      // Dynamic Campus Atmosphere: Night Curfew vs Daytime
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(isNightCurfew ? '#030712' : '#67e8f9');
        if (sceneRef.current.fog) {
          sceneRef.current.fog.color = new THREE.Color(isNightCurfew ? '#030712' : '#67e8f9');
        }
      }
      if (dirLightRef.current) {
        dirLightRef.current.intensity = isNightCurfew ? 0.22 : 1.35;
        dirLightRef.current.color = new THREE.Color(isNightCurfew ? '#60a5fa' : '#ffffff');
      }
      if (hemiLightRef.current) {
        hemiLightRef.current.intensity = isNightCurfew ? 0.18 : 0.65;
        hemiLightRef.current.color = new THREE.Color(isNightCurfew ? '#1e293b' : '#67e8f9');
      }

      // During night curfew, student NPCs stay indoors (campus is quiet & dull)
      npcsRef.current.forEach((npc) => {
        npc.mesh.visible = !isNightCurfew;
      });

      // Animate Campus Security Patrol Officers
      securityNpcsRef.current.forEach((sec) => {
        // Flashlight beam active during night
        sec.spotlight.intensity = isNightCurfew ? 3.5 : 0;

        const nextWp = sec.waypoints[(sec.currentWaypoint + 1) % sec.waypoints.length];
        const targetV = new THREE.Vector2(nextWp[0], nextWp[1]);
        const currV = new THREE.Vector2(sec.mesh.position.x, sec.mesh.position.z);
        const distToWp = currV.distanceTo(targetV);

        if (distToWp < 1.4) {
          sec.currentWaypoint = (sec.currentWaypoint + 1) % sec.waypoints.length;
        } else {
          const dir = targetV.clone().sub(currV).normalize();
          sec.mesh.position.x += dir.x * sec.speed * delta;
          sec.mesh.position.z += dir.y * sec.speed * delta;
          sec.mesh.rotation.y = Math.atan2(dir.x, dir.y);

          const secCycle = time * 7;
          sec.leftLeg.rotation.x = Math.sin(secCycle) * 0.7;
          sec.rightLeg.rotation.x = -Math.sin(secCycle) * 0.7;
        }

        // Check if officer intercepts player during curfew
        if (isNightCurfew && !hasTriggeredCurfewRef.current && !isPausedRef.current) {
          const distToPlayer = currV.distanceTo(new THREE.Vector2(posRef.current.x, posRef.current.z));
          if (distToPlayer < 9.5) {
            hasTriggeredCurfewRef.current = true;
            sec.mesh.lookAt(posRef.current.x, sec.mesh.position.y, posRef.current.z);
            sounds.playKekeHorn(); // Whistle sound
            if (onCurfewInterceptRef.current) {
              onCurfewInterceptRef.current(sec.officerName, sec.zoneName);
            }
          }
        }
      });

      if (!isNightCurfew) {
        hasTriggeredCurfewRef.current = false;
      }

      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);

      if (rendererRef.current?.domElement && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-sky-950 font-sans">
      {/* 3D Viewport Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Dynamic Active Ride Conveyance Overlay */}
      {activeRide && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-stone-900/90 border-2 border-amber-400 text-white px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-pulse">
          <span className="text-xl">🛺</span>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-300">
              Campus Transit Conveyance
            </div>
            <div className="text-xs font-black">
              Traveling along university road to {activeRide.destinationPOI.name}...
            </div>
          </div>
        </div>
      )}

      {/* Floating Camera Navigation Controls (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={handleResetCamera}
          className="p-2.5 bg-stone-900/90 hover:bg-stone-800 border border-emerald-500/60 rounded-2xl text-emerald-400 hover:text-white shadow-xl backdrop-blur-md transition transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Reset Orbit Camera Orientation"
        >
          <Compass className="w-5 h-5" />
        </button>

        <div className="bg-stone-900/90 border border-stone-700/80 rounded-2xl p-1 flex flex-col gap-1 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => handleZoom(-6)}
            className="p-2 hover:bg-stone-800 rounded-xl text-stone-300 hover:text-white transition cursor-pointer"
            title="Zoom In"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(6)}
            className="p-2 hover:bg-stone-800 rounded-xl text-stone-300 hover:text-white transition cursor-pointer"
            title="Zoom Out"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
