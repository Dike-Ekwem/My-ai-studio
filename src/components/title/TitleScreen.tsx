import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { Crest } from '../Crest';
import { COURSES } from '../../data/courses';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import {
  Play,
  Settings,
  GraduationCap,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface TitleScreenProps {
  savedGame: PlayerState | null;
  onNewGame: () => void;
  onResumeGame: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  savedGame,
  onNewGame,
  onResumeGame,
  onOpenSettings
}) => {
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const savedCourse = savedGame ? COURSES.find((c) => c.id === savedGame.courseId) : null;

  const handleStartNewGameClick = () => {
    sounds.playClick();
    if (savedGame) {
      setShowOverwriteWarning(true);
    } else {
      onNewGame();
    }
  };

  const handleConfirmOverwrite = () => {
    sounds.playClick();
    setShowOverwriteWarning(false);
    onNewGame();
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#032e18] font-sans text-white flex items-center justify-center p-4">
      {/* ---------------------------------------------------- */}
      {/* RESTORED ORIGINAL GREEN-AND-GOLD INSTITUTIONAL CANVAS */}
      {/* ---------------------------------------------------- */}
      {/* Radial Gold-Emerald Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.18)_0%,rgba(6,78,40,0.6)_45%,rgba(2,44,20,0.95)_85%)] pointer-events-none" />

      {/* Decorative Academic Guilloche / Diamond Lattice Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none [background-image:linear-gradient(45deg,#f59e0b_1px,transparent_1px),linear-gradient(-45deg,#f59e0b_1px,transparent_1px)] [background-size:32px_32px]"
      />

      {/* Elegant Classical Border Filigree (Green & Gold Frame) */}
      <div className="absolute inset-4 sm:inset-6 border border-amber-500/25 rounded-3xl pointer-events-none flex flex-col justify-between p-3 sm:p-5">
        <div className="flex justify-between items-center text-amber-400/40 text-xs font-serif">
          <span>◆ MCMXXVI ◆</span>
          <span>◆ EXCELLENCE & DIGNITY ◆</span>
        </div>
        <div className="flex justify-between items-center text-amber-400/40 text-xs font-serif">
          <span>✦ VERITAS ✦</span>
          <span>✦ DISCIPLINE ✦</span>
        </div>
      </div>

      {/* Subtle Floating Gold Sparkles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[18%] left-[12%] w-1.5 h-1.5 rounded-full bg-amber-300/40 animate-ping" />
        <div className="absolute top-[28%] right-[16%] w-2 h-2 rounded-full bg-yellow-200/50 animate-pulse" />
        <div className="absolute bottom-[22%] left-[20%] w-1.5 h-1.5 rounded-full bg-amber-400/30 animate-pulse" />
        <div className="absolute bottom-[18%] right-[14%] w-2 h-2 rounded-full bg-amber-300/40 animate-ping" />
      </div>

      {/* ---------------------------------------------------- */}
      {/* CENTERED MAIN MENU CARD                               */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-10 max-w-lg w-full bg-gradient-to-b from-stone-900/90 via-stone-900/95 to-emerald-950/90 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Official University Crest */}
        <div className="flex justify-center -mt-2">
          <Crest size="lg" showTitle={false} />
        </div>

        {/* Restored Original Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/90 border border-amber-400/50 text-amber-300 text-[11px] font-black tracking-widest uppercase shadow">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Federal University of Omo</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow-md pt-1">
            Undergrad
          </h1>

          {/* Improved Three-Line Description per User Specification */}
          <div className="pt-1.5 text-xs sm:text-[13px] text-stone-200 font-medium leading-relaxed max-w-md mx-auto space-y-0.5">
            <p>Create your own student identity and shape your university journey.</p>
            <p>Attend classes, make friends, explore campus life, and build your future.</p>
            <p className="font-semibold text-amber-300">Your story as an undergraduate starts here.</p>
          </div>
        </div>

        {/* Action Menu Buttons */}
        <div className="space-y-2.5 pt-1">
          {savedGame && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onResumeGame();
              }}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black py-3.5 px-5 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between cursor-pointer border border-amber-300"
            >
              <div className="text-left min-w-0">
                <div className="text-[10px] uppercase font-black text-emerald-950 tracking-wider">
                  Continue Game
                </div>
                <div className="text-base font-extrabold truncate text-stone-950">
                  {savedGame.name}
                </div>
                <div className="text-[11px] font-bold text-emerald-950 truncate">
                  {savedCourse?.name || 'Undergraduate'} • {formatNaira(savedGame.balance)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/20 border border-emerald-950/30 flex items-center justify-center shrink-0 ml-2 shadow-inner">
                <Play className="w-5 h-5 fill-emerald-950 text-emerald-950" />
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={handleStartNewGameClick}
            className={`w-full font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              savedGame
                ? 'bg-stone-800/90 hover:bg-stone-700/90 text-stone-200 border border-stone-700 text-xs'
                : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-sm py-4 border-2 border-amber-400/80 shadow-emerald-900/60'
            }`}
          >
            <GraduationCap className="w-5 h-5 text-amber-300" />
            <span>{savedGame ? 'Start Fresh Admission (New Game)' : 'Start New Game'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="w-full bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-stone-300 hover:text-white font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Audio & Gameplay Settings</span>
          </button>
        </div>

        {/* Academic Session Footer */}
        <div className="text-[10px] text-amber-400/70 font-semibold tracking-wider pt-1">
          2026/2027 Academic Session • Federal University of Omo
        </div>
      </div>

      {/* Overwrite Confirmation Modal */}
      {showOverwriteWarning && savedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full bg-stone-900 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl space-y-4 text-center text-white">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Start a Fresh Admission?</h3>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                An active student career for <span className="font-bold text-amber-300">{savedGame.name}</span> ({savedCourse?.name || 'Student'}) is already saved.
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Starting a new game will begin a fresh admission process. Your prior profile will be replaced once you confirm your new student matriculation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowOverwriteWarning(false);
                }}
                className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs cursor-pointer transition"
              >
                Cancel & Keep Save
              </button>

              <button
                type="button"
                onClick={handleConfirmOverwrite}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-xs cursor-pointer shadow-lg hover:scale-105 transition"
              >
                Proceed with New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
