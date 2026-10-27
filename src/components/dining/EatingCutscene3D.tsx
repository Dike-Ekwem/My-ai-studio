import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import { formatNaira } from '../../utils/storage';
import { Utensils, Sparkles, Heart, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EatingCutscene3DProps {
  player: PlayerState;
  meal: {
    name: string;
    price: number;
    effect?: { hunger?: number; stamina?: number };
  };
  vendorName: string;
  onComplete: () => void;
}

export const EatingCutscene3D: React.FC<EatingCutscene3DProps> = ({
  player,
  meal,
  vendorName,
  onComplete
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [bitesLeft, setBitesLeft] = useState<number>(4);
  const [biteMessage, setBiteMessage] = useState<string>('The aroma is mouth-watering! Take your first bite.');
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [simulatedHunger, setSimulatedHunger] = useState<number>(player.hunger);
  const [simulatedStamina, setSimulatedStamina] = useState<number>(player.stamina);

  const hungerDropPerBite = Math.round((meal.effect?.hunger ? Math.abs(meal.effect.hunger) : 40) / 4);
  const staminaGainPerBite = Math.round((meal.effect?.stamina || 35) / 4);

  // 3D Scene Refs
  const characterHeadRef = useRef<THREE.Group | null>(null);
  const foodPlateRef = useRef<THREE.Group | null>(null);
  const rightHandRef = useRef<THREE.Mesh | null>(null);
  const steamParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1c1917');
    scene.fog = new THREE.FogExp2('#1c1917', 0.045);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 1.45, 2.3);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight('#fef3c7', 0.9);
    scene.add(ambientLight);

    const warmCeilingLight = new THREE.PointLight('#f59e0b', 2.2, 12);
    warmCeilingLight.position.set(0, 3.2, 0.6);
    warmCeilingLight.castShadow = true;
    scene.add(warmCeilingLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.7);
    rimLight.position.set(-2, 2.5, -1);
    scene.add(rimLight);

    // 3. Bukka Room Interior & Table
    // Tiled Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#292524',
      roughness: 0.6,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back Wall with African motifs & Chalkboard
    const backWallGeo = new THREE.PlaneGeometry(16, 6);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: '#44403c',
      roughness: 0.8
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 3, -2.5);
    scene.add(backWall);

    // Dining Table (Warm Polished Mahogany Wood)
    const tableTopGeo = new THREE.BoxGeometry(1.6, 0.08, 0.9);
    const tableMat = new THREE.MeshStandardMaterial({
      color: '#78350f',
      roughness: 0.4,
      metalness: 0.1
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.set(0, 0.76, 0.4);
    tableTop.receiveShadow = true;
    tableTop.castShadow = true;
    scene.add(tableTop);

    // Table Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.76, 12);
    const legMat = new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.7 });
    [
      [-0.7, 0.38, 0.1],
      [0.7, 0.38, 0.1],
      [-0.7, 0.38, 0.7],
      [0.7, 0.38, 0.7]
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, ly, lz);
      scene.add(leg);
    });

    // 4. Player Character (Seated at Table)
    const charGroup = new THREE.Group();
    charGroup.position.set(0, 0, -0.15); // Behind the table facing camera

    // Torso (wearing student attire)
    const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.3);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: player.customization?.shirtColor || '#059669',
      roughness: 0.6
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.9, 0);
    torso.castShadow = true;
    charGroup.add(torso);

    // Student ID Tag / Lanyard around neck
    const lanyardGeo = new THREE.BoxGeometry(0.08, 0.12, 0.02);
    const lanyardMat = new THREE.MeshStandardMaterial({ color: '#facc15' });
    const lanyard = new THREE.Mesh(lanyardGeo, lanyardMat);
    lanyard.position.set(0, 0.85, 0.16);
    charGroup.add(lanyard);

    // Character Head Group (Nodding / Chewing)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.4, 0);

    const headGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const skinMat = new THREE.MeshStandardMaterial({ color: '#8d5524', roughness: 0.7 });
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.23, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: '#171717', roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.04;
    headGroup.add(hair);

    // Student Cap or Fresh Cut
    const eyesMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const pupilMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
    
    // Eyes
    [-0.07, 0.07].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), eyesMat);
      eye.position.set(ex, 0.02, 0.2);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), pupilMat);
      pupil.position.set(ex, 0.02, 0.23);
      headGroup.add(eye);
      headGroup.add(pupil);
    });

    // Cheerful Smile Mouth
    const smileGeo = new THREE.TorusGeometry(0.045, 0.012, 8, 16, Math.PI);
    const smileMat = new THREE.MeshBasicMaterial({ color: '#451a03' });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.rotation.x = Math.PI;
    smile.position.set(0, -0.09, 0.2);
    headGroup.add(smile);

    charGroup.add(headGroup);
    characterHeadRef.current = headGroup;

    // Right Arm & Fork / Spoon
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12);
    const armMat = new THREE.MeshStandardMaterial({ color: '#8d5524', roughness: 0.7 });
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.35, 0.85, 0.25);
    rightArm.rotation.set(-0.8, 0, 0.4);
    charGroup.add(rightArm);
    rightHandRef.current = rightArm;

    scene.add(charGroup);

    // 5. Steaming 3D Food Plate
    const foodGroup = new THREE.Group();
    foodGroup.position.set(0, 0.81, 0.38);

    // Ceramic Plate
    const plateGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.04, 32);
    const plateMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.2,
      metalness: 0.1
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.castShadow = true;
    plate.receiveShadow = true;
    foodGroup.add(plate);

    // Distinct Food Mound based on item name
    const mealLower = meal.name.toLowerCase();
    
    if (mealLower.includes('jollof') || mealLower.includes('rice')) {
      // Mountain of Red Jollof Rice
      const riceGeo = new THREE.ConeGeometry(0.18, 0.1, 24);
      const riceMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.8 });
      const riceMound = new THREE.Mesh(riceGeo, riceMat);
      riceMound.position.set(-0.04, 0.06, 0.02);
      foodGroup.add(riceMound);

      // Fried Plantain Dodo (Golden Yellow crescents)
      const dodoGeo = new THREE.BoxGeometry(0.07, 0.025, 0.04);
      const dodoMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4 });
      [
        [0.08, 0.04, -0.06, 0.3],
        [0.09, 0.04, 0.02, -0.2],
        [0.07, 0.04, 0.08, 0.6]
      ].forEach(([dx, dy, dz, rot]) => {
        const dodo = new THREE.Mesh(dodoGeo, dodoMat);
        dodo.position.set(dx, dy, dz);
        dodo.rotation.y = rot;
        foodGroup.add(dodo);
      });

      // Roasted Chicken Drumstick
      const chickenGeo = new THREE.CylinderGeometry(0.04, 0.025, 0.14, 12);
      const chickenMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.5 });
      const chicken = new THREE.Mesh(chickenGeo, chickenMat);
      chicken.position.set(-0.08, 0.06, -0.06);
      chicken.rotation.set(0.5, 0.4, 0.8);
      foodGroup.add(chicken);
    } else if (mealLower.includes('yam') || mealLower.includes('swallow') || mealLower.includes('egusi') || mealLower.includes('eba')) {
      // Pounded Yam Swirl
      const swallowGeo = new THREE.SphereGeometry(0.12, 24, 16);
      const swallowMat = new THREE.MeshStandardMaterial({ color: '#fefce8', roughness: 0.3 });
      const swallow = new THREE.Mesh(swallowGeo, swallowMat);
      swallow.scale.set(1.1, 0.7, 1);
      swallow.position.set(-0.06, 0.06, 0);
      foodGroup.add(swallow);

      // Rich Egusi & Vegetable Soup Mound
      const soupGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.05, 20);
      const soupMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.5 });
      const soup = new THREE.Mesh(soupGeo, soupMat);
      soup.position.set(0.07, 0.04, 0);
      foodGroup.add(soup);
    } else if (mealLower.includes('pie') || mealLower.includes('snack') || mealLower.includes('doughnut') || mealLower.includes('puff')) {
      // Golden Baked Pastries
      const pastryGeo = new THREE.CylinderGeometry(0.1, 0.11, 0.06, 24);
      const pastryMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.4 });
      const pastry = new THREE.Mesh(pastryGeo, pastryMat);
      pastry.position.set(0, 0.05, 0);
      foodGroup.add(pastry);
    } else {
      // General Campus Delicious Plate (Indomie / Shawarma / Suya)
      const suyaGeo = new THREE.BoxGeometry(0.18, 0.04, 0.12);
      const suyaMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.6 });
      const suya = new THREE.Mesh(suyaGeo, suyaMat);
      suya.position.set(0, 0.04, 0);
      foodGroup.add(suya);

      // Onions & Sliced Peppers
      const pepperGeo = new THREE.TorusGeometry(0.04, 0.01, 8, 16);
      const pepperMat = new THREE.MeshStandardMaterial({ color: '#dc2626' });
      const pepper = new THREE.Mesh(pepperGeo, pepperMat);
      pepper.rotation.x = Math.PI / 2;
      pepper.position.set(0.02, 0.07, 0.02);
      foodGroup.add(pepper);
    }

    // Chilled Beverage Bottle (Zobo or Malt)
    const bottleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16);
    const bottleMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      transparent: true,
      opacity: 0.85,
      roughness: 0.1
    });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.set(0.36, 0.11, 0.05);
    foodGroup.add(bottle);

    scene.add(foodGroup);
    foodPlateRef.current = foodGroup;

    // 6. Steaming Smoke Particle Effect
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.18;
      positions[i * 3 + 1] = Math.random() * 0.35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.18;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const steamPoints = new THREE.Points(particleGeo, particleMat);
    steamPoints.position.set(0, 0.88, 0.38);
    scene.add(steamPoints);
    steamParticlesRef.current = steamPoints;

    // 7. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Subtle breathing & head chewing bob
      if (characterHeadRef.current) {
        characterHeadRef.current.position.y = 1.4 + Math.sin(time * 3) * 0.015;
        characterHeadRef.current.rotation.x = Math.sin(time * 3.5) * 0.04;
      }

      // Hand subtle motion
      if (rightHandRef.current) {
        rightHandRef.current.position.y = 0.85 + Math.sin(time * 2.5) * 0.02;
      }

      // Animate Steaming Smoke Particles upwards
      if (steamParticlesRef.current) {
        const posAttr = steamParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] += 0.003; // rise up
          arr[i * 3] += Math.sin(time * 2 + i) * 0.0006;
          if (arr[i * 3 + 1] > 0.45) {
            arr[i * 3 + 1] = 0;
            arr[i * 3] = (Math.random() - 0.5) * 0.15;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Gentle camera sway
      camera.position.x = Math.sin(time * 0.4) * 0.08;
      camera.position.y = 1.45 + Math.cos(time * 0.5) * 0.02;
      camera.lookAt(0, 0.95, 0.15);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
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
  }, [meal]);

  // Handle Taking a Bite
  const handleTakeBite = () => {
    if (bitesLeft <= 0 || isFinished) return;

    sounds.playClick();
    
    // Animate head chew
    if (characterHeadRef.current) {
      characterHeadRef.current.rotation.x = 0.15;
      setTimeout(() => {
        if (characterHeadRef.current) characterHeadRef.current.rotation.x = -0.05;
      }, 150);
      setTimeout(() => {
        if (characterHeadRef.current) characterHeadRef.current.rotation.x = 0;
      }, 300);
    }

    const nextBites = bitesLeft - 1;
    setBitesLeft(nextBites);

    // Update simulated stats
    const newHunger = Math.max(0, simulatedHunger - hungerDropPerBite);
    const newStamina = Math.min(100, simulatedStamina + staminaGainPerBite);
    setSimulatedHunger(newHunger);
    setSimulatedStamina(newStamina);

    // Nigerian student cheerful reaction quotes
    const reactions = [
      `Mmm! That first bite hits the spot! Sweet spicy flavour!`,
      `Omo! The meat is soft and well-seasoned! Mama didn't disappoint.`,
      `Chilled drink washing down the pepper smoothly! Energy rising!`,
      `Last bite wiped clean! Stomach is 100% full. Soul completely revived!`
    ];
    setBiteMessage(reactions[4 - nextBites - 1] || 'Delicious meal!');

    if (nextBites === 0) {
      setIsFinished(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
      sounds.playCashPing();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl bg-stone-900 border-2 border-amber-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3.5 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-600/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Eatery Dining Cutscene • {vendorName}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Enjoying: {meal.name}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/30">
              Paid {formatNaira(meal.price)}
            </span>
          </div>
        </div>

        {/* 3D Canvas Viewport */}
        <div ref={mountRef} className="relative w-full h-72 sm:h-96 bg-stone-950 overflow-hidden">
          {/* Subtle In-scene Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-stone-950/70" />

          {/* Bite Reaction Speech Bubble */}
          <div className="absolute top-4 inset-x-4 flex justify-center pointer-events-none z-10">
            <div className="bg-stone-900/90 border border-amber-500/80 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md max-w-md text-center animate-in zoom-in-95 duration-200">
              <p className="text-xs sm:text-sm font-bold text-amber-300">
                "{biteMessage}"
              </p>
            </div>
          </div>

          {/* Floating Needs Replenishment Indicator */}
          <div className="absolute bottom-3 left-3 bg-stone-900/85 border border-stone-700/80 rounded-2xl p-2.5 shadow-xl backdrop-blur-md flex items-center gap-3 pointer-events-none z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Heart className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>Hunger: {simulatedHunger}%</span>
            </div>
            <div className="w-0.5 h-4 bg-stone-700" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              <span>Stamina: {simulatedStamina}%</span>
            </div>
          </div>

          {/* Plate Clean Indicator */}
          {isFinished && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-20 animate-in fade-in">
              <div className="bg-stone-900 border-2 border-emerald-500 rounded-3xl p-6 text-center max-w-sm shadow-2xl space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white">Plate Wiped Clean!</h3>
                <p className="text-xs text-stone-300">
                  Meal completed! Your hunger has been satisfied, and your stamina is renewed for your campus activities.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onComplete();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition transform hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Step Outside to Campus</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Interactive Controls */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-300 flex items-center gap-2">
            <span className="font-bold text-amber-400">Bites remaining:</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((b) => (
                <div
                  key={b}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    b < bitesLeft
                      ? 'bg-amber-500 border-amber-300 shadow'
                      : 'bg-stone-800 border-stone-700 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isFinished ? (
              <button
                type="button"
                onClick={handleTakeBite}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                <span>Take a Big Bite ({bitesLeft} Left)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onComplete();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition cursor-pointer"
              >
                Finish & Step Outside
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onComplete();
              }}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
