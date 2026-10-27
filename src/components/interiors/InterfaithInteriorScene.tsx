import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  Award,
  Clock,
  X,
  Music,
  Smile,
  ShieldCheck
} from 'lucide-react';

interface InterfaithInteriorSceneProps {
  player: PlayerState;
  onClose: () => void;
  onPray: () => void;
}

export const InterfaithInteriorScene: React.FC<InterfaithInteriorSceneProps> = ({
  player,
  onClose,
  onPray
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#032219');
    scene.fog = new THREE.FogExp2('#032219', 0.015);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 4.2, 9.5);
    camera.lookAt(0, 2.0, -3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Stone Sanctuary Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 28),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Front Chancel Wall
    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(28, 12, 1),
      new THREE.MeshLambertMaterial({ color: '#0f172a' })
    );
    frontWall.position.set(0, 6, -8);
    scene.add(frontWall);

    // Stained Glass Centerpiece Window
    const stainedGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 9),
      new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.85 })
    );
    stainedGlass.position.set(0, 6.5, -7.4);
    scene.add(stainedGlass);

    // Wooden Sanctuary Pews (Rows on left and right)
    const pewMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    for (let r = 0; r < 4; r++) {
      const pz = -1.5 + r * 3.2;
      [-4.5, 4.5].forEach((px) => {
        const pew = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.9, 0.8), pewMat);
        pew.position.set(px, 0.45, pz);
        scene.add(pew);

        // Student worshipping in pew
        const torso = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.9, 0.38),
          new THREE.MeshLambertMaterial({ color: '#f8fafc' }) // White fellowship outfit
        );
        torso.position.set(px, 0.85, pz - 0.1);
        scene.add(torso);

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 16, 16),
          new THREE.MeshLambertMaterial({ color: '#5d4037' })
        );
        head.position.set(px, 1.6, pz - 0.1);
        scene.add(head);
      });
    }

    // Pulpit / Altar Table
    const altar = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 1.4, 1.6),
      new THREE.MeshLambertMaterial({ color: '#451a03' })
    );
    altar.position.set(0, 0.7, -5.5);
    scene.add(altar);

    // Altar Candlesticks & Flowers
    const candleLight = new THREE.PointLight('#fef08a', 1.2, 12);
    candleLight.position.set(0, 2.5, -5.0);
    scene.add(candleLight);

    const ambientLight = new THREE.AmbientLight('#bae6fd', 0.55);
    scene.add(ambientLight);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      camera.position.x = Math.sin(time * 0.25) * 0.6;
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

  const handleFellowshipPray = () => {
    sounds.playCheer();
    onPray();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setFeedback('Participated in student campus fellowship! Spirit refreshed, Stamina boosted, and gained +50 Peace XP.');
  };

  const handleSilentMeditation = () => {
    sounds.playNotification();
    setFeedback('Quiet contemplation & personal reflection. Exam anxiety relieved!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-stone-900 border-2 border-emerald-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* 3D Sanctuary Viewport */}
        <div ref={mountRef} className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          
          {/* Header */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-stone-900/90 border border-emerald-500/50 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <Heart className="w-4 h-4 fill-emerald-300" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Campus Interfaith Centre
                </div>
                <div className="text-xs font-black text-white">
                  Chapel of Grace & Campus Mosque
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

          {/* Feedback */}
          {feedback && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-emerald-950/95 border border-emerald-400 text-emerald-200 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 max-w-md text-center">
              🕊️ {feedback}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-10 pointer-events-auto">
            <div className="bg-stone-950/90 border border-emerald-500/60 rounded-3xl p-4 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Spiritual Fellowship & Reflection
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  All Students Welcome
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleFellowshipPray}
                  className="bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-500/80 p-3.5 rounded-2xl text-left transition flex items-center justify-between cursor-pointer group shadow"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-amber-300 fill-amber-300" />
                    <div>
                      <div className="text-xs font-black text-white">Join Fellowship Prayers</div>
                      <div className="text-[10px] text-stone-300">Spiritual renewal, +50 XP & Stamina boost</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-amber-300 px-2 py-1 rounded font-bold border border-emerald-700">
                    +50 XP
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSilentMeditation}
                  className="bg-stone-900/80 hover:bg-stone-800 border border-stone-700 p-3.5 rounded-2xl text-left transition flex items-center justify-between cursor-pointer group shadow"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                    <div>
                      <div className="text-xs font-black text-white">Quiet Meditation & Exam Prayers</div>
                      <div className="text-[10px] text-stone-300">Peaceful reflection for upcoming exams</div>
                    </div>
                  </div>
                  <Smile className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
