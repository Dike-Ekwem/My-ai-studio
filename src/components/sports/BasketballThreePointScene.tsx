import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Award,
  ArrowRight,
  RotateCcw,
  Clock,
  Target,
  Sparkles,
  X
} from 'lucide-react';

interface BasketballThreePointSceneProps {
  onClose: () => void;
  onFinishChallenge: (basketsMade: number, totalScore: number, xpGained: number) => void;
}

interface RackSpot {
  id: number;
  name: string;
  x: number;
  z: number;
  ballsLeft: number;
  isMoneyBall: boolean;
}

export const BasketballThreePointScene: React.FC<BasketballThreePointSceneProps> = ({
  onClose,
  onFinishChallenge
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // 5 Official Three-Point Racks around the Arc
  const [currentRackIndex, setCurrentRackIndex] = useState<number>(0);
  const [ballInRackIndex, setBallInRackIndex] = useState<number>(0); // 0 to 4 (ball 4 is Money Ball)
  const [score, setScore] = useState<number>(0);
  const [basketsMade, setBasketsMade] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [shotCharge, setShotCharge] = useState<number>(0);
  const [shotFeedback, setShotFeedback] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const rackMeshesRef = useRef<THREE.Group[]>([]);

  // Ball Physical State
  const ballPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const ballVel = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isBallActive = useRef<boolean>(false);

  const chargingRef = useRef<boolean>(false);
  const chargeAmountRef = useRef<number>(0);

  // Hoop coordinates (Basket at z = -5.5m, height = 3.05m)
  const HOOP_X = 0;
  const HOOP_Y = 3.05;
  const HOOP_Z = -5.5;

  const RACKS: RackSpot[] = [
    { id: 0, name: 'Left Corner', x: -6.4, z: -4.5, ballsLeft: 5, isMoneyBall: false },
    { id: 1, name: 'Left Wing', x: -4.8, z: 0.5, ballsLeft: 5, isMoneyBall: false },
    { id: 2, name: 'Top of Key', x: 0, z: 2.2, ballsLeft: 5, isMoneyBall: false },
    { id: 3, name: 'Right Wing', x: 4.8, z: 0.5, ballsLeft: 5, isMoneyBall: false },
    { id: 4, name: 'Right Corner', x: 6.4, z: -4.5, ballsLeft: 5, isMoneyBall: false }
  ];

  // Setup 3D Arena & 5 Racks
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#030712');
    scene.fog = new THREE.FogExp2('#030712', 0.012);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(HOOP_X, HOOP_Y, HOOP_Z);
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
    const spot = new THREE.DirectionalLight('#38bdf8', 1.4);
    spot.position.set(10, 25, 15);
    spot.castShadow = true;
    scene.add(spot);

    // Court Floor
    const courtMat = new THREE.MeshLambertMaterial({ color: '#0284c7' });
    const keyMat = new THREE.MeshLambertMaterial({ color: '#c2410c' });
    const lineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

    const court = new THREE.Mesh(new THREE.PlaneGeometry(32, 28), courtMat);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    scene.add(court);

    // Key Lane
    const keyLane = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 6.0), keyMat);
    keyLane.rotation.x = -Math.PI / 2;
    keyLane.position.set(0, 0.01, -2.5);
    scene.add(keyLane);

    // Three-point arc (Radius = 6.75m from hoop)
    const arc = new THREE.Mesh(new THREE.RingGeometry(6.65, 6.82, 36, 1, 0, Math.PI), lineMat);
    arc.rotation.x = -Math.PI / 2;
    arc.position.set(HOOP_X, 0.02, HOOP_Z);
    scene.add(arc);

    // Regulation Hoop at z = -5.5m
    const hoop = new THREE.Group();
    hoop.position.set(HOOP_X, 0, HOOP_Z);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4.2, 12), new THREE.MeshLambertMaterial({ color: '#0f172a' }));
    pole.position.set(0, 2.1, -1.2);
    hoop.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 1.5), new THREE.MeshLambertMaterial({ color: '#0f172a' }));
    arm.position.set(0, 3.25, -0.5);
    arm.rotation.x = -0.3;
    hoop.add(arm);

    // Tempered Glass Backboard
    const backboard = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.3, 0.08),
      new THREE.MeshLambertMaterial({ color: '#e0f2fe', transparent: true, opacity: 0.85 })
    );
    backboard.position.set(0, 3.4, 0);
    hoop.add(backboard);

    // Red Target Square
    const redSq = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.38, 4),
      new THREE.MeshBasicMaterial({ color: '#ef4444', side: THREE.DoubleSide })
    );
    redSq.rotation.z = Math.PI / 4;
    redSq.position.set(0, 3.32, 0.05);
    hoop.add(redSq);

    // Orange Breakaway Rim
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.035, 12, 24),
      new THREE.MeshLambertMaterial({ color: '#ea580c' })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, HOOP_Y, 0.45);
    hoop.add(rim);

    // White Net
    const net = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.18, 0.45, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true })
    );
    net.position.set(0, HOOP_Y - 0.25, 0.45);
    hoop.add(net);

    scene.add(hoop);

    // 5 Visual Ball Racks at Shooting Spots
    rackMeshesRef.current = [];
    RACKS.forEach((r) => {
      const rackG = new THREE.Group();
      rackG.position.set(r.x, 0, r.z);

      const stand = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.85, 1.4),
        new THREE.MeshLambertMaterial({ color: '#0f172a' })
      );
      stand.position.y = 0.42;
      rackG.add(stand);

      // 5 Balls inside rack
      for (let b = 0; b < 5; b++) {
        const isMoney = b === 4;
        const ballItem = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 12, 12),
          new THREE.MeshLambertMaterial({ color: isMoney ? '#3b82f6' : '#ea580c' })
        );
        ballItem.position.set(0, 0.95, -0.5 + b * 0.25);
        rackG.add(ballItem);
      }

      scene.add(rackG);
      rackMeshesRef.current.push(rackG);
    });

    // 3D Player Figure
    const playerG = new THREE.Group();
    playerG.position.set(RACKS[0].x, 0, RACKS[0].z);

    const playerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 1.1, 0.4),
      new THREE.MeshLambertMaterial({ color: '#047857' })
    );
    playerBody.position.y = 1.45;
    playerG.add(playerBody);

    const playerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 12),
      new THREE.MeshLambertMaterial({ color: '#875338' })
    );
    playerHead.position.y = 2.25;
    playerG.add(playerHead);

    scene.add(playerG);
    playerGroupRef.current = playerG;

    // Active Shooting Ball
    const shotBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshLambertMaterial({ color: '#ea580c' })
    );
    shotBall.position.set(RACKS[0].x, 1.5, RACKS[0].z);
    scene.add(shotBall);
    ballMeshRef.current = shotBall;

    // -------------------------------------------------------------
    // ANIMATION & PHYSICS LOOP
    // -------------------------------------------------------------
    let animId: number;
    let lastT = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.1);
      lastT = now;

      // Charge Meter
      if (chargingRef.current) {
        chargeAmountRef.current = Math.min(1.0, chargeAmountRef.current + dt * 1.7);
        setShotCharge(chargeAmountRef.current);
      }

      // Ball Trajectory
      if (isBallActive.current) {
        ballVel.current.y -= 18.0 * dt;
        ballPos.current.addScaledVector(ballVel.current, dt);

        if (ballMeshRef.current) {
          ballMeshRef.current.position.copy(ballPos.current);
          ballMeshRef.current.rotation.x += dt * 12;
        }

        // Check Hoop Collision & Swish
        const distToHoop = Math.hypot(ballPos.current.x - HOOP_X, ballPos.current.z - (HOOP_Z + 0.45));
        if (distToHoop < 0.45 && ballPos.current.y <= HOOP_Y + 0.15 && ballPos.current.y >= HOOP_Y - 0.4 && ballVel.current.y < 0) {
          isBallActive.current = false;
          setIsShooting(false);
          sounds.playNetSwish();
          confetti({ particleCount: 40, spread: 50 });

          const isMoney = ballInRackIndex === 4;
          const points = isMoney ? 2 : 1;
          setScore((s) => s + points);
          setBasketsMade((b) => b + 1);
          setShotFeedback(isMoney ? 'MONEY BALL! 🔥 +2 PTS!' : 'SWISH! +1 PT!');

          advanceBall();
        } else if (ballPos.current.y <= 0.24 || ballPos.current.z < HOOP_Z - 2) {
          // Missed
          isBallActive.current = false;
          setIsShooting(false);
          sounds.playCrossbarHit();
          setShotFeedback('RIMMED OUT! MISS!');

          advanceBall();
        }
      }

      renderer.render(scene, cameraRef.current!);
    };

    animate();

    // 60-Second Countdown
    const countdown = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsComplete(true);
          sounds.playBuzzer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(countdown);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const advanceBall = () => {
    setTimeout(() => {
      setBallInRackIndex((prevBall) => {
        if (prevBall < 4) {
          // Next ball in same rack
          const nextB = prevBall + 1;
          resetBallToShooter(currentRackIndex, nextB);
          return nextB;
        } else {
          // Finished this rack, advance to next rack!
          if (currentRackIndex < 4) {
            const nextRack = currentRackIndex + 1;
            setCurrentRackIndex(nextRack);
            resetBallToShooter(nextRack, 0);
            return 0;
          } else {
            // Finished all 5 racks!
            setIsComplete(true);
            sounds.playCheer();
            return 4;
          }
        }
      });
    }, 600);
  };

  const resetBallToShooter = (rackIdx: number, ballIdx: number) => {
    const rack = RACKS[rackIdx];
    if (playerGroupRef.current) {
      playerGroupRef.current.position.set(rack.x, 0, rack.z);
      playerGroupRef.current.lookAt(HOOP_X, 0, HOOP_Z);
    }
    if (cameraRef.current) {
      const camX = rack.x * 0.8;
      const camZ = rack.z + 4.2;
      cameraRef.current.position.set(camX, 2.6, camZ);
      cameraRef.current.lookAt(HOOP_X, HOOP_Y, HOOP_Z);
    }
    ballPos.current.set(rack.x, 1.5, rack.z);
    ballVel.current.set(0, 0, 0);
    if (ballMeshRef.current) {
      ballMeshRef.current.position.copy(ballPos.current);
      // Tint ball if Money Ball
      const isMoney = ballIdx === 4;
      (ballMeshRef.current.material as THREE.MeshLambertMaterial).color.set(isMoney ? '#3b82f6' : '#ea580c');
    }
  };

  // Shot Charging Handlers
  const handleStartCharge = () => {
    if (isShooting || isComplete) return;
    chargingRef.current = true;
    chargeAmountRef.current = 0;
  };

  const handleReleaseShot = () => {
    if (!chargingRef.current || isComplete) return;
    chargingRef.current = false;
    setIsShooting(true);
    isBallActive.current = true;
    sounds.playDribble();

    const charge = chargeAmountRef.current;
    const isGreen = charge >= 0.45 && charge <= 0.65;

    // Launch Ball on parabolic arc to hoop
    const rack = RACKS[currentRackIndex];
    const target = new THREE.Vector3(HOOP_X, HOOP_Y + 0.15, HOOP_Z + 0.45);
    const flightTime = 1.0;

    const vx = (target.x - ballPos.current.x) / flightTime;
    const vz = (target.z - ballPos.current.z) / flightTime;
    const vy = (target.y - ballPos.current.y + 0.5 * 18.0 * flightTime * flightTime) / flightTime;

    ballVel.current.set(
      vx * (isGreen ? 1.0 : (Math.random() - 0.5) * 0.12 + 1.0),
      vy * (isGreen ? 1.0 : 0.94),
      vz * (isGreen ? 1.0 : (Math.random() - 0.5) * 0.15 + 1.0)
    );

    setShotFeedback(isGreen ? 'EXCELLENT APEX RELEASE!' : charge < 0.45 ? 'EARLY RELEASE' : 'LATE RELEASE');
    setShotCharge(0);
    chargeAmountRef.current = 0;
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950 font-sans">
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Scoreboard HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 bg-slate-900/90 border-2 border-amber-400 text-white px-7 py-3 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Time Left</span>
          <div className="flex items-center gap-1.5 text-2xl font-black text-amber-300">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>{timerSeconds}s</span>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-700" />

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-sky-400">Current Rack</span>
          <span className="text-sm font-black text-white">{RACKS[currentRackIndex].name}</span>
          <span className="text-[10px] text-amber-400 font-bold">
            Ball {ballInRackIndex + 1} / 5 {ballInRackIndex === 4 && '★ (MONEY BALL)'}
          </span>
        </div>

        <div className="h-8 w-px bg-slate-700" />

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Total Score</span>
          <span className="text-3xl font-black text-emerald-400">{score}</span>
        </div>
      </div>

      {/* Shot Feedback Banner */}
      {shotFeedback && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-emerald-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-lg animate-bounce">
          {shotFeedback}
        </div>
      )}

      {/* Release Timing Gauge */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 bg-slate-900/90 border border-sky-400 px-5 py-2.5 rounded-2xl backdrop-blur-md">
        <div className="text-[10px] font-bold uppercase text-sky-300">Jump Shot Meter • Release in Green Zone</div>
        <div className="w-56 h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700 relative">
          <div className="absolute left-[45%] w-[20%] h-full bg-emerald-500/50 z-10" />
          <div
            className={`h-full rounded-full transition-all duration-75 relative z-20 ${
              shotCharge >= 0.45 && shotCharge <= 0.65 ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
            style={{ width: `${shotCharge * 100}%` }}
          />
        </div>
      </div>

      {/* Interactive Shoot Button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <button
          type="button"
          disabled={isShooting || isComplete}
          onMouseDown={handleStartCharge}
          onMouseUp={handleReleaseShot}
          onTouchStart={handleStartCharge}
          onTouchEnd={handleReleaseShot}
          className="px-10 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-40 text-slate-950 font-black rounded-3xl shadow-2xl transition transform active:scale-95 cursor-pointer text-base flex items-center gap-2"
        >
          <Target className="w-5 h-5 fill-slate-950" />
          HOLD & RELEASE TO SHOOT
        </button>
      </div>

      {/* Exit Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 z-20 p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:text-white shadow-xl transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Challenge Completed Modal */}
      {isComplete && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-7 max-w-md w-full shadow-2xl text-center">
            <div className="text-4xl mb-2">🎯</div>
            <h2 className="text-2xl font-black text-white">THREE-POINT CONTEST COMPLETE!</h2>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Federal University of Omo All-Stars Shootout
            </p>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 mb-6">
              <span className="text-xs text-slate-400 block mb-1">Final Score</span>
              <span className="text-4xl font-black text-amber-400">{score} / 30 PTS</span>
              <span className="text-xs text-emerald-400 font-bold block mt-1">
                {basketsMade} of 25 Total Baskets Made
              </span>
            </div>

            <button
              onClick={() => onFinishChallenge(basketsMade, score, score * 10 + 50)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black rounded-2xl shadow-xl transition transform active:scale-95 cursor-pointer"
            >
              Claim Contest XP & Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
