import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { ACCOMMODATIONS } from '../../data/accommodations';
import { sounds } from '../../utils/audio';
import {
  Home,
  Moon,
  BookOpen,
  Coffee,
  MessageCircle,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  Zap
} from 'lucide-react';

interface HostelModalProps {
  player: PlayerState;
  onClose: () => void;
  onSleep: () => void;
  onStudy: () => void;
  onChatRoommate: (replyText: string) => void;
}

export const HostelModal: React.FC<HostelModalProps> = ({
  player,
  onClose,
  onSleep,
  onStudy,
  onChatRoommate
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'roommate' | 'study'>('room');
  const [feedback, setFeedback] = useState<string | null>(null);

  const accommodation = ACCOMMODATIONS.find((a) => a.id === player.selectedAccommodationId) || ACCOMMODATIONS[0];
  const roommate = player.roommate;

  const handleRest = () => {
    sounds.playNotification();
    onSleep();
    setFeedback('You slept peacefully. Stamina restored to 100%! Advanced to next morning.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeskStudy = () => {
    if (player.stamina < 15) {
      sounds.playClick();
      setFeedback('⚠️ Too tired to study! Have a rest on your bed first.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    sounds.playNotification();
    onStudy();
    setFeedback('Dedicated 2 hours of revision at your desk. GPA and Exam Confidence boosted! (+40 XP)');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative max-w-lg w-full max-h-[92vh] overflow-y-auto bg-stone-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-950 border border-emerald-500/50 rounded-xl text-amber-400">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">
                Student Residence
              </div>
              <h2 className="text-lg font-black text-white">{accommodation.name}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback */}
        {feedback && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 p-2.5 rounded-xl text-xs mb-3 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Room Illustration representation */}
        <div className="relative h-40 bg-gradient-to-br from-amber-950/60 via-stone-900 to-emerald-950 rounded-2xl border border-stone-700 p-4 mb-4 flex flex-col justify-between overflow-hidden shadow-inner">
          <div className="flex justify-between items-start text-xs">
            <span className="bg-black/60 px-2.5 py-1 rounded-full text-amber-300 font-bold border border-stone-700">
              🛏️ Room #{player.matricNo.slice(-3)}
            </span>
            <span className="text-[11px] text-stone-400">Ceiling Fan Humming • Tap Water Running</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-600 flex items-center justify-center text-2xl">
              {roommate ? roommate.avatar : '👤'}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {roommate ? roommate.name : 'Single Room Resident'}
              </div>
              <div className="text-[11px] text-emerald-400">
                {roommate ? `${roommate.department} • Roommate` : 'Private Studio Unit'}
              </div>
            </div>
          </div>
        </div>

        {/* Room Actions */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleRest}
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700 p-3 rounded-2xl text-left cursor-pointer transition group shadow"
            >
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
                <Moon className="w-4 h-4" />
                <span>Sleep / Rest</span>
              </div>
              <div className="text-[10px] text-stone-400">Refill Stamina to 100% and advance to next morning</div>
            </button>

            <button
              type="button"
              onClick={handleDeskStudy}
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700 p-3 rounded-2xl text-left cursor-pointer transition group shadow"
            >
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Study at Desk</span>
              </div>
              <div className="text-[10px] text-stone-400">Boost GPA & Exam readiness (-15% stamina)</div>
            </button>
          </div>

          {/* Roommate Interaction if available */}
          {roommate && (
            <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700 space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Roommate Banter ({roommate.name})</span>
              </div>
              <p className="text-xs text-stone-300 italic">
                "{roommate.personality}"
              </p>
              <div className="flex gap-1.5 pt-1">
                {[
                  'Guy, borrow me 2k for urgent provisions',
                  'Let us go to the lecture room together!',
                  'I bought some bread and suya from the market.'
                ].map((banter, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sounds.playNotification();
                      onChatRoommate(banter);
                      setFeedback(`Roommate replied: "Sharp! You're a true bro!" (Relationship +10)`);
                      setTimeout(() => setFeedback(null), 3000);
                    }}
                    className="flex-1 bg-stone-900 hover:bg-emerald-950 border border-stone-700 hover:border-emerald-500 p-2 rounded-xl text-[10px] text-stone-200 transition text-left cursor-pointer"
                  >
                    💬 {banter.slice(0, 22)}...
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
