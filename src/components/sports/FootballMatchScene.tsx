import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import { createMonopolyHead } from '../game3d/monopolyFace';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Zap,
  RotateCcw,
  Clock,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  X,
  Radio,
  Volume2
} from 'lucide-react';

export interface FootballMatchResult {
  homeGoals: number;
  awayGoals: number;
  playerGoals: number;
  shots: number;
  shotsOnTarget: number;
  tackles: number;
  xpGained: number;
  cashGained: number;
}

interface FootballMatchSceneProps {
  player?: PlayerState | null;
  homeTeamName?: string;
  awayTeamName?: string;
  homeColor?: string;
  awayColor?: string;
  isTournament?: boolean;
  tournamentRound?: string;
  onFinishMatch: (result: FootballMatchResult) => void;
  onExit: () => void;
}

interface PlayerActor {
  id: string;
  name: string;
  team: 'home' | 'away';
  isUser: boolean;
  isKeeper: boolean;
  group: THREE.Group;
  legL: THREE.Mesh;
  legR: THREE.Mesh;
  armL: THREE.Mesh;
  armR: THREE.Mesh;
  torso: THREE.Mesh;
  baseX: number;
  baseZ: number;
  speed: number;
  stamina: number;
  role: 'gk' | 'df' | 'mf' | 'fw';
  stumbleTimer: number;
}

export const FootballMatchScene: React.FC<FootballMatchSceneProps> = ({
  player,
  homeTeamName = 'Faculty of Engineering (FUO)',
  awayTeamName = 'Faculty of Law (Lex Titans)',
  homeColor = '#047857',
  awayColor = '#7e22ce',
  isTournament = false,
  tournamentRound = 'Quick Match',
  onFinishMatch,
  onExit
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Match State
  const [matchTime, setMatchTime] = useState<number>(120); // 2 minutes
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [playerGoals, setPlayerGoals] = useState<number>(0);
  const [shotsCount, setShotsCount] = useState<number>(0);
  const [shotsOnTarget, setShotsOnTarget] = useState<number>(0);
  const [tacklesCount, setTacklesCount] = useState<number>(0);
  const [commentary, setCommentary] = useState<string>('Match Kick-off! The stadium is packed to capacity!');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [shotCharge, setShotCharge] = useState<number>(0);
  const [isChargingShot, setIsChargingShot] = useState<boolean>(false);
  const [hasPossession, setHasPossession] = useState<boolean>(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const playersRef = useRef<PlayerActor[]>([]);
  const userActorRef = useRef<PlayerActor | null>(null);
  const spectatorCrowdRef = useRef<THREE.Group[]>([]);
  const netsRef = useRef<{ west: THREE.Group; east: THREE.Group } | null>(null);

  // Ball Physical State
  const ballPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.24, 0));
  const ballVel = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const ballOwner = useRef<PlayerActor | null>(null);
  const passTarget = useRef<PlayerActor | null>(null);

  // Input State
  const keysPressed = useRef<{ [k: string]: boolean }>({});
  const chargingRef = useRef<boolean>(false);
  const chargeAmountRef = useRef<number>(0);

  // Field dimensions: length 56m (-28 to +28), width 34m (-17 to +17)
  const FIELD_X = 28;
  const FIELD_Z = 17;
  const GOAL_WIDTH = 7.32;
  const GOAL_HEIGHT = 2.44;

  const triggerGoalCelebration = useCallback((scoringTeam: 'home' | 'away', scorerName: string) => {
    sounds.playWhistle();
    sounds.playGoalCelebration();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    if (scoringTeam === 'home') {
      setHomeScore((s) => s + 1);
      if (scorerName === 'You') {
        setPlayerGoals((g) => g + 1);
      }
      setCommentary(`⚡ GOOOAL! ${scorerName} fires it into the net! The home stadium erupts!`);
    } else {
      setAwayScore((s) => s + 1);
      setCommentary(`⚡ GOAL! ${scorerName} scores for ${awayTeamName}!`);
    }

    // Reset ball to center circle after brief celebration
    ballOwner.current = null;
    passTarget.current = null;
    ballPos.current.set(0, 0.24, 0);
    ballVel.current.set(0, 0, 0);

    // Reset player positions to kickoff positions
    playersRef.current.forEach((p) => {
      p.group.position.set(p.baseX, 0, p.baseZ);
    });
  }, [awayTeamName]);

  // Execute Pass Command
  const handlePass = useCallback(() => {
    if (!ballOwner.current || !ballOwner.current.isUser) return;
    const user = ballOwner.current;

    // Find best open teammate ahead of user
    const teammates = playersRef.current.filter((p) => p.team === 'home' && !p.isUser && !p.isKeeper);
    if (teammates.length === 0) return;

    // Pick teammate closest to opponent goal (+X) or best forward angle
    teammates.sort((a, b) => b.group.position.x - a.group.position.x);
    const target = teammates[0];

    passTarget.current = target;
    const passVector = new THREE.Vector3().subVectors(target.group.position, user.group.position);
    passVector.y = 0;
    const passDistance = passVector.length();
    passVector.normalize();

    // Crisp pass speed
    ballVel.current.copy(passVector.multiplyScalar(Math.min(22, Math.max(14, passDistance * 1.5))));
    ballVel.current.y = 0.4;
    ballOwner.current = null;
    setHasPossession(false);
    sounds.playKick();
    setCommentary(`Precise pass played through to ${target.name}!`);
  }, []);

  // Execute Tackle Command
  const handleTackle = useCallback(() => {
    if (!userActorRef.current) return;
    const user = userActorRef.current;

    // User sliding tackle
    sounds.playTackle();
    setTacklesCount((c) => c + 1);

    // Lunging forward animation
    user.legL.rotation.x = 1.3;
    user.legR.rotation.x = -1.1;

    // Check proximity to ball or rival ball-carrier
    const distToBall = user.group.position.distanceTo(ballPos.current);
    if (distToBall < 3.2) {
      if (ballOwner.current && ballOwner.current.team !== 'home') {
        const opponent = ballOwner.current;
        opponent.stumbleTimer = 1.2;
        ballOwner.current = user;
        ballVel.current.set(0, 0, 0);
        setHasPossession(true);
        setCommentary(`HEROIC SLIDE TACKLE! Dispossessed ${opponent.name}!`);
      } else if (!ballOwner.current) {
        ballOwner.current = user;
        ballVel.current.set(0, 0, 0);
        setHasPossession(true);
        setCommentary('Won the loose ball cleanly!');
      }
    }
  }, []);

  // Execute Shoot Command (on keyup / release)
  const handleReleaseShot = useCallback(() => {
    if (!chargingRef.current) return;
    chargingRef.current = false;
    setIsChargingShot(false);

    if (ballOwner.current && ballOwner.current.isUser) {
      const charge = chargeAmountRef.current;
      const power = Math.max(14, Math.min(28, 14 + charge * 14));

      // Target goal corners (+X = 28, Z ∈ [-3.2, 3.2], Y ∈ [0.4, 2.2])
      const aimCornerZ = (Math.random() - 0.5) * 5.2;
      const aimHeight = 0.6 + charge * 1.6;
      const targetVec = new THREE.Vector3(28 - ballPos.current.x, aimHeight, aimCornerZ - ballPos.current.z).normalize();

      ballVel.current.copy(targetVec.multiplyScalar(power));
      ballOwner.current = null;
      setHasPossession(false);
      sounds.playKick();

      setShotsCount((c) => c + 1);
      setShotsOnTarget((c) => c + 1);
      setCommentary('POWERFUL STRIKE! Ball screaming toward the goal!');
    }

    chargeAmountRef.current = 0;
    setShotCharge(0);
  }, []);

  // Setup Full 3D Stadium, Spectators & Match Loop
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#030712');
    scene.fog = new THREE.FogExp2('#030712', 0.009);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 300);
    camera.position.set(0, 24, 38);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // =============================================================
    // 1. LIGHTING & 4 FLOODLIGHT TOWERS
    // =============================================================
    const ambient = new THREE.AmbientLight('#ffffff', 0.75);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight('#fef08a', 1.25);
    dirLight.position.set(18, 45, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 4 Angled 18m Floodlight Towers around Stadium
    const towerMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    [[-34, -22], [34, -22], [-34, 22], [34, 22]].forEach(([tx, tz]) => {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 20, 8), towerMat);
      pylon.position.set(tx, 10, tz);
      scene.add(pylon);

      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.8), lampGlowMat);
      lampHead.position.set(tx, 20.2, tz);
      lampHead.lookAt(0, 2, 0);
      scene.add(lampHead);

      const spot = new THREE.SpotLight('#fef08a', 1.4, 75, Math.PI / 3.5, 0.4);
      spot.position.set(tx, 20, tz);
      spot.target.position.set(0, 0, 0);
      scene.add(spot);
      scene.add(spot.target);
    });

    // =============================================================
    // 2. MOWED EMERALD TURF & PITCH MARKINGS
    // =============================================================
    const pitchMow1 = new THREE.MeshLambertMaterial({ color: '#15803d' });
    const pitchMow2 = new THREE.MeshLambertMaterial({ color: '#166534' });

    // 10 Alternating mow stripes across the 56m pitch
    const stripeW = 5.6;
    for (let i = 0; i < 10; i++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(stripeW, 34),
        i % 2 === 0 ? pitchMow1 : pitchMow2
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(-FIELD_X + stripeW / 2 + i * stripeW, 0.01, 0);
      stripe.receiveShadow = true;
      scene.add(stripe);
    }

    // Touchlines & Goal lines
    const whiteLine = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    [-17, 17].forEach((gz) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(56, 0.22), whiteLine);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, gz);
      scene.add(line);
    });
    [-28, 28].forEach((gx) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 34), whiteLine);
      line.rotation.x = -Math.PI / 2;
      line.position.set(gx, 0.02, 0);
      scene.add(line);
    });

    // Halfway Line & Center Circle
    const half = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 34), whiteLine);
    half.rotation.x = -Math.PI / 2;
    half.position.set(0, 0.02, 0);
    scene.add(half);

    const centerCircle = new THREE.Mesh(new THREE.RingGeometry(5.0, 5.22, 32), whiteLine);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.022, 0);
    scene.add(centerCircle);

    const centerSpot = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), whiteLine);
    centerSpot.rotation.x = -Math.PI / 2;
    centerSpot.position.set(0, 0.023, 0);
    scene.add(centerSpot);

    // Goal Boxes & Penalty Spots
    [-1, 1].forEach((dir) => {
      const bx = dir * 28;
      const boxFront = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 18), whiteLine);
      boxFront.rotation.x = -Math.PI / 2;
      boxFront.position.set(bx - dir * 14, 0.02, 0);
      scene.add(boxFront);

      [-9, 9].forEach((bz) => {
        const boxSide = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.22), whiteLine);
        boxSide.rotation.x = -Math.PI / 2;
        boxSide.position.set(bx - dir * 7, 0.02, bz);
        scene.add(boxSide);
      });

      const penSpot = new THREE.Mesh(new THREE.CircleGeometry(0.26, 16), whiteLine);
      penSpot.rotation.x = -Math.PI / 2;
      penSpot.position.set(bx - dir * 9.5, 0.023, 0);
      scene.add(penSpot);
    });

    // =============================================================
    // 3. REGULATION GOALPOSTS & VIBRATING NETS
    // =============================================================
    const postMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
    const netMat = new THREE.MeshBasicMaterial({ color: '#cbd5e1', wireframe: true });

    const createGoalComplex = (gx: number, facingDir: number) => {
      const goal = new THREE.Group();
      goal.position.set(gx, 0, 0);

      [-3.66, 3.66].forEach((pz) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, GOAL_HEIGHT, 14), postMat);
        post.position.set(0, GOAL_HEIGHT / 2, pz);
        goal.add(post);
      });

      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, GOAL_WIDTH, 14), postMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(0, GOAL_HEIGHT, 0);
      goal.add(crossbar);

      const net = new THREE.Mesh(new THREE.BoxGeometry(2.0, GOAL_HEIGHT, GOAL_WIDTH), netMat);
      net.position.set(-facingDir * 1.0, GOAL_HEIGHT / 2, 0);
      goal.add(net);

      scene.add(goal);
      return goal;
    };

    const goalWest = createGoalComplex(-28, 1);
    const goalEast = createGoalComplex(28, -1);
    netsRef.current = { west: goalWest, east: goalEast };

    // =============================================================
    // 4. FULL REALISTIC STADIUM GRANDSTANDS & CHEERING SPECTATORS
    // =============================================================
    const standConcreteMat = new THREE.MeshLambertMaterial({ color: '#334155' });
    const seatMatHome = new THREE.MeshLambertMaterial({ color: '#16a34a' });
    const seatMatAway = new THREE.MeshLambertMaterial({ color: '#9333ea' });
    const canopyRoofMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });

    // North Main Covered Grandstand (Length = 58m, 5 Tiers)
    const northStand = new THREE.Group();
    northStand.position.set(0, 0, -21.5);

    for (let t = 0; t < 5; t++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(58, 0.75, 1.4), standConcreteMat);
      step.position.set(0, 0.38 + t * 0.75, -t * 1.3);
      northStand.add(step);

      // Add colorful cheering spectator models on each tier
      for (let s = -26; s <= 26; s += 1.8) {
        const fanGroup = new THREE.Group();
        fanGroup.position.set(s + (Math.random() - 0.5) * 0.4, 0.8 + t * 0.75, -t * 1.3);

        const fanColor = Math.random() > 0.4 ? seatMatHome : seatMatAway;
        const fanTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.35), fanColor);
        fanTorso.position.y = 0.35;
        fanGroup.add(fanTorso);

        const fanHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshLambertMaterial({ color: Math.random() > 0.5 ? '#875338' : '#5c3826' })
        );
        fanHead.position.y = 0.8;
        fanGroup.add(fanHead);

        northStand.add(fanGroup);
        spectatorCrowdRef.current.push(fanGroup);
      }
    }

    // Steel Cantilever Truss Roof over North Grandstand
    const roofCanopy = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 10), canopyRoofMat);
    roofCanopy.position.set(0, 6.8, -3.2);
    roofCanopy.rotation.x = 0.08;
    northStand.add(roofCanopy);

    // VIP Commentary Box
    const vipBox = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2.4, 2.8),
      new THREE.MeshLambertMaterial({ color: '#0284c7' })
    );
    vipBox.position.set(0, 5.2, -5.5);
    northStand.add(vipBox);

    scene.add(northStand);

    // South Open Bleachers (Length = 58m, 4 Tiers)
    const southStand = new THREE.Group();
    southStand.position.set(0, 0, 21.5);
    for (let t = 0; t < 4; t++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(58, 0.75, 1.4), standConcreteMat);
      step.position.set(0, 0.38 + t * 0.75, t * 1.3);
      southStand.add(step);

      for (let s = -25; s <= 25; s += 2.0) {
        const fanGroup = new THREE.Group();
        fanGroup.position.set(s, 0.8 + t * 0.75, t * 1.3);

        const fanTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.35), seatMatHome);
        fanTorso.position.y = 0.35;
        fanGroup.add(fanTorso);

        const fanHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshLambertMaterial({ color: '#875338' })
        );
        fanHead.position.y = 0.8;
        fanGroup.add(fanHead);

        southStand.add(fanGroup);
        spectatorCrowdRef.current.push(fanGroup);
      }
    }
    scene.add(southStand);

    // East & West Goal End Bleachers
    [-1, 1].forEach((dir) => {
      const endStand = new THREE.Group();
      endStand.position.set(dir * 33, 0, 0);
      for (let t = 0; t < 3; t++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.75, 30), standConcreteMat);
        step.position.set(dir * t * 1.3, 0.38 + t * 0.75, 0);
        endStand.add(step);
      }
      scene.add(endStand);
    });

    // Perimeter LED Advertising Boards
    const adMat = new THREE.MeshBasicMaterial({ color: '#0ea5e9' });
    [-18.5, 18.5].forEach((az) => {
      const board = new THREE.Mesh(new THREE.BoxGeometry(56, 1.0, 0.3), adMat);
      board.position.set(0, 0.5, az);
      scene.add(board);
    });

    // =============================================================
    // 5. SOCCER BALL MESH (WITH REALISTIC LEATHER PANELS)
    // =============================================================
    const ballCanvas = document.createElement('canvas');
    ballCanvas.width = 128;
    ballCanvas.height = 128;
    const bctx = ballCanvas.getContext('2d')!;
    bctx.fillStyle = '#ffffff';
    bctx.fillRect(0, 0, 128, 128);
    bctx.fillStyle = '#0f172a';
    for (let p = 0; p < 9; p++) {
      bctx.beginPath();
      bctx.arc(24 + (p % 3) * 40, 24 + Math.floor(p / 3) * 40, 14, 0, Math.PI * 2);
      bctx.fill();
    }
    const ballTex = new THREE.CanvasTexture(ballCanvas);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshLambertMaterial({ map: ballTex })
    );
    ball.position.set(0, 0.24, 0);
    ball.castShadow = true;
    scene.add(ball);
    ballMeshRef.current = ball;

    // =============================================================
    // 6. BUILD INDIVIDUAL 3D CHARACTERS (TEAMMATES & OPPONENTS)
    // =============================================================
    playersRef.current = [];

    const createActor = (
      id: string,
      name: string,
      team: 'home' | 'away',
      isUser: boolean,
      isKeeper: boolean,
      role: 'gk' | 'df' | 'mf' | 'fw',
      baseX: number,
      baseZ: number,
      jerseyColor: string,
      shortsColor: string
    ): PlayerActor => {
      const g = new THREE.Group();
      g.position.set(baseX, 0, baseZ);

      // Shorts / Legs
      const legMat = new THREE.MeshLambertMaterial({ color: shortsColor });
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.9, 0.26), legMat);
      legL.position.set(-0.2, 0.45, 0);
      g.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.9, 0.26), legMat);
      legR.position.set(0.2, 0.45, 0);
      g.add(legR);

      // Jersey Torso with Faculty Crest
      const jerseyMat = new THREE.MeshLambertMaterial({ color: jerseyColor });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.0, 0.38), jerseyMat);
      torso.position.y = 1.35;
      g.add(torso);

      // Arms
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, 0.2), jerseyMat);
      armL.position.set(-0.46, 1.35, 0);
      g.add(armL);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, 0.2), jerseyMat);
      armR.position.set(0.46, 1.35, 0);
      g.add(armR);

      // Head / Face
      const head = createMonopolyHead(isUser ? 'student' : isKeeper ? 'npc_walrus' : 'npc_goatee');
      head.position.y = 2.15;
      g.add(head);

      // Overhead Floating Name Badge Canvas
      const nameCanvas = document.createElement('canvas');
      nameCanvas.width = 256;
      nameCanvas.height = 64;
      const nCtx = nameCanvas.getContext('2d')!;
      nCtx.fillStyle = isUser ? 'rgba(234, 179, 8, 0.9)' : team === 'home' ? 'rgba(22, 163, 74, 0.9)' : 'rgba(147, 51, 234, 0.9)';
      nCtx.roundRect(4, 4, 248, 56, 12);
      nCtx.fill();
      nCtx.strokeStyle = '#ffffff';
      nCtx.lineWidth = 4;
      nCtx.stroke();
      nCtx.fillStyle = '#ffffff';
      nCtx.font = 'bold 26px sans-serif';
      nCtx.textAlign = 'center';
      nCtx.textBaseline = 'middle';
      nCtx.fillText(name, 128, 32);

      const nameTex = new THREE.CanvasTexture(nameCanvas);
      const namePlate = new THREE.Mesh(
        new THREE.PlaneGeometry(2.0, 0.5),
        new THREE.MeshBasicMaterial({ map: nameTex, transparent: true })
      );
      namePlate.position.y = 2.85;
      g.add(namePlate);

      // Golden Indicator Ring for User
      if (isUser) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.75, 0.9, 24),
          new THREE.MeshBasicMaterial({ color: '#facc15', side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.04;
        g.add(ring);
      }

      scene.add(g);

      return {
        id,
        name,
        team,
        isUser,
        isKeeper,
        role,
        group: g,
        legL,
        legR,
        armL,
        armR,
        torso,
        baseX,
        baseZ,
        speed: isUser ? 10.5 : isKeeper ? 7.2 : 8.8,
        stamina: 100,
        stumbleTimer: 0
      };
    };

    // Home Team: You + 3 Teammates (Attacking to +X)
    const pUser = createActor('user', 'You (C)', 'home', true, false, 'fw', -8, 0, homeColor, '#ffffff');
    userActorRef.current = pUser;
    playersRef.current.push(pUser);
    playersRef.current.push(createActor('h_gk', 'GK Dele', 'home', false, true, 'gk', -26, 0, '#eab308', '#0f172a'));
    playersRef.current.push(createActor('h_df', 'Emeka (DF)', 'home', false, false, 'df', -16, -6, homeColor, '#ffffff'));
    playersRef.current.push(createActor('h_mf', 'Chidi (MF)', 'home', false, false, 'mf', -10, 7, homeColor, '#ffffff'));

    // Away Team: 4 Opponents (Attacking to -X)
    playersRef.current.push(createActor('a_gk', 'GK Victor', 'away', false, true, 'gk', 26, 0, '#ef4444', '#0f172a'));
    playersRef.current.push(createActor('a_df', 'Usman (DF)', 'away', false, false, 'df', 16, 6, awayColor, '#ffffff'));
    playersRef.current.push(createActor('a_mf', 'Ahmed (MF)', 'away', false, false, 'mf', 10, -6, awayColor, '#ffffff'));
    playersRef.current.push(createActor('a_fw', 'Capt. Tobe (FW)', 'away', false, false, 'fw', 8, 0, awayColor, '#ffffff'));

    // Give user initial possession
    ballOwner.current = pUser;
    setHasPossession(true);

    // =============================================================
    // 7. KEYBOARD INPUT LISTENERS
    // =============================================================
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;

      // Shoot Charging: Space, Enter, or C
      if (k === ' ' || k === 'c' || k === 'enter') {
        if (!chargingRef.current && ballOwner.current && ballOwner.current.isUser) {
          chargingRef.current = true;
          chargeAmountRef.current = 0;
          setIsChargingShot(true);
        }
      }

      // Pass Action: X or P
      if (k === 'x' || k === 'p') {
        handlePass();
      }

      // Tackle Action: V or Shift
      if (k === 'v' || k === 'shift') {
        handleTackle();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = false;

      // Shoot Release
      if (k === ' ' || k === 'c' || k === 'enter') {
        handleReleaseShot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // =============================================================
    // 8. ANIMATION & GAMEPLAY LOOP
    // =============================================================
    let animId: number;
    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Animate Spectator crowd cheering
      spectatorCrowdRef.current.forEach((fan, idx) => {
        fan.position.y = 0.8 + Math.abs(Math.sin(now * 0.005 + idx * 0.5)) * 0.22;
      });

      // Shot meter charging
      if (chargingRef.current) {
        chargeAmountRef.current = Math.min(1.0, chargeAmountRef.current + dt * 2.2);
        setShotCharge(chargeAmountRef.current);
      }

      // 1. User Movement Controller
      if (userActorRef.current) {
        const u = userActorRef.current;
        let mx = 0;
        let mz = 0;
        const k = keysPressed.current;
        if (k['w'] || k['arrowup']) mz -= 1;
        if (k['s'] || k['arrowdown']) mz += 1;
        if (k['a'] || k['arrowleft']) mx -= 1;
        if (k['d'] || k['arrowright']) mx += 1;

        const isSprinting = k['shift'];
        const currentSpeed = (isSprinting ? u.speed * 1.35 : u.speed) * dt;

        if (mx !== 0 || mz !== 0) {
          const moveDir = new THREE.Vector3(mx, 0, mz).normalize();
          u.group.position.x = Math.max(-FIELD_X + 1, Math.min(FIELD_X - 1, u.group.position.x + moveDir.x * currentSpeed));
          u.group.position.z = Math.max(-FIELD_Z + 1, Math.min(FIELD_Z - 1, u.group.position.z + moveDir.z * currentSpeed));
          u.group.rotation.y = Math.atan2(moveDir.x, moveDir.z);

          // Animate user legs & arms
          const cycle = now * 0.014;
          u.legL.rotation.x = Math.sin(cycle) * 0.85;
          u.legR.rotation.x = -Math.sin(cycle) * 0.85;
          u.armL.rotation.x = -Math.sin(cycle) * 0.65;
          u.armR.rotation.x = Math.sin(cycle) * 0.65;
        } else {
          u.legL.rotation.x = THREE.MathUtils.lerp(u.legL.rotation.x, 0, 0.2);
          u.legR.rotation.x = THREE.MathUtils.lerp(u.legR.rotation.x, 0, 0.2);
        }
      }

      // 2. Individual AI Players Logic (Teammates & Opponents)
      playersRef.current.forEach((p) => {
        if (p.isUser) return;

        // Recovery from tackle stumble
        if (p.stumbleTimer > 0) {
          p.stumbleTimer -= dt;
          return;
        }

        // GOALKEEPERS: Stay in goal mouth and track ball with lateral diving
        if (p.isKeeper) {
          const targetZ = Math.max(-GOAL_WIDTH / 2 + 0.6, Math.min(GOAL_WIDTH / 2 - 0.6, ballPos.current.z));
          p.group.position.z = THREE.MathUtils.lerp(p.group.position.z, targetZ, dt * 5.0);
          p.group.rotation.y = p.team === 'home' ? Math.PI / 2 : -Math.PI / 2;

          // Keeper diving save if incoming shot is fast
          const distToBall = p.group.position.distanceTo(ballPos.current);
          if (distToBall < 2.2 && Math.abs(ballVel.current.x) > 4) {
            sounds.playTackle();
            ballVel.current.x *= -0.45;
            ballVel.current.z += (Math.random() - 0.5) * 8;
            ballVel.current.y = 1.4;
            ballOwner.current = null;
            setCommentary(`BRILLIANT SAVE by ${p.name}! Keeper tips it wide!`);
          }
          return;
        }

        // OUTFIELD PLAYERS:
        if (ballOwner.current === p) {
          // Player possesses ball: advance towards target goal
          const attackDirX = p.team === 'home' ? 1 : -1;
          p.group.position.x += attackDirX * p.speed * 0.8 * dt;
          p.group.rotation.y = attackDirX > 0 ? Math.PI / 2 : -Math.PI / 2;

          // Animate running
          const cycle = now * 0.012;
          p.legL.rotation.x = Math.sin(cycle) * 0.8;
          p.legR.rotation.x = -Math.sin(cycle) * 0.8;

          // Shoot when close to goal
          if ((p.team === 'home' && p.group.position.x > 18) || (p.team === 'away' && p.group.position.x < -18)) {
            const targetX = p.team === 'home' ? 28 : -28;
            const aimCorner = (Math.random() - 0.5) * 4.6;
            const dir = new THREE.Vector3(targetX - ballPos.current.x, 1.0, aimCorner - ballPos.current.z).normalize();
            ballVel.current.copy(dir.multiplyScalar(20));
            ballVel.current.y = 1.2;
            ballOwner.current = null;
            sounds.playKick();
            setCommentary(`${p.name} fires a shot at goal!`);
          }
        } else if (passTarget.current === p) {
          // Teammate receiving pass: sprint directly to meet incoming ball!
          const dir = new THREE.Vector3().subVectors(ballPos.current, p.group.position);
          dir.y = 0;
          if (dir.length() > 0.5) {
            dir.normalize();
            p.group.position.addScaledVector(dir, p.speed * 1.15 * dt);
            p.group.rotation.y = Math.atan2(dir.x, dir.z);
          }
          // Control reception
          if (p.group.position.distanceTo(ballPos.current) < 1.2) {
            ballOwner.current = p;
            passTarget.current = null;
            ballVel.current.set(0, 0, 0);
            setCommentary(`${p.name} cushions the ball smoothly!`);
          }
        } else if (!ballOwner.current) {
          // LOOSE BALL: All nearby outfield players actively chase and contest it!
          const distToBall = p.group.position.distanceTo(ballPos.current);
          if (distToBall < 18) {
            const dir = new THREE.Vector3().subVectors(ballPos.current, p.group.position);
            dir.y = 0;
            dir.normalize();
            p.group.position.addScaledVector(dir, p.speed * 1.05 * dt);
            p.group.rotation.y = Math.atan2(dir.x, dir.z);
          }
        } else {
          // Positional support
          const supportX = p.baseX + (ballPos.current.x - p.baseX) * 0.5;
          const supportZ = p.baseZ + (ballPos.current.z - p.baseZ) * 0.5;
          const targetPos = new THREE.Vector3(supportX, 0, supportZ);
          const dir = new THREE.Vector3().subVectors(targetPos, p.group.position);
          if (dir.length() > 0.6) {
            dir.normalize();
            p.group.position.addScaledVector(dir, p.speed * 0.7 * dt);
            p.group.rotation.y = Math.atan2(dir.x, dir.z);
          }
        }
      });

      // 3. Ball Physics Engine
      if (ballOwner.current) {
        // Dribble smoothly in front of ball-carrier
        const o = ballOwner.current;
        const forward = new THREE.Vector3(Math.sin(o.group.rotation.y), 0, Math.cos(o.group.rotation.y));
        ballPos.current.copy(o.group.position).addScaledVector(forward, 0.75);
        ballPos.current.y = 0.24;
        ballVel.current.set(0, 0, 0);

        setHasPossession(o.isUser);
      } else {
        // Ball in flight / rolling physics
        ballVel.current.y -= 18.0 * dt; // Gravity
        ballPos.current.addScaledVector(ballVel.current, dt);

        // Ground Bounce & Rolling Friction
        if (ballPos.current.y <= 0.24) {
          ballPos.current.y = 0.24;
          ballVel.current.y = -ballVel.current.y * 0.6;
          if (Math.abs(ballVel.current.y) < 0.4) ballVel.current.y = 0;
          ballVel.current.x *= 0.982;
          ballVel.current.z *= 0.982;
        }

        // Contested Pickup by Nearest Player
        for (const p of playersRef.current) {
          if (p.stumbleTimer > 0) continue;
          const dist = p.group.position.distanceTo(ballPos.current);
          if (dist < 1.15 && ballPos.current.y < 1.1) {
            ballOwner.current = p;
            setHasPossession(p.isUser);
            break;
          }
        }
      }

      // Check Goal Detection
      // West Goal (-X = -28, |Z| <= 3.66, Y <= 2.44)
      if (ballPos.current.x <= -28.2 && Math.abs(ballPos.current.z) <= GOAL_WIDTH / 2 && ballPos.current.y <= GOAL_HEIGHT) {
        triggerGoalCelebration('away', 'Opponent Striker');
      }
      // East Goal (+X = 28, |Z| <= 3.66, Y <= 2.44)
      else if (ballPos.current.x >= 28.2 && Math.abs(ballPos.current.z) <= GOAL_WIDTH / 2 && ballPos.current.y <= GOAL_HEIGHT) {
        const scorer = (ballOwner.current && ballOwner.current.name) || (userActorRef.current && userActorRef.current.name) || 'You';
        triggerGoalCelebration('home', scorer);
      }

      // Touchline bounds collision / bounce-back
      if (Math.abs(ballPos.current.z) > FIELD_Z) {
        ballVel.current.z *= -0.7;
        ballPos.current.z = Math.sign(ballPos.current.z) * (FIELD_Z - 0.2);
      }
      if (Math.abs(ballPos.current.x) > FIELD_X + 2) {
        ballVel.current.x *= -0.7;
        ballPos.current.x = Math.sign(ballPos.current.x) * (FIELD_X + 1.8);
      }

      // Update 3D Ball Mesh
      if (ballMeshRef.current) {
        ballMeshRef.current.position.copy(ballPos.current);
        ballMeshRef.current.rotation.x += ballVel.current.z * dt * 2.5;
        ballMeshRef.current.rotation.z -= ballVel.current.x * dt * 2.5;
      }

      // Dynamic Broadcast Camera Tracking
      if (cameraRef.current) {
        const targetCamX = ballPos.current.x * 0.45;
        const targetCamZ = 24 + Math.abs(ballPos.current.z) * 0.35;
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetCamX, 0.08);
        cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, targetCamZ, 0.08);
        cameraRef.current.lookAt(ballPos.current.x * 0.55, 0.5, ballPos.current.z * 0.3);
      }

      renderer.render(scene, cameraRef.current!);
    };

    animate();

    // Match Countdown Timer
    const matchTimer = setInterval(() => {
      setMatchTime((prev) => {
        if (prev <= 1) {
          clearInterval(matchTimer);
          setIsGameOver(true);
          sounds.playWhistle();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(matchTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [homeColor, awayColor, triggerGoalCelebration, handlePass, handleTackle, handleReleaseShot]);

  const handleFinishAndCollect = () => {
    const isWin = homeScore > awayScore;
    const xp = (homeScore * 80) + (playerGoals * 120) + (tacklesCount * 15) + (isWin ? 200 : 80);
    const cash = isWin ? 10000 : 3000;

    onFinishMatch({
      homeGoals: homeScore,
      awayGoals: awayScore,
      playerGoals,
      shots: shotsCount,
      shotsOnTarget,
      tackles: tacklesCount,
      xpGained: xp,
      cashGained: cash
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-black font-sans text-stone-100">
      {/* 3D WebGL Viewport */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Matchday Broadcast Scoreboard */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-slate-950/90 border-2 border-emerald-500/50 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: homeColor }} />
          <div className="text-right">
            <p className="text-xs text-stone-400 font-semibold uppercase">{homeTeamName}</p>
            <p className="text-2xl font-black text-amber-400">{homeScore}</p>
          </div>
        </div>

        <div className="flex flex-col items-center px-4 border-x border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{formatTime(matchTime)}</span>
          </div>
          <span className="text-[10px] text-amber-200 uppercase font-black tracking-wider mt-0.5">{tournamentRound}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-xs text-stone-400 font-semibold uppercase">{awayTeamName}</p>
            <p className="text-2xl font-black text-stone-200">{awayScore}</p>
          </div>
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: awayColor }} />
        </div>
      </div>

      {/* Live Stadium Commentary Ticker */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-black/80 border border-emerald-500/30 text-emerald-300 text-xs font-medium px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
        <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        <span>{commentary}</span>
      </div>

      {/* Shot Power Gauge (Shows when charging) */}
      {isChargingShot && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1">
          <div className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500 animate-bounce" />
            SHOT POWER
          </div>
          <div className="w-48 h-4 bg-slate-900 border-2 border-amber-400 rounded-full overflow-hidden p-0.5 shadow-xl">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                shotCharge > 0.85 ? 'bg-red-500' : shotCharge > 0.6 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${shotCharge * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls Overlay & Onscreen Buttons */}
      <div className="absolute bottom-6 left-6 z-20 bg-slate-950/80 border border-stone-700/60 p-3 rounded-2xl backdrop-blur-md hidden sm:block">
        <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Match Controls</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-300">
          <span><strong className="text-emerald-400">WASD / Arrows</strong> : Move</span>
          <span><strong className="text-emerald-400">Shift</strong> : Sprint</span>
          <span><strong className="text-emerald-400">X / P</strong> : Pass to Teammate</span>
          <span><strong className="text-emerald-400">C / Space</strong> : Hold to Shoot</span>
          <span><strong className="text-emerald-400">V</strong> : Sliding Tackle</span>
          <span><strong className="text-emerald-400">Auto</strong> : Chase Loose Ball</span>
        </div>
      </div>

      {/* Action Buttons for Click / Mobile */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={handlePass}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4" />
          PASS (X)
        </button>

        <button
          onMouseDown={() => {
            if (ballOwner.current && ballOwner.current.isUser) {
              chargingRef.current = true;
              chargeAmountRef.current = 0;
              setIsChargingShot(true);
            }
          }}
          onMouseUp={handleReleaseShot}
          onTouchStart={() => {
            if (ballOwner.current && ballOwner.current.isUser) {
              chargingRef.current = true;
              chargeAmountRef.current = 0;
              setIsChargingShot(true);
            }
          }}
          onTouchEnd={handleReleaseShot}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-xl active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Flame className="w-4 h-4 text-red-700" />
          SHOOT (C)
        </button>

        <button
          onClick={handleTackle}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
        >
          <ShieldAlert className="w-4 h-4" />
          TACKLE (V)
        </button>

        <button
          onClick={onExit}
          className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-stone-300 rounded-xl"
          title="Exit Match"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Full-Time Whistle Results Modal */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="max-w-md w-full bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 text-center shadow-2xl">
            <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-3 animate-bounce" />
            <h2 className="text-2xl font-black text-amber-400 tracking-wide uppercase">
              {homeScore > awayScore ? 'VICTORY FOR FUO!' : homeScore === awayScore ? 'HONOURABLE DRAW' : 'DEFEATED'}
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Full-time whistle blown at Vice-Chancellor's Stadium!
            </p>

            <div className="flex items-center justify-center gap-6 my-5 bg-slate-950 py-3 rounded-2xl border border-slate-800">
              <div className="text-center">
                <p className="text-[10px] text-stone-400 font-bold uppercase">{homeTeamName}</p>
                <p className="text-3xl font-black text-amber-400">{homeScore}</p>
              </div>
              <span className="text-xl font-black text-stone-600">-</span>
              <div className="text-center">
                <p className="text-[10px] text-stone-400 font-bold uppercase">{awayTeamName}</p>
                <p className="text-3xl font-black text-stone-300">{awayScore}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5 text-left">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <p className="text-[10px] text-stone-400 uppercase font-semibold">Your Goals</p>
                <p className="text-lg font-black text-emerald-400">{playerGoals}</p>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <p className="text-[10px] text-stone-400 uppercase font-semibold">Tackles Won</p>
                <p className="text-lg font-black text-sky-400">{tacklesCount}</p>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <p className="text-[10px] text-stone-400 uppercase font-semibold">Shots (Target)</p>
                <p className="text-lg font-black text-amber-400">{shotsOnTarget}/{shotsCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-2xl mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-emerald-200">Match Prize Earnings:</span>
              </div>
              <span className="text-sm font-black text-amber-300">
                ₦{homeScore > awayScore ? '10,000' : '3,000'}
              </span>
            </div>

            <button
              onClick={handleFinishAndCollect}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Collect Prize & Return to Stadium
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
