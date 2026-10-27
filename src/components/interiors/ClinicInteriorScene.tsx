import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Activity,
  Heart,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  Stethoscope,
  Pill
} from 'lucide-react';

interface ClinicInteriorSceneProps {
  player: PlayerState;
  onClose: () => void;
  onRestoreHealth: () => void;
}

export const ClinicInteriorScene: React.FC<ClinicInteriorSceneProps> = ({
  player,
  onClose,
  onRestoreHealth
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 3.8, 8.5);
    camera.lookAt(0, 1.8, -2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Clean Hospital White Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshLambertMaterial({ color: '#f1f5f9' })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Walls
    const wallMat = new THREE.MeshLambertMaterial({ color: '#e2e8f0' });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 10, 1), wallMat);
    backWall.position.set(0, 5, -6);
    scene.add(backWall);

    // Red Cross Medical Insignia on Wall
    const redCrossH = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.1), new THREE.MeshLambertMaterial({ color: '#dc2626' }));
    redCrossH.position.set(0, 5.5, -5.4);
    scene.add(redCrossH);

    const redCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.1), new THREE.MeshLambertMaterial({ color: '#dc2626' }));
    redCrossV.position.set(0, 5.5, -5.4);
    scene.add(redCrossV);

    // Doctor's Desk
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 1.5, 1.8),
      new THREE.MeshLambertMaterial({ color: '#64748b' })
    );
    desk.position.set(-2, 0.75, -2);
    scene.add(desk);

    // Doctor NPC in White Lab Coat
    const docGroup = new THREE.Group();
    docGroup.position.set(-2, 0, -3.2);

    const docTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.2, 0.45),
      new THREE.MeshLambertMaterial({ color: '#ffffff' }) // White coat
    );
    docTorso.position.y = 1.4;
    docGroup.add(docTorso);

    const docHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshLambertMaterial({ color: '#5d4037' })
    );
    docHead.position.set(0, 2.2, 0);
    docGroup.add(docHead);

    scene.add(docGroup);

    // Examination Couch / Bed
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.1, 4.5),
      new THREE.MeshLambertMaterial({ color: '#0284c7' })
    );
    bed.position.set(4, 0.55, -1.5);
    scene.add(bed);

    // Lighting
    const brightLight = new THREE.DirectionalLight('#ffffff', 1.2);
    brightLight.position.set(4, 10, 6);
    scene.add(brightLight);

    const ambient = new THREE.AmbientLight('#ffffff', 0.6);
    scene.add(ambient);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
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
  }, []);

  const handleConsultDoctor = () => {
    sounds.playCheer();
    onRestoreHealth();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setFeedback('Doctor examination complete! Full medical clearance issued. Stamina restored to 100%!');
  };

  const handleVitamins = () => {
    sounds.playClick();
    setFeedback('Received daily Vitamin C & B-Complex tablets from the dispensary. Fatigue minimized!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-stone-900 border-2 border-cyan-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        <div ref={mountRef} className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-stone-900/90 border border-cyan-500/50 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Campus Health Services • Medical Ward
                </div>
                <div className="text-xs font-black text-white">
                  FUO University Health Centre & Dispensary
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="pointer-events-auto p-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white cursor-pointer shadow-lg backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {feedback && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-cyan-950/95 border border-cyan-400 text-cyan-200 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 max-w-md text-center">
              🩺 {feedback}
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-10 pointer-events-auto">
            <div className="bg-stone-950/90 border border-cyan-500/60 rounded-3xl p-4 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Medical Doctor Consultation & Triage
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">
                  Current Stamina: {Math.round(player.stamina)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleConsultDoctor}
                  className="bg-cyan-900/80 hover:bg-cyan-800 border border-cyan-500/80 p-3.5 rounded-2xl text-left transition flex items-center justify-between cursor-pointer group shadow"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-400 fill-red-400" />
                    <div>
                      <div className="text-xs font-black text-white">Full Medical Treatment</div>
                      <div className="text-[10px] text-stone-300">Restores stamina to 100% and cures fatigue</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-1 rounded font-bold border border-cyan-700">
                    Heal 100%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleVitamins}
                  className="bg-stone-900/80 hover:bg-stone-800 border border-stone-700 p-3.5 rounded-2xl text-left transition flex items-center justify-between cursor-pointer group shadow"
                >
                  <div className="flex items-center gap-3">
                    <Pill className="w-6 h-6 text-amber-400" />
                    <div>
                      <div className="text-xs font-black text-white">Collect Free Multivitamins</div>
                      <div className="text-[10px] text-stone-300">University dispensary health boost</div>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
