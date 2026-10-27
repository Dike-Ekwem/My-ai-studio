import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState, InventoryItem, BankTransaction } from '../../types/game';
import { CAMPUS_SERVICES, CampusService, ServiceAction } from '../../data/shops';
import { CampusPOI } from '../../data/campusLocations';
import { sounds } from '../../utils/audio';
import { formatNaira } from '../../utils/storage';
import {
  Scissors,
  Printer,
  Sparkles,
  Shirt,
  Smartphone,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  ArrowRight
} from 'lucide-react';

interface CampusServicesSceneProps {
  player: PlayerState;
  currentPOI: CampusPOI | null;
  onClose: () => void;
  onPerformService: (action: ServiceAction, service: CampusService) => void;
}

export const CampusServicesScene: React.FC<CampusServicesSceneProps> = ({
  player,
  currentPOI,
  onClose,
  onPerformService
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [activeActionInProgress, setActiveActionInProgress] = useState<ServiceAction | null>(null);

  // Match the service definition from POI ID
  const serviceId = currentPOI?.id || 'service_cybercafe';
  const service: CampusService =
    CAMPUS_SERVICES.find((s) => s.id === serviceId) || CAMPUS_SERVICES[0];

  // Business Hours Logic
  // Check whether the shop is currently open based on player.timeOfDay
  const currentMinutes = player.timeOfDay % 1440;
  const isOpen = currentMinutes >= service.openTime && currentMinutes < service.closeTime;

  const formatClockTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  // 3D Themed Interior Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 1.5, -2.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshLambertMaterial({
      color:
        service.categoryType === 'barber' ? '#292524' :
        service.categoryType === 'laundry' ? '#0e7490' :
        service.categoryType === 'phone_gadgets' ? '#3b0764' :
        service.categoryType === 'minimart' ? '#14532d' :
        '#1e293b'
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Back Wall
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(20, 8, 1),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    wall.position.set(0, 4, -5);
    scene.add(wall);

    // Main Service Counter / Workstation
    const counterMat = new THREE.MeshLambertMaterial({ color: '#334155' });
    const mainDesk = new THREE.Mesh(new THREE.BoxGeometry(8, 1.4, 2), counterMat);
    mainDesk.position.set(0, 0.7, -1.8);
    scene.add(mainDesk);

    // Themed Props inside the 3D viewport
    if (service.categoryType === 'barber') {
      // Barber Chair
      const chairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.3, 16), new THREE.MeshLambertMaterial({ color: '#facc15' }));
      chairBase.position.set(0, 0.15, -0.2);
      scene.add(chairBase);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), new THREE.MeshLambertMaterial({ color: '#dc2626' }));
      seat.position.set(0, 0.8, -0.2);
      scene.add(seat);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.25), new THREE.MeshLambertMaterial({ color: '#dc2626' }));
      backrest.position.set(0, 1.5, -0.75);
      scene.add(backrest);

      // Barber Rotating Pole Accent
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.2, 12), new THREE.MeshLambertMaterial({ color: '#f8fafc' }));
      pole.position.set(4, 2.2, -4);
      scene.add(pole);
    } else if (service.categoryType === 'laundry') {
      // Washing Machines Lineup
      [-2.4, 0, 2.4].forEach((wx) => {
        const washer = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 1.6), new THREE.MeshLambertMaterial({ color: '#f8fafc' }));
        washer.position.set(wx, 1.0, -3.8);
        scene.add(washer);

        const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16), new THREE.MeshLambertMaterial({ color: '#0284c7' }));
        drum.rotation.x = Math.PI / 2;
        drum.position.set(wx, 1.1, -2.95);
        scene.add(drum);
      });
    } else if (service.categoryType === 'printing') {
      // Heavy Xerox Photocopier & Dual Monitors
      const xerox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 1.8), new THREE.MeshLambertMaterial({ color: '#f1f5f9' }));
      xerox.position.set(-2.8, 0.9, -1.8);
      scene.add(xerox);

      [-0.8, 1.2].forEach((mx) => {
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.1), new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
        monitor.position.set(mx, 1.9, -1.8);
        scene.add(monitor);
      });
    } else if (service.categoryType === 'phone_gadgets') {
      // Glass Display Showcase with Power banks & Phones
      const glassCase = new THREE.Mesh(
        new THREE.BoxGeometry(7.6, 0.9, 1.8),
        new THREE.MeshLambertMaterial({ color: '#c084fc', transparent: true, opacity: 0.65 })
      );
      glassCase.position.set(0, 1.85, -1.8);
      scene.add(glassCase);
    } else {
      // Mini-Mart Shelves & Drinks Cooler
      const cooler = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.4, 1.6), new THREE.MeshBasicMaterial({ color: '#34d399' }));
      cooler.position.set(-3.5, 1.7, -3.8);
      scene.add(cooler);
    }

    // Warm Room Ambience Light
    const ambientLight = new THREE.AmbientLight('#fef08a', 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight('#f59e0b', 1.8, 14);
    pointLight.position.set(0, 4.5, 2);
    scene.add(pointLight);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      camera.position.x = Math.sin(time * 0.2) * 0.4;
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
  }, [serviceId]);

  const handleExecuteService = (action: ServiceAction) => {
    sounds.playClick();
    if (!isOpen) {
      setErrorToast(`Store is currently CLOSED! Operating hours are ${formatClockTime(service.openTime)} to ${formatClockTime(service.closeTime)}.`);
      setTimeout(() => setErrorToast(null), 3500);
      return;
    }

    if (player.balance < action.price) {
      setErrorToast(`Insufficient Omo-Pay balance! You need ${formatNaira(action.price)} to access this service.`);
      setTimeout(() => setErrorToast(null), 3500);
      return;
    }

    setActiveActionInProgress(action);

    setTimeout(() => {
      sounds.playCashPing();
      onPerformService(action, service);
      setActiveActionInProgress(null);
      setSuccessToast(`Service Completed: ${action.name}! (Duration: ${action.durationMinutes} mins)`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-stone-900 border-2 border-emerald-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* 3D Service Shop Viewport */}
        <div ref={mountRef} className="relative h-56 sm:h-64 w-full bg-slate-950 overflow-hidden shrink-0">
          
          {/* Header Controls */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-stone-900/90 border border-emerald-500/50 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
              <span className="text-2xl">{service.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Student Village Service • {service.serviceTitle}
                </div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {service.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-stone-900/90 border border-amber-400/80 rounded-2xl px-3 py-1 text-xs font-mono font-bold text-amber-300 shadow backdrop-blur-md">
                Wallet: {formatNaira(player.balance)}
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

          {/* Business Status Badge on Viewport */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow backdrop-blur-md flex items-center gap-1.5 border ${
                isOpen
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 animate-pulse'
                  : 'bg-red-950/90 text-red-300 border-red-500/80'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isOpen ? 'OPEN FOR BUSINESS' : 'CURRENTLY CLOSED'}</span>
              <span className="text-stone-300 font-mono text-[10px] normal-case">
                ({formatClockTime(service.openTime)} - {formatClockTime(service.closeTime)})
              </span>
            </span>
          </div>

          {/* Success Toast */}
          {successToast && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-emerald-950/95 border border-emerald-400 text-emerald-200 px-5 py-2 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 max-w-md text-center">
              ✨ {successToast}
            </div>
          )}

          {/* Error Toast */}
          {errorToast && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-rose-950/95 border border-rose-500 text-rose-200 px-5 py-2 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 max-w-md text-center">
              ⚠️ {errorToast}
            </div>
          )}
        </div>

        {/* Action Services Selection List */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-stone-900/95">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wider">
                Available Services & Instant Purchases
              </div>
              <div className="text-[11px] text-stone-400 italic">
                "{service.tagline}"
              </div>
            </div>
            <div className="text-[11px] text-stone-300 font-mono font-bold">
              Time on Campus: {formatClockTime(currentMinutes)}
            </div>
          </div>

          {!isOpen && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold">This store is closed right now.</span>
                <p className="text-[11px] text-stone-300">
                  Business hours are {formatClockTime(service.openTime)} to {formatClockTime(service.closeTime)}. You can return during opening hours or explore other open stores in the Student Village!
                </p>
              </div>
            </div>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {service.actions.map((act) => (
              <div
                key={act.id}
                className="bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 hover:border-emerald-500/60 rounded-2xl p-4 transition flex flex-col justify-between shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-stone-900 border border-stone-700">
                        {act.icon}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                          {act.name}
                        </h4>
                        <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{act.durationMinutes} mins</span>
                          {act.effect.stamina !== undefined && (
                            <span>• Stamina {act.effect.stamina > 0 ? `+${act.effect.stamina}` : act.effect.stamina}%</span>
                          )}
                          {act.effect.studyBoost !== undefined && (
                            <span>• Study +{act.effect.studyBoost}%</span>
                          )}
                          {act.effect.reputationXP !== undefined && (
                            <span>• Rep +{act.effect.reputationXP} XP</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-2.5 leading-snug">
                    {act.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-stone-700/60 flex items-center justify-between">
                  <span className="text-sm font-mono font-black text-amber-300">
                    {formatNaira(act.price)}
                  </span>

                  <button
                    type="button"
                    disabled={!isOpen || activeActionInProgress !== null}
                    onClick={() => handleExecuteService(act)}
                    className={`font-bold px-4 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95 ${
                      !isOpen
                        ? 'bg-stone-700 text-stone-400 cursor-not-allowed opacity-50'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{activeActionInProgress?.id === act.id ? 'Processing...' : 'Request Service'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
