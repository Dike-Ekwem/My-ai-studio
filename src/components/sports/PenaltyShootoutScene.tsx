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
  Activity
} from 'lucide-react';

interface PenaltyShootoutSceneProps {
  onClose: () => void;
  onFinishMatch: (goalsScored: number, xpGained: number) => void;
}

export const PenaltyShootoutScene: React.FC<PenaltyShootoutSceneProps> = ({
  onClose,
  onFinishMatch
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Competition State (5-Shot Tournament)
  const [shotsTaken, setShotsTaken] = useState(0);
  const [goalsScored, setGoalsScored] = useState(0);
  const [shotHistory, setShotHistory] = useState<('goal' | 'saved')[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [aimTarget, setAimTarget] = useState<{ x: number; y: number } | null>(null);
  const [isAimingLocked, setIsAimingLocked] = useState(false);
  const [isBallInFlight, setIsBallInFlight] = useState(false);
  const [shotFeedback, setShotFeedback] = useState<string | null>(null);
  const [competitionFinished, setCompetitionFinished] = useState(false);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);

  // Three.js object references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const goalieGroupRef = useRef<THREE.Group | null>(null);
  const kickerGroupRef = useRef<THREE.Group | null>(null);
  const reticleMeshRef = useRef<THREE.Mesh | null>(null);
  const backgroundPlayersRef = useRef<THREE.Group[]>([]);

  // Aim bounds for goal mouth: Width 7.32m (-3.5 to 3.5), Height 2.44m (0.2 to 2.3)
  const goalBounds = {
    minX: -3.4,
    maxX: 3.4,
    minY: 0.25,
    maxY: 2.35
  };

  // Setup 3D Stadium & Goalpost
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera (Positioned directly behind penalty spot)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#042f2e');
    scene.fog = new THREE.FogExp2('#042f2e', 0.012);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 120);
    camera.position.set(0, 2.2, 7.8); // Behind ball (ball at z = 3.5, goal at z = -7.5)
    camera.lookAt(0, 1.4, -7.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 2. Pitch Turf & Markings
    const pitchGeo = new THREE.PlaneGeometry(55, 65);
    const pitchMat = new THREE.MeshLambertMaterial({ color: '#15803d' });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.receiveShadow = true;
    scene.add(pitch);

    // Line Markings (Goal Line, Penalty Box, Penalty Spot)
    const lineMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

    // Goal line at z = -7.5
    const goalLine = new THREE.Mesh(new THREE.PlaneGeometry(24, 0.2), lineMat);
    goalLine.rotation.x = -Math.PI / 2;
    goalLine.position.set(0, 0.02, -7.5);
    scene.add(goalLine);

    // Penalty Area Box (16.5m depth from goal line)
    const boxSideL = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 16.5), lineMat);
    boxSideL.rotation.x = -Math.PI / 2;
    boxSideL.position.set(-11, 0.02, 0.75);
    scene.add(boxSideL);

    const boxSideR = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 16.5), lineMat);
    boxSideR.rotation.x = -Math.PI / 2;
    boxSideR.position.set(11, 0.02, 0.75);
    scene.add(boxSideR);

    const boxFront = new THREE.Mesh(new THREE.PlaneGeometry(22, 0.2), lineMat);
    boxFront.rotation.x = -Math.PI / 2;
    boxFront.position.set(0, 0.02, 9);
    scene.add(boxFront);

    // Penalty Spot (11m from goal line: z = 3.5)
    const penSpot = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16), lineMat);
    penSpot.rotation.x = -Math.PI / 2;
    penSpot.position.set(0, 0.03, 3.5);
    scene.add(penSpot);

    // 3. Goalpost with Net Structure
    const postMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
    const postRadius = 0.08;

    // Left Post
    const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, 2.44, 16), postMat);
    leftPost.position.set(-3.66, 1.22, -7.5);
    leftPost.castShadow = true;
    scene.add(leftPost);

    // Right Post
    const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, 2.44, 16), postMat);
    rightPost.position.set(3.66, 1.22, -7.5);
    rightPost.castShadow = true;
    scene.add(rightPost);

    // Crossbar
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, 7.32, 16), postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 2.44, -7.5);
    crossbar.castShadow = true;
    scene.add(crossbar);

    // 3D Realistic Netting Mesh
    const netGeo = new THREE.BoxGeometry(7.32, 2.44, 1.8);
    const netMat = new THREE.MeshBasicMaterial({
      color: '#e2e8f0',
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, 1.22, -8.4);
    scene.add(net);

    // Stadium Lights & Daylight
    const sunLight = new THREE.DirectionalLight('#ffffff', 1.1);
    sunLight.position.set(8, 16, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight('#67e8f9', '#15803d', 0.55);
    scene.add(hemiLight);

    // 4. Soccer Ball (at penalty spot z = 3.5)
    const ballGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const ballMat = new THREE.MeshLambertMaterial({ color: '#ffffff' });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, 0.24, 3.5);
    ball.castShadow = true;
    scene.add(ball);
    ballMeshRef.current = ball;

    // Black pentagonal patch markings on ball
    const patchMat = new THREE.MeshBasicMaterial({ color: '#09090b' });
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.CircleGeometry(0.06, 5), patchMat);
      p.position.set(Math.sin(i * 1.05) * 0.23, Math.cos(i * 1.05) * 0.23, 0.05);
      ball.add(p);
    }

    // 5. 3D Goalkeeper on the Goal Line (z = -7.3)
    const goalie = new THREE.Group();
    goalie.position.set(0, 0, -7.3);

    // Goalkeeper Torso (Bright yellow goalie jersey)
    const goalieTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.2, 0.45),
      new THREE.MeshLambertMaterial({ color: '#facc15' })
    );
    goalieTorso.position.y = 1.4;
    goalieTorso.castShadow = true;
    goalie.add(goalieTorso);

    // Goalkeeper Head
    const goalieHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshLambertMaterial({ color: '#5d4037' })
    );
    goalieHead.position.set(0, 2.3, 0);
    goalie.add(goalieHead);

    // Goalkeeper Gloves
    const gloveMat = new THREE.MeshLambertMaterial({ color: '#ea580c' });
    const gloveL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), gloveMat);
    gloveL.position.set(-0.75, 1.4, 0.2);
    goalie.add(gloveL);

    const gloveR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), gloveMat);
    gloveR.position.set(0.75, 1.4, 0.2);
    goalie.add(gloveR);

    // Goalkeeper Shorts & Legs
    const shortMat = new THREE.MeshLambertMaterial({ color: '#171717' });
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.45, 0.46), shortMat);
    shorts.position.y = 0.8;
    goalie.add(shorts);

    scene.add(goalie);
    goalieGroupRef.current = goalie;

    // 6. Kicker Player Character (Behind ball at z = 4.7)
    const kicker = new THREE.Group();
    kicker.position.set(-0.7, 0, 4.8);

    const kickerTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 1.1, 0.4),
      new THREE.MeshLambertMaterial({ color: '#16a34a' }) // Green university kit
    );
    kickerTorso.position.y = 1.35;
    kicker.add(kickerTorso);

    const kickerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshLambertMaterial({ color: '#4e342e' })
    );
    kickerHead.position.set(0, 2.15, 0);
    kicker.add(kickerHead);

    scene.add(kicker);
    kickerGroupRef.current = kicker;

    // 7. Aim Reticle on Goal Face
    const reticleGeo = new THREE.RingGeometry(0.2, 0.26, 24);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: '#f59e0b',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.position.set(0, 1.2, -7.4);
    scene.add(reticle);
    reticleMeshRef.current = reticle;

    // 8. Background Football Players Performing Training Drill
    backgroundPlayersRef.current = [];
    const bgColors = ['#2563eb', '#dc2626', '#16a34a'];
    [
      [-14, -12],
      [-10, -18],
      [12, -15],
      [15, -10]
    ].forEach(([bx, bz], idx) => {
      const bgP = new THREE.Group();
      bgP.position.set(bx, 0, bz);

      const tMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.0, 0.38),
        new THREE.MeshLambertMaterial({ color: bgColors[idx % bgColors.length] })
      );
      tMesh.position.y = 1.2;
      bgP.add(tMesh);

      const hMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 12, 12),
        new THREE.MeshLambertMaterial({ color: '#5d4037' })
      );
      hMesh.position.set(0, 1.95, 0);
      bgP.add(hMesh);

      scene.add(bgP);
      backgroundPlayersRef.current.push(bgP);
    });

    // 9. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Goalkeeper subtle ready bounce when not in flight
      if (goalieGroupRef.current && !isBallInFlight) {
        goalieGroupRef.current.position.y = Math.abs(Math.sin(time * 6.5)) * 0.12;
        goalieGroupRef.current.position.x = Math.sin(time * 2.5) * 0.45;
      }

      // Background players subtle jogging / stretching
      backgroundPlayersRef.current.forEach((bg, idx) => {
        bg.position.z += Math.sin(time * 1.5 + idx) * 0.02;
        bg.position.y = Math.abs(Math.sin(time * 4.5 + idx)) * 0.08;
      });

      // Reticle pulse
      if (reticleMeshRef.current) {
        const pulse = 1 + Math.sin(time * 8) * 0.12;
        reticleMeshRef.current.scale.set(pulse, pulse, 1);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
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
  }, []);

  // Mouse Movement Aiming Mechanic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAimingLocked || isBallInFlight || competitionFinished) return;
    if (!mountRef.current || !reticleMeshRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1); // -1 to 1

    // Map screen normalized coordinates to visible 3D goal face
    const targetX = Math.max(goalBounds.minX, Math.min(goalBounds.maxX, nx * 4.2));
    const targetY = Math.max(goalBounds.minY, Math.min(goalBounds.maxY, 1.25 + ny * 1.5));

    setAimTarget({ x: targetX, y: targetY });
    reticleMeshRef.current.position.set(targetX, targetY, -7.4);
  };

  // Click to Lock Aim & Trigger Shoot Countdown: 3 -> 2 -> 1 -> SHOOT!
  const handleClickAim = () => {
    if (isAimingLocked || isBallInFlight || competitionFinished) return;
    if (!aimTarget) return;

    sounds.playClick();
    setIsAimingLocked(true);
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) {
          clearInterval(timer);
          return null;
        }
        if (prev <= 1) {
          clearInterval(timer);
          executeShot(aimTarget);
          return null;
        }
        sounds.playClick();
        return prev - 1;
      });
    }, 600);
  };

  // Ball & Goalkeeper Physics Simulation
  const executeShot = (target: { x: number; y: number }) => {
    sounds.playKick();
    setIsBallInFlight(true);

    const ball = ballMeshRef.current;
    const goalie = goalieGroupRef.current;
    const kicker = kickerGroupRef.current;
    if (!ball || !goalie) return;

    // 1. Kicker run up
    if (kicker) {
      kicker.position.set(-0.2, 0, 3.8);
      kicker.rotation.y = 0.3;
    }

    // 2. Decide Goalkeeper Dive Direction
    // Options: 'left' (dives to x < -1.5), 'center' (-1.0 to 1.0), 'right' (x > 1.5)
    const diveDirections = ['left', 'center', 'right', 'top-corner'];
    const chosenDive = diveDirections[Math.floor(Math.random() * diveDirections.length)];

    let diveTargetX = 0;
    let diveTargetY = 0.8;
    if (chosenDive === 'left') {
      diveTargetX = -2.2;
      diveTargetY = Math.random() > 0.5 ? 1.5 : 0.4;
    } else if (chosenDive === 'right') {
      diveTargetX = 2.2;
      diveTargetY = Math.random() > 0.5 ? 1.5 : 0.4;
    } else if (chosenDive === 'top-corner') {
      diveTargetX = (Math.random() > 0.5 ? 1 : -1) * 2.8;
      diveTargetY = 1.9;
    } else {
      diveTargetX = (Math.random() - 0.5) * 0.8;
      diveTargetY = 1.2;
    }

    // Evaluate Result based on spatial proximity between Ball Target & Goalkeeper Dive
    const distanceToGoalie = Math.hypot(target.x - diveTargetX, target.y - diveTargetY);
    const isGoal = distanceToGoalie > 1.35; // If goalkeeper dive does not intercept ball!

    const startPos = new THREE.Vector3(0, 0.24, 3.5);
    const endPos = new THREE.Vector3(target.x, target.y, -7.5);
    const durationMs = 650;
    const startTime = performance.now();

    const shotInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Ball Trajectory with parabolic gravity arc
      const curX = THREE.MathUtils.lerp(startPos.x, endPos.x, progress);
      const curZ = THREE.MathUtils.lerp(startPos.z, endPos.z, progress);
      const arcY = Math.sin(progress * Math.PI) * 0.9;
      const curY = THREE.MathUtils.lerp(startPos.y, endPos.y, progress) + arcY;

      ball.position.set(curX, curY, curZ);
      ball.rotation.x += 0.35;
      ball.rotation.y += 0.25;

      // Animate Goalkeeper Dive
      goalie.position.x = THREE.MathUtils.lerp(0, diveTargetX, progress * 1.2);
      goalie.position.y = THREE.MathUtils.lerp(0, diveTargetY, progress * 1.2);
      if (chosenDive === 'left') goalie.rotation.z = THREE.MathUtils.lerp(0, 0.95, progress);
      else if (chosenDive === 'right') goalie.rotation.z = THREE.MathUtils.lerp(0, -0.95, progress);

      if (progress >= 1) {
        clearInterval(shotInterval);

        // Result Resolution
        if (isGoal) {
          sounds.playCheer();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          setGoalsScored((g) => g + 1);
          setShotHistory((h) => [...h, 'goal']);
          setShotFeedback('GOAL! Brilliant strike into the net! ⚽🔥');
        } else {
          sounds.playClick();
          setShotHistory((h) => [...h, 'saved']);
          setShotFeedback('SAVED! Superb diving stop by the keeper! 🧤');
        }

        const nextShots = shotsTaken + 1;
        setShotsTaken(nextShots);

        // Reset after short delay or conclude match if 5 shots complete
        setTimeout(() => {
          if (nextShots >= 5) {
            setCompetitionFinished(true);
            const totalGoals = isGoal ? goalsScored + 1 : goalsScored;
            const rewardXP = 60 + totalGoals * 60; // Up to 360 XP for 5 goals!
            if (!hasClaimedReward) {
              setHasClaimedReward(true);
              onFinishMatch(totalGoals, rewardXP);
            }
          } else {
            resetForNextShot();
          }
        }, 1600);
      }
    }, 16);
  };

  const resetForNextShot = () => {
    setIsBallInFlight(false);
    setIsAimingLocked(false);
    setShotFeedback(null);

    // Reset 3D ball, goalie, kicker
    if (ballMeshRef.current) {
      ballMeshRef.current.position.set(0, 0.24, 3.5);
    }
    if (goalieGroupRef.current) {
      goalieGroupRef.current.position.set(0, 0, -7.3);
      goalieGroupRef.current.rotation.set(0, 0, 0);
    }
    if (kickerGroupRef.current) {
      kickerGroupRef.current.position.set(-0.7, 0, 4.8);
      kickerGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    setShotsTaken(0);
    setGoalsScored(0);
    setShotHistory([]);
    setCompetitionFinished(false);
    setHasClaimedReward(false);
    resetForNextShot();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-stone-900 border-2 border-emerald-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* 3D Penalty Pitch Viewport */}
        <div
          ref={mountRef}
          onMouseMove={handleMouseMove}
          onClick={handleClickAim}
          className="relative flex-1 w-full bg-emerald-950 overflow-hidden cursor-crosshair"
        >
          {/* Top Scoreboard & Header */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-stone-900/90 border border-emerald-500/50 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-amber-300">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  FUO Campus Stadium • Penalty Shootout
                </div>
                <div className="text-xs font-black text-white">
                  5-Shot Interfaculty Championship
                </div>
              </div>
            </div>

            {/* Score Pill: Goals 3 / 5 & Shot 4 / 5 */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-stone-900/90 border border-amber-400/80 rounded-2xl px-4 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-3 font-mono text-xs font-bold">
                <div>
                  <span className="text-stone-400">SHOT: </span>
                  <span className="text-white">{Math.min(5, shotsTaken + 1)} / 5</span>
                </div>
                <div className="w-px h-4 bg-stone-700" />
                <div>
                  <span className="text-stone-400">GOALS: </span>
                  <span className="text-emerald-400">{goalsScored} / 5</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white cursor-pointer shadow-lg backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shot History Indicator Dots */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-2">
            {[0, 1, 2, 3, 4].map((idx) => {
              const res = shotHistory[idx];
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shadow-md ${
                    res === 'goal'
                      ? 'bg-emerald-500 border-white text-stone-950'
                      : res === 'saved'
                      ? 'bg-red-600 border-white text-white'
                      : 'bg-stone-900/80 border-stone-600 text-stone-500'
                  }`}
                >
                  {res === 'goal' ? '✓' : res === 'saved' ? '✕' : idx + 1}
                </div>
              );
            })}
          </div>

          {/* Countdown Display: 3 -> 2 -> 1 -> SHOOT! */}
          {countdown !== null && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-in zoom-in-50 duration-200">
              <div className="bg-stone-950/90 border-4 border-amber-400 text-amber-300 font-black text-6xl sm:text-7xl px-8 py-5 rounded-3xl shadow-2xl backdrop-blur-md animate-bounce">
                {countdown}
              </div>
            </div>
          )}

          {/* Aim Prompt at bottom */}
          {!isAimingLocked && !isBallInFlight && !competitionFinished && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-stone-950/85 border border-amber-400/80 rounded-2xl px-5 py-2.5 shadow-2xl backdrop-blur-md text-center">
                <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2 justify-center">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Move Mouse to Aim • Click Goal to SHOOT!</span>
                </div>
                <div className="text-[10px] text-stone-300 mt-0.5">
                  Pick corners to beat the campus goalkeeper!
                </div>
              </div>
            </div>
          )}

          {/* In-Flight Result Banner */}
          {shotFeedback && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in zoom-in-75 duration-200">
              <div className="bg-stone-950/95 border-2 border-amber-400 text-amber-300 font-black text-base sm:text-lg px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
                {shotFeedback}
              </div>
            </div>
          )}

          {/* Final Results Modal after 5 attempts */}
          {competitionFinished && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-stone-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 mx-auto flex items-center justify-center text-amber-400 shadow-xl">
                  <Trophy className="w-9 h-9" />
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Full-Time Match Results
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {goalsScored >= 4
                      ? 'Golden Boot Champion! 🥇'
                      : goalsScored >= 2
                      ? 'Solid Performance! 🥈'
                      : 'Training Complete! ⚽'}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    You converted <span className="font-black text-emerald-400 text-sm">{goalsScored}</span> out of 5 penalty kicks against the varsity goalkeeper!
                  </p>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-2 bg-stone-800/80 p-3 rounded-2xl border border-stone-700 text-xs">
                  <div>
                    <div className="text-stone-400 text-[10px] font-semibold">Total Goals</div>
                    <div className="text-emerald-400 font-black text-lg">{goalsScored} / 5</div>
                  </div>
                  <div>
                    <div className="text-stone-400 text-[10px] font-semibold">Athletic XP Earned</div>
                    <div className="text-amber-300 font-black text-lg">+{60 + goalsScored * 60} XP</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black py-3 px-4 rounded-2xl shadow-lg border border-emerald-400 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition transform hover:scale-[1.02]"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-300" />
                    <span>Play Another 5-Shot Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition"
                  >
                    Return to Campus
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
