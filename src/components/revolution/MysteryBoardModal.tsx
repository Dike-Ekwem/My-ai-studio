import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { MysteryClue, MysterySuspect } from '../../types/revolution';
import { MYSTERY_CLUES, MYSTERY_SUSPECTS } from '../../data/revolutionData';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import confetti from 'canvas-confetti';
import {
  Search,
  FileText,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  X,
  Sparkles,
  Award,
  Pin,
  MapPin,
  Compass,
  ArrowRight
} from 'lucide-react';

interface MysteryBoardModalProps {
  player: PlayerState;
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
}

export const MysteryBoardModal: React.FC<MysteryBoardModalProps> = ({
  player,
  onClose,
  onUpdatePlayer
}) => {
  const [clues, setClues] = useState<MysteryClue[]>(
    player.mysteryClues && player.mysteryClues.length > 0 ? player.mysteryClues : MYSTERY_CLUES
  );
  const [suspects, setSuspects] = useState<MysterySuspect[]>(MYSTERY_SUSPECTS);
  const [selectedClueId, setSelectedClueId] = useState<string>(clues[0]?.id || 'clue_archive_ledger');
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('suspect_contractor_danladi');
  const [tribunalResult, setTribunalResult] = useState<{ success: boolean; message: string } | null>(
    player.mysterySolved
      ? {
          success: true,
          message: 'Case Solved! Alhaji Danladi confessed and returned the 1926 Founders Mace to the Senate Building.'
        }
      : null
  );

  const activeClue = clues.find((c) => c.id === selectedClueId) || clues[0];
  const activeSuspect = suspects.find((s) => s.id === selectedSuspectId) || suspects[0];

  // Discover clue handler (searches the specified location on campus)
  const handleDiscoverClue = (clueId: string) => {
    sounds.playNotification();
    setClues((prev) => {
      const updated = prev.map((c) => (c.id === clueId ? { ...c, discovered: true } : c));
      onUpdatePlayer((p) => ({ ...p, mysteryClues: updated, reputationXP: p.reputationXP + 30 }));
      return updated;
    });
  };

  // Submit formal accusation to Senate Tribunal
  const handleSubmitAccusation = (suspectId: string) => {
    sounds.playClick();
    const suspect = suspects.find((s) => s.id === suspectId);
    if (!suspect) return;

    const discoveredCount = clues.filter((c) => c.discovered).length;

    if (discoveredCount < 2) {
      setTribunalResult({
        success: false,
        message: 'Insufficient Evidence! The Senate Disciplinary Committee requires at least 2 verified pieces of physical evidence before opening a formal hearing.'
      });
      return;
    }

    if (suspect.isCulprit) {
      sounds.playCheer();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });

      const bounty = 60000;
      onUpdatePlayer((prev) => {
        const newTx = {
          id: `tx_${Date.now()}`,
          reference: `SENATE-BOUNTY-${Math.floor(100000 + Math.random() * 900000)}`,
          date: `Day ${prev.day}`,
          time: 'Investigation Bounty',
          description: 'University Heritage Recovery Award: 1926 Founders Mace',
          type: 'credit' as const,
          amount: bounty,
          balanceAfter: prev.balance + bounty,
          recipientOrSender: 'Senate Disciplinary Committee'
        };

        return {
          ...prev,
          balance: prev.balance + bounty,
          reputationXP: prev.reputationXP + 200,
          gpa: Math.min(5.0, prev.gpa + 0.1),
          mysterySolved: true,
          transactions: [newTx, ...prev.transactions]
        };
      });

      setTribunalResult({
        success: true,
        message: `CASE SOLVED! Alhaji Danladi broke down under the weight of the Ojuelegba pawn slip and lab access logs. The 1926 Founders Mace has been restored to the Senate Citadel. Awarded ${formatNaira(bounty)} + 200 XP!`
      });
    } else {
      sounds.playBuzzer();
      onUpdatePlayer((prev) => ({
        ...prev,
        reputationXP: Math.max(0, prev.reputationXP - 40)
      }));

      setTribunalResult({
        success: false,
        message: `False Accusation! ${suspect.name}'s alibi was substantiated by security footage. The Senate warned you against unverified claims (-40 XP). Review your clues carefully!`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-stone-950 border-2 border-amber-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950 border border-amber-500/60 rounded-2xl text-amber-400">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  Senate Investigation & Evidence Board
                </h2>
                <span className="text-[10px] bg-red-500/20 text-red-300 font-extrabold px-2.5 py-0.5 rounded-full border border-red-400/40">
                  Case #FUO-1926-MACE
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Investigate the missing 1926 ceremonial Founder's Mace and examination syndicate leak across campus
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

        {/* Tribunal Verdict Banner */}
        {tribunalResult && (
          <div
            className={`px-6 py-3 text-xs font-bold flex items-center gap-2.5 border-b shrink-0 animate-in slide-in-from-top-2 ${
              tribunalResult.success
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                : 'bg-red-950/90 border-red-500/60 text-red-200'
            }`}
          >
            {tribunalResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{tribunalResult.message}</span>
          </div>
        )}

        {/* Investigation Corkboard Surface */}
        <div className="flex-1 flex overflow-hidden bg-[#18130d] [background-image:linear-gradient(to_right,#2a1e12_1px,transparent_1px),linear-gradient(to_bottom,#2a1e12_1px,transparent_1px)] [background-size:24px_24px]">
          {/* Left: Clues Pinboard */}
          <div className="w-80 sm:w-96 bg-stone-900/80 border-r border-stone-800 p-4 overflow-y-auto space-y-3 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" /> Physical Evidence Clues
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {clues.filter((c) => c.discovered).length} / {clues.length} Found
              </span>
            </div>

            {clues.map((clue) => {
              const isSelected = clue.id === activeClue.id;
              return (
                <div
                  key={clue.id}
                  onClick={() => { sounds.playClick(); setSelectedClueId(clue.id); }}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950 to-stone-900 border-amber-500 ring-1 ring-amber-400/50 shadow-lg'
                      : 'bg-stone-900/90 hover:bg-stone-850 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-white">{clue.title}</span>
                    {clue.discovered ? (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Discovered
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                        Undiscovered
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{clue.location}</span>
                  </div>

                  {!clue.discovered && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDiscoverClue(clue.id);
                      }}
                      className="mt-2.5 w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-[10px] rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow"
                    >
                      <Search className="w-3 h-3" /> Search Location for Clue
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Suspect Dossiers & Tribunal Hearing */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Active Clue Detail Card */}
              <div className="bg-stone-900/90 border border-stone-800 p-4.5 rounded-3xl shadow-xl">
                <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  Selected Evidence Inspection
                </div>
                <h3 className="text-lg font-black text-white mt-1">{activeClue.title}</h3>
                <div className="text-xs text-amber-300 font-semibold mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Found at: {activeClue.location}
                </div>
                <p className="text-xs text-stone-300 mt-2.5 leading-relaxed bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
                  {activeClue.discovered
                    ? activeClue.description
                    : 'Search this campus location to uncover this piece of physical evidence and reveal its critical forensic insight.'}
                </p>

                {activeClue.discovered && (
                  <div className="mt-3 p-3 bg-blue-950/40 border border-blue-500/40 rounded-2xl text-xs text-blue-200">
                    <strong>Forensic Deduction:</strong> {activeClue.insight}
                  </div>
                )}
              </div>

              {/* Suspect Profiles & Interrogations */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-stone-300 tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Persons of Interest & Witness Testimonies</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suspects.map((suspect) => {
                    const isSelected = suspect.id === activeSuspect.id;
                    return (
                      <div
                        key={suspect.id}
                        onClick={() => { sounds.playClick(); setSelectedSuspectId(suspect.id); }}
                        className={`p-4 rounded-3xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 border-amber-500 ring-2 ring-amber-400/50 shadow-xl'
                            : 'bg-stone-900/60 hover:bg-stone-850 border-stone-800 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl p-2 rounded-2xl bg-stone-950 border border-stone-800">
                            {suspect.avatar}
                          </span>
                          <div>
                            <div className="font-black text-sm text-white">{suspect.name}</div>
                            <div className="text-[10px] text-amber-400 font-bold">{suspect.role}</div>
                          </div>
                        </div>

                        <div className="text-[11px] text-stone-300 space-y-1 mt-2">
                          <div>
                            <strong className="text-stone-400">Suspected Motive:</strong> {suspect.motive}
                          </div>
                          <div>
                            <strong className="text-stone-400">Stated Alibi:</strong> {suspect.alibi}
                          </div>
                        </div>

                        <div className="mt-3 p-2.5 bg-stone-950 rounded-xl border border-stone-800 text-[11px] text-stone-400 italic">
                          {suspect.testimony}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Action: Formal Accusation Submission */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">Disciplinary Tribunal Hearing</div>
                <div className="text-[11px] text-stone-400">
                  Targeted Suspect: <strong className="text-amber-300">{activeSuspect.name}</strong> ({activeSuspect.role})
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSubmitAccusation(activeSuspect.id)}
                disabled={player.mysterySolved}
                className="bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-500 hover:to-amber-500 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Award className="w-4 h-4" />
                <span>
                  {player.mysterySolved ? 'Mystery Already Solved (Mace Recovered)' : `Indict ${activeSuspect.name} Before Senate Committee`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
