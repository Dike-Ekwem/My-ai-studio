import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { BasketballGameScene, BasketballGameResult } from './BasketballGameScene';
import { BasketballThreePointScene } from './BasketballThreePointScene';
import { sounds } from '../../utils/audio';
import {
  Trophy,
  Flame,
  Award,
  ArrowRight,
  Shield,
  Target,
  Users,
  Play,
  X,
  Sparkles,
  Zap
} from 'lucide-react';

interface BasketballModalProps {
  player?: PlayerState;
  onClose: () => void;
  onFinishChallenge: (basketsMade: number, xpGained: number) => void;
}

type BasketballScreen = 'hub' | 'quick_game' | 'three_point' | 'streetball_1v1';

export const BasketballModal: React.FC<BasketballModalProps> = ({
  player,
  onClose,
  onFinishChallenge
}) => {
  const [screen, setScreen] = useState<BasketballScreen>('hub');

  // Callback for Quick Game or 1v1 Streetball
  const handleGameFinished = (result: BasketballGameResult) => {
    onFinishChallenge(result.userPoints, result.xpGained);
    setScreen('hub');
  };

  // Callback for 3-Point Challenge
  const handleThreePointFinished = (basketsMade: number, totalScore: number, xpGained: number) => {
    onFinishChallenge(basketsMade, xpGained);
    setScreen('hub');
  };

  if (screen === 'quick_game') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <BasketballGameScene
          player={player}
          mode="quick_game"
          homeTeamName={player?.faculty ? `${player.faculty} Warriors` : 'FUO Warriors'}
          awayTeamName="Faculty of Law Titans"
          onFinishGame={handleGameFinished}
          onExit={() => setScreen('hub')}
        />
      </div>
    );
  }

  if (screen === 'streetball_1v1') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <BasketballGameScene
          player={player}
          mode="streetball_1v1"
          homeTeamName={player?.name || 'You'}
          awayTeamName="Captain Tobe (Street King)"
          onFinishGame={handleGameFinished}
          onExit={() => setScreen('hub')}
        />
      </div>
    );
  }

  if (screen === 'three_point') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <BasketballThreePointScene
          onClose={() => setScreen('hub')}
          onFinishChallenge={handleThreePointFinished}
        />
      </div>
    );
  }

  // Master Basketball Hub
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-sky-500/70 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-white font-sans overflow-hidden">
        {/* Hub Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-500/20 border-2 border-sky-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              🏀
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                FEDERAL UNIVERSITY OF OMO BASKETBALL ARENA
              </h1>
              <p className="text-xs text-sky-400 font-medium">
                Official Campus Hoops Venue • 3 Playable Basketball Modes
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

        {/* Court Captain Dialogue */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="text-3xl">😎</div>
          <div>
            <div className="text-xs font-bold text-amber-300">Captain Tobe • Campus Hoops Icon</div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              "Yo fresher! Welcome to the Undergrad Hoops Arena! The student crowd came out to see if your handles and jumper can hold down the court. We got 3 distinct modes: team up for a 3v3 match, test your shooter's touch in the 3-Point Challenge, or step onto the blacktop against me in a 1-on-1 duel. Let's see some buckets!"
            </p>
          </div>
        </div>

        {/* 3 Distinct Playable Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Mode A: Quick Game */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900/90 border-2 border-sky-500/60 hover:border-sky-400 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded">
                  MODE A
                </span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <h2 className="text-sm font-black text-white mb-1">Quick Game (3v3)</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Full playable basketball match with dribble mechanics, jump shots, passes, rebounds, steals & 24s shot clock.
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setScreen('quick_game');
              }}
              className="mt-4 w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Play 3v3
            </button>
          </div>

          {/* Mode B: Three-Point Challenge */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900/90 border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                  MODE B
                </span>
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-sm font-black text-white mb-1">3-Point Contest</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                60-second timed challenge across 5 racks around the arc with 2-point Money Balls and release timing gauge!
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setScreen('three_point');
              }}
              className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              Shoot 3-Pointers
            </button>
          </div>

          {/* Mode C: 1v1 Streetball Duel */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900/90 border-2 border-orange-500/60 hover:border-orange-400 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">
                  MODE C
                </span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <h2 className="text-sm font-black text-white mb-1">1v1 Streetball</h2>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Head-to-head showdown against Captain Tobe! First to 11 points wins. Crossovers, pull-ups, and lock-down defense.
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setScreen('streetball_1v1');
              }}
              className="mt-4 w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              Play 1v1 Duel
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>Acrylic Court Surface • Regulation 3.05m Hoops & Glass Backboards</span>
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
