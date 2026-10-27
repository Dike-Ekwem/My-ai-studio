import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { RoomCustomizationState } from '../../types/revolution';
import { INITIAL_ROOM_CUSTOMIZATION } from '../../data/revolutionData';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import confetti from 'canvas-confetti';
import {
  Palette,
  Sparkles,
  CheckCircle2,
  X,
  Image,
  Layers,
  Monitor,
  Trophy,
  Lightbulb,
  Home
} from 'lucide-react';

interface RoomDecoratorModalProps {
  player: PlayerState;
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
}

export const RoomDecoratorModal: React.FC<RoomDecoratorModalProps> = ({
  player,
  onClose,
  onUpdatePlayer
}) => {
  const [config, setConfig] = useState<RoomCustomizationState>(
    player.roomCustomization || INITIAL_ROOM_CUSTOMIZATION
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveDecor = () => {
    sounds.playCashPing();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    onUpdatePlayer((prev) => ({
      ...prev,
      roomCustomization: config,
      fun: Math.min(100, (prev.fun || 80) + 15),
      reputationXP: prev.reputationXP + 25
    }));

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-stone-950 border-2 border-emerald-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 border border-emerald-500/60 rounded-2xl text-amber-400">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  Hostel Room 3D Interior Decorator
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  Hall A & Palm Lodge
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Personalise your student room bedding, wall art, coding rigs, and ambient fairy lights
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Success Alert */}
        {savedSuccess && (
          <div className="bg-emerald-950 border-b border-emerald-500/60 text-emerald-200 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Room Customization Saved! Live 3D interior updated.</span>
          </div>
        )}

        {/* Options Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Section 1: Wall Poster Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Image className="w-4 h-4 text-emerald-400" />
              <span>1. Wall Art & Poster Motif</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'afrobeat_legends', name: 'Afrobeat Legends (Fela & Burna)', icon: '🎷' },
                { id: 'super_eagles', name: 'Super Eagles 1996 Gold', icon: '🦅' },
                { id: 'tech_matrix', name: 'Neural Code Matrix', icon: '💻' },
                { id: 'fuo_heritage', name: '1926 University Heritage', icon: '🏛️' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { sounds.playClick(); setConfig({ ...config, wallPoster: opt.id as any }); }}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    config.wallPoster === opt.id
                      ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/50 text-white'
                      : 'bg-stone-900/80 hover:bg-stone-850 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <div className="font-extrabold text-xs">{opt.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Bedding & Duvet Style */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>2. Bedding & Duvet Fabric</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'ankara_gold', name: 'Ankara Gold Wax Print', color: '#d97706' },
                { id: 'emerald_velvet', name: 'Royal Emerald Velvet', color: '#047857' },
                { id: 'indigo_traditional', name: 'Abeokuta Indigo Tie-Dye', color: '#312e81' },
                { id: 'standard', name: 'Minimalist Clean White', color: '#94a3b8' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { sounds.playClick(); setConfig({ ...config, duvetStyle: opt.id as any }); }}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    config.duvetStyle === opt.id
                      ? 'bg-stone-900 border-amber-400 ring-2 ring-amber-400/50 text-white'
                      : 'bg-stone-900/60 hover:bg-stone-850 border-stone-800 text-stone-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full shrink-0 shadow" style={{ backgroundColor: opt.color }} />
                  <span className="font-bold text-xs">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Study Desk & Electronics Rig */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span>3. Study Desk & Workstation Hardware</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'dual_monitor_tech', name: 'Dual Monitor Tech Bro Rig', desc: 'Mechanical keyboard, widescreen display & headphones' },
                { id: 'artist_drafting', name: 'Architecture & Drafting Desk', desc: 'Adjustable easel, sketchbooks & drafting ruler' },
                { id: 'basic_study', name: 'Classical Academic Library Desk', desc: 'Reading lamp, course binders & textbooks' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { sounds.playClick(); setConfig({ ...config, deskRig: opt.id as any }); }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    config.deskRig === opt.id
                      ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400/50 text-white'
                      : 'bg-stone-900/80 hover:bg-stone-850 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="font-extrabold text-xs text-white">{opt.name}</div>
                  <div className="text-[10px] text-stone-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Ambient Lights & Trophies */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span>4. Room Ambience & Fixtures</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setConfig({ ...config, stringLightsActive: !config.stringLightsActive })}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                  config.stringLightsActive
                    ? 'bg-amber-950/60 border-amber-500 text-white'
                    : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white">Warm Fairy String Lights</div>
                  <div className="text-[10px] text-stone-400">Cozy ambient ceiling glow</div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    config.stringLightsActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-800'
                  }`}
                >
                  {config.stringLightsActive ? '✓' : ''}
                </div>
              </div>

              <div
                onClick={() => setConfig({ ...config, trophyShelf: !config.trophyShelf })}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                  config.trophyShelf
                    ? 'bg-amber-950/60 border-amber-500 text-white'
                    : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white">Academic & Sports Trophy Shelf</div>
                  <div className="text-[10px] text-stone-400">Showcase tournament cups & awards</div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    config.trophyShelf ? 'bg-amber-400 text-stone-950' : 'bg-stone-800'
                  }`}
                >
                  {config.trophyShelf ? '✓' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-stone-900 border-t border-stone-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-400">
            Changes are saved permanently to your student save file
          </div>

          <button
            type="button"
            onClick={handleSaveDecor}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black px-7 py-3 rounded-2xl text-xs shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Apply 3D Room Decor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
