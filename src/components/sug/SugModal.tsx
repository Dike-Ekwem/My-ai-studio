import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Vote,
  Award,
  Users,
  Megaphone,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';

interface SugModalProps {
  player: PlayerState;
  onClose: () => void;
  onVoteCandidate: (candidateName: string) => void;
}

export const SugModal: React.FC<SugModalProps> = ({ player, onClose, onVoteCandidate }) => {
  const [voted, setVoted] = useState<string | null>(null);

  const candidates = [
    {
      name: 'Comrade Babatunde "Aluta" Adeleke',
      tagline: 'Welfare First: Free Night Library Buses & Lower Bukka Prices!',
      faculty: 'Faculty of Arts and Humanities',
      color: 'border-amber-500 bg-amber-950/30'
    },
    {
      name: 'Rt. Hon. Chidinma Okeke',
      tagline: 'Academic Excellence: 24/7 Campus Solar Wi-Fi & Modern Lab Kits!',
      faculty: 'Faculty of Engineering and Technology',
      color: 'border-blue-500 bg-blue-950/30'
    },
    {
      name: 'Senator Usman Bello',
      tagline: 'Student Unity: Interfaculty Sports League & Modern Clinic Drugs!',
      faculty: 'Faculty of Commerce and Management',
      color: 'border-emerald-500 bg-emerald-950/30'
    }
  ];

  const handleVote = (candidateName: string) => {
    sounds.playCheer();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setVoted(candidateName);
    onVoteCandidate(candidateName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative max-w-lg w-full max-h-[92vh] overflow-y-auto bg-stone-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-950 border border-emerald-500/50 rounded-xl text-amber-400">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">
                Federal University of Omo SUG
              </div>
              <h2 className="text-lg font-black text-white">Student Union Presidential Debates</h2>
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

        <p className="text-xs text-stone-300 mb-4">
          The Student Union Government (SUG) elections are underway! Vote for your preferred presidential candidate to steer student welfare and university advocacy.
        </p>

        {voted ? (
          <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-black text-amber-300">Your Ballot Has Been Cast!</div>
            <p className="text-xs text-stone-200">
              You voted for <strong>{voted}</strong>. Campus Civic XP +80!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Back to Campus
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((cand, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border ${cand.color} space-y-1.5`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{cand.name}</h3>
                    <div className="text-[10px] text-amber-300">{cand.faculty}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVote(cand.name)}
                    className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition shadow"
                  >
                    Vote
                  </button>
                </div>
                <p className="text-xs text-stone-300 italic">"{cand.tagline}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
