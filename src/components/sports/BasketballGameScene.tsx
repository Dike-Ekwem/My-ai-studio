import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import { createMonopolyHead } from '../game3d/monopolyFace';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Award,
  ArrowRight,
  RotateCcw,
  Clock,
  Shield,
  Zap,
  X,
  Target
} from 'lucide-react';

export interface BasketballGameResult {
  playerScore: number;
  opponentScore: number;
  userPoints: number;
  rebounds: number;
  steals: number;
  xpGained: number;
  cashGained: number;
}

interface BasketballGameSceneProps {
  player?: PlayerState;
  mode: 'quick_game' | 'streetball_1v1';
  homeTeamName?: string;
  awayTeamName?: string;
  onFinishGame: (result: BasketballGameResult) => void;
  onExit: () => void;
}

interface HoopsPlayer {
  id: string;
  name: string;
  team: 'home' | 'away';
  isUser: boolean;
  group: THREE.Group;
  legL: THREE.Mesh;
  legR: THREE.Mesh;
  armL: THREE.Mesh;
  armR: THREE.Mesh;
  torso: THREE.Mesh;
  baseX: number;
  baseZ: number;
  speed: number;
  shootTimer: number;
}

export const BasketballGameScene: React.FC<BasketballGameSceneProps> = ({
  player,
  mode = 'quick_game',
  homeTeamName = 'FUO Warriors',
  awayTeamName = mode === 'streetball_1v1' ? 'Captain Tobe (Street King)' : 'Lex Titans',
  onFinishGame,
  onExit
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Match State
  const is1v1 = mode === 'streetball_1v1';
  const targetScore = is1v1 ? 11 : 24;
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [reboundsCount, setReboundsCount] = useState<number>(0);
  const [stealsCount, setStealsCount] = useState<number>(0);
  const [gameClock, setGameClock] = useState<number>(120); // 2 minutes
  const [shotClock, setShotClock] = useState<number>(24);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [commentary, setCommentary] = useState<string>(
    is1v1 ? '1-on-1 Streetball Duel! First to 11 points wins by 2!' : 'Tip-off! All-Stars Campus Basketball Match!'
  );

  // Shot Meter
  const [shotCharge, setShotCharge] = useState<number>(0);
  const [isChargingShot, setIsChargingShot] = useState<boolean>(false);
  const [shotFeedback, setShotFeedback] = useState<string | null>(null);

  // Three.js Core Handles
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const playersRef = useRef<HoopsPlayer[]>([]);
  const userActorRef = useRef<HoopsPlayer | null>(null);

  // Ball Physical State
  const ballPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.3, 0));
  const ballVel = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const ballPossessor = useRef<HoopsPlayer | null>(null);
  const isShotInFlight = useRef<boolean>(false);

  // Input State
  const keysPressed = useRef<{ [k: string]: boolean }>({});
  const chargingRef = useRef<boolean>(false);
  const chargeAmountRef = useRef<number>(0);

  // Court geometry: 28m x 15m. Baskets at x = +/- 12.4m, y = 3.05m, z = 0
  const RIM_X_EAST = 12.4;
  const RIM_X_WEST = -12.4;
  const RIM_Y = 3.05;
  const RIM_RADIUS = 0.45;

  const triggerBasket = useCallback((scoringTeam: 'home' | 'away', points: number, scorerName: string) => {
    sounds.playNetSwish();
    sounds.playCheer();
    confetti({ particleCount: 60, spread: 70 });

    if (scoringTeam === 'home') {
      setHomeScore((s) => {
        const next = s + points;
        if (next >= targetScore) setIsGameOver(true);
        return next;
      });
      if (scorerName === 'You') {
        setUserPoints((p) => p + points);
      }
      setCommentary(`SWISH! ${scorerName} scores ${points} points! Buckets!`);
    } else {
      setAwayScore((s) => {
        const next = s + points;
        if (next >= targetScore) setIsGameOver(true);
        return next;
      });
      setCommentary(`BASKET! ${scorerName} knocks down a ${points}-pointer!`);
    }

    // Reset ball to inbound / top of key
    setShotClock(24);
    isShotInFlight.current = false;
    ballPos.current.set(0, 0.3, 0);
    ballVel.current.set(0, 0, 0);
    ballPossessor.current = null;
  }, [targetScore]);

  // Setup 3D Basketball Scene & Game Loop
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#030712');
    scene.fog = new THREE.FogExp2('#030712', 0.012);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 120);
    camera.position.set(0, 16, 22);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Arena Lighting
    const ambient = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambient);
    const lightL = new THREE.DirectionalLight('#38bdf8', 1.3);
    lightL.position.set(-15, 25, 15);
    scene.add(lightL);
    const lightR = new THREE.DirectionalLight('#fef08a', 1.3);
    lightR.position.set(15, 25, -15);
    scene.add(lightR);

    // Court Surface: 28m x 15m
    const courtMat = new THREE.MeshLambertMaterial({ color: '#0284c7' });
    const apronMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });
    const keyMat = new THREE.MeshLambertMaterial({ color: '#c2410c' });
    const lineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

    const apron = new THREE.Mesh(new THREE.PlaneGeometry(32, 19), apronMat);
    apron.rotation.x = -Math.PI / 2;
    apron.receiveShadow = true;
    scene.add(apron);

    const court = new THREE.Mesh(new THREE.PlaneGeometry(28, 15), courtMat);
    court.rotation.x = -Math.PI / 2;
    court.position.y = 0.01;
    court.receiveShadow = true;
    scene.add(court);

    // Key Lanes
    [-1, 1].forEach((dir) => {
      const key = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.9), keyMat);
      key.rotation.x = -Math.PI / 2;
      key.position.set(dir * (14 - 2.9), 0.015, 0);
      scene.add(key);
    });

    // Court White Markings
    [-7.5, 7.5].forEach((z) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(28, 0.15), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, z);
      scene.add(line);
    });
    [-14, 14].forEach((x) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 15), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.02, 0);
      scene.add(line);
    });

    const halfLine = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 15), lineMat);
    halfLine.rotation.x = -Math.PI / 2;
    halfLine.position.set(0, 0.02, 0);
    scene.add(halfLine);

    const centerCircle = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.88, 32), lineMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.021, 0);
    scene.add(centerCircle);

    // Regulation Hoops at West and East
    const postMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });
    const boardMat = new THREE.MeshLambertMaterial({ color: '#e0f2fe', transparent: true, opacity: 0.85 });
    const rimMat = new THREE.MeshLambertMaterial({ color: '#ea580c' });
    const netMat = new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true });

    const createHoop = (hx: number, facingDir: number) => {
      const hoop = new THREE.Group();
      hoop.position.set(hx, 0, 0);

      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 3.8, 12), postMat);
      mast.position.set(facingDir * 1.4, 1.9, 0);
      hoop.add(mast);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 0.2), postMat);
      arm.position.set(facingDir * 0.5, 3.2, 0);
      arm.rotation.z = facingDir * 0.25;
      hoop.add(arm);

      const board = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 1.8), boardMat);
      board.position.set(0, 3.25, 0);
      hoop.add(board);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.035, 12, 24), rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(-facingDir * 0.48, RIM_Y, 0);
      hoop.add(rim);

      const net = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.18, 0.45, 12, 1, true), netMat);
      net.position.set(-facingDir * 0.48, RIM_Y - 0.25, 0);
      hoop.add(net);

      scene.add(hoop);
    };

    createHoop(-14, -1);
    createHoop(14, 1);

    // 3D Basketball Mesh (Orange leather texture with black channels)
    const ballCanvas = document.createElement('canvas');
    ballCanvas.width = 128;
    ballCanvas.height = 128;
    const bctx = ballCanvas.getContext('2d')!;
    bctx.fillStyle = '#ea580c';
    bctx.fillRect(0, 0, 128, 128);
    bctx.strokeStyle = '#1e1b4b';
    bctx.lineWidth = 6;
    bctx.strokeRect(4, 4, 120, 120);
    bctx.beginPath();
    bctx.arc(64, 64, 50, 0, Math.PI * 2);
    bctx.stroke();
    const ballTex = new THREE.CanvasTexture(ballCanvas);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshLambertMaterial({ map: ballTex })
    );
    ball.position.set(0, 0.28, 0);
    ball.castShadow = true;
    scene.add(ball);
    ballMeshRef.current = ball;

    // Build Players (Mode dependent: 1v1 vs 3v3)
    playersRef.current = [];

    const createPlayer = (
      id: string,
      name: string,
      team: 'home' | 'away',
      isUser: boolean,
      baseX: number,
      baseZ: number,
      jerseyColor: string
    ): HoopsPlayer => {
      const g = new THREE.Group();
      g.position.set(baseX, 0, baseZ);

      const legMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.95, 0.26), legMat);
      legL.position.set(-0.22, 0.48, 0);
      g.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.95, 0.26), legMat);
      legR.position.set(0.22, 0.48, 0);
      g.add(legR);

      const jerseyMat = new THREE.MeshLambertMaterial({ color: jerseyColor });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.1, 0.4), jerseyMat);
      torso.position.y = 1.45;
      g.add(torso);

      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.22), jerseyMat);
      armL.position.set(-0.48, 1.45, 0);
      g.add(armL);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.22), jerseyMat);
      armR.position.set(0.48, 1.45, 0);
      g.add(armR);

      const head = createMonopolyHead(isUser ? 'student' : 'npc_sunglasses');
      head.position.y = 2.28;
      g.add(head);

      if (isUser) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.65, 0.82, 24),
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
        group: g,
        legL,
        legR,
        armL,
        armR,
        torso,
        baseX,
        baseZ,
        speed: isUser ? 9.5 : 8.2,
        shootTimer: 0
      };
    };

    // User Player (Home)
    const pUser = createPlayer('user', 'You', 'home', true, -4, 0, '#047857');
    userActorRef.current = pUser;
    playersRef.current.push(pUser);

    if (is1v1) {
      // 1v1 Street Rival: Captain Tobe
      playersRef.current.push(createPlayer('tobe', 'Captain Tobe', 'away', false, 4, 0, '#ea580c'));
    } else {
      // 3v3 All-Stars
      playersRef.current.push(createPlayer('h2', 'Femi (SG)', 'home', false, -7, 4, '#047857'));
      playersRef.current.push(createPlayer('h3', 'Bayo (C)', 'home', false, -8, -4, '#047857'));

      playersRef.current.push(createPlayer('a1', 'Lex Striker', 'away', false, 6, 0, '#7e22ce'));
      playersRef.current.push(createPlayer('a2', 'Kola (PG)', 'away', false, 8, 4, '#7e22ce'));
      playersRef.current.push(createPlayer('a3', 'Emeka (PF)', 'away', false, 8, -4, '#7e22ce'));
    }

    // Input Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      // Jump Shot Charging (Space or K)
      if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        if (!chargingRef.current) {
          chargingRef.current = true;
          chargeAmountRef.current = 0;
          setIsChargingShot(true);
        }
      }

      // Pass Action (J or X)
      if (e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'x') {
        if (ballPossessor.current && ballPossessor.current.isUser && !is1v1) {
          const teammates = playersRef.current.filter((p) => p.team === 'home' && !p.isUser);
          if (teammates.length > 0) {
            const mate = teammates[0];
            const dir = new THREE.Vector3().subVectors(mate.group.position, ballPossessor.current.group.position).normalize();
            ballVel.current.copy(dir.multiplyScalar(16));
            ballVel.current.y = 1.0;
            ballPossessor.current = null;
            sounds.playDribble();
            setCommentary('Chest pass to open teammate on the wing!');
          }
        }
      }

      // Steal / Contest Action (C or Z)
      if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'z') {
        if (userActorRef.current && (!ballPossessor.current || ballPossessor.current.team !== 'home')) {
          sounds.playDribble();
          const dist = userActorRef.current.group.position.distanceTo(ballPos.current);
          if (dist < 2.2) {
            ballPossessor.current = userActorRef.current;
            ballVel.current.set(0, 0, 0);
            setStealsCount((c) => c + 1);
            setCommentary('POKE STEAL! Fast break opportunity!');
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;

      // Release Jump Shot
      if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        if (chargingRef.current) {
          chargingRef.current = false;
          setIsChargingShot(false);

          if (ballPossessor.current && ballPossessor.current.isUser) {
            const charge = chargeAmountRef.current;
            const isGreen = charge >= 0.45 && charge <= 0.65; // Sweet spot release window

            // Target East basket (+X = 12.4m, y = 3.05m)
            const target = new THREE.Vector3(RIM_X_EAST, RIM_Y + 0.2, 0);
            const dist = ballPos.current.distanceTo(target);
            const isThree = ballPos.current.x < 14 - 6.75;

            // Parabolic Arc Velocity
            const flightTime = 1.0;
            const vx = (target.x - ballPos.current.x) / flightTime;
            const vz = (target.z - ballPos.current.z) / flightTime;
            const vy = (target.y - ballPos.current.y + 0.5 * 18.0 * flightTime * flightTime) / flightTime;

            ballVel.current.set(
              vx * (isGreen ? 1.0 : (Math.random() - 0.5) * 0.15 + 1.0),
              vy * (isGreen ? 1.0 : 0.95),
              vz * (isGreen ? 1.0 : (Math.random() - 0.5) * 0.2 + 1.0)
            );

            isShotInFlight.current = true;
            ballPossessor.current = null;
            sounds.playDribble();

            if (isGreen) {
              setShotFeedback('EXCELLENT RELEASE! 🔥 GREEN LIGHT!');
            } else {
              setShotFeedback(charge < 0.45 ? 'SLIGHTLY EARLY' : 'LATE RELEASE');
            }
          }
          chargeAmountRef.current = 0;
          setShotCharge(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // -------------------------------------------------------------
    // ANIMATION & PHYSICS GAMEPLAY LOOP
    // -------------------------------------------------------------
    let animId: number;
    let lastT = performance.now();
    let dribbleBounceTimer = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.1);
      lastT = now;

      // Charge bar increment
      if (chargingRef.current) {
        chargeAmountRef.current = Math.min(1.0, chargeAmountRef.current + dt * 1.8);
        setShotCharge(chargeAmountRef.current);
      }

      // 1. User Movement
      if (userActorRef.current) {
        const u = userActorRef.current;
        let mx = 0;
        let mz = 0;
        const k = keysPressed.current;
        if (k['w'] || k['arrowup']) mz -= 1;
        if (k['s'] || k['arrowdown']) mz += 1;
        if (k['a'] || k['arrowleft']) mx -= 1;
        if (k['d'] || k['arrowright']) mx += 1;

        const isSprint = k['shift'];
        const spd = (isSprint ? u.speed * 1.35 : u.speed) * dt;

        if (mx !== 0 || mz !== 0) {
          const moveDir = new THREE.Vector3(mx, 0, mz).normalize();
          u.group.position.x = Math.max(-13.5, Math.min(13.5, u.group.position.x + moveDir.x * spd));
          u.group.position.z = Math.max(-7.0, Math.min(7.0, u.group.position.z + moveDir.z * spd));
          u.group.rotation.y = Math.atan2(moveDir.x, moveDir.z);

          // Animate Legs
          const cyc = now * 0.012;
          u.legL.rotation.x = Math.sin(cyc) * 0.8;
          u.legR.rotation.x = -Math.sin(cyc) * 0.8;
        } else {
          u.legL.rotation.x = 0;
          u.legR.rotation.x = 0;
        }
      }

      // 2. AI Opponents & Teammates Logic
      playersRef.current.forEach((p) => {
        if (p.isUser) return;

        if (ballPossessor.current === p) {
          // Attack Opponent Basket
          const targetBasketX = p.team === 'home' ? RIM_X_EAST : RIM_X_WEST;
          const attackDir = new THREE.Vector3(targetBasketX - p.group.position.x, 0, -p.group.position.z).normalize();
          p.group.position.addScaledVector(attackDir, p.speed * 0.75 * dt);
          p.group.rotation.y = Math.atan2(attackDir.x, attackDir.z);

          // In range to shoot
          p.shootTimer += dt;
          if (p.shootTimer > 2.8 && Math.abs(p.group.position.x - targetBasketX) < 8.5) {
            p.shootTimer = 0;
            // Launch jump shot
            const target = new THREE.Vector3(targetBasketX, RIM_Y + 0.15, 0);
            const flightTime = 1.0;
            const vx = (target.x - ballPos.current.x) / flightTime;
            const vz = (target.z - ballPos.current.z) / flightTime;
            const vy = (target.y - ballPos.current.y + 0.5 * 18.0 * flightTime * flightTime) / flightTime;

            ballVel.current.set(vx * 0.98, vy * 0.98, vz);
            isShotInFlight.current = true;
            ballPossessor.current = null;
            sounds.playDribble();
            setCommentary(`${p.name} pulls up for a mid-range jumper!`);
          }
        } else {
          // Play defense or get open
          const targetX = p.team === 'home' ? ballPos.current.x - 2 : ballPos.current.x + 2;
          const dir = new THREE.Vector3(targetX - p.group.position.x, 0, ballPos.current.z - p.group.position.z);
          if (dir.length() > 0.6) {
            dir.normalize();
            p.group.position.addScaledVector(dir, p.speed * 0.6 * dt);
            p.group.rotation.y = Math.atan2(dir.x, dir.z);
          }
        }
      });

      // 3. Realistic Ball Physics & Dribbling
      if (ballPossessor.current) {
        // Active dribble linked to player motion
        const o = ballPossessor.current;
        dribbleBounceTimer += dt * 8;
        const bounceY = Math.abs(Math.sin(dribbleBounceTimer)) * 0.85 + 0.28;

        const forward = new THREE.Vector3(Math.sin(o.group.rotation.y), 0, Math.cos(o.group.rotation.y));
        const handSide = new THREE.Vector3(Math.cos(o.group.rotation.y), 0, -Math.sin(o.group.rotation.y)).multiplyScalar(0.4);

        ballPos.current.copy(o.group.position).add(forward.multiplyScalar(0.5)).add(handSide);
        ballPos.current.y = bounceY;
        ballVel.current.set(0, 0, 0);

        if (bounceY < 0.32) {
          sounds.playDribble();
        }
      } else {
        // Ball in Flight / Loose Ball
        ballVel.current.y -= 18.0 * dt; // Gravity
        ballPos.current.addScaledVector(ballVel.current, dt);

        // Floor Bounce
        if (ballPos.current.y <= 0.28) {
          ballPos.current.y = 0.28;
          ballVel.current.y = -ballVel.current.y * 0.72;
          if (Math.abs(ballVel.current.y) < 0.4) ballVel.current.y = 0;
          ballVel.current.x *= 0.98;
          ballVel.current.z *= 0.98;
        }

        // Check Hoop Basket Detection (West Basket & East Basket)
        [RIM_X_EAST, RIM_X_WEST].forEach((hx) => {
          const distToRim = Math.hypot(ballPos.current.x - hx, ballPos.current.z);
          // Passing downwards through rim
          if (distToRim < RIM_RADIUS && ballPos.current.y <= RIM_Y + 0.1 && ballPos.current.y >= RIM_Y - 0.4 && ballVel.current.y < 0) {
            const scoringTeam = hx === RIM_X_EAST ? 'home' : 'away';
            const scorer = userActorRef.current && scoringTeam === 'home' ? 'You' : 'Away Team';
            const pts = Math.abs(ballPos.current.x) > 6.75 ? 3 : 2;
            triggerBasket(scoringTeam, pts, scorer);
          }
        });

        // Loose Ball Proximity Grab
        for (const p of playersRef.current) {
          if (p.group.position.distanceTo(ballPos.current) < 1.3 && ballPos.current.y < 1.5) {
            ballPossessor.current = p;
            isShotInFlight.current = false;
            if (p.isUser) setReboundsCount((r) => r + 1);
            break;
          }
        }
      }

      // Update 3D Ball
      if (ballMeshRef.current) {
        ballMeshRef.current.position.copy(ballPos.current);
        ballMeshRef.current.rotation.x += ballVel.current.z * dt * 2.5;
        ballMeshRef.current.rotation.z -= ballVel.current.x * dt * 2.5;
      }

      // Smooth Camera Follow
      if (cameraRef.current) {
        const targetX = ballPos.current.x * 0.35;
        cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, targetX, 0.08);
        cameraRef.current.lookAt(ballPos.current.x * 0.4, 1.5, 0);
      }

      renderer.render(scene, cameraRef.current!);
    };

    animate();

    // Game Countdown
    const timer = setInterval(() => {
      setGameClock((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          sounds.playBuzzer();
          return 0;
        }
        return prev - 1;
      });

      setShotClock((s) => {
        if (s <= 1) {
          sounds.playBuzzer();
          return 24;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [is1v1, triggerBasket]);

  const handleClaimResults = () => {
    const isWin = homeScore > awayScore;
    onFinishGame({
      playerScore: homeScore,
      opponentScore: awayScore,
      userPoints,
      rebounds: reboundsCount,
      steals: stealsCount,
      xpGained: isWin ? 190 : 75,
      cashGained: isWin ? 15000 : 5000
    });
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950 font-sans">
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Top Arena Electronic Scoreboard & Shot Clock HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-5 bg-slate-900/90 border-2 border-sky-500/70 text-white px-7 py-3 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-sky-400">HOME</div>
            <div className="text-sm font-black truncate max-w-[120px]">{homeTeamName.split(' ')[0]}</div>
          </div>
          <span className="text-3xl font-black text-amber-400 bg-slate-800 px-3.5 py-1 rounded-xl">
            {homeScore}
          </span>
        </div>

        {/* Center Clock & Shot Clock */}
        <div className="flex flex-col items-center px-4 border-x border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.floor(gameClock / 60)}:{(gameClock % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400">SHOT:</span>
            <span className={`text-xs font-black ${shotClock <= 5 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
              {shotClock}s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-amber-400 bg-slate-800 px-3.5 py-1 rounded-xl">
            {awayScore}
          </span>
          <div>
            <div className="text-[10px] uppercase font-bold text-purple-400">AWAY</div>
            <div className="text-sm font-black truncate max-w-[120px]">{awayTeamName.split(' ')[0]}</div>
          </div>
        </div>
      </div>

      {/* Live Commentary & Shot Feedback */}
      <div className="absolute top-22 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
        <div className="bg-slate-900/85 border border-slate-700 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm max-w-lg truncate">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{commentary}</span>
        </div>
        {shotFeedback && (
          <div className="bg-emerald-500/90 text-white font-black text-[11px] px-3 py-0.5 rounded-full shadow animate-bounce">
            {shotFeedback}
          </div>
        )}
      </div>

      {/* Shot Meter Gauge */}
      {isChargingShot && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 bg-slate-900/90 border border-sky-400 px-4 py-2 rounded-xl backdrop-blur-md">
          <div className="text-[10px] font-bold uppercase text-sky-300">Jump Shot Meter (Release at Green)</div>
          <div className="w-48 h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700 relative">
            {/* Green Sweet Spot Zone (45% to 65%) */}
            <div className="absolute left-[45%] w-[20%] h-full bg-emerald-500/50 z-10" />
            <div
              className={`h-full rounded-full transition-all duration-75 relative z-20 ${
                shotCharge >= 0.45 && shotCharge <= 0.65 ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${shotCharge * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Responsive Gameplay Controls */}
      <div className="absolute bottom-4 left-6 z-20 bg-slate-900/85 border border-slate-700 p-3 rounded-2xl shadow-xl backdrop-blur-md text-xs text-slate-300 flex items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Move</span>
          <span className="font-bold text-white">WASD / Arrows</span>
        </div>
        <div className="h-6 w-px bg-slate-700" />
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Sprint</span>
          <span className="font-bold text-white">Shift</span>
        </div>
        <div className="h-6 w-px bg-slate-700" />
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Jump Shot</span>
          <span className="font-bold text-amber-400">Hold Space / K</span>
        </div>
        {!is1v1 && (
          <>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Pass</span>
              <span className="font-bold text-emerald-400">J / X</span>
            </div>
          </>
        )}
        <div className="h-6 w-px bg-slate-700" />
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Steal / Contest</span>
          <span className="font-bold text-sky-400">C / Z</span>
        </div>
      </div>

      {/* Exit Button */}
      <button
        onClick={onExit}
        className="absolute top-4 right-6 z-20 p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:text-white shadow-xl transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Game Over Summary Modal */}
      {isGameOver && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-7 max-w-md w-full shadow-2xl text-center">
            <div className="text-3xl mb-2">{homeScore > awayScore ? '🏆' : '💔'}</div>
            <h2 className="text-2xl font-black text-white">
              {homeScore > awayScore ? 'BASKETBALL VICTORY!' : 'FINAL WHISTLE DEFEAT'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {is1v1 ? '1v1 Streetball Duel Result' : 'Campus All-Stars Match Result'}
            </p>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-5 flex justify-around items-center">
              <div>
                <div className="text-xs font-bold text-sky-400 truncate max-w-[100px]">{homeTeamName.split(' ')[0]}</div>
                <div className="text-3xl font-black text-white">{homeScore}</div>
              </div>
              <div className="text-xs font-black text-slate-500 uppercase">FINAL</div>
              <div>
                <div className="text-xs font-bold text-purple-400 truncate max-w-[100px]">{awayTeamName.split(' ')[0]}</div>
                <div className="text-3xl font-black text-white">{awayScore}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Your Points</span>
                <span className="text-lg font-black text-amber-400">{userPoints}</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Rebounds</span>
                <span className="text-lg font-black text-sky-400">{reboundsCount}</span>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Steals</span>
                <span className="text-lg font-black text-emerald-400">{stealsCount}</span>
              </div>
            </div>

            <button
              onClick={handleClaimResults}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black rounded-2xl shadow-xl transition transform active:scale-95 cursor-pointer"
            >
              Confirm Match Stats & Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
