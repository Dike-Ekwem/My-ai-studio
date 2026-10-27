import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import {
  Award,
  Sparkles,
  FileText,
  CheckCircle2,
  X,
  Building2,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface SenateInteriorSceneProps {
  player: PlayerState;
  onClose: () => void;
}

export const SenateInteriorScene: React.FC<SenateInteriorSceneProps> = ({
  player,
  onClose
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
    camera.position.set(0, 4.2, 9.5);
    camera.lookAt(0, 2.0, -3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Marble Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 28),
      new THREE.MeshLambertMaterial({ color: '#334155' })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Marble Columns
    const colMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' });
    [-7, -2.5, 2.5, 7].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 9, 20), colMat);
      col.position.set(cx, 4.5, -4);
      scene.add(col);
    });

    // Reception Counter Desk
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1.6, 1.8),
      new THREE.MeshLambertMaterial({ color: '#0f172a' })
    );
    desk.position.set(0, 0.8, -2.5);
    scene.add(desk);

    // Gold Coat of Arms Crest
    const crest = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 0.1, 24),
      new THREE.MeshLambertMaterial({ color: '#f59e0b' })
    );
    crest.rotation.x = Math.PI / 2;
    crest.position.set(0, 5.5, -7.5);
    scene.add(crest);

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.7);
    scene.add(ambientLight);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      camera.position.x = Math.sin(time * 0.2) * 0.5;
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

  const handleVerifyClearance = () => {
    sounds.playNotification();
    setFeedback(`Matriculation clearance fully verified for ${player.name} (${player.matricNo}). All academic files cleared!`);
  };

  const handleCalendar = () => {
    sounds.playClick();
    setFeedback('First Semester Examination commences in 8 weeks. Revision timetable on track.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-stone-900 border-2 border-amber-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        <div ref={mountRef} className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-stone-900/90 border border-amber-500/50 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-950 border border-amber-400 flex items-center justify-center text-amber-300">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Senate Tower & Academic Registry
                </div>
                <div className="text-xs font-black text-white">
                  Office of the Registrar & Student Affairs
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
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-amber-950/95 border border-amber-400 text-amber-200 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 max-w-md text-center">
              📜 {feedback}
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-10 pointer-events-auto">
            <div className="bg-stone-950/90 border border-amber-500/60 rounded-3xl p-4 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Official University Circulars & Registry Records
                  </span>
                </div>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  {player.matricNo}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleVerifyClearance}
                  className="bg-amber-900/80 hover:bg-amber-800 border border-amber-500/80 p-3.5 rounded-2xl text-left transition flex items-center justify-between cursor-pointer group shadow"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-amber-300" />
                    <div>
                      <div className="text-xs font-black text-white">Verify Matriculation Clearance</div>
                      <div className="text-[10px] text-stone-300">Official student file endorsement</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={handleCalendar}
                  className="bg-stone-900/80 hover:bg-stone-800 border border-stone-700 p-3.5 rounded-2xl text-left transition flex items-center justify-between cursor-pointer group shadow"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-cyan-400" />
                    <div>
                      <div className="text-xs font-black text-white">Academic Calendar & Circulars</div>
                      <div className="text-[10px] text-stone-300">Semester examination schedules</div>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
