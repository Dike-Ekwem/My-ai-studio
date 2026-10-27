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
  CheckCircle2,
  X,
  Target
} from 'lucide-react';

interface BasketballShootSceneProps {
  onClose: () => void;
  onFinishChallenge: (basketsMade: number, xpGained: number) => void;
}

export const BasketballShootScene: React.FC<BasketballShootSceneProps> = ({
  onClose,
  onFinishChallenge
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Challenge State (5 Shots)
  const [shotsTaken, setShotsTaken] = useState(0);
  const [basketsMade, setBasketsMade] = useState(0);
  const [shotHistory, setShotHistory] = useState<('made' | 'miss')[]>([]);
  const [aimOffset, setAimOffset] = useState<{ x: number; y: number }>({ x: 0, y: 3.1 });
  const [isShooting, setIsShooting] = useState(false);
  const [shotFeedback, setShotFeedback] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hasAwardedReward, setHasAwardedReward] = useState(false);

  // Three.js object references
  const ballRef = useRef<THREE.Mesh | null>(null);
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const hoopGroupRef = useRef<THREE.Group | null>(null);

  // Setup 3D Basketball Court & Hoop
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#082f49');
    scene.fog = new THREE.FogExp2('#082f49', 0.012);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 2.6, 7.5); // Elevated view behind player looking directly at the hoop
    camera.lookAt(0, 2.8, -5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 1. Basketball Court Floor
    const courtGeo = new THREE.PlaneGeometry(36, 42);
    const courtMat = new THREE.MeshLambertMaterial({ color: '#0369a1' }); // Deep acrylic blue
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    scene.add(court);

    // Terracotta Key Lane
    const keyGeo = new THREE.PlaneGeometry(4.8, 8.5);
    const keyMat = new THREE.MeshLambertMaterial({ color: '#c2410c' });
    const keyLane = new THREE.Mesh(keyGeo, keyMat);
    keyLane.rotation.x = -Math.PI / 2;
    keyLane.position.set(0, 0.02, -1.2);
    scene.add(keyLane);

    // Court White Markings
    const lineMat = new THREE.MeshBasicMaterial({ color: '#f8fafc' });

    // Free Throw Line (z = 3.0)
    const ftLine = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 0.15), lineMat);
    ftLine.rotation.x = -Math.PI / 2;
    ftLine.position.set(0, 0.03, 3.0);
    scene.add(ftLine);

    // Three-point arc (approximate semicircle)
    const arcGeo = new THREE.RingGeometry(6.6, 6.75, 32, 1, 0, Math.PI);
    const threeArc = new THREE.Mesh(arcGeo, lineMat);
    threeArc.rotation.x = -Math.PI / 2;
    threeArc.position.set(0, 0.03, -5.5);
    scene.add(threeArc);

    // 2. Regulation 3D Basketball Hoop
    const hoop = new THREE.Group();
    hoop.position.set(0, 0, -5.5);

    // Base Support Pole
    const poleMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4.2, 16), poleMat);
    pole.position.set(0, 2.1, -1.1);
    pole.castShadow = true;
    hoop.add(pole);

    // Angled Neck Arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 1.3), poleMat);
    arm.position.set(0, 3.25, -0.45);
    arm.rotation.x = -0.35;
    hoop.add(arm);

    // Tempered Glass Backboard (1.8m wide, 1.05m high at height 3.1m)
    const boardGeo = new THREE.BoxGeometry(2.4, 1.4, 0.08);
    const boardMat = new THREE.MeshLambertMaterial({
      color: '#e0f2fe',
      transparent: true,
      opacity: 0.8
    });
    const backboard = new THREE.Mesh(boardGeo, boardMat);
    backboard.position.set(0, 3.4, 0);
    hoop.add(backboard);

    // Backboard White/Red Target Square
    const innerSq = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.42, 4),
      new THREE.MeshBasicMaterial({ color: '#ef4444', side: THREE.DoubleSide })
    );
    innerSq.rotation.z = Math.PI / 4;
    innerSq.position.set(0, 3.32, 0.05);
    hoop.add(innerSq);

    // Orange Metal Rim (Height 3.05m, Diameter 0.45m)
    const rimGeo = new THREE.TorusGeometry(0.35, 0.035, 12, 24);
    const rimMat = new THREE.MeshLambertMaterial({ color: '#ea580c' });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.05, 0.42);
    hoop.add(rim);

    // White Net Mesh
    const netGeo = new THREE.CylinderGeometry(0.35, 0.18, 0.55, 16, 4, true);
    const netMat = new THREE.MeshBasicMaterial({
      color: '#f8fafc',
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, 2.76, 0.42);
    hoop.add(net);

    scene.add(hoop);
    hoopGroupRef.current = hoop;

    // 3. Basketball (Spalding textured orange sphere with black ribs)
    const ballGeo = new THREE.SphereGeometry(0.25, 24, 24);
    const ballMat = new THREE.MeshLambertMaterial({ color: '#ea580c' });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, 1.95, 3.8); // In player's hands at free throw spot
    ball.castShadow = true;
    scene.add(ball);
    ballRef.current = ball;

    // 4. Player Character (Taking shot)
    const player = new THREE.Group();
    player.position.set(0, 0, 4.3);

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.15, 0.42),
      new THREE.MeshLambertMaterial({ color: '#15803d' }) // Green university jersey
    );
    torso.position.y = 1.35;
    player.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshLambertMaterial({ color: '#5d4037' })
    );
    head.position.set(0, 2.15, 0);
    player.add(head);

    scene.add(player);
    playerGroupRef.current = player;

    // 5. Aim Reticle
    const reticleGeo = new THREE.RingGeometry(0.18, 0.24, 24);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.position.set(0, 3.1, -5.0);
    scene.add(reticle);
    reticleRef.current = reticle;

    // Lighting
    const sunLight = new THREE.DirectionalLight('#ffffff', 1.15);
    sunLight.position.set(6, 14, 8);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight('#bae6fd', 0.6);
    scene.add(ambientLight);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Subtle reticle breathing
      if (reticleRef.current) {
        const s = 1 + Math.sin(time * 6) * 0.1;
        reticleRef.current.scale.set(s, s, 1);
      }

      // Idle breathing of player before shoot
      if (playerGroupRef.current && !isShooting) {
        playerGroupRef.current.position.y = Math.sin(time * 3) * 0.03;
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

  // Mouse Aiming Control
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isShooting || isComplete) return;
    if (!mountRef.current || !reticleRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1); // -1 to 1

    const targetX = THREE.MathUtils.clamp(nx * 2.8, -1.8, 1.8);
    const targetY = THREE.MathUtils.clamp(3.1 + ny * 1.5, 2.2, 4.2);

    setAimOffset({ x: targetX, y: targetY });
    reticleRef.current.position.set(targetX, targetY, -5.0);
  };

  // Click to Shoot Basketball
  const handleShootBall = () => {
    if (isShooting || isComplete) return;
    sounds.playClick();
    setIsShooting(true);

    const ball = ballRef.current;
    if (!ball) return;

    const startPos = new THREE.Vector3(0, 1.95, 3.8);
    const targetPos = new THREE.Vector3(aimOffset.x, aimOffset.y, -5.1);

    // Evaluate basket success: within 0.42m of center of hoop (x ~ 0, y ~ 3.05)
    const distToCenter = Math.hypot(aimOffset.x - 0, aimOffset.y - 3.08);
    const isBasket = distToCenter < 0.48;

    const durationMs = 850;
    const startTime = performance.now();

    const shotInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const p = Math.min(1, elapsed / durationMs);

      // High parabolic ballistic basketball arc (apex reaches ~5.2m)
      const curX = THREE.MathUtils.lerp(startPos.x, targetPos.x, p);
      const curZ = THREE.MathUtils.lerp(startPos.z, targetPos.z, p);
      const arcHeight = Math.sin(p * Math.PI) * 2.8;
      const curY = THREE.MathUtils.lerp(startPos.y, targetPos.y, p) + arcHeight;

      ball.position.set(curX, curY, curZ);
      ball.rotation.x += 0.35; // Backspin

      if (p >= 1) {
        clearInterval(shotInterval);

        if (isBasket) {
          sounds.playCheer();
          confetti({ particleCount: 65, spread: 55, origin: { y: 0.6 } });
          setBasketsMade((b) => b + 1);
          setShotHistory((h) => [...h, 'made']);
          setShotFeedback('SWISH! Pure bucket from the line! 🏀🔥');

          // Drop through net
          ball.position.set(0, 2.4, -5.08);
        } else {
          sounds.playClick();
          setShotHistory((h) => [...h, 'miss']);
          setShotFeedback('CLANG! Off the back of the rim! 💥');
          // Rebound bounce
          ball.position.set(targetPos.x * 1.3, 1.2, -4.2);
        }

        const nextShots = shotsTaken + 1;
        setShotsTaken(nextShots);

        setTimeout(() => {
          if (nextShots >= 5) {
            setIsComplete(true);
            const finalBaskets = isBasket ? basketsMade + 1 : basketsMade;
            const rewardXP = 50 + finalBaskets * 50;
            if (!hasAwardedReward) {
              setHasAwardedReward(true);
              onFinishChallenge(finalBaskets, rewardXP);
            }
          } else {
            // Reset for next shot
            setIsShooting(false);
            setShotFeedback(null);
            ball.position.set(0, 1.95, 3.8);
          }
        }, 1500);
      }
    }, 16);
  };

  const handleRestart = () => {
    sounds.playClick();
    setShotsTaken(0);
    setBasketsMade(0);
    setShotHistory([]);
    setIsComplete(false);
    setIsShooting(false);
    setShotFeedback(null);
    setHasAwardedReward(false);
    if (ballRef.current) {
      ballRef.current.position.set(0, 1.95, 3.8);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-stone-900 border-2 border-orange-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* 3D Court Viewport */}
        <div
          ref={mountRef}
          onMouseMove={handleMouseMove}
          onClick={handleShootBall}
          className="relative flex-1 w-full bg-slate-950 overflow-hidden cursor-crosshair"
        >
          {/* Top Header & Scoreboard */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-stone-900/90 border border-orange-500/50 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-orange-950 border border-orange-400 flex items-center justify-center text-amber-300">
                🏀
              </div>
              <div>
                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                  FUO Basketball Arena • Shooting Challenge
                </div>
                <div className="text-xs font-black text-white">
                  5-Shot Free Throw Contest
                </div>
              </div>
            </div>

            {/* Scoreboard Pill */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-stone-900/90 border border-orange-400/80 rounded-2xl px-4 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-3 font-mono text-xs font-bold">
                <div>
                  <span className="text-stone-400">ATTEMPT: </span>
                  <span className="text-white">{Math.min(5, shotsTaken + 1)} / 5</span>
                </div>
                <div className="w-px h-4 bg-stone-700" />
                <div>
                  <span className="text-stone-400">BASKETS: </span>
                  <span className="text-orange-400">{basketsMade} / 5</span>
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

          {/* Shot History Dots */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-2">
            {[0, 1, 2, 3, 4].map((idx) => {
              const res = shotHistory[idx];
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shadow-md ${
                    res === 'made'
                      ? 'bg-orange-500 border-white text-stone-950'
                      : res === 'miss'
                      ? 'bg-red-600 border-white text-white'
                      : 'bg-stone-900/80 border-stone-600 text-stone-500'
                  }`}
                >
                  {res === 'made' ? '✓' : res === 'miss' ? '✕' : idx + 1}
                </div>
              );
            })}
          </div>

          {/* Aim Prompt */}
          {!isShooting && !isComplete && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-stone-950/85 border border-orange-400/80 rounded-2xl px-5 py-2.5 shadow-2xl backdrop-blur-md text-center">
                <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2 justify-center">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span>Aim with Mouse • Click to Release Jumpshot!</span>
                </div>
                <div className="text-[10px] text-stone-300 mt-0.5">
                  Target directly through the cylinder for a clean swish!
                </div>
              </div>
            </div>
          )}

          {/* Shot Feedback */}
          {shotFeedback && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in zoom-in-75 duration-200">
              <div className="bg-stone-950/95 border-2 border-orange-400 text-amber-300 font-black text-base sm:text-lg px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
                {shotFeedback}
              </div>
            </div>
          )}

          {/* Final Results Modal */}
          {isComplete && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-stone-900 border-2 border-orange-500 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-950 border-2 border-orange-400 mx-auto flex items-center justify-center text-amber-400 shadow-xl">
                  <Trophy className="w-9 h-9" />
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                    Shooting Drill Concluded
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {basketsMade >= 4
                      ? 'Sharpshooter Status! 🏆'
                      : basketsMade >= 2
                      ? 'Good Shooting Form! 🥈'
                      : 'Drill Completed! 🏀'}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    You knocked down <span className="font-black text-orange-400 text-sm">{basketsMade}</span> out of 5 shots on the university basketball court!
                  </p>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-2 bg-stone-800/80 p-3 rounded-2xl border border-stone-700 text-xs">
                  <div>
                    <div className="text-stone-400 text-[10px] font-semibold">Baskets Made</div>
                    <div className="text-orange-400 font-black text-lg">{basketsMade} / 5</div>
                  </div>
                  <div>
                    <div className="text-stone-400 text-[10px] font-semibold">Athletic XP Earned</div>
                    <div className="text-amber-300 font-black text-lg">+{50 + basketsMade * 50} XP</div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black py-3 px-4 rounded-2xl shadow-lg border border-orange-400 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition transform hover:scale-[1.02]"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-300" />
                    <span>Play Another 5-Shot Drill</span>
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
