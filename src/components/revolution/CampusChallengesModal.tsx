import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { CooperativeChallenge } from '../../types/revolution';
import { COOPERATIVE_CHALLENGES } from '../../data/revolutionData';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import confetti from 'canvas-confetti';
import {
  Users,
  Sun,
  Trophy,
  Heart,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  X,
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';

interface CampusChallengesModalProps {
  player: PlayerState;
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
}

export const CampusChallengesModal: React.FC<CampusChallengesModalProps> = ({
  player,
  onClose,
  onUpdatePlayer
}) => {
  const [challenges, setChallenges] = useState<CooperativeChallenge[]>(
    player.cooperativeChallenges && player.cooperativeChallenges.length > 0
      ? player.cooperativeChallenges
      : COOPERATIVE_CHALLENGES
  );
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challenges[0]?.id || 'chal_solar_electrification');
  const [contributionInput, setContributionInput] = useState<number>(10000);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeChallenge =
    challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  const handleContribute = () => {
    if (player.balance < contributionInput) {
      sounds.playNotification();
      setFeedback(`Insufficient funds! Your current Omo-Pay balance is ${formatNaira(player.balance)}.`);
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    sounds.playCheer();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    const newAmount = activeChallenge.currentAmount + contributionInput;
    const isNowCompleted = newAmount >= activeChallenge.targetAmount;

    // Check newly unlocked stages
    const updatedStages = activeChallenge.stages.map((stage) => ({
      ...stage,
      achieved: stage.achieved || newAmount >= stage.threshold
    }));

    const updatedChallenges = challenges.map((c) =>
      c.id === activeChallenge.id
        ? {
            ...c,
            currentAmount: newAmount,
            isCompleted: isNowCompleted,
            playerContributionTotal: c.playerContributionTotal + contributionInput,
            stages: updatedStages
          }
        : c
    );

    setChallenges(updatedChallenges);

    onUpdatePlayer((prev) => {
      const newTx = {
        id: `tx_${Date.now()}_chal`,
        reference: `CHALLENGE-CONTRIB-${Math.floor(100000 + Math.random() * 900000)}`,
        date: `Day ${prev.day}`,
        time: 'Civic Contribution',
        description: `Pledge: ${activeChallenge.title}`,
        type: 'debit' as const,
        amount: contributionInput,
        balanceAfter: prev.balance - contributionInput,
        recipientOrSender: 'FUO Student Cooperative Council'
      };

      const repEarned = Math.round(contributionInput / 100);

      // Trigger corresponding physical 3D world transformations
      const updatedWorld = {
        ...(prev.worldEvolution || {
          quadPavilionRenovated: false,
          stadiumTrophyShowcase: false,
          techHubInnovationPedestal: false,
          solarStreetlightsInstalled: false,
          culturalFestivalPavilion: false,
          drainageCanalReinforced: false
        })
      };

      if (activeChallenge.id === 'chal_solar_electrification' && newAmount >= 100000) {
        updatedWorld.solarStreetlightsInstalled = true;
      }
      if (activeChallenge.id === 'chal_nuga_stadium' && newAmount >= 120000) {
        updatedWorld.stadiumTrophyShowcase = true;
      }

      return {
        ...prev,
        balance: prev.balance - contributionInput,
        reputationXP: prev.reputationXP + repEarned,
        transactions: [newTx, ...prev.transactions],
        cooperativeChallenges: updatedChallenges,
        worldEvolution: updatedWorld
      };
    });

    setFeedback(`🎉 Contributed ${formatNaira(contributionInput)}! Milestone progress advanced.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-stone-950 border-2 border-emerald-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 border border-emerald-500/60 rounded-2xl text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  Cooperative Campus Challenges
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  Collective Student Drives
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Join forces with student unions and faculties to fund and construct lasting university infrastructure
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

        {/* Feedback Alert */}
        {feedback && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/60 text-emerald-200 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Challenge Selector */}
          <div className="w-80 sm:w-96 bg-stone-900/60 border-r border-stone-800 p-4 overflow-y-auto space-y-3 shrink-0">
            <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider mb-2">
              Active University Drives
            </div>

            {challenges.map((chal) => {
              const isSelected = chal.id === activeChallenge.id;
              const pct = Math.min(100, Math.round((chal.currentAmount / chal.targetAmount) * 100));

              return (
                <button
                  key={chal.id}
                  type="button"
                  onClick={() => { sounds.playClick(); setSelectedChallengeId(chal.id); }}
                  className={`w-full p-4 rounded-2xl border text-left transition flex flex-col gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950 to-stone-900 border-emerald-500 ring-1 ring-emerald-400/50 shadow-lg'
                      : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">
                      {chal.category === 'electrification' ? '⚡' : chal.category === 'stadium_upgrade' ? '🏆' : '🍲'}
                    </span>
                    <span className="text-xs font-black font-mono text-emerald-400">{pct}%</span>
                  </div>

                  <h3 className="font-extrabold text-sm text-white leading-snug">
                    {chal.title}
                  </h3>

                  <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden border border-stone-700/60 mt-1">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono mt-0.5">
                    <span>{formatNaira(chal.currentAmount)}</span>
                    <span>Target: {formatNaira(chal.targetAmount)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Challenge Detail & Contribution Console */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Challenge Overview Card */}
              <div className="bg-stone-900/90 border border-stone-800 p-6 rounded-3xl shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                      University Civic Initiative
                    </span>
                    <h2 className="text-xl font-black text-white mt-1">
                      {activeChallenge.title}
                    </h2>
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed max-w-2xl">
                      {activeChallenge.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Your Contributions</div>
                    <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                      {formatNaira(activeChallenge.playerContributionTotal)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Amount */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-stone-300">
                      Raised: <strong className="text-white">{formatNaira(activeChallenge.currentAmount)}</strong>
                    </span>
                    <span className="text-amber-400">
                      Target: {formatNaira(activeChallenge.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 rounded-full h-3.5 overflow-hidden border border-stone-700">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (activeChallenge.currentAmount / activeChallenge.targetAmount) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Incremental Stages & Visible Unlocks */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-stone-300 tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Civic Milestones & Physical Campus Upgrades</span>
                </h4>

                <div className="space-y-2.5">
                  {activeChallenge.stages.map((stage, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition ${
                        stage.achieved
                          ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                          : 'bg-stone-900/50 border-stone-800 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            stage.achieved
                              ? 'bg-emerald-500 text-stone-950 shadow'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {stage.achieved ? '✓' : idx + 1}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-white">{stage.name}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5">{stage.benefit}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-xs font-bold text-amber-300">
                        {formatNaira(stage.threshold)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Contribution Form */}
            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">Make a Cooperative Pledge</div>
                <div className="text-[10px] text-stone-400">
                  Available Omo-Pay Balance: <strong className="text-emerald-400">{formatNaira(player.balance)}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {[5000, 10000, 25000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setContributionInput(amt)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold cursor-pointer transition ${
                      contributionInput === amt
                        ? 'bg-amber-500 text-stone-950 font-black shadow'
                        : 'bg-stone-800 text-stone-300 hover:text-white'
                    }`}
                  >
                    {formatNaira(amt)}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleContribute}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black px-6 py-2.5 rounded-2xl text-xs shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Contribute {formatNaira(contributionInput)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
