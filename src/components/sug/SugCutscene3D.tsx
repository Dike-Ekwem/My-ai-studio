import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import { createMonopolyHead } from '../game3d/monopolyFace';
import confetti from 'canvas-confetti';
import {
  Users,
  Award,
  Vote,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Megaphone
} from 'lucide-react';

interface SugCutscene3DProps {
  player: PlayerState;
  onClose: () => void;
  onVoteCandidate: (candidate: string) => void;
}

export const SugCutscene3D: React.FC<SugCutscene3DProps> = ({
  player,
  onClose,
  onVoteCandidate
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeSpeech, setActiveSpeech] = useState<string>(
    'SUG President Comrade Emeka: "Greatest Omo Students! Aluta Continua! The Union is demanding 24/7 solar light in all hostels and subsidized Keke fares! We stand united for student welfare!"'
  );
  const [hasVoted, setHasVoted] = useState(false);
  const [votedName, setVotedName] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0369a1');
    scene.fog = new THREE.FogExp2('#0369a1', 0.012);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 8.2);
    camera.lookAt(0, 1.4, -0.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight('#fef08a', 1.3);
    sun.position.set(12, 22, 14);
    sun.castShadow = true;
    scene.add(sun);

    // Parliament Hall Floor (Polished Marble)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 20),
      new THREE.MeshLambertMaterial({ color: '#0f172a' })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Green Dais Platform
    const dais = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.45, 4.5),
      new THREE.MeshLambertMaterial({ color: '#166534' })
    );
    dais.position.set(0, 0.22, -3.2);
    scene.add(dais);

    // Wooden Speaker Podium with Microphone
    const podium = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 0.9),
      new THREE.MeshLambertMaterial({ color: '#78350f' })
    );
    podium.position.set(0, 0.92, -2.4);
    scene.add(podium);

    // SUG Crest on Podium Front
    const crestMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.6, 0.05),
      new THREE.MeshLambertMaterial({ color: '#facc15' })
    );
    crestMesh.position.set(0, 0.92, -1.92);
    scene.add(crestMesh);

    // CHARACTERS: SUG President at Podium, Parliamentarian on Left, Player on Right
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

    // SUG President with presidential green/white sash
    const pres = createCharacter('#047857', '#171717', 'npc_handlebar');
    pres.position.set(0, 0.45, -3.2);
    scene.add(pres);

    // Parliament Delegate on Left
    const delegate = createCharacter('#ea580c', '#1e293b', 'npc_sunglasses');
    delegate.position.set(-2.5, 0, -1.2);
    delegate.rotation.y = 0.4;
    scene.add(delegate);

    // Student (Player) on Right
    const student = createCharacter('#2563eb', '#1e293b', 'student');
    student.position.set(2.4, 0, -1.2);
    student.rotation.y = -0.4;
    scene.add(student);

    // Subtle gentle camera animation
    let animId: number;
    let t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.015;
      camera.position.x = Math.sin(t * 0.4) * 0.25;
      camera.position.y = 2.5 + Math.cos(t * 0.5) * 0.08;
      camera.lookAt(0, 1.4, -0.8);
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

  const handleCastVote = (candidateName: string) => {
    sounds.playCheer();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    setHasVoted(true);
    setVotedName(candidateName);
    onVoteCandidate(candidateName);
    setActiveSpeech(
      `Electoral Commissioner: "Vote verified and stamped for ${candidateName}! Thank you for exercising your democratic franchise as an enlightened FUO student!"`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full h-[88vh] bg-stone-900 border-2 border-sky-500 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col justify-between">
        {/* TOP HEADER */}
        <div className="relative z-20 px-4 py-3 bg-stone-950/80 border-b border-sky-900/60 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950 border border-sky-500/50 rounded-xl text-amber-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-sky-400">
                Student Union Government (SUG)
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Parliamentary Assembly & Electoral Hall
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D CANVAS VIEWPORT */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* DOCKED BOTTOM CINEMATIC DIALOGUE & VOTING (NO HEAD OVERLAP) */}
        <div className="relative z-30 p-3 sm:p-5 pointer-events-auto bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent pt-6">
          <div className="bg-stone-900/95 border-2 border-sky-500/70 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3">
            {/* Assembly Speech */}
            <div className="text-xs sm:text-sm text-stone-100 font-medium leading-relaxed italic border-l-2 border-amber-400 pl-3">
              "{activeSpeech}"
            </div>

            {/* Voting Options */}
            <div className="pt-2 border-t border-stone-800">
              {!hasVoted ? (
                <div>
                  <div className="text-[11px] font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                    <Vote className="w-3.5 h-3.5" />
                    <span>Cast Your Vote for SUG President 2026/2027:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCastVote('Comrade Emeka Okafor (Action Alliance)')}
                      className="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-left transition cursor-pointer group"
                    >
                      <div className="font-extrabold text-xs text-emerald-300 group-hover:text-white">
                        Comrade Emeka Okafor
                      </div>
                      <div className="text-[10px] text-stone-300">
                        Platform: 24/7 Library Solar Power & Hostel Water Boreholes
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCastVote('Zainab Danjuma (Student First Movement)')}
                      className="p-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600 text-left transition cursor-pointer group"
                    >
                      <div className="font-extrabold text-xs text-purple-300 group-hover:text-white">
                        Zainab Danjuma
                      </div>
                      <div className="text-[10px] text-stone-300">
                        Platform: Subsidized Keke Transit & Campus Safety Lighting
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-emerald-300 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-700/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Ballot Verified! You voted for: <strong className="text-white">{votedName}</strong></span>
                  </div>
                  <span className="font-bold text-[10px] bg-emerald-900 px-2 py-0.5 rounded-full text-white">
                    +50 Civic XP
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
