import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/audio';
import { Bus, Send, ArrowRight, Heart, Luggage, Sparkles, MessageCircle, FastForward } from 'lucide-react';
import { createMonopolyHead } from '../game3d/monopolyFace';

interface ArrivalScene3DProps {
  studentName: string;
  courseName: string;
  onFinishArrival: () => void;
}

export const ArrivalScene3D: React.FC<ArrivalScene3DProps> = ({
  studentName,
  courseName,
  onFinishArrival
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [sceneStep, setSceneStep] = useState<1 | 2 | 3 | 4>(1);
  const [customReply, setCustomReply] = useState('');
  const [chosenStudentReply, setChosenStudentReply] = useState<string | null>(null);
  const [shuttleState, setShuttleState] = useState<'arriving' | 'parked' | 'departing'>('arriving');
  const [activeSpeaker, setActiveSpeaker] = useState<'papa' | 'mama' | 'student'>('papa');

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const busGroupRef = useRef<THREE.Group | null>(null);
  const papaMeshRef = useRef<THREE.Group | null>(null);
  const mamaMeshRef = useRef<THREE.Group | null>(null);
  const studentMeshRef = useRef<THREE.Group | null>(null);
  const driverMeshRef = useRef<THREE.Group | null>(null);

  const cleanStudentName = studentName.trim() || 'Student';

  // Build the 3D cinematic scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#7dd3fc'); // Sunny Abuja morning sky
    scene.fog = new THREE.FogExp2('#7dd3fc', 0.007);

    // Camera positioned with optimal clearance so characters and gate inscription are prominent
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 250);
    cameraRef.current = camera;
    camera.position.set(0, 2.8, 9.2);
    camera.lookAt(0, 3.4, -4.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight('#fffbeb', 1.4);
    sun.position.set(18, 32, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    const warmFill = new THREE.DirectionalLight('#fef08a', 0.45);
    warmFill.position.set(-18, 12, -8);
    scene.add(warmFill);

    // Ground: lush green campus lawn
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 140),
      new THREE.MeshLambertMaterial({ color: '#2d6a4f' })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);

    // Drop-off road with curb and asphalt
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 12),
      new THREE.MeshLambertMaterial({ color: '#334155' })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, 4);
    road.receiveShadow = true;
    scene.add(road);

    // Road markings
    const stripeMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
    for (let x = -60; x <= 60; x += 8) {
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.3), stripeMat);
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(x, 0.03, 4);
      scene.add(mark);
    }

    // Concrete curb
    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(140, 0.25, 0.8),
      new THREE.MeshLambertMaterial({ color: '#94a3b8' })
    );
    curb.position.set(0, 0.12, -1.8);
    curb.receiveShadow = true;
    scene.add(curb);

    // Paved Sidewalk with tiles
    const sidewalk = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 6),
      new THREE.MeshLambertMaterial({ color: '#cbd5e1' })
    );
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(0, 0.15, -4.8);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    // ============================================================
    // BACKGROUND CAMPUS BUILDINGS VISTA (VISIBLE THROUGH THE GATE)
    // ============================================================
    const campusVista = new THREE.Group();
    campusVista.position.set(0, 0, -35);

    // Internal Central Boulevard stretching into distance
    const innerRoad = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 70),
      new THREE.MeshLambertMaterial({ color: '#334155' })
    );
    innerRoad.rotation.x = -Math.PI / 2;
    innerRoad.position.set(0, 0.02, -20);
    campusVista.add(innerRoad);

    // Stately Royal Palm Trees along the internal boulevard
    const createVistaPalm = (px: number, pz: number) => {
      const palm = new THREE.Group();
      palm.position.set(px, 0, pz);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.38, 6.5, 8),
        new THREE.MeshLambertMaterial({ color: '#78350f' })
      );
      trunk.position.y = 3.25;
      palm.add(trunk);
      const frondMat = new THREE.MeshLambertMaterial({ color: '#15803d' });
      for (let i = 0; i < 7; i++) {
        const frond = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.2, 5), frondMat);
        frond.rotation.z = 0.65;
        frond.rotation.y = (i * Math.PI * 2) / 7;
        frond.position.y = 6.2;
        palm.add(frond);
      }
      return palm;
    };

    [-8, 8].forEach((px) => {
      [-5, -18, -32, -45].forEach((pz) => {
        campusVista.add(createVistaPalm(px, pz));
      });
    });

    // Distant Senate Clock Tower centered at the end of the vista
    const senateVista = new THREE.Group();
    senateVista.position.set(0, 0, -50);
    const senateBase = new THREE.Mesh(
      new THREE.BoxGeometry(16, 9, 12),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    senateBase.position.y = 4.5;
    senateVista.add(senateBase);

    const senateTower = new THREE.Mesh(
      new THREE.BoxGeometry(6, 14, 6),
      new THREE.MeshLambertMaterial({ color: '#0f172a' })
    );
    senateTower.position.y = 15;
    senateVista.add(senateTower);

    const senateSpire = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 7, 8),
      new THREE.MeshLambertMaterial({ color: '#d97706' })
    );
    senateSpire.position.y = 25.5;
    senateVista.add(senateSpire);

    // Glowing Clock Face
    const clockDial = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 16),
      new THREE.MeshBasicMaterial({ color: '#fef08a' })
    );
    clockDial.position.set(0, 16.5, 3.05);
    senateVista.add(clockDial);

    campusVista.add(senateVista);

    // Left and Right Faculty Buildings in the background
    const facLeft = new THREE.Mesh(
      new THREE.BoxGeometry(16, 11, 14),
      new THREE.MeshLambertMaterial({ color: '#0f766e' })
    );
    facLeft.position.set(-24, 5.5, -28);
    campusVista.add(facLeft);

    const facRight = new THREE.Mesh(
      new THREE.BoxGeometry(16, 10, 14),
      new THREE.MeshLambertMaterial({ color: '#1d4ed8' })
    );
    facRight.position.set(24, 5.0, -28);
    campusVista.add(facRight);

    scene.add(campusVista);

    // ============================================================
    // REDESIGNED MONUMENTAL INSTITUTIONAL ENTRANCE GATE
    // With multi-tiered Classical pillars, mouldings, university seal,
    // and official inscription: "WELCOME TO FEDERAL UNIVERSITY OF OMO SURULERE CAMPUS"
    // ============================================================
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, -6.8);

    const greenMat = new THREE.MeshLambertMaterial({ color: '#064e3b' });
    const goldMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
    const stoneCreamMat = new THREE.MeshLambertMaterial({ color: '#fef3c7' });
    const darkGateMat = new THREE.MeshLambertMaterial({ color: '#022c14' });

    // 1. Two Stately Main Entrance Pillars with Pedestals & Cornices
    const createPillar = (xPos: number) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(xPos, 0, 0);

      // Base Pedestal
      const basePedestal = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.4), darkGateMat);
      basePedestal.position.y = 0.6;
      basePedestal.castShadow = true;
      pGroup.add(basePedestal);

      const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.25, 2.6), goldMat);
      baseTrim.position.y = 1.25;
      pGroup.add(baseTrim);

      // Main Pillar Shaft (Fluted appearance)
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.9, 4.4, 1.9), greenMat);
      shaft.position.y = 3.55;
      shaft.castShadow = true;
      pGroup.add(shaft);

      // Vertical Gold Inlay Grooves on Pillar
      [-0.6, 0, 0.6].forEach((gx) => {
        const groove = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.8, 0.08), goldMat);
        groove.position.set(gx, 3.55, 0.98);
        pGroup.add(groove);
      });

      // Capital Cornice
      const capitalTrim = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.35, 2.5), goldMat);
      capitalTrim.position.y = 5.9;
      pGroup.add(capitalTrim);

      const capitalBlock = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 2.2), stoneCreamMat);
      capitalBlock.position.y = 6.25;
      pGroup.add(capitalBlock);

      // Spherical Golden Lantern Finial atop pillar
      const lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.3, 8), darkGateMat);
      lanternBase.position.y = 6.6;
      pGroup.add(lanternBase);

      const lanternGlobe = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 16, 16),
        new THREE.MeshBasicMaterial({ color: '#fef08a' })
      );
      lanternGlobe.position.y = 7.05;
      pGroup.add(lanternGlobe);

      // Lantern brass cage rim
      const lanternRim = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.04, 8, 16), goldMat);
      lanternRim.rotation.x = Math.PI / 2;
      lanternRim.position.y = 7.05;
      pGroup.add(lanternRim);

      return pGroup;
    };

    gateGroup.add(createPillar(-7.2));
    gateGroup.add(createPillar(7.2));

    // Outer Side Wing Walls with Pedestrian Gateways
    [-11.2, 11.2].forEach((wx) => {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.8, 0.9), greenMat);
      sideWall.position.set(wx, 1.9, 0);
      sideWall.castShadow = true;
      gateGroup.add(sideWall);

      const sideCap = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 1.1), goldMat);
      sideCap.position.set(wx, 3.9, 0);
      gateGroup.add(sideCap);

      // Decorative wrought iron gate bars in side portal
      const portalMat = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
      for (let bx = -1.6; bx <= 1.6; bx += 0.4) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 6), portalMat);
        bar.position.set(wx + bx, 2.0, 0);
        gateGroup.add(bar);
      }
    });

    // 2. Grand Overhead Beam with Mouldings spanning the Pillars
    const mainArchBeam = new THREE.Mesh(
      new THREE.BoxGeometry(15.2, 1.3, 1.6),
      greenMat
    );
    mainArchBeam.position.set(0, 5.85, 0);
    mainArchBeam.castShadow = true;
    gateGroup.add(mainArchBeam);

    const archGoldUnderTrim = new THREE.Mesh(
      new THREE.BoxGeometry(14.8, 0.18, 1.8),
      goldMat
    );
    archGoldUnderTrim.position.set(0, 5.15, 0);
    gateGroup.add(archGoldUnderTrim);

    const archGoldTopTrim = new THREE.Mesh(
      new THREE.BoxGeometry(15.4, 0.22, 1.8),
      goldMat
    );
    archGoldTopTrim.position.set(0, 6.55, 0);
    gateGroup.add(archGoldTopTrim);

    // Upper Classical Triangular / Arched Pediment Header
    const pedimentBase = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 0.85, 1.4),
      darkGateMat
    );
    pedimentBase.position.set(0, 7.05, 0);
    gateGroup.add(pedimentBase);

    // Decorative Gold Peak Arch
    const pedimentPeak = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 3.6, 1.2, 3),
      goldMat
    );
    pedimentPeak.rotation.z = Math.PI;
    pedimentPeak.rotation.y = Math.PI / 2;
    pedimentPeak.position.set(0, 7.7, 0);
    gateGroup.add(pedimentPeak);

    // Golden Central Finial atop gate
    const centerFinial = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1.4, 8),
      goldMat
    );
    centerFinial.position.set(0, 8.8, 0);
    gateGroup.add(centerFinial);

    // 3. High-Definition Canvas for Gate Inscription & University Logo
    // Displaying: "WELCOME TO FEDERAL UNIVERSITY OF OMO SURULERE CAMPUS"
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 256;
    const sCtx = signCanvas.getContext('2d');
    if (sCtx) {
      // Emerald green luxury background with double gold borders
      const bgGrad = sCtx.createLinearGradient(0, 0, 0, 256);
      bgGrad.addColorStop(0, '#044223');
      bgGrad.addColorStop(0.5, '#065f33');
      bgGrad.addColorStop(1, '#022d17');
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, 1024, 256);

      // Gold Filigree Border
      sCtx.strokeStyle = '#f59e0b';
      sCtx.lineWidth = 10;
      sCtx.strokeRect(12, 12, 1000, 232);

      sCtx.strokeStyle = '#fde68a';
      sCtx.lineWidth = 3;
      sCtx.strokeRect(22, 22, 980, 212);

      // University Seal / Mascot Emblem at Center Top
      sCtx.fillStyle = '#f59e0b';
      sCtx.beginPath();
      sCtx.arc(512, 54, 34, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.fillStyle = '#064e3b';
      sCtx.beginPath();
      sCtx.arc(512, 54, 30, 0, Math.PI * 2);
      sCtx.fill();

      // University Seal Logo Icon (Star + Graduation Cap)
      sCtx.fillStyle = '#fef08a';
      sCtx.font = 'bold 26px sans-serif';
      sCtx.textAlign = 'center';
      sCtx.textBaseline = 'middle';
      sCtx.fillText('★ FUO ★', 512, 54);

      // Top Welcome Inscription
      sCtx.fillStyle = '#fef08a';
      sCtx.font = '900 36px "Cabinet Grotesk", "Times New Roman", serif';
      sCtx.letterSpacing = '3px';
      sCtx.fillText('WELCOME TO', 512, 110);

      // Main Institution Name Inscription
      sCtx.fillStyle = '#ffffff';
      sCtx.font = '900 48px "Cabinet Grotesk", "Times New Roman", serif';
      sCtx.shadowColor = 'rgba(0,0,0,0.8)';
      sCtx.shadowBlur = 8;
      sCtx.shadowOffsetY = 4;
      sCtx.fillText('FEDERAL UNIVERSITY OF OMO', 512, 165);

      // Campus Location Inscription
      sCtx.shadowBlur = 0;
      sCtx.fillStyle = '#f59e0b';
      sCtx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
      sCtx.fillText('SURULERE CAMPUS', 512, 215);
    }

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.anisotropy = 4;

    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(13.8, 2.6),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(0, 5.85, 0.88);
    gateGroup.add(signMesh);

    scene.add(gateGroup);

    // ==========================================
    // 3D CHARACTERS WITH MONOPOLY GUY FACES
    // ==========================================
    const createCharacter = (
      shirtColor: string,
      pantsColor: string,
      variant: 'papa' | 'mama' | 'student' | 'npc_walrus'
    ) => {
      const char = new THREE.Group();

      // Torso
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 1.15, 0.48),
        new THREE.MeshLambertMaterial({ color: shirtColor })
      );
      torso.position.y = 1.45;
      torso.castShadow = true;
      char.add(torso);

      // Legs
      const legMat = new THREE.MeshLambertMaterial({ color: pantsColor });
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.32), legMat);
      legL.position.set(-0.24, 0.48, 0);
      legL.castShadow = true;
      char.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.32), legMat);
      legR.position.set(0.24, 0.48, 0);
      legR.castShadow = true;
      char.add(legR);

      // Arms
      const armMat = new THREE.MeshLambertMaterial({ color: shirtColor });
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), armMat);
      armL.position.set(-0.55, 1.42, 0);
      char.add(armL);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), armMat);
      armR.position.set(0.55, 1.42, 0);
      char.add(armR);

      // Backpack for Student
      if (variant === 'student') {
        const pack = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.85, 0.38),
          new THREE.MeshLambertMaterial({ color: '#ea580c' })
        );
        pack.position.set(0, 1.45, -0.38);
        pack.castShadow = true;
        char.add(pack);
      }

      // Add 3D Monopoly Guy Head with Handlebar Moustache, Monocle, Rosy Cheeks, & Hat
      const monopolyHead = createMonopolyHead(variant);
      monopolyHead.position.y = 2.35;
      char.add(monopolyHead);

      return char;
    };

    // Papa (Chief Okafor) - Dignified Monopoly Chief with white handlebar mustache, monocle & red cap
    const papa = createCharacter('#1e3a8a', '#0f172a', 'papa');
    papa.position.set(-1.9, 0.15, -2.4);
    papa.rotation.y = 0.4;
    scene.add(papa);
    papaMeshRef.current = papa;

    // Mama (Lolo Okafor) - Warm matriarch with Ankara and golden Gele
    const mama = createCharacter('#d97706', '#78350f', 'mama');
    mama.position.set(-3.4, 0.15, -2.1);
    mama.rotation.y = 0.55;
    scene.add(mama);
    mamaMeshRef.current = mama;

    // Student (Player) - Young Monopoly graduate face with sharp dark mustache & mortarboard cap
    const student = createCharacter('#047857', '#1e3a8a', 'student');
    student.position.set(1.6, 0.15, -2.4);
    student.rotation.y = -0.4;
    scene.add(student);
    studentMeshRef.current = student;

    // Shuttle Driver with Walrus Mustache & conductor cap standing by shuttle
    const driver = createCharacter('#b45309', '#1e293b', 'npc_walrus');
    driver.position.set(-6.5, 0.15, 2.5);
    driver.rotation.y = 1.1;
    scene.add(driver);
    driverMeshRef.current = driver;

    // Luggage: Hard Suitcase & Authentic Ghana-Must-Go Bag
    const luggageGroup = new THREE.Group();
    luggageGroup.position.set(0, 0.15, -2.2);

    const suitcase = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.65, 0.42),
      new THREE.MeshLambertMaterial({ color: '#451a03' })
    );
    suitcase.position.set(-0.4, 0.32, 0);
    suitcase.castShadow = true;
    luggageGroup.add(suitcase);

    // Ghana-Must-Go Bag (Checked Pattern)
    const gmgCanvas = document.createElement('canvas');
    gmgCanvas.width = 128;
    gmgCanvas.height = 128;
    const gmgCtx = gmgCanvas.getContext('2d');
    if (gmgCtx) {
      gmgCtx.fillStyle = '#dc2626';
      gmgCtx.fillRect(0, 0, 128, 128);
      gmgCtx.fillStyle = '#2563eb';
      for (let i = 0; i < 128; i += 16) {
        gmgCtx.fillRect(i, 0, 8, 128);
        gmgCtx.fillRect(0, i, 128, 8);
      }
      gmgCtx.fillStyle = '#ffffff';
      for (let x = 0; x < 128; x += 32) {
        for (let y = 0; y < 128; y += 32) {
          gmgCtx.fillRect(x + 4, y + 4, 8, 8);
        }
      }
    }
    const gmgTex = new THREE.CanvasTexture(gmgCanvas);
    const gmgBag = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.9, 0.6),
      new THREE.MeshLambertMaterial({ map: gmgTex })
    );
    gmgBag.position.set(0.6, 0.45, 0.1);
    gmgBag.rotation.y = 0.25;
    gmgBag.castShadow = true;
    luggageGroup.add(gmgBag);

    scene.add(luggageGroup);

    // Commercial Danfo Bus
    const bus = new THREE.Group();
    bus.position.set(-25, 0, 4.2);

    const bodyMat = new THREE.MeshLambertMaterial({ color: '#facc15' });
    const busBody = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.6, 2.5), bodyMat);
    busBody.position.y = 1.65;
    busBody.castShadow = true;
    bus.add(busBody);

    const greenStripe = new THREE.Mesh(
      new THREE.BoxGeometry(6.25, 0.4, 2.52),
      new THREE.MeshLambertMaterial({ color: '#16a34a' })
    );
    greenStripe.position.y = 1.4;
    bus.add(greenStripe);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(6.3, 0.35, 2.6),
      new THREE.MeshLambertMaterial({ color: '#ffffff' })
    );
    roof.position.y = 3.05;
    bus.add(roof);

    const winMat = new THREE.MeshLambertMaterial({ color: '#0284c7' });
    const winL = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.85), winMat);
    winL.position.set(0, 2.2, 1.28);
    bus.add(winL);

    const wheelMat = new THREE.MeshLambertMaterial({ color: '#1c1917' });
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.38, 16);
    [
      [-1.9, -1.25],
      [-1.9, 1.25],
      [1.9, -1.25],
      [1.9, 1.25]
    ].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, 0.48, wz);
      bus.add(w);
    });

    scene.add(bus);
    busGroupRef.current = bus;

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Shuttle movement animation:
      if (busGroupRef.current) {
        if (shuttleState === 'arriving') {
          if (busGroupRef.current.position.x < -7) {
            busGroupRef.current.position.x += 0.22;
          } else {
            busGroupRef.current.position.x = -7;
            setShuttleState('parked');
          }
        } else if (shuttleState === 'departing') {
          busGroupRef.current.position.x += 0.22;
        }
      }

      // Gentle Sims-style breathing and idle gestures
      if (papaMeshRef.current) {
        papaMeshRef.current.position.y = 0.15 + Math.sin(time * 2.2) * 0.03;
        if (activeSpeaker === 'papa') {
          papaMeshRef.current.rotation.y = 0.4 + Math.sin(time * 3.5) * 0.05;
        }
      }
      if (mamaMeshRef.current) {
        mamaMeshRef.current.position.y = 0.15 + Math.sin(time * 2.2 + 1) * 0.03;
        if (activeSpeaker === 'mama') {
          mamaMeshRef.current.rotation.y = 0.55 + Math.sin(time * 3.5) * 0.05;
        }
      }
      if (studentMeshRef.current) {
        studentMeshRef.current.position.y = 0.15 + Math.sin(time * 2.2 + 2) * 0.03;
        if (activeSpeaker === 'student') {
          studentMeshRef.current.rotation.y = -0.4 + Math.sin(time * 3) * 0.05;
        }
      }

      // Smooth subtle camera sway with clear view of characters and gate
      camera.position.x = Math.sin(time * 0.2) * 0.35;
      camera.lookAt(0, 3.4, -4.8);

      renderer.render(scene, camera);
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
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current?.domElement && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [shuttleState, activeSpeaker]);

  // Update speaker on scene step
  useEffect(() => {
    if (sceneStep === 1) setActiveSpeaker('papa');
    else if (sceneStep === 2) setActiveSpeaker('mama');
    else if (sceneStep === 3) setActiveSpeaker('student');
    else if (sceneStep === 4) setActiveSpeaker('papa');
  }, [sceneStep]);

  // Keyboard shortcut listener for replies (1, 2, 3)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (sceneStep === 3) {
        if (e.key === '1') {
          handleSelectReply("I'll be fine, Dad. Don't worry, I'll take care of myself.");
        } else if (e.key === '2') {
          handleSelectReply("Mummy, I'll call you. Just don't call me every hour!");
        } else if (e.key === '3') {
          handleSelectReply("I've got this. I'll make you both proud.");
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [sceneStep]);

  // Handle student replies
  const handleSelectReply = (reply: string) => {
    sounds.playClick();
    setChosenStudentReply(reply);
    setSceneStep(4);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReply.trim()) return;
    sounds.playClick();
    setChosenStudentReply(customReply.trim());
    setSceneStep(4);
  };

  const handleFinishScene = () => {
    sounds.playKekeHorn();
    setShuttleState('departing');
    setTimeout(() => {
      onFinishArrival();
    }, 1000);
  };

  return (
    <div className="relative w-full h-[600px] max-h-[85vh] rounded-3xl overflow-hidden border-2 border-emerald-500/70 shadow-2xl bg-stone-950 select-none flex flex-col justify-between">
      {/* 3D Canvas Viewport in Background */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* TOP HEADER: University Gate Tag */}
      <div className="relative z-20 mx-3 sm:mx-4 mt-2 flex items-center justify-between pointer-events-none">
        <div className="bg-stone-900/80 border border-emerald-500/50 px-3 py-1 rounded-full text-[11px] font-bold text-amber-300 flex items-center gap-1.5 shadow-md backdrop-blur-md">
          <Bus className="w-3.5 h-3.5 text-amber-400" />
          <span>Federal University of Omo • Main Gate Drop-Off</span>
        </div>
        <div className="bg-stone-900/80 border border-stone-700 px-3 py-1 rounded-full text-[10px] text-stone-300 font-bold backdrop-blur-md">
          Department: <span className="text-emerald-400">{courseName}</span>
        </div>
      </div>

      {/* CINEMATIC CUTSCENE DIALOGUE DOCK AT BOTTOM: NEVER OVERLAPS CHARACTER HEADS OR BODIES */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[96%] max-w-2xl z-30 pointer-events-auto">
        {/* STEP 1: FATHER SPEAKS */}
        {sceneStep === 1 && (
          <div className="bg-stone-950/90 border-2 border-blue-500/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-left animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-1.5 border-b border-stone-800 pb-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-sm shadow border border-blue-300">
                  👨🏾‍🦳
                </span>
                <div>
                  <span className="font-black text-xs text-blue-300">Papa (Chief Okafor)</span>
                  <span className="text-[10px] text-stone-400 ml-2 font-mono">1/3</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setSceneStep(2); }}
                className="text-[11px] font-bold text-blue-300 hover:text-white flex items-center gap-1 bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-lg border border-stone-700 cursor-pointer transition"
              >
                <span>Listen to Mama</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-stone-100 font-medium leading-relaxed">
              "Look at that monumental gate, my child {cleanStudentName}! The Federal University of Omo. You are here to learn and build your future. Be responsible, take your studies seriously, and stay far away from trouble. Remember the values we raised you with."
            </p>
          </div>
        )}

        {/* STEP 2: MOTHER SPEAKS */}
        {sceneStep === 2 && (
          <div className="bg-stone-950/90 border-2 border-amber-500/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-left animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-1.5 border-b border-stone-800 pb-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-sm shadow border border-amber-300">
                  🧕🏾
                </span>
                <div>
                  <span className="font-black text-xs text-amber-300">Mama (Lolo Okafor)</span>
                  <span className="text-[10px] text-stone-400 ml-2 font-mono">2/3</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setSceneStep(3); }}
                  className="text-[10px] font-bold text-stone-400 hover:text-amber-300 flex items-center gap-1 bg-stone-800 px-2 py-1 rounded-lg border border-stone-700 cursor-pointer"
                  title="Skip to your response"
                >
                  <FastForward className="w-3 h-3" />
                  <span>Skip</span>
                </button>
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setSceneStep(3); }}
                  className="text-[11px] font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded-lg shadow cursor-pointer transition flex items-center gap-1"
                >
                  <span>Reply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-100 font-medium leading-relaxed">
              "Amen, Papa! And please, {cleanStudentName}, eat proper food every day. Don't starve yourself because of reading. Take good care of your luggage and provisions, and be careful about who you trust. Call home whenever you can, okay?"
            </p>
          </div>
        )}

        {/* STEP 3: PLAYER RESPONDS */}
        {sceneStep === 3 && (
          <div className="bg-stone-950/90 border-2 border-emerald-500/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-left space-y-2 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-stone-800 pb-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-sm shadow border border-emerald-300">
                  🎓
                </span>
                <span className="font-black text-xs text-emerald-300">{cleanStudentName} (You)</span>
              </div>
              <span className="text-[10px] text-amber-300 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60">
                Choose Your Response
              </span>
            </div>

            {/* 3 Distinct Player Replies */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {[
                { key: '1', label: 'Reassuring', text: "I'll be fine, Dad. Don't worry, I'll take care of myself." },
                { key: '2', label: 'Playful', text: "Mummy, I'll call you. Just don't call every hour!" },
                { key: '3', label: 'Confident', text: "I've got this. I'll make you both proud." }
              ].map((reply) => (
                <button
                  key={reply.key}
                  type="button"
                  onClick={() => handleSelectReply(reply.text)}
                  className="text-left p-2 rounded-xl bg-stone-900/90 hover:bg-emerald-950 border border-stone-800 hover:border-emerald-500 text-xs text-stone-100 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-stone-800 text-[10px] font-mono text-emerald-400 font-bold flex items-center justify-center shrink-0">
                      {reply.key}
                    </span>
                    <span className="italic leading-tight text-[11px]">"{reply.text}"</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Typed Text Input (Free text option) */}
            <div className="pt-1 border-t border-stone-800/80">
              <form onSubmit={handleCustomSubmit} className="flex gap-1.5">
                <input
                  type="text"
                  value={customReply}
                  onChange={(e) => setCustomReply(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Or type a custom reply..."
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!customReply.trim()}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    customReply.trim()
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 4: PARENTAL BLESSING REACTION & PROCEED */}
        {sceneStep === 4 && (
          <div className="bg-stone-950/90 border-2 border-amber-400/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md space-y-2 text-left animate-in slide-in-from-bottom-2 duration-300">
            {chosenStudentReply && (
              <div className="text-xs text-emerald-300 italic border-l-2 border-emerald-400 pl-2 py-0.5">
                <span className="font-bold text-[10px] uppercase text-emerald-400 not-italic mr-1">You:</span>
                "{chosenStudentReply}"
              </div>
            )}

            <div className="text-xs text-stone-200 leading-relaxed space-y-1">
              <p className="flex items-start gap-1.5">
                <span className="font-bold text-blue-300 shrink-0">Papa:</span>
                <span>"That is the spirit. Go inside, secure your accommodation, and make us proud."</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="font-bold text-amber-300 shrink-0">Mama:</span>
                <span>"May God guide your steps, my child. We will be waiting for your call on Sunday!"</span>
              </p>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handleFinishScene}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition transform hover:scale-[1.02] cursor-pointer"
              >
                <span>Select Accommodation & Move into Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM STATUS BAR: Subtle and non-obstructive */}
      <div className="relative z-10 px-3 py-2 flex justify-between items-center text-[10px] text-stone-400 pointer-events-none">
        <span>Press [1, 2, 3] to select responses</span>
        <span>Danfo Commercial Shuttle Bus</span>
      </div>
    </div>
  );
};
