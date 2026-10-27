import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { CampusPOI, CAMPUS_POIS } from '../../data/campusLocations';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { createMonopolyHead } from '../game3d/monopolyFace';
import {
  Bus,
  Car,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
  CreditCard,
  Sparkles
} from 'lucide-react';

interface TransportCutscene3DProps {
  player: PlayerState;
  currentPOI: CampusPOI | null;
  onClose: () => void;
  onStartRide: (destination: CampusPOI, fare: number, vehicleType: 'keke' | 'shuttle') => void;
  onOpenOffCampus?: () => void;
}

export const TransportCutscene3D: React.FC<TransportCutscene3DProps> = ({
  player,
  currentPOI,
  onClose,
  onStartRide,
  onOpenOffCampus
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [vehicleType, setVehicleType] = useState<'keke' | 'shuttle'>('keke');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('fac_eng');
  const [driverDialogue, setDriverDialogue] = useState<string>(
    'Keke Conductor (Baba Yellow): "Wuse, Berger, Faculty Quadrangle, Gate! Enter with your ₦100 or ₦150 exact change o! No ₦1,000 note this morning!"'
  );

  // Available destination terminals across campus
  const destinations = CAMPUS_POIS.filter(
    (poi) =>
      poi.id !== currentPOI?.id &&
      (poi.category === 'academic' ||
        poi.category === 'residential' ||
        poi.category === 'commercial' ||
        poi.category === 'recreation' ||
        poi.category === 'transport')
  );

  const selectedDest = destinations.find((d) => d.id === selectedDestinationId) || destinations[0];
  const fare = vehicleType === 'keke' ? 100 : 150;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#38bdf8');
    scene.fog = new THREE.FogExp2('#38bdf8', 0.012);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.4, 8.5);
    camera.lookAt(0, 1.2, -1.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Sunlight
    const ambient = new THREE.AmbientLight('#ffffff', 0.9);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight('#fffbeb', 1.4);
    sun.position.set(15, 25, 18);
    sun.castShadow = true;
    scene.add(sun);

    // Terminal Asphalt & Sidewalk Curb
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 14),
      new THREE.MeshLambertMaterial({ color: '#334155' })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, 1);
    road.receiveShadow = true;
    scene.add(road);

    const sidewalk = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 8),
      new THREE.MeshLambertMaterial({ color: '#cbd5e1' })
    );
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(0, 0.12, -4.5);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    // Terminal Canopy Shelter
    const shelter = new THREE.Group();
    shelter.position.set(-2, 0, -4.5);

    const canopyPoles = [
      [-3, -1.5], [3, -1.5], [-3, 1.5], [3, 1.5]
    ];
    canopyPoles.forEach(([px, pz]) => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8),
        new THREE.MeshLambertMaterial({ color: '#171717' })
      );
      pole.position.set(px, 1.6, pz);
      shelter.add(pole);
    });

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(6.6, 0.2, 3.6),
      new THREE.MeshLambertMaterial({ color: '#15803d' })
    );
    roof.position.set(0, 3.2, 0);
    shelter.add(roof);
    scene.add(shelter);

    // 1. KEKE NAPEP 3D MODEL ON THE ROAD
    const kekeGroup = new THREE.Group();
    kekeGroup.position.set(-3.2, 0, 1.2);
    kekeGroup.rotation.y = 0.2;

    const cabinMat = new THREE.MeshLambertMaterial({ color: '#facc15' });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.5, 1.5), cabinMat);
    cabin.position.set(0.1, 1.05, 0);
    kekeGroup.add(cabin);

    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.9, 1.3),
      new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.7 })
    );
    windshield.position.set(1.0, 1.65, 0);
    kekeGroup.add(windshield);

    // Keke 3 Wheels
    const tireMat = new THREE.MeshLambertMaterial({ color: '#18181b' });
    const wheelF = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 12), tireMat);
    wheelF.rotation.z = Math.PI / 2;
    wheelF.position.set(1.15, 0.32, 0);
    kekeGroup.add(wheelF);

    [-0.7, 0.7].forEach((wz) => {
      const wheelR = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12), tireMat);
      wheelR.rotation.z = Math.PI / 2;
      wheelR.position.set(-0.85, 0.35, wz);
      kekeGroup.add(wheelR);
    });

    scene.add(kekeGroup);

    // 2. CHARACTERS: Keke Driver & Player Student
    const createCharacter = (shirt: string, pants: string, variant: any) => {
      const char = new THREE.Group();
      const legs = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.95, 0.3),
        new THREE.MeshLambertMaterial({ color: pants })
      );
      legs.position.y = 0.48;
      char.add(legs);

      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.1, 0.42),
        new THREE.MeshLambertMaterial({ color: shirt })
      );
      torso.position.y = 1.45;
      char.add(torso);

      const head = createMonopolyHead(variant);
      head.position.y = 2.25;
      char.add(head);

      return char;
    };

    // Driver in orange polo & conductor cap
    const driver = createCharacter('#ea580c', '#1e293b', 'npc_walrus');
    driver.position.set(-1.2, 0.12, 0.2);
    driver.rotation.y = -0.4;
    scene.add(driver);

    // Student (Player) standing on sidewalk
    const student = createCharacter('#047857', '#1e293b', 'student');
    student.position.set(1.5, 0.12, -2.2);
    student.rotation.y = -0.3;
    scene.add(student);

    // Subtle gentle camera animation
    let animId: number;
    let t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.015;
      camera.position.x = Math.sin(t * 0.4) * 0.3;
      camera.position.y = 2.4 + Math.cos(t * 0.5) * 0.08;
      camera.lookAt(0, 1.2, -1.0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleConfirmRide = () => {
    if (player.balance < fare) {
      sounds.playClick();
      setDriverDialogue(`Driver: "Ah, my student! Your Omo-Pay balance is too low o! Fare is ${formatNaira(fare)}!"`);
      return;
    }

    sounds.playKekeHorn();
    onStartRide(selectedDest, fare, vehicleType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full h-[88vh] bg-stone-900 border-2 border-amber-500 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col justify-between">
        {/* TOP HEADER */}
        <div className="relative z-20 px-4 py-3 bg-stone-950/80 border-b border-amber-900/60 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950 border border-amber-500/50 rounded-xl text-amber-400">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400">
                FUO Campus Shuttle & Keke Park
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {currentPOI?.name || 'Transport Terminal'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Balance</div>
              <div className="text-xs font-mono font-bold text-white">{formatNaira(player.balance)}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D CANVAS VIEWPORT */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* DOCKED BOTTOM CINEMATIC DIALOGUE & ROUTE CONTROLS (NO HEAD OVERLAP) */}
        <div className="relative z-30 p-3 sm:p-5 pointer-events-auto bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent pt-6">
          <div className="bg-stone-900/95 border-2 border-amber-500/70 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3">
            {/* Conductor Dialogue */}
            <div className="text-xs sm:text-sm text-stone-100 font-medium leading-relaxed italic border-l-2 border-amber-400 pl-3">
              "{driverDialogue}"
            </div>

            {/* Vehicle Mode Toggle & Destination Picker */}
            <div className="pt-2 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setVehicleType('keke');
                    setDriverDialogue('Keke Conductor: "Express Keke straight to your faculty! Enter fast let\'s move!"');
                  }}
                  className={`flex-1 p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                    vehicleType === 'keke'
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Keke Napep (₦100)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setVehicleType('shuttle');
                    setDriverDialogue('Shuttle Driver: "Campus Coaster Bus! AC is working and radio is on! Taking off now!"');
                  }}
                  className={`flex-1 p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                    vehicleType === 'shuttle'
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  <Bus className="w-4 h-4" />
                  <span>Shuttle Bus (₦150)</span>
                </button>
              </div>

              {/* Destination Selector & Board Button */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedDestinationId}
                  onChange={(e) => {
                    sounds.playClick();
                    setSelectedDestinationId(e.target.value);
                  }}
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-amber-200 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.id} className="bg-stone-900 text-white">
                      {dest.name} ({dest.category})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleConfirmRide}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer shrink-0"
                >
                  <span>Board ({formatNaira(fare)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {onOpenOffCampus && (
                <div className="col-span-full pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onOpenOffCampus();
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow border border-amber-400/50 cursor-pointer transition transform hover:scale-[1.01]"
                  >
                    <span>🌆 Transit to Off-Campus Districts (Ojuelegba Market • Yaba Tech Arts • Outer Lodges)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
