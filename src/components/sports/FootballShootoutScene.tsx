import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  X,
  Target,
  Flame,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';

interface FootballShootoutSceneProps {
  onClose: () => void;
  onFinishShootout: (playerGoals: number, keeperSaves: number, isWinner: boolean) => void;
}

type KickTurn = 'user_kicking' | 'user_keeping';

export const FootballShootoutScene: React.FC<FootballShootoutSceneProps> = ({
  onClose,
  onFinishShootout
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Shootout Rounds State (5 Rounds per team + Sudden Death)
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [turn, setTurn] = useState<KickTurn>('user_kicking');
  const [userScore, setUserScore] = useState<number>(0);
  const [rivalScore, setRivalScore] = useState<number>(0);
  const [userRounds, setUserRounds] = useState<('goal' | 'miss')[]>([]);
  const [rivalRounds, setRivalRounds] = useState<('goal' | 'miss')[]>([]);

  // Interactive controls state
  const [aimOffset, setAimOffset] = useState<{ x: number; y: number }>({ x: 0, y: 1.2 });
  const [chargePower, setChargePower] = useState<number>(0);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isBallMoving, setIsBallMoving] = useState<boolean>(false);
  const [keeperDiveChoice, setKeeperDiveChoice] = useState<'left' | 'center' | 'right' | null>(null);
  const [roundFeedback, setRoundFeedback] = useState<string>('Your Turn to Strike! Aim with mouse or keys, hold shoot to charge!');
  const [isShootoutOver, setIsShootoutOver] = useState<boolean>(false);
  const [playerSavesCount, setPlayerSavesCount] = useState<number>(0);

  // Three.js object references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const goalieGroupRef = useRef<THREE.Group | null>(null);
  const strikerGroupRef = useRef<THREE.Group | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const spectatorCrowdRef = useRef<THREE.Group[]>([]);

  // Ball Physical Trajectory
  const ballPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.24, 3.5));
  const ballVel = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isBallActive = useRef<boolean>(false);

  const GOAL_Z = -7.5;
  const GOAL_WIDTH = 7.32;
  const GOAL_HEIGHT = 2.44;

  // Setup 3D Stadium & Penalty Box
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
    camera.position.set(0, 2.4, 8.2);
    camera.lookAt(0, 1.4, GOAL_Z);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Floodlight & Ambience
    const ambient = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambient);

    const floodlight = new THREE.DirectionalLight('#fef08a', 1.4);
    floodlight.position.set(12, 24, 14);
    floodlight.castShadow = true;
    scene.add(floodlight);

    // 4 Stadium Floodlight Pylons
    const pylonMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const lampMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    [[-16, 2], [16, 2], [-16, -14], [16, -14]].forEach(([px, pz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 16, 8), pylonMat);
      p.position.set(px, 8, pz);
      scene.add(p);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.6), lampMat);
      lamp.position.set(px, 16.2, pz);
      lamp.lookAt(0, 1.5, GOAL_Z);
      scene.add(lamp);
    });

    // Striped Emerald Mow Turf
    const turfMat1 = new THREE.MeshLambertMaterial({ color: '#15803d' });
    const turfMat2 = new THREE.MeshLambertMaterial({ color: '#166534' });
    for (let i = -15; i <= 15; i += 3) {
      const mow = new THREE.Mesh(
        new THREE.PlaneGeometry(36, 3),
        Math.abs(i) % 6 === 0 ? turfMat1 : turfMat2
      );
      mow.rotation.x = -Math.PI / 2;
      mow.position.set(0, 0.01, i);
      mow.receiveShadow = true;
      scene.add(mow);
    }

    // Goal line, Penalty Box & Penalty spot
    const lineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const goalLine = new THREE.Mesh(new THREE.PlaneGeometry(24, 0.22), lineMat);
    goalLine.rotation.x = -Math.PI / 2;
    goalLine.position.set(0, 0.02, GOAL_Z);
    scene.add(goalLine);

    const penSpot = new THREE.Mesh(new THREE.CircleGeometry(0.26, 16), lineMat);
    penSpot.rotation.x = -Math.PI / 2;
    penSpot.position.set(0, 0.03, 3.5);
    scene.add(penSpot);

    // Goalposts & Netting
    const postMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
    const netMat = new THREE.MeshBasicMaterial({ color: '#cbd5e1', wireframe: true });

    [-3.66, 3.66].forEach((pz) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, GOAL_HEIGHT, 14), postMat);
      post.position.set(pz, GOAL_HEIGHT / 2, GOAL_Z);
      scene.add(post);
    });

    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, GOAL_WIDTH, 14), postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, GOAL_HEIGHT, GOAL_Z);
    scene.add(crossbar);

    const netBack = new THREE.Mesh(new THREE.BoxGeometry(GOAL_WIDTH, GOAL_HEIGHT, 2.2), netMat);
    netBack.position.set(0, GOAL_HEIGHT / 2, GOAL_Z - 1.1);
    scene.add(netBack);

    // Grandstand Behind the Goal with Fans
    const grandstand = new THREE.Group();
    grandstand.position.set(0, 0, GOAL_Z - 3.5);

    const standMat = new THREE.MeshLambertMaterial({ color: '#334155' });
    const fanMat1 = new THREE.MeshLambertMaterial({ color: '#16a34a' });
    const fanMat2 = new THREE.MeshLambertMaterial({ color: '#f59e0b' });
    const fanMat3 = new THREE.MeshLambertMaterial({ color: '#9333ea' });

    for (let t = 0; t < 5; t++) {
      const tier = new THREE.Mesh(new THREE.BoxGeometry(32, 0.8, 1.4), standMat);
      tier.position.set(0, 0.4 + t * 0.8, -t * 1.3);
      grandstand.add(tier);

      // Fans in the stands
      for (let s = -14; s <= 14; s += 1.6) {
        const fan = new THREE.Group();
        fan.position.set(s + (Math.random() - 0.5) * 0.3, 0.8 + t * 0.8, -t * 1.3);

        const colors = [fanMat1, fanMat2, fanMat3];
        const fanColor = colors[Math.floor(Math.random() * colors.length)];
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.35), fanColor);
        body.position.y = 0.35;
        fan.add(body);

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 8, 8),
          new THREE.MeshLambertMaterial({ color: '#875338' })
        );
        head.position.y = 0.85;
        fan.add(head);

        grandstand.add(fan);
        spectatorCrowdRef.current.push(fan);
      }
    }

    // Cantilever Roof over End Stand
    const roof = new THREE.Mesh(new THREE.BoxGeometry(34, 0.35, 8), new THREE.MeshLambertMaterial({ color: '#0f172a' }));
    roof.position.set(0, 6.2, -3.2);
    roof.rotation.x = -0.06;
    grandstand.add(roof);

    scene.add(grandstand);

    // Perimeter Boards
    const adBoard = new THREE.Mesh(
      new THREE.BoxGeometry(26, 0.9, 0.2),
      new THREE.MeshBasicMaterial({ color: '#0ea5e9' })
    );
    adBoard.position.set(0, 0.45, GOAL_Z - 2.8);
    scene.add(adBoard);

    // Ball Mesh
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshLambertMaterial({ color: '#ffffff' })
    );
    ball.position.set(0, 0.24, 3.5);
    ball.castShadow = true;
    scene.add(ball);
    ballMeshRef.current = ball;

    // Goalkeeper Model
    const goalie = new THREE.Group();
    goalie.position.set(0, 0, GOAL_Z + 0.1);

    const keeperBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.4), new THREE.MeshLambertMaterial({ color: '#eab308' }));
    keeperBody.position.y = 1.35;
    goalie.add(keeperBody);

    const keeperHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), new THREE.MeshLambertMaterial({ color: '#875338' }));
    keeperHead.position.y = 2.15;
    goalie.add(keeperHead);

    const glovesMat = new THREE.MeshLambertMaterial({ color: '#38bdf8' });
    [-0.55, 0.55].forEach((gx) => {
      const glove = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), glovesMat);
      glove.position.set(gx, 1.35, 0.2);
      goalie.add(glove);
    });

    scene.add(goalie);
    goalieGroupRef.current = goalie;

    // Striker Model (Runs up before shot)
    const striker = new THREE.Group();
    striker.position.set(0, 0, 5.2);

    const strikerBody = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.0, 0.38), new THREE.MeshLambertMaterial({ color: '#047857' }));
    strikerBody.position.y = 1.35;
    striker.add(strikerBody);

    const strikerHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshLambertMaterial({ color: '#5c3826' }));
    strikerHead.position.y = 2.1;
    striker.add(strikerHead);

    const strikerLegL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.85, 0.26), new THREE.MeshLambertMaterial({ color: '#ffffff' }));
    strikerLegL.position.set(-0.2, 0.42, 0);
    striker.add(strikerLegL);

    const strikerLegR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.85, 0.26), new THREE.MeshLambertMaterial({ color: '#ffffff' }));
    strikerLegR.position.set(0.2, 0.42, 0);
    striker.add(strikerLegR);

    scene.add(striker);
    strikerGroupRef.current = striker;

    // Aim Reticle
    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.45, 24),
      new THREE.MeshBasicMaterial({ color: '#ef4444', side: THREE.DoubleSide })
    );
    reticle.position.set(0, 1.2, GOAL_Z + 0.05);
    scene.add(reticle);
    reticleRef.current = reticle;

    // -------------------------------------------------------------
    // LOOP
    // -------------------------------------------------------------
    let animId: number;
    let lastT = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.1);
      lastT = now;

      // Animate crowd bobbing
      spectatorCrowdRef.current.forEach((fan, idx) => {
        fan.position.y = 0.8 + Math.abs(Math.sin(now * 0.004 + idx * 0.3)) * 0.15;
      });

      // Ball Trajectory
      if (isBallActive.current) {
        ballVel.current.y -= 14.0 * dt; // Gravity
        ballPos.current.addScaledVector(ballVel.current, dt);

        if (ballPos.current.y <= 0.24) {
          ballPos.current.y = 0.24;
          ballVel.current.y = -ballVel.current.y * 0.45;
        }

        if (ballMeshRef.current) {
          ballMeshRef.current.position.copy(ballPos.current);
          ballMeshRef.current.rotation.x += dt * 18;
        }

        // Check if ball crossed goal line
        if (ballPos.current.z <= GOAL_Z) {
          isBallActive.current = false;
          setIsBallMoving(false);

          // Evaluate Outcome
          const inGoalX = Math.abs(ballPos.current.x) <= GOAL_WIDTH / 2;
          const inGoalY = ballPos.current.y <= GOAL_HEIGHT && ballPos.current.y >= 0.15;

          if (turn === 'user_kicking') {
            // Did AI Goalkeeper save it?
            const keeperDist = goalie.position.distanceTo(ballPos.current);
            if (keeperDist < 1.45) {
              sounds.playCrossbarHit();
              setUserRounds((r) => [...r, 'miss']);
              setRoundFeedback('SAVED! Goalkeeper read your mind and turned it away!');
            } else if (inGoalX && inGoalY) {
              sounds.playWhistle();
              sounds.playGoalCelebration();
              confetti({ particleCount: 70, spread: 65 });
              setUserScore((s) => s + 1);
              setUserRounds((r) => [...r, 'goal']);
              setRoundFeedback('GOAL! Top bins! Clean, unstoppable penalty!');
            } else {
              sounds.playCrossbarHit();
              setUserRounds((r) => [...r, 'miss']);
              setRoundFeedback('MISSED! Off target or slammed against the woodwork!');
            }
          } else {
            // User was Keeping
            const keeperDist = goalie.position.distanceTo(ballPos.current);
            if (keeperDist < 1.6) {
              sounds.playCrossbarHit();
              sounds.playGoalCelebration();
              setPlayerSavesCount((s) => s + 1);
              setRivalRounds((r) => [...r, 'miss']);
              setRoundFeedback('HEROIC SAVE! You palmed away their penalty!');
            } else if (inGoalX && inGoalY) {
              sounds.playWhistle();
              setRivalScore((s) => s + 1);
              setRivalRounds((r) => [...r, 'goal']);
              setRoundFeedback('Goal for Rival! Ball neatly converted.');
            } else {
              setRivalRounds((r) => [...r, 'miss']);
              setRoundFeedback('OFF TARGET! Opponent blasted it into the crowd!');
            }
          }

          // Advance to next turn / round after 1.8 seconds
          setTimeout(() => {
            advanceRound();
          }, 1800);
        }
      }

      // Smooth Aim Reticle Position
      if (reticleRef.current) {
        reticleRef.current.position.x = aimOffset.x;
        reticleRef.current.position.y = aimOffset.y;
        reticleRef.current.visible = turn === 'user_kicking' && !isBallActive.current;
      }

      renderer.render(scene, cameraRef.current!);
    };

    animate();

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
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [turn, aimOffset]);

  const advanceRound = () => {
    // Reset ball position
    ballPos.current.set(0, 0.24, 3.5);
    ballVel.current.set(0, 0, 0);
    if (ballMeshRef.current) ballMeshRef.current.position.set(0, 0.24, 3.5);
    if (goalieGroupRef.current) goalieGroupRef.current.position.set(0, 0, GOAL_Z + 0.1);
    if (strikerGroupRef.current) strikerGroupRef.current.position.set(0, 0, 5.2);

    if (turn === 'user_kicking') {
      // Switch to User Keeping
      setTurn('user_keeping');
      setKeeperDiveChoice(null);
      setRoundFeedback('Your Turn in Goal! Pick your dive: Left, Center, or Right!');
    } else {
      // Completed one full round
      const nextRound = roundNumber + 1;
      if (nextRound > 5 && userScore !== rivalScore) {
        // Match Decided!
        setIsShootoutOver(true);
      } else {
        setRoundNumber(nextRound);
        setTurn('user_kicking');
        setRoundFeedback(`Round ${nextRound}: Your Kick! Pick your spot!`);
      }
    }
  };

  // User kicks penalty
  const handleKickShot = () => {
    if (isBallActive.current || turn !== 'user_kicking') return;

    sounds.playKick();
    isBallActive.current = true;
    setIsBallMoving(true);

    // Striker run-up animation
    if (strikerGroupRef.current) {
      strikerGroupRef.current.position.set(0, 0, 3.8);
    }

    // Calculate ball velocity toward aim reticle
    const powerMultiplier = 20 + chargePower * 10;
    const target = new THREE.Vector3(aimOffset.x, aimOffset.y, GOAL_Z);
    const dir = new THREE.Vector3().subVectors(target, ballPos.current).normalize();
    ballVel.current.copy(dir.multiplyScalar(powerMultiplier));

    // AI Goalkeeper dives randomly (left, center, or right)
    const choices = ['left', 'center', 'right'] as const;
    const aiDive = choices[Math.floor(Math.random() * choices.length)];
    if (goalieGroupRef.current) {
      const diveTargetX = aiDive === 'left' ? -2.2 : aiDive === 'right' ? 2.2 : 0;
      goalieGroupRef.current.position.x = diveTargetX;
      goalieGroupRef.current.rotation.z = aiDive === 'left' ? 0.45 : aiDive === 'right' ? -0.45 : 0;
    }
  };

  // User dives as goalkeeper
  const handleUserDive = (diveChoice: 'left' | 'center' | 'right') => {
    if (isBallActive.current || turn !== 'user_keeping') return;

    setKeeperDiveChoice(diveChoice);
    sounds.playKick();
    isBallActive.current = true;
    setIsBallMoving(true);

    // User goalkeeper dives
    if (goalieGroupRef.current) {
      const diveTargetX = diveChoice === 'left' ? -2.2 : diveChoice === 'right' ? 2.2 : 0;
      goalieGroupRef.current.position.x = diveTargetX;
      goalieGroupRef.current.rotation.z = diveChoice === 'left' ? 0.45 : diveChoice === 'right' ? -0.45 : 0;
    }

    // AI Striker takes shot
    const rivalTargets = [
      new THREE.Vector3(-2.2, 1.2, GOAL_Z),
      new THREE.Vector3(2.2, 1.4, GOAL_Z),
      new THREE.Vector3(0, 1.0, GOAL_Z),
      new THREE.Vector3(-2.0, 1.8, GOAL_Z),
      new THREE.Vector3(2.0, 1.8, GOAL_Z)
    ];
    const target = rivalTargets[Math.floor(Math.random() * rivalTargets.length)];
    const dir = new THREE.Vector3().subVectors(target, ballPos.current).normalize();
    ballVel.current.copy(dir.multiplyScalar(24));
  };

  // Interactive mouse aim on Goal
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (turn !== 'user_kicking' || isBallActive.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    // Clamp aim within goal frame: X ∈ [-3.2, 3.2], Y ∈ [0.4, 2.2]
    setAimOffset({
      x: THREE.MathUtils.clamp(nx * 3.6, -3.4, 3.4),
      y: THREE.MathUtils.clamp(ny * 1.6 + 1.2, 0.3, 2.3)
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-full select-none overflow-hidden bg-black font-sans text-stone-100"
    >
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Scoreboard Header */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <div className="flex items-center gap-6 bg-slate-950/90 border-2 border-emerald-500/50 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl">
          <div className="text-right">
            <p className="text-[10px] text-stone-400 font-bold uppercase">YOU (FUO)</p>
            <p className="text-2xl font-black text-amber-400">{userScore}</p>
          </div>

          <div className="flex flex-col items-center px-4 border-x border-slate-700">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
              {roundNumber <= 5 ? `Round ${roundNumber} / 5` : 'Sudden Death'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={`u_${i}`}
                  className={`w-2.5 h-2.5 rounded-full ${
                    userRounds[i] === 'goal'
                      ? 'bg-emerald-400 shadow-md shadow-emerald-400/50'
                      : userRounds[i] === 'miss'
                      ? 'bg-red-500'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={`r_${i}`}
                  className={`w-2.5 h-2.5 rounded-full ${
                    rivalRounds[i] === 'goal'
                      ? 'bg-purple-400 shadow-md shadow-purple-400/50'
                      : rivalRounds[i] === 'miss'
                      ? 'bg-red-500'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-left">
            <p className="text-[10px] text-stone-400 font-bold uppercase">RIVAL FC</p>
            <p className="text-2xl font-black text-stone-200">{rivalScore}</p>
          </div>
        </div>

        {/* Stadium Commentary */}
        <div className="bg-black/80 border border-emerald-500/30 text-emerald-300 text-xs font-medium px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>{roundFeedback}</span>
        </div>
      </div>

      {/* User Controls: Kicking vs Keeping */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
        {turn === 'user_kicking' ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
              Move cursor over goal to aim reticle
            </p>
            <button
              onClick={handleKickShot}
              disabled={isBallMoving}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Flame className="w-5 h-5 text-red-600" />
              FIRE PENALTY SHOT!
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
              Anticipate their shot & choose your dive!
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleUserDive('left')}
                disabled={isBallMoving}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                DIVE LEFT
              </button>
              <button
                onClick={() => handleUserDive('center')}
                disabled={isBallMoving}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                STAY CENTER
              </button>
              <button
                onClick={() => handleUserDive('right')}
                disabled={isBallMoving}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                DIVE RIGHT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Exit Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 p-2.5 bg-slate-900/80 hover:bg-slate-800 text-stone-300 rounded-xl"
        title="Exit Shootout"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Shootout Outcome Modal */}
      {isShootoutOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="max-w-md w-full bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 text-center shadow-2xl">
            <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-3 animate-bounce" />
            <h2 className="text-2xl font-black text-amber-400 tracking-wide uppercase">
              {userScore > rivalScore ? 'SHOOTOUT VICTORY!' : 'SHOOTOUT HEARTBREAK'}
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              {userScore > rivalScore
                ? 'Clinical penalties and heroic keeping won the day!'
                : 'Hard fought battle from the spot. Next time for sure!'}
            </p>

            <div className="flex items-center justify-center gap-6 my-5 bg-slate-950 py-3 rounded-2xl border border-slate-800">
              <div className="text-center">
                <p className="text-[10px] text-stone-400 font-bold uppercase">YOU</p>
                <p className="text-3xl font-black text-amber-400">{userScore}</p>
              </div>
              <span className="text-xl font-black text-stone-600">-</span>
              <div className="text-center">
                <p className="text-[10px] text-stone-400 font-bold uppercase">RIVAL</p>
                <p className="text-3xl font-black text-stone-300">{rivalScore}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 text-left">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <p className="text-[10px] text-stone-400 uppercase font-semibold">Penalties Scored</p>
                <p className="text-xl font-black text-emerald-400">{userScore}</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <p className="text-[10px] text-stone-400 uppercase font-semibold">Keeper Saves</p>
                <p className="text-xl font-black text-sky-400">{playerSavesCount}</p>
              </div>
            </div>

            <button
              onClick={() => onFinishShootout(userScore, playerSavesCount, userScore > rivalScore)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Collect Shootout Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
