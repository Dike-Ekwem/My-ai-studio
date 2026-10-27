import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { LegacyRecord } from '../../types/revolution';
import { DEFAULT_LEGACY_RECORDS } from '../../data/revolutionData';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Award,
  BookOpen,
  Sparkles,
  Trophy,
  History,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';

interface LegacyDossierModalProps {
  player: PlayerState;
  onClose: () => void;
  onArchiveLegacy: (record: LegacyRecord) => void;
}

export const LegacyDossierModal: React.FC<LegacyDossierModalProps> = ({
  player,
  onClose,
  onArchiveLegacy
}) => {
  const [legacyRecords, setLegacyRecords] = useState<LegacyRecord[]>([
    ...(player.legacyRecords || []),
    ...DEFAULT_LEGACY_RECORDS
  ]);
  const [endowmentNote, setEndowmentNote] = useState('');
  const [archivedSuccess, setArchivedSuccess] = useState(false);

  // Compute player honors
  const currentHonor =
    player.gpa >= 4.5
      ? 'First Class'
      : player.gpa >= 3.5
      ? 'Second Class Upper'
      : 'Second Class Lower';

  const completedInventionsCount =
    player.innovationProjects?.filter((p) => p.isExhibited).length || 0;
  const sportsTrophiesCount = player.reputationXP > 300 ? 2 : 1;
  const casesSolvedCount = player.mysterySolved ? 1 : 0;

  const handleArchiveCurrentStudent = () => {
    sounds.playCheer();
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });

    const newRecord: LegacyRecord = {
      id: `leg_${Date.now()}`,
      studentName: player.name,
      matricNo: player.matricNo,
      courseName: player.faculty || 'Federal University of Omo Undergraduate',
      finalGPA: Number(player.gpa.toFixed(2)),
      honor: currentHonor,
      sugOfficeHeld: player.reputationXP > 500 ? 'SUG Senator of Honour' : undefined,
      sportsTrophies: sportsTrophiesCount,
      patentedInventions: completedInventionsCount,
      casesSolved: casesSolvedCount,
      achievements: [
        `${currentHonor} Degree Honor`,
        player.mysterySolved ? 'Recovered 1926 Founders Mace' : 'Campus Explorer',
        completedInventionsCount > 0 ? 'TETFUND Innovation Patent' : 'Matriculated Scholar'
      ],
      endowmentMessage:
        endowmentNote.trim() || 'Excelsior et Scientia — Built with pride on the Surulere campus.',
      dateGraduated: `Academic Year Day ${player.day}`
    };

    setLegacyRecords([newRecord, ...legacyRecords]);
    onArchiveLegacy(newRecord);
    setArchivedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-stone-950 border-2 border-amber-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950 border border-amber-500/60 rounded-2xl text-amber-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  Senate Hall of Fame & Legacy Archives
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  Generational Heritage
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Permanent institutional records of university achievements, honors, and student alumni legacies
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

        {/* Success Alert */}
        {archivedSuccess && (
          <div className="bg-amber-950 border-b border-amber-500/60 text-amber-200 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Student Career Inducted into the Senate Hall of Fame Archives!</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Current Student Profile Snapshot */}
          <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/40 p-5 rounded-3xl border border-emerald-600/60 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Current Undergraduate Dossier
                </span>
                <h3 className="text-xl font-black text-white mt-1">{player.name}</h3>
                <div className="text-xs text-stone-300 font-mono mt-0.5">{player.matricNo}</div>
              </div>

              <div className="text-right">
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black px-3 py-1 rounded-full">
                  {currentHonor} Standing
                </span>
                <div className="text-base font-black text-white font-mono mt-1">
                  GPA: {player.gpa.toFixed(2)} / 5.0
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-800 text-center">
              <div className="bg-stone-950/80 p-2.5 rounded-2xl border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-bold">Patented Inventions</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                  {completedInventionsCount}
                </div>
              </div>

              <div className="bg-stone-950/80 p-2.5 rounded-2xl border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-bold">Campus Mysteries Solved</div>
                <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                  {casesSolvedCount}
                </div>
              </div>

              <div className="bg-stone-950/80 p-2.5 rounded-2xl border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-bold">Reputation XP</div>
                <div className="text-base font-black text-blue-400 font-mono mt-0.5">
                  {player.reputationXP}
                </div>
              </div>
            </div>

            {/* Archive Form */}
            <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase">
                Alumni Motto / Endowment Message to Future Students
              </label>
              <input
                type="text"
                value={endowmentNote}
                onChange={(e) => setEndowmentNote(e.target.value)}
                placeholder="Leave words of advice for future undergraduates..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleArchiveCurrentStudent}
                className="mt-2 w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-stone-950" />
                <span>Induct Current Student into Senate Hall of Fame</span>
              </button>
            </div>
          </div>

          {/* Hall of Fame Historical Ledger */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Historical Roll of Honour</span>
            </h4>

            <div className="space-y-3">
              {legacyRecords.map((leg) => (
                <div
                  key={leg.id}
                  className="bg-stone-900/90 border border-stone-800 p-4 rounded-3xl space-y-2 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">{leg.studentName}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/40">
                          {leg.honor}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {leg.matricNo} • {leg.dateGraduated} • GPA: {leg.finalGPA}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-stone-300 italic bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                    "{leg.endowmentMessage}"
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {leg.achievements.map((ach, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] bg-stone-800 text-stone-300 font-semibold px-2 py-0.5 rounded-md border border-stone-700/60"
                      >
                        🏅 {ach}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
