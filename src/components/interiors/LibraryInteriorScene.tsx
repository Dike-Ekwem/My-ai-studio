import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  X,
  Laptop
} from 'lucide-react';

interface LibraryInteriorSceneProps {
  player: PlayerState;
  onClose: () => void;
  onStudy: () => void;
}

export const LibraryInteriorScene: React.FC<LibraryInteriorSceneProps> = ({
  player,
  onClose,
  onStudy
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // 3D Library Interior Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#06202a');
    scene.fog = new THREE.FogExp2('#06202a', 0.02);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 4.5, 9.5);
    camera.lookAt(0, 1.8, -2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Floor (Polished library parquet)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 28),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back & Side Walls
    const wallMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(28, 10, 1), wallMat);
    backWall.position.set(0, 5, -8);
    scene.add(backWall);

    // 1. Tall Wooden Bookshelves along back wall and sides
    const shelfMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#f8fafc'];

    [-9, -3, 3, 9].forEach((sx) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(5.2, 7.5, 1.2), shelfMat);
      shelf.position.set(sx, 3.75, -7.2);
      shelf.castShadow = true;
      scene.add(shelf);

      // Book rows
      for (let level = 1; level <= 4; level++) {
        for (let bx = -2.1; bx <= 2.1; bx += 0.45) {
          const color = bookColors[Math.floor(Math.random() * bookColors.length)];
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 1.1, 0.9),
            new THREE.MeshLambertMaterial({ color })
          );
          book.position.set(sx + bx, level * 1.5, -7.0);
          scene.add(book);
        }
      }
    });

    // 2. Study Tables with Green Bankers Lamps & Reading Students
    const tableMat = new THREE.MeshLambertMaterial({ color: '#451a03' });
    const lampMat = new THREE.MeshBasicMaterial({ color: '#22c55e' });

    [-4.5, 4.5].forEach((tx) => {
      // Table
      const table = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.15, 2.8), tableMat);
      table.position.set(tx, 1.5, 0.5);
      table.castShadow = true;
      scene.add(table);

      // Legs
      [-2.8, 2.8].forEach((lx) => {
        [-1.1, 1.1].forEach((lz) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5), shelfMat);
          leg.position.set(tx + lx, 0.75, 0.5 + lz);
          scene.add(leg);
        });
      });

      // Desk Lamp
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.4), lampMat);
      lamp.position.set(tx, 1.95, 0.5);
      scene.add(lamp);

      const lampLight = new THREE.PointLight('#86efac', 0.8, 6);
      lampLight.position.set(tx, 1.9, 0.5);
      scene.add(lampLight);

      // Reading Student NPC
      const studentTorso = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 1.0, 0.4),
        new THREE.MeshLambertMaterial({ color: tx > 0 ? '#1d4ed8' : '#b45309' })
      );
      studentTorso.position.set(tx, 1.35, 1.8);
      scene.add(studentTorso);

      const studentHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 16, 16),
        new THREE.MeshLambertMaterial({ color: '#5d4037' })
      );
      studentHead.position.set(tx, 2.15, 1.8);
      studentHead.rotation.x = 0.25; // Looking down at books
      scene.add(studentHead);
    });

    // 3. Front Librarian Desk
    const libDesk = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.6, 1.4), tableMat);
    libDesk.position.set(0, 0.8, -3.2);
    scene.add(libDesk);

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.4, 0.1),
      new THREE.MeshLambertMaterial({ color: '#fef08a' })
    );
    sign.position.set(0, 1.7, -2.5);
    scene.add(sign);

    // Warm Library Ambient Lighting
    const ambientLight = new THREE.AmbientLight('#fef08a', 0.55);
    scene.add(ambientLight);

    const ceilingDir = new THREE.DirectionalLight('#ffffff', 0.8);
    ceilingDir.position.set(2, 10, 5);
    scene.add(ceilingDir);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      // Gentle cinematic camera drift
      camera.position.x = Math.sin(time * 0.2) * 0.8;
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

  const handleDeepStudy = () => {
    sounds.playNotification();
    onStudy();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setFeedback('Dedicated 2 hours of quiet reading at the library! GPA boosted (+0.02) and gained +70 Academic XP.');
  };

  const handleBrowseArchives = () => {
    sounds.playClick();
    setFeedback('Reviewed past 5 years examination papers for 100-level courses! Exam Preparedness at maximum.');
  };

  const handleELibrary = () => {
    sounds.playClick();
    setFeedback('Logged into FUO IEEE/JSTOR research database. Found useful research project materials (+30 XP).');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-stone-900 border-2 border-teal-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* 3D Library Viewport */}
        <div ref={mountRef} className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          
          {/* Top Header */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-stone-900/90 border border-teal-500/50 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-teal-950 border border-teal-400 flex items-center justify-center text-teal-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                  University Central Library • Silent Study Wing
                </div>
                <div className="text-xs font-black text-white">
                  Nnamdi Azikiwe Memorial Library
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

          {/* Feedback banner */}
          {feedback && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-teal-950/95 border border-teal-400 text-teal-200 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 max-w-md text-center">
              ✨ {feedback}
            </div>
          )}

          {/* Bottom Interactive Study Desk Options */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-10 pointer-events-auto">
            <div className="bg-stone-950/90 border border-teal-500/60 rounded-3xl p-4 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Library Reading Desk & Academic Resources
                  </span>
                </div>
                <span className="text-[10px] text-teal-400 font-mono font-bold">
                  Quiet Zone • 2nd Floor
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleDeepStudy}
                  className="bg-teal-900/80 hover:bg-teal-800 border border-teal-500/80 p-3 rounded-2xl text-left transition flex flex-col justify-between cursor-pointer group shadow"
                >
                  <div className="flex items-center justify-between mb-1">
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span className="text-[9px] bg-teal-950 px-2 py-0.5 rounded text-teal-300 font-mono">
                      +70 XP
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Study Course Slides</div>
                    <div className="text-[10px] text-stone-300">Boosts GPA and Exam Preparedness</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleBrowseArchives}
                  className="bg-stone-900/80 hover:bg-stone-800 border border-stone-700 p-3 rounded-2xl text-left transition flex flex-col justify-between cursor-pointer group shadow"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span className="text-[9px] bg-stone-800 px-2 py-0.5 rounded text-cyan-300 font-mono">
                      Archives
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Browse Past Questions</div>
                    <div className="text-[10px] text-stone-300">Review 100-level exam papers</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleELibrary}
                  className="bg-stone-900/80 hover:bg-stone-800 border border-stone-700 p-3 rounded-2xl text-left transition flex flex-col justify-between cursor-pointer group shadow"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Laptop className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] bg-stone-800 px-2 py-0.5 rounded text-emerald-300 font-mono">
                      e-Library
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">E-Learning Terminal</div>
                    <div className="text-[10px] text-stone-300">Access online research journals</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
