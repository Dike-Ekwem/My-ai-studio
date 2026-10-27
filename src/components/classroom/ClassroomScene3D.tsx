import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState } from '../../types/game';
import { COURSES } from '../../data/courses';
import { sounds } from '../../utils/audio';
import { createMonopolyHead, MonopolyVariant } from '../game3d/monopolyFace';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Sparkles,
  Award,
  FastForward,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Clock,
  Volume2
} from 'lucide-react';

interface ClassroomScene3DProps {
  player: PlayerState;
  onClose: () => void;
  onCompleteClass: (courseCode: string, scoreGained: number) => void;
}

export const ClassroomScene3D: React.FC<ClassroomScene3DProps> = ({
  player,
  onClose,
  onCompleteClass
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'lecture_sim' | 'attendance_confirmed' | 'optional_quiz' | 'finished'>('lecture_sim');
  const [lectureProgress, setLectureProgress] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [hasAwardedAttendance, setHasAwardedAttendance] = useState(false);
  const [attendanceRewardXP, setAttendanceRewardXP] = useState(120);

  // Active Course and Schedule
  const course = COURSES.find((c) => c.id === player.courseId) || COURSES[0];
  // Pick today's course or the first scheduled course
  const activeCourse = course.firstYearCourses.find((c) => c.dayOfWeek === player.dayOfWeek) || course.firstYearCourses[0];
  const quiz = activeCourse.sampleQuiz;

  // Lecture slides / chalkboard texts
  const lectureSlides = [
    {
      title: `${activeCourse.code}: Fundamental Principles`,
      subtitle: `Lecturer: ${activeCourse.lecturer}`,
      notes: 'Welcome class! Today we examine core foundational theorems and analytical applications in contemporary practice.'
    },
    {
      title: 'Theoretical Framework & Case Studies',
      subtitle: 'Continuous Assessment Syllabus',
      notes: 'Make sure your departmental lecture pads are open. Note the critical distinction between empirical data and theoretical models.'
    },
    {
      title: 'Examination Directives & Class Attendance',
      subtitle: '75% Attendance Requirement',
      notes: 'Attendance registers are submitted directly to the Academic Planning Board. Review chapter references for our upcoming quiz.'
    }
  ];

  useEffect(() => {
    sounds.playCampusBell();
  }, []);

  // Three.js 3D Classroom Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.FogExp2('#0f172a', 0.018);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 14.5); // Elevated view looking over students towards lecturer
    camera.lookAt(0, 2.2, -4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Classroom Architecture
    // Floor
    const floorGeo = new THREE.PlaneGeometry(32, 36);
    const floorMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Front Wall (Behind Lecturer)
    const wallMat = new THREE.MeshLambertMaterial({ color: '#334155' });
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(32, 12, 1), wallMat);
    frontWall.position.set(0, 6, -10);
    scene.add(frontWall);

    // Chalkboard / Presentation Screen at front
    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(16, 5.2, 0.3),
      new THREE.MeshLambertMaterial({ color: '#78350f' })
    );
    boardFrame.position.set(0, 5.2, -9.4);
    scene.add(boardFrame);

    const boardSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(15.4, 4.8),
      new THREE.MeshLambertMaterial({ color: '#064e3b' }) // Traditional green chalkboard
    );
    boardSurface.position.set(0, 5.2, -9.24);
    scene.add(boardSurface);

    // Side Walls with Tall Campus Windows
    const sideWallGeo = new THREE.BoxGeometry(1, 12, 36);
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftWall.position.set(-16, 6, 8);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightWall.position.set(16, 6, 8);
    scene.add(rightWall);

    // Window Frames with Sunlight Inflow
    const windowMat = new THREE.MeshBasicMaterial({ color: '#bae6fd', transparent: true, opacity: 0.65 });
    for (let wz = -4; wz <= 18; wz += 6) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 5), windowMat);
      win.position.set(-15.4, 6.5, wz);
      win.rotation.y = Math.PI / 2;
      scene.add(win);
    }

    // Ceiling Lights
    const ceilingLight = new THREE.DirectionalLight('#ffffff', 1.1);
    ceilingLight.position.set(4, 14, 2);
    ceilingLight.castShadow = true;
    scene.add(ceilingLight);

    const ambientLight = new THREE.AmbientLight('#94a3b8', 0.6);
    scene.add(ambientLight);

    const stageLight = new THREE.PointLight('#fef08a', 0.8, 16);
    stageLight.position.set(0, 6, -5);
    scene.add(stageLight);

    // Front Lecturer Podium / Desk
    const podiumMat = new THREE.MeshLambertMaterial({ color: '#451a03' });
    const podium = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 1.6), podiumMat);
    podium.position.set(-3.5, 0.9, -6);
    podium.castShadow = true;
    podium.receiveShadow = true;
    scene.add(podium);

    // Books and Laptop on podium
    const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.6), new THREE.MeshLambertMaterial({ color: '#0284c7' }));
    laptop.position.set(-3.5, 1.84, -6);
    scene.add(laptop);

    // 3. Lecturer 3D Character (With Monopoly Styling & Gown)
    const lecturerGroup = new THREE.Group();
    lecturerGroup.position.set(0, 0, -6.5);

    // Lecturer Body with Academic Gown / Suit
    const lectTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.35, 0.5),
      new THREE.MeshLambertMaterial({ color: '#0f172a' })
    );
    lectTorso.position.y = 1.65;
    lectTorso.castShadow = true;
    lecturerGroup.add(lectTorso);

    // Academic Sash / Stole
    const stole = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 1.1, 0.52),
      new THREE.MeshLambertMaterial({ color: '#dc2626' })
    );
    stole.position.y = 1.7;
    lecturerGroup.add(stole);

    // Lecturer Monopoly Head (Papa / Professor variant)
    const lectHead = createMonopolyHead('papa');
    lectHead.position.set(0, 2.7, 0);
    lecturerGroup.add(lectHead);

    // Lecturer Right Arm (Gesturing with chalk / pointer)
    const lectArmR = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.95, 0.24),
      new THREE.MeshLambertMaterial({ color: '#0f172a' })
    );
    lectArmR.position.set(0.55, 1.6, 0);
    lecturerGroup.add(lectArmR);

    // Lecturer Left Arm
    const lectArmL = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.95, 0.24),
      new THREE.MeshLambertMaterial({ color: '#0f172a' })
    );
    lectArmL.position.set(-0.55, 1.6, 0);
    lecturerGroup.add(lectArmL);

    scene.add(lecturerGroup);

    // 4. Seated Student NPCs (~50 Students Arranged in Tiered Rows)
    const studentLimbs: { head: THREE.Group; armL: THREE.Mesh; armR: THREE.Mesh; id: number }[] = [];
    const deskMat = new THREE.MeshLambertMaterial({ color: '#854d0e' });
    const benchMat = new THREE.MeshLambertMaterial({ color: '#52525b' });

    const rows = 5;
    const colsPerRow = 10; // Total 50 students!
    const variants: MonopolyVariant[] = [
      'student',
      'npc_handlebar',
      'npc_pencil',
      'npc_sunglasses',
      'npc_monocle',
      'mama'
    ];
    const shirtColors = ['#1d4ed8', '#15803d', '#b91c1c', '#7c3aed', '#d97706', '#0f766e', '#f43f5e', '#334155'];

    for (let r = 0; r < rows; r++) {
      const rowZ = -1.5 + r * 3.8;
      const rowY = r * 0.45; // Gentle tiered elevation so all students see lecturer!

      // Tiered Platform Riser
      const tierRiser = new THREE.Mesh(
        new THREE.BoxGeometry(26, 0.45 * (r + 1), 3.6),
        new THREE.MeshLambertMaterial({ color: '#1e293b' })
      );
      tierRiser.position.set(0, (0.45 * (r + 1)) / 2, rowZ + 1.2);
      scene.add(tierRiser);

      // Long Shared Continuous Desks
      [-6.5, 6.5].forEach((dx) => {
        const desk = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.12, 1.1), deskMat);
        desk.position.set(dx, rowY + 1.45, rowZ);
        desk.castShadow = true;
        scene.add(desk);

        // Desk Legs
        [-5, 5].forEach((lx) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.45), benchMat);
          leg.position.set(dx + lx, rowY + 0.72, rowZ);
          scene.add(leg);
        });

        // Notebooks & Pens on desks
        [-3.5, 0, 3.5].forEach((bx) => {
          const book = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.5), new THREE.MeshLambertMaterial({ color: '#f8fafc' }));
          book.position.set(dx + bx, rowY + 1.52, rowZ);
          scene.add(book);
        });
      });

      // Seated Student Characters in this row
      for (let c = 0; c < colsPerRow; c++) {
        // Skip central aisle
        const colX = (c < 5) ? -12 + c * 2.2 : 3.2 + (c - 5) * 2.2;
        const studentGroup = new THREE.Group();
        studentGroup.position.set(colX, rowY + 0.35, rowZ + 0.9);

        // Student Torso
        const color = shirtColors[(r * colsPerRow + c) % shirtColors.length];
        const torso = new THREE.Mesh(
          new THREE.BoxGeometry(0.75, 1.05, 0.42),
          new THREE.MeshLambertMaterial({ color })
        );
        torso.position.y = 0.95;
        studentGroup.add(torso);

        // Student Head with Monopoly Guy variation
        const variant = variants[(r * colsPerRow + c) % variants.length];
        const head = createMonopolyHead(variant);
        head.position.set(0, 1.78, 0);
        studentGroup.add(head);

        // Arms resting on desk / writing notes
        const armL = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.7, 0.2),
          new THREE.MeshLambertMaterial({ color })
        );
        armL.position.set(-0.45, 1.0, 0.2);
        armL.rotation.x = -Math.PI / 3;
        studentGroup.add(armL);

        const armR = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.7, 0.2),
          new THREE.MeshLambertMaterial({ color })
        );
        armR.position.set(0.45, 1.0, 0.2);
        armR.rotation.x = -Math.PI / 3;
        studentGroup.add(armR);

        studentLimbs.push({
          head,
          armL,
          armR,
          id: r * colsPerRow + c
        });

        scene.add(studentGroup);
      }
    }

    // 5. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera pan: oscillates gently between wide amphitheater and lecturer focus
      const camT = (Math.sin(time * 0.3) + 1) / 2;
      camera.position.x = Math.sin(time * 0.25) * 2.5;
      camera.position.y = THREE.MathUtils.lerp(6.8, 7.8, camT);
      camera.position.z = THREE.MathUtils.lerp(12.5, 15.5, camT);
      camera.lookAt(Math.sin(time * 0.3) * 1.5, 2.2, -5.5);

      // Lecturer pacing and gesturing at chalkboard
      const lectPace = Math.sin(time * 0.8) * 2.8;
      lecturerGroup.position.x = lectPace;
      // Lecturer turns periodically towards board or students
      lecturerGroup.rotation.y = (Math.sin(time * 0.6) > 0.4) ? 0.35 : -0.25;

      // Arm gesturing with chalk
      lectArmR.rotation.x = -Math.PI / 2 + Math.sin(time * 3.5) * 0.45;
      lectArmR.rotation.z = Math.sin(time * 2.2) * 0.25;
      lectArmL.rotation.x = Math.sin(time * 1.8) * 0.3;

      // Subtle student idle animations: note taking, shifting, nodding
      studentLimbs.forEach((s) => {
        const offset = s.id * 0.4;
        // Head slight nod or look towards lecturer
        s.head.rotation.y = Math.sin(time * 1.5 + offset) * 0.15 + (lectPace * 0.04);
        s.head.rotation.x = Math.sin(time * 2.0 + offset) * 0.05;

        // Writing arm subtle movement
        s.armR.rotation.x = -Math.PI / 3 + Math.sin(time * 5.0 + offset) * 0.08;
      });

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

  // Lecture Simulation Progress (10 - 20 seconds total)
  useEffect(() => {
    if (phase !== 'lecture_sim') return;

    const interval = setInterval(() => {
      setLectureProgress((prev) => {
        const next = prev + 5;
        if (next >= 33 && next < 66) setCurrentSlideIndex(1);
        if (next >= 66) setCurrentSlideIndex(2);

        if (next >= 100) {
          clearInterval(interval);
          handleFinishSimulation();
          return 100;
        }
        return next;
      });
    }, 750); // ~15 seconds total

    return () => clearInterval(interval);
  }, [phase]);

  // Clean conclusion of lecture simulation
  const handleFinishSimulation = () => {
    sounds.playCheer();
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.55 } });
    setPhase('attendance_confirmed');

    if (!hasAwardedAttendance) {
      setHasAwardedAttendance(true);
      onCompleteClass(activeCourse.code, attendanceRewardXP);
    }
  };

  const handleSelectQuiz = (idx: number) => {
    sounds.playClick();
    setSelectedQuizOption(idx);
    const isCorrect = idx === quiz.correctIndex;
    if (isCorrect) {
      sounds.playCheer();
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-stone-900 border-2 border-emerald-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* 3D Classroom View Container */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          <div ref={mountRef} className="w-full h-full" />

          {/* Top Classroom Venue & Course HUD */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-stone-900/90 border border-emerald-500/50 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-amber-300">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Live Lecture • {activeCourse.venue}
                </div>
                <div className="text-xs font-black text-white">
                  {activeCourse.code}: {activeCourse.title}
                </div>
              </div>
            </div>

            {/* Skip Button (Unobtrusive side control) */}
            {phase === 'lecture_sim' && (
              <button
                type="button"
                onClick={handleFinishSimulation}
                className="pointer-events-auto bg-stone-900/90 hover:bg-stone-800 border border-amber-400/80 hover:border-amber-400 text-amber-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                title="Skip to attendance confirmation"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip Lecture</span>
              </button>
            )}
          </div>

          {/* Floating Live Chalkboard Overlay during Simulation */}
          {phase === 'lecture_sim' && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-10 pointer-events-none animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-stone-950/85 border border-emerald-500/60 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                      Prof. {activeCourse.lecturer.split(' ').pop()} Delivering Lecture
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {lectureProgress}% Completed
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-medium text-stone-200 leading-snug">
                  "{lectureSlides[currentSlideIndex].notes}"
                </div>

                {/* Lecture Progress Bar */}
                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden border border-stone-700/80 mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${lectureProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phase 2: Attendance Confirmed Stage */}
          {phase === 'attendance_confirmed' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-stone-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl max-w-md w-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-xl">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Official Attendance Record Updated
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">
                    Lecture Attendance Confirmed!
                  </h3>
                  <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                    You attended <span className="font-bold text-white">{activeCourse.code}: {activeCourse.title}</span> with {activeCourse.lecturer}.
                  </p>
                </div>

                {/* Reward breakdown */}
                <div className="grid grid-cols-2 gap-2 bg-stone-800/80 p-3 rounded-2xl border border-stone-700 text-xs text-left">
                  <div>
                    <div className="text-stone-400 text-[10px] font-semibold">Academic Credit</div>
                    <div className="text-emerald-400 font-bold text-sm">+{attendanceRewardXP} XP</div>
                  </div>
                  <div>
                    <div className="text-stone-400 text-[10px] font-semibold">Semester GPA Standing</div>
                    <div className="text-amber-300 font-bold text-sm">{(player.gpa + 0.02).toFixed(2)} / 5.0</div>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-stone-700/60 flex items-center gap-1.5 text-[11px] text-stone-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>In-Game Time Advanced by 1.5 Hours</span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setPhase('optional_quiz');
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black py-3 px-4 rounded-2xl shadow-lg border border-emerald-400 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition transform hover:scale-[1.02]"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-300" />
                    <span>Attempt Bonus Quiz (+50 XP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition"
                  >
                    Exit to Campus
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 3: Optional Academic Assessment */}
          {phase === 'optional_quiz' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-stone-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl max-w-lg w-full text-left space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="text-xs uppercase font-bold text-emerald-400">
                    Course Continuous Assessment
                  </div>
                  <span className="text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Bonus +50 XP
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm sm:text-base font-bold text-white">
                    {quiz.question}
                  </div>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                  {quiz.options.map((option, idx) => {
                    const isSelected = selectedQuizOption === idx;
                    const isCorrect = idx === quiz.correctIndex;
                    let style = 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200';
                    if (selectedQuizOption !== null) {
                      if (isCorrect) style = 'bg-emerald-900/90 border-emerald-400 text-white shadow-lg';
                      else if (isSelected) style = 'bg-red-950/80 border-red-500 text-stone-300';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={selectedQuizOption !== null}
                        onClick={() => handleSelectQuiz(idx)}
                        className={`w-full p-3 rounded-2xl border text-xs sm:text-sm font-medium transition text-left flex items-center justify-between cursor-pointer ${style}`}
                      >
                        <span>{option}</span>
                        {selectedQuizOption !== null && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedQuizOption !== null && (
                  <div className="p-3 bg-stone-800/90 rounded-2xl border border-stone-700 text-xs text-stone-300 animate-in fade-in">
                    <span className="font-bold text-amber-300">Explanation: </span>
                    {quiz.explanation}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <span>Finish & Return to Campus</span>
                    <ArrowRight className="w-4 h-4" />
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
