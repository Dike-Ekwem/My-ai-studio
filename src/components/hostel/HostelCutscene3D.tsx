import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { ACCOMMODATIONS } from '../../data/accommodations';
import { sounds } from '../../utils/audio';
import { createMonopolyHead } from '../game3d/monopolyFace';
import confetti from 'canvas-confetti';
import {
  Bed,
  Moon,
  BookOpen,
  MessageSquare,
  Sparkles,
  Users,
  CheckCircle2,
  X,
  ArrowRight,
  Home,
  ShieldCheck
} from 'lucide-react';

interface HostelCutscene3DProps {
  player: PlayerState;
  onClose: () => void;
  onSleep: () => void;
  onStudy: () => void;
  onChatRoommate: () => void;
  onOpenRoomDecorator?: () => void;
}

export const HostelCutscene3D: React.FC<HostelCutscene3DProps> = ({
  player,
  onClose,
  onSleep,
  onStudy,
  onChatRoommate,
  onOpenRoomDecorator
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeDialogue, setActiveDialogue] = useState<string>(
    player.roommate
      ? `Roommate (${player.roommate.name}): "Hey ${player.name.split(' ')[0]}! Welcome back to the room. Did NEPA take light in your lecture hall today too?"`
      : 'Hostel Porter: "Welcome back to your hall of residence! Keep your room tidy and report any electrical or plumbing issues at the porter lodge."'
  );
  const [roomActionFeedback, setRoomActionFeedback] = useState<string | null>(null);

  const accommodation =
    ACCOMMODATIONS.find((a) => a.id === player.selectedAccommodationId) || ACCOMMODATIONS[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e1b4b');
    scene.fog = new THREE.FogExp2('#1e1b4b', 0.015);

    // Camera angled to showcase the room and characters with clear clearance
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(0, 3.2, 7.2);
    camera.lookAt(0, 1.4, -0.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Warm Room Lamp & Ambient Lighting
    const ambient = new THREE.AmbientLight('#fef08a', 0.7);
    scene.add(ambient);

    const lamp = new THREE.PointLight('#fef08a', 1.3, 18);
    lamp.position.set(-2, 3.8, 0);
    scene.add(lamp);

    // Room Floor (Warm wooden parquet)
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshLambertMaterial({ color: '#78350f' });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls with customized paint color
    const wallColor = player.roomCustomization?.roomColor || '#312e81';
    const wallMat = new THREE.MeshLambertMaterial({ color: wallColor });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), wallMat);
    backWall.position.set(0, 4, -8);
    scene.add(backWall);

    // Floor Rug if unlocked/styled
    if (player.roomCustomization?.rugStyle && player.roomCustomization.rugStyle !== 'none') {
      const rug = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 0.03, 3.2),
        new THREE.MeshLambertMaterial({ color: '#b45309' })
      );
      rug.position.set(0, 0.02, -1.2);
      scene.add(rug);
    }

    // Posters on Back Wall
    if (player.roomCustomization?.wallPoster && player.roomCustomization.wallPoster !== 'none') {
      const posterMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
      const poster1 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), posterMat);
      poster1.position.set(-1.8, 4.5, -7.95);
      scene.add(poster1);

      const poster2 = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 2.0),
        new THREE.MeshBasicMaterial({ color: '#065f46' })
      );
      poster2.position.set(0.2, 4.6, -7.95);
      scene.add(poster2);
    }

    // Fairy String Lights along top edge
    if (player.roomCustomization?.stringLightsActive) {
      const fairyLightGroup = new THREE.Group();
      const stringWire = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.04, 0.04),
        new THREE.MeshBasicMaterial({ color: '#facc15' })
      );
      stringWire.position.set(0, 7.2, -7.9);
      fairyLightGroup.add(stringWire);

      for (let fx = -6.0; fx <= 6.0; fx += 1.2) {
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 8, 8),
          new THREE.MeshBasicMaterial({ color: '#fef08a' })
        );
        bulb.position.set(fx, 7.05 + Math.sin(fx * 2) * 0.1, -7.88);
        fairyLightGroup.add(bulb);
      }
      const fairyPoint = new THREE.PointLight('#fef08a', 0.9, 12);
      fairyPoint.position.set(0, 6.8, -7.5);
      fairyLightGroup.add(fairyPoint);
      scene.add(fairyLightGroup);
    }

    // Trophy Shelf above Bed or Desk
    if (player.roomCustomization?.trophyShelf) {
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(-4.2, 5.0, -7.9);

      const shelfPlank = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.1, 0.6),
        new THREE.MeshLambertMaterial({ color: '#78350f' })
      );
      shelfGroup.add(shelfPlank);

      // Gold mini trophies
      const goldMat = new THREE.MeshLambertMaterial({ color: '#facc15' });
      [-0.8, 0.8].forEach((tx) => {
        const trophy = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 0.4, 8), goldMat);
        trophy.position.set(tx, 0.25, 0);
        shelfGroup.add(trophy);
      });
      scene.add(shelfGroup);
    }

    // Window with campus night/day view
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.6, 0.2),
      new THREE.MeshLambertMaterial({ color: '#1e1b4b' })
    );
    windowFrame.position.set(2.8, 4.2, -7.9);
    scene.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2.4),
      new THREE.MeshBasicMaterial({ color: '#38bdf8' })
    );
    windowGlass.position.set(2.8, 4.2, -7.78);
    scene.add(windowGlass);

    // 1. Double Bunk Bed (Left side)
    const bunkGroup = new THREE.Group();
    bunkGroup.position.set(-4.2, 0, -2.5);

    // Bed frame posts
    const postMat = new THREE.MeshLambertMaterial({ color: '#171717' });
    [[-1.1, -1.8], [1.1, -1.8], [-1.1, 1.8], [1.1, 1.8]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8), postMat);
      post.position.set(px, 2.1, pz);
      bunkGroup.add(post);
    });

    // Lower bunk mattress & customized bedsheet duvet
    const duvetStyle = player.roomCustomization?.duvetStyle;
    const beddingColor =
      duvetStyle === 'ankara_gold'
        ? '#f59e0b'
        : duvetStyle === 'emerald_velvet'
        ? '#059669'
        : duvetStyle === 'indigo_traditional'
        ? '#3730a3'
        : '#047857';
    const matMat = new THREE.MeshLambertMaterial({ color: beddingColor });
    const lowerMattress = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.4, 3.5), matMat);
    lowerMattress.position.set(0, 0.8, 0);
    bunkGroup.add(lowerMattress);

    // Upper bunk mattress & orange bedsheet
    const matMat2 = new THREE.MeshLambertMaterial({ color: '#ea580c' });
    const upperMattress = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.4, 3.5), matMat2);
    upperMattress.position.set(0, 2.9, 0);
    bunkGroup.add(upperMattress);

    // Pillow
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.2, 0.8),
      new THREE.MeshLambertMaterial({ color: '#f8fafc' })
    );
    pillow.position.set(0, 1.05, -1.2);
    bunkGroup.add(pillow);

    scene.add(bunkGroup);

    // 2. Study Desk with Books, Table Lamp & Tech Rig
    const deskGroup = new THREE.Group();
    deskGroup.position.set(3.2, 0, -3.5);

    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 1.2, 1.6),
      new THREE.MeshLambertMaterial({ color: '#451a03' })
    );
    desk.position.set(0, 0.6, 0);
    deskGroup.add(desk);

    // Tech Desk: Dual Monitors & Mechanical Keyboard
    if (player.roomCustomization?.deskRig === 'dual_monitor_tech') {
      const monitorMat = new THREE.MeshLambertMaterial({ color: '#09090b' });
      const screenMat = new THREE.MeshBasicMaterial({ color: '#0284c7' });

      // Monitor 1 (Main)
      const mon1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 0.08), monitorMat);
      mon1.position.set(0.1, 1.7, -0.2);
      deskGroup.add(mon1);

      const scr1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), screenMat);
      scr1.position.set(0.1, 1.7, -0.15);
      deskGroup.add(scr1);

      // Stand
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), monitorMat);
      stand.position.set(0.1, 1.35, -0.25);
      deskGroup.add(stand);

      // Keyboard
      const kbd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.35), new THREE.MeshLambertMaterial({ color: '#171717' }));
      kbd.position.set(0.1, 1.22, 0.3);
      deskGroup.add(kbd);
    } else {
      // Standard Study Books
      const book1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.15, 0.6),
        new THREE.MeshLambertMaterial({ color: '#dc2626' })
      );
      book1.position.set(-0.6, 1.28, 0.1);
      deskGroup.add(book1);

      const book2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.12, 0.55),
        new THREE.MeshLambertMaterial({ color: '#2563eb' })
      );
      book2.position.set(-0.55, 1.42, 0.1);
      deskGroup.add(book2);
    }

    scene.add(deskGroup);

    // 3. CHARACTERS: Player & Roommate
    const createCharacterMesh = (shirtColor: string, pantsColor: string, variant: any) => {
      const char = new THREE.Group();

      const legs = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.95, 0.3),
        new THREE.MeshLambertMaterial({ color: pantsColor })
      );
      legs.position.y = 0.48;
      char.add(legs);

      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.1, 0.42),
        new THREE.MeshLambertMaterial({ color: shirtColor })
      );
      torso.position.y = 1.45;
      char.add(torso);

      const head = createMonopolyHead(variant);
      head.position.y = 2.25;
      char.add(head);

      return char;
    };

    // Student (Player) standing in center-right
    const playerChar = createCharacterMesh('#047857', '#1e293b', 'student');
    playerChar.position.set(0.8, 0, 0.5);
    playerChar.rotation.y = -0.5;
    scene.add(playerChar);

    // Roommate (or Porter) sitting/standing by the desk on left
    const roommateChar = createCharacterMesh('#d97706', '#374151', 'npc_goatee');
    roommateChar.position.set(-1.4, 0, -0.2);
    roommateChar.rotation.y = 0.6;
    scene.add(roommateChar);

    // Subtle gentle camera oscillation
    let animId: number;
    let time = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.015;
      camera.position.x = Math.sin(time * 0.4) * 0.35;
      camera.position.y = 3.2 + Math.cos(time * 0.5) * 0.1;
      camera.lookAt(0, 1.4, -0.5);
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
  }, [player]);

  const handleRest = () => {
    sounds.playCheer();
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    onSleep();
    setRoomActionFeedback('Took a deep refreshing sleep! Energy restored to 100%.');
    setActiveDialogue(
      player.roommate
        ? `Roommate (${player.roommate.name}): "You slept like a baby! Hope you're ready for lectures today."`
        : 'Hostel Porter: "Good morning! The water taps are running at the borehole."'
    );
  };

  const handleRevise = () => {
    sounds.playClick();
    onStudy();
    setRoomActionFeedback('Revised lecture notebooks at study desk! Continuous assessment boosted.');
    setActiveDialogue(
      player.roommate
        ? `Roommate (${player.roommate.name}): "Omo, you're really serious with your books! Keep that first-class momentum going."`
        : 'Hostel Porter: "Hard work pays, my child. First class is yours!"'
    );
  };

  const handleGist = () => {
    sounds.playClick();
    onChatRoommate();
    setRoomActionFeedback('Gisted with roommate about campus life and departmental politics!');
    const gists = [
      `Roommate: "Did you hear what happened at the SUG senate debate yesterday? The SUG president promised 24/7 library WiFi!"`,
      `Roommate: "Bro, make sure you don't miss the 8 AM quiz tomorrow. That lecturer takes attendance very strictly!"`,
      `Roommate: "I'm heading to Mama Nkechi's joint later for lunch. Their egusi soup is unmatched!"`
    ];
    setActiveDialogue(gists[Math.floor(Math.random() * gists.length)]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full h-[88vh] bg-stone-900 border-2 border-indigo-500 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col justify-between">
        {/* TOP HEADER */}
        <div className="relative z-20 px-4 py-3 bg-stone-950/80 border-b border-indigo-900/60 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950 border border-indigo-500/50 rounded-xl text-amber-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-indigo-400">
                {accommodation.location === 'inside' ? 'On-Campus Residence' : 'Off-Campus Private Lodge'}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">{accommodation.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300 font-mono bg-stone-900 px-3 py-1 rounded-full border border-stone-800">
              {accommodation.occupancy}
            </span>
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

        {/* Action feedback toast */}
        {roomActionFeedback && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-950 border border-emerald-400 text-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-2">
            ✨ {roomActionFeedback}
          </div>
        )}

        {/* DOCKED BOTTOM CINEMATIC DIALOGUE & ACTIONS (ZERO OVERLAP WITH HEADS) */}
        <div className="relative z-30 p-3 sm:p-5 pointer-events-auto bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent pt-8">
          <div className="bg-stone-900/90 border border-indigo-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3">
            {/* Dialogue text */}
            <div className="text-xs sm:text-sm text-stone-100 font-medium leading-relaxed italic border-l-2 border-amber-400 pl-3">
              "{activeDialogue}"
            </div>

            {/* Interactive Room Actions */}
            <div className="pt-2 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleRest}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                <Moon className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Sleep (100% Energy)</span>
              </button>

              <button
                type="button"
                onClick={handleRevise}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Study (+GPA Boost)</span>
              </button>

              <button
                type="button"
                onClick={handleGist}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Gist with Roommate</span>
              </button>

              {onOpenRoomDecorator && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenRoomDecorator();
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
                  <span>Customize Decor [🎨]</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
