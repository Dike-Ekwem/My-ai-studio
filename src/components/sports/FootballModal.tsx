import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { FootballMatchScene, FootballMatchResult } from './FootballMatchScene';
import { FootballShootoutScene } from './FootballShootoutScene';
import { FootballTournamentView } from './FootballTournamentView';
import { sounds } from '../../utils/audio';
import {
  Trophy,
  Award,
  Flame,
  ArrowRight,
  Shield,
  Target,
  Users,
  Play,
  X,
  Sparkles,
  Zap
} from 'lucide-react';

interface FootballModalProps {
  player?: PlayerState | null;
  onClose: () => void;
  onFinishMatch: (goalsScored: number, xpGained: number, cashReward?: number) => void;
}

type FootballScreen = 'hub' | 'quick_match' | 'shootout' | 'tournament' | 'tournament_match';

export const FootballModal: React.FC<FootballModalProps> = ({
  player,
  onClose,
  onFinishMatch
}) => {
  const [screen, setScreen] = useState<FootballScreen>('hub');
  const [tournamentMatchContext, setTournamentMatchContext] = useState<{ round: string; opponent: string } | null>(null);

  // Quick match callback
  const handleQuickMatchComplete = (result: FootballMatchResult) => {
    onFinishMatch(result.homeGoals, result.xpGained, result.cashGained);
    setScreen('hub');
  };

  // Shootout callback
  const handleShootoutComplete = (playerGoals: number, keeperSaves: number, isWinner: boolean) => {
    const xp = isWinner ? 180 : 70;
    const cash = isWinner ? 5000 : 1500;
    onFinishMatch(playerGoals, xp, cash);
    setScreen('hub');
  };

  // Launch tournament match
  const handleLaunchTournamentMatch = (roundName: string, opponentTeam: string) => {
    setTournamentMatchContext({ round: roundName, opponent: opponentTeam });
    setScreen('tournament_match');
  };

  if (screen === 'quick_match') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <FootballMatchScene
          player={player}
          homeTeamName={player?.faculty ? `${player.faculty} FC` : 'FUO Warriors FC'}
          awayTeamName="Faculty of Law (Lex Titans)"
          homeColor="#047857"
          awayColor="#7e22ce"
          tournamentRound="Quick Match"
          onFinishMatch={handleQuickMatchComplete}
          onExit={() => setScreen('hub')}
        />
      </div>
    );
  }

  if (screen === 'tournament_match') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <FootballMatchScene
          player={player}
          homeTeamName={player?.faculty ? `${player.faculty} FC` : 'FUO Warriors FC'}
          awayTeamName={tournamentMatchContext?.opponent || 'Opponent FC'}
          homeColor="#047857"
          awayColor="#ef4444"
          isTournament={true}
          tournamentRound={tournamentMatchContext?.round || 'VC Cup Match'}
          onFinishMatch={handleQuickMatchComplete}
          onExit={() => setScreen('tournament')}
        />
      </div>
    );
  }

  if (screen === 'shootout') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <FootballShootoutScene
          onClose={() => setScreen('hub')}
          onFinishShootout={handleShootoutComplete}
        />
      </div>
    );
  }

  if (screen === 'tournament') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <FootballTournamentView
          player={player}
          onPlayMatch={handleLaunchTournamentMatch}
          onClose={() => setScreen('hub')}
        />
      </div>
    );
  }

  // Master Matchday Hub Screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-white font-sans overflow-hidden">
        {/* Hub Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              ⚽
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                FEDERAL UNIVERSITY OF OMO STADIUM
              </h1>
              <p className="text-xs text-emerald-400 font-medium">
                Official Campus Football Facility • 3 Playable Sports Modes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Coach Introduction Speech */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="text-3xl">👨🏾‍🏫</div>
          <div>
            <div className="text-xs font-bold text-amber-300">Coach Chukwudi • Head Coach</div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              "Welcome to the university stadium, {player?.name || 'champ'}! Whether you want a full 4v4 match against our fierce campus rivals, a nail-biting penalty shootout duel, or a shot at lifting the Vice-Chancellor's Cup in the Inter-Faculty Tournament, the pitch is yours. Put on your boots and show your class!"
            </p>
          </div>
        </div>

        {/* 3 Distinct Playable Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Mode A: Quick Match */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900/90 border-2 border-emerald-500/60 hover:border-emerald-400 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  MODE A
                </span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-sm font-black text-white mb-1">Quick Match</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Full playable match with AI teammates, opponents, passing, shooting power bar, slide tackles & goalkeepers.
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setScreen('quick_match');
              }}
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Start Match
            </button>
          </div>

          {/* Mode B: Penalty Shootout */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900/90 border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                  MODE B
                </span>
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-sm font-black text-white mb-1">Penalty Shootout</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                5 alternating rounds: Take precision penalty kicks as striker, then dive to save rival shots as goalkeeper!
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setScreen('shootout');
              }}
              className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              Take Penalties
            </button>
          </div>

          {/* Mode C: Inter-Faculty Cup Tournament */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900/90 border-2 border-purple-500/60 hover:border-purple-400 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
                  MODE C
                </span>
                <Trophy className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-sm font-black text-white mb-1">Inter-Faculty Cup</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Knockout tournament bracket! Win the Semifinal and Grand Final to lift the Vice-Chancellor's Golden Trophy.
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setScreen('tournament');
              }}
              className="mt-4 w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              View Bracket
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Stadium Floodlights Active • Grass Mowed Regulation Surface</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition font-medium cursor-pointer"
          >
            Return to Campus Walkway
          </button>
        </div>
      </div>
    </div>
  );
};
