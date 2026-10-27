import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import { ShieldAlert, Moon, Bed, Clock, ArrowRight, ShieldCheck, Sun } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CurfewModalProps {
  player: PlayerState;
  officerName?: string;
  locationName?: string;
  onEscortToHostel: () => void;
}

export const CurfewModal: React.FC<CurfewModalProps> = ({
  player,
  officerName = 'Officer Balogun (Campus Security)',
  locationName = 'Near Hostels Quadrangle',
  onEscortToHostel
}) => {
  const [step, setStep] = useState<'intercept' | 'escorting' | 'morning'>('intercept');

  const handleComply = () => {
    sounds.playClick();
    setStep('escorting');

    setTimeout(() => {
      setStep('morning');
      sounds.playNotification();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, 2400);
  };

  const handleWakeUp = () => {
    sounds.playClick();
    onEscortToHostel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-red-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        {step === 'intercept' && (
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/40 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                  University Curfew Enforcement • 10:00 PM - 6:00 AM
                </div>
                <h2 className="text-lg font-black text-white leading-tight">
                  Night Patrol Intercept!
                </h2>
                <div className="text-xs text-stone-400 font-medium">
                  {officerName} • {locationName}
                </div>
              </div>
            </div>

            {/* Officer Dialogue Card */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-2xl opacity-40">🔦</div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                Security Officer Warning:
              </div>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
                "HALT right there! Student ID check! Do you know what time it is? It is past 10:00 PM! Campus curfew is strictly enforced. Fresh students must not be found wandering the campus after curfew hours. The campus is dark, dull, and locked for the night!"
              </p>
            </div>

            {/* Curfew Rules Notice */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2.5">
              <Moon className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                To ensure campus safety, the officer must escort you directly to your hostel room to sleep until 6:00 AM.
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleComply}
                className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm rounded-2xl shadow-xl transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Bed className="w-4 h-4" />
                <span>"Sorry Officer, please escort me to my hostel to sleep"</span>
              </button>

              <button
                type="button"
                onClick={handleComply}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                "I was studying late, heading to bed now"
              </button>
            </div>
          </div>
        )}

        {step === 'escorting' && (
          <div className="p-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center mx-auto animate-spin">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">Escorting to Hostel Room...</h3>
            <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
              Officer Balogun escorts you through the quiet night campus back to your hall of residence. The doors are secured and you tuck into bed for a full night's rest.
            </p>
            <div className="flex justify-center items-center gap-2 text-xs text-amber-400 font-mono">
              <span>10:30 PM</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span>06:00 AM Sunrise</span>
            </div>
          </div>
        )}

        {step === 'morning' && (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-xl">
              <Sun className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Good Morning • 06:00 AM
              </span>
              <h3 className="text-xl font-black text-white mt-1">Full Night's Rest Completed!</h3>
            </div>

            <p className="text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
              The morning bird calls sound and the Abuja sun rises over the Federal University of Omo. Campus gates have reopened and morning lectures are in session!
            </p>

            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 text-xs text-emerald-400 font-bold flex items-center justify-around">
              <span>⚡ Stamina: 100% (Fully Restored)</span>
              <span>🍲 Hunger: Reset</span>
            </div>

            <button
              type="button"
              onClick={handleWakeUp}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm rounded-2xl shadow-xl transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Wake Up & Step Out to Campus</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
