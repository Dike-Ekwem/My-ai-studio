import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Shield,
  ChevronRight,
  Flame,
  CheckCircle2,
  X,
  Play,
  RotateCcw
} from 'lucide-react';

interface TournamentMatch {
  id: string;
  round: 'semifinal' | 'final';
  team1: string;
  team2: string;
  score1: number | null;
  score2: number | null;
  isPlayerMatch: boolean;
  isCompleted: boolean;
  winner: string | null;
}

interface FootballTournamentViewProps {
  player?: PlayerState | null;
  onPlayMatch: (roundName: string, opponentTeam: string) => void;
  onClose: () => void;
}

export const FootballTournamentView: React.FC<FootballTournamentViewProps> = ({
  player,
  onPlayMatch,
  onClose
}) => {
  const [currentStage, setCurrentStage] = useState<'semifinal' | 'final' | 'champion'>('semifinal');

  const [matches, setMatches] = useState<TournamentMatch[]>([
    {
      id: 'semi_1',
      round: 'semifinal',
      team1: 'Faculty of Engineering (Omo Tech)',
      team2: 'Faculty of Law (Lex Titans)',
      score1: null,
      score2: null,
      isPlayerMatch: true,
      isCompleted: false,
      winner: null
    },
    {
      id: 'semi_2',
      round: 'semifinal',
      team1: 'Faculty of Science (Cyber Hawks)',
      team2: 'Faculty of Arts (Golden Bards)',
      score1: 2,
      score2: 1,
      isPlayerMatch: false,
      isCompleted: true,
      winner: 'Faculty of Science (Cyber Hawks)'
    },
    {
      id: 'final_1',
      round: 'final',
      team1: 'TBD',
      team2: 'Faculty of Science (Cyber Hawks)',
      score1: null,
      score2: null,
      isPlayerMatch: true,
      isCompleted: false,
      winner: null
    }
  ]);

  const handleStartMatch = (match: TournamentMatch) => {
    sounds.playClick();
    const opponent = match.team1.includes('Engineering') ? match.team2 : match.team1;
    onPlayMatch(
      match.round === 'semifinal' ? 'Vice-Chancellor\'s Cup Semifinal' : 'Vice-Chancellor\'s Cup Grand Final',
      opponent
    );
  };

  return (
    <div className="w-full h-full bg-slate-950/95 backdrop-blur-md flex flex-col p-6 text-white font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/20 border-2 border-amber-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            🏆
          </div>
          <div>
            <h1 className="text-xl font-black text-amber-300">
              VICE-CHANCELLOR'S INTER-FACULTY CUP 2026
            </h1>
            <p className="text-xs text-slate-400">
              Knockout Tournament • Federal University of Omo Main Stadium
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Bracket Tree Visualizer */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
          {/* Semifinals Column */}
          <div className="space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Semifinals (Knockout)
            </div>

            {/* Match 1 (Player's Match) */}
            <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Fixture 1</span>
                {matches[0].isCompleted ? (
                  <span className="text-emerald-400 font-bold">Full Time</span>
                ) : (
                  <span className="text-amber-400 font-bold animate-pulse">Ready to Play</span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {matches[0].team1}
                  </span>
                  <span className="text-lg text-emerald-400">{matches[0].score1 ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    {matches[0].team2}
                  </span>
                  <span className="text-lg text-purple-400">{matches[0].score2 ?? '-'}</span>
                </div>
              </div>

              {!matches[0].isCompleted && (
                <button
                  onClick={() => handleStartMatch(matches[0])}
                  className="mt-4 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer text-xs"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Play Semifinal Match
                </button>
              )}
            </div>

            {/* Match 2 (Simulated) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Fixture 2</span>
                <span className="text-slate-400 font-bold">Completed</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-sky-400">
                  <span>{matches[1].team1}</span>
                  <span className="text-base text-white">{matches[1].score1}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-400">
                  <span>{matches[1].team2}</span>
                  <span className="text-base">{matches[1].score2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Final Column */}
          <div className="space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Grand Final (Trophy Match)
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-900 border-2 border-amber-400/80 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between text-xs text-amber-300 mb-3">
                <span className="font-bold">Grand Final Fixture</span>
                <span className="text-[10px] uppercase font-black bg-amber-500/20 px-2 py-0.5 rounded text-amber-400">
                  Gold Medal Match
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between font-black">
                  <span className="text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    {matches[0].isCompleted ? matches[0].winner : 'Winner of Semifinal 1'}
                  </span>
                  <span className="text-xl text-amber-400">{matches[2].score1 ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between font-black">
                  <span className="text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-500" />
                    {matches[2].team2}
                  </span>
                  <span className="text-xl text-sky-400">{matches[2].score2 ?? '-'}</span>
                </div>
              </div>

              {matches[0].isCompleted ? (
                <button
                  onClick={() => handleStartMatch(matches[2])}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer text-xs"
                >
                  <Trophy className="w-4 h-4" />
                  Play Grand Final!
                </button>
              ) : (
                <div className="p-3 bg-slate-800/60 rounded-xl text-center text-xs text-slate-400 font-medium">
                  Win Semifinal 1 to unlock the Grand Final!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tournament Rewards Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🥇</div>
            <div>
              <div className="text-xs font-bold text-white">Championship Trophy & Cash Prize</div>
              <div className="text-[11px] text-slate-400">
                Lift the Vice-Chancellor's Cup • ₦25,000 allowance bonus • +250 Reputation XP
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
            Official FUO Trophy
          </span>
        </div>
      </div>
    </div>
  );
};
