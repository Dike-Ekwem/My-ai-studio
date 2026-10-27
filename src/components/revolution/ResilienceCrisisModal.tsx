import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { CrisisDisruptionState } from '../../types/revolution';
import { INITIAL_CRISIS_STATE } from '../../data/revolutionData';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Fuel,
  Sun,
  Waves,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Award,
  X,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ResilienceCrisisModalProps {
  player: PlayerState;
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
}

export const ResilienceCrisisModal: React.FC<ResilienceCrisisModalProps> = ({
  player,
  onClose,
  onUpdatePlayer
}) => {
  const [crisis, setCrisis] = useState<CrisisDisruptionState>(
    player.crisisState || INITIAL_CRISIS_STATE
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  // Check inventory for diesel fuel cans
  const dieselInInventory =
    player.inventory.find((i) => i.id === 'item_diesel_can')?.quantity || 0;

  // Task 1: Supply Diesel Can to Health Clinic Generator
  const handleDeliverDiesel = () => {
    if (dieselInInventory <= 0) {
      sounds.playNotification();
      setFeedback('You do not have a 25L Diesel Can! Visit the Outer Lodges Fuel Depot via Keke to procure one.');
      return;
    }

    sounds.playCashPing();
    const newCount = crisis.dieselCansAcquired + 1;
    const isNowClinicSaved = newCount >= crisis.dieselCansRequired;

    setCrisis((prev) => ({
      ...prev,
      dieselCansAcquired: newCount,
      clinicSaved: isNowClinicSaved
    }));

    onUpdatePlayer((prev) => {
      const updatedInv = prev.inventory
        .map((i) => (i.id === 'item_diesel_can' ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);

      const updatedCrisis: CrisisDisruptionState = {
        ...(prev.crisisState || INITIAL_CRISIS_STATE),
        dieselCansAcquired: newCount,
        clinicSaved: isNowClinicSaved
      };

      return {
        ...prev,
        inventory: updatedInv,
        reputationXP: prev.reputationXP + 50,
        crisisState: updatedCrisis
      };
    });

    setFeedback(`⛽ Delivered diesel can to Clinic generator! (${newCount}/${crisis.dieselCansRequired})`);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Task 2: Connect Solar Inverter to Clinic
  const handleConnectSolar = () => {
    sounds.playNotification();
    setCrisis((prev) => ({ ...prev, solarInverterConnected: true }));

    onUpdatePlayer((prev) => ({
      ...prev,
      reputationXP: prev.reputationXP + 60,
      crisisState: {
        ...(prev.crisisState || INITIAL_CRISIS_STATE),
        solarInverterConnected: true
      }
    }));

    setFeedback('☀️ Solar Inverter successfully bridged to Clinic ICU cold-storage!');
    setTimeout(() => setFeedback(null), 3500);
  };

  // Task 3: Unclog Pond Drainage Canal
  const handleClearDrainage = () => {
    sounds.playNotification();
    setCrisis((prev) => ({ ...prev, drainageCleared: true }));

    onUpdatePlayer((prev) => {
      const updatedWorld = {
        ...(prev.worldEvolution || {
          quadPavilionRenovated: false,
          stadiumTrophyShowcase: false,
          techHubInnovationPedestal: false,
          solarStreetlightsInstalled: false,
          culturalFestivalPavilion: false,
          drainageCanalReinforced: false
        }),
        drainageCanalReinforced: true
      };

      return {
        ...prev,
        reputationXP: prev.reputationXP + 60,
        worldEvolution: updatedWorld,
        crisisState: {
          ...(prev.crisisState || INITIAL_CRISIS_STATE),
          drainageCleared: true
        }
      };
    });

    setFeedback('🌊 Unclogged bridge drainage culvert! Flood waters receding from walkway.');
    setTimeout(() => setFeedback(null), 3500);
  };

  // Task 4: Distribute Emergency Lamps
  const handleDistributeLamps = () => {
    sounds.playCashPing();
    const newLamps = Math.min(crisis.emergencyLampsRequired, crisis.emergencyLampsDistributed + 1);

    setCrisis((prev) => ({ ...prev, emergencyLampsDistributed: newLamps }));

    onUpdatePlayer((prev) => ({
      ...prev,
      reputationXP: prev.reputationXP + 35,
      crisisState: {
        ...(prev.crisisState || INITIAL_CRISIS_STATE),
        emergencyLampsDistributed: newLamps
      }
    }));

    setFeedback(`💡 Distributed rechargeable emergency lamp to hostel halls! (${newLamps}/${crisis.emergencyLampsRequired})`);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Claim Vice Chancellor Commendation upon full crisis resolution
  const allTasksCompleted =
    crisis.clinicSaved &&
    crisis.solarInverterConnected &&
    crisis.drainageCleared &&
    crisis.emergencyLampsDistributed >= crisis.emergencyLampsRequired;

  const handleClaimResolutionReward = () => {
    sounds.playCheer();
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });

    const reward = 75000;
    setCrisis((prev) => ({
      ...prev,
      stage: 'resolved',
      completionRewardEarned: true
    }));

    onUpdatePlayer((prev) => {
      const newTx = {
        id: `tx_${Date.now()}_crisis`,
        reference: `VC-CITIZEN-AWARD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: `Day ${prev.day}`,
        time: 'VC Commendation',
        description: 'Crisis Relief & Resilience Leadership Honorarium',
        type: 'credit' as const,
        amount: reward,
        balanceAfter: prev.balance + reward,
        recipientOrSender: 'Office of the Vice-Chancellor'
      };

      return {
        ...prev,
        balance: prev.balance + reward,
        reputationXP: prev.reputationXP + 250,
        gpa: Math.min(5.0, prev.gpa + 0.15),
        transactions: [newTx, ...prev.transactions],
        crisisState: {
          ...(prev.crisisState || INITIAL_CRISIS_STATE),
          stage: 'resolved',
          completionRewardEarned: true
        }
      };
    });

    setFeedback(`🏆 VICTORY: Campus power and drainage fully restored! Awarded ${formatNaira(reward)} VC Scholarship Honorarium!`);
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-stone-950 border-2 border-red-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950 border border-red-500/60 rounded-2xl text-red-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  Campus Crisis & Emergency Relief Desk
                </h2>
                <span className="text-[10px] bg-red-500/20 text-red-300 font-extrabold px-2.5 py-0.5 rounded-full border border-red-400/40">
                  Scenario: National Grid Collapse
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Coordinate fuel supply, emergency solar bridging, and drainage relief to safeguard campus facilities
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
          <div className="bg-red-950/90 border-b border-red-500/60 text-red-200 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* Situation Hero Brief */}
          <div className="bg-gradient-to-r from-red-950/60 via-stone-900 to-amber-950/50 p-5 rounded-3xl border border-red-600/50 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                  Emergency Situation Log
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Surulere Substation Blackout & Tropical Rainstorm
                </h3>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed max-w-2xl">
                  A heavy tropical thunderstorm has damaged the regional power grid. The university health clinic cold-storage vaccines are in danger, the natural pond canal is brimming near the footbridge, and student hostels are in darkness.
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase font-bold text-stone-400">Relief Bounty</div>
                <div className="text-lg font-black text-amber-300 font-mono">
                  {formatNaira(75000)}
                </div>
              </div>
            </div>
          </div>

          {/* Crisis Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-stone-300 tracking-wider flex items-center gap-1.5">
              <span>Required Emergency Actions</span>
            </h4>

            {/* Task 1 */}
            <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-950 border border-amber-500/50 text-amber-400">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-white">
                    Procure & Supply Diesel Fuel to Clinic Generator
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Acquire 25L diesel cans from Outer Lodges Depot via Keke. In inventory:{' '}
                    <strong className="text-amber-300">{dieselInInventory} can(s)</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-stone-300">
                  {crisis.dieselCansAcquired} / {crisis.dieselCansRequired}
                </span>
                <button
                  type="button"
                  onClick={handleDeliverDiesel}
                  disabled={crisis.clinicSaved}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl cursor-pointer transition disabled:opacity-40"
                >
                  {crisis.clinicSaved ? 'Fulfilled ✓' : 'Deliver Can'}
                </button>
              </div>
            </div>

            {/* Task 2 */}
            <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-950 border border-blue-500/50 text-blue-400">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-white">
                    Bridge Prototype Solar Inverter to ICU Storage
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Connect solar battery backup to prevent vital pharmaceutical spoilage
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConnectSolar}
                disabled={crisis.solarInverterConnected}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer transition disabled:opacity-40"
              >
                {crisis.solarInverterConnected ? 'Connected ✓' : 'Bridge Inverter'}
              </button>
            </div>

            {/* Task 3 */}
            <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-white">
                    Clear Flood Debris from Pond Bridge Drainage Canal
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Unclog debris around the arched bridge to keep the central walkway dry
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearDrainage}
                disabled={crisis.drainageCleared}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl cursor-pointer transition disabled:opacity-40"
              >
                {crisis.drainageCleared ? 'Cleared ✓' : 'Clear Canal'}
              </button>
            </div>

            {/* Task 4 */}
            <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-white">
                    Distribute Rechargeable Lamps to Student Halls
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Provide emergency study lighting across Hall A and Palm Lodge
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-stone-300">
                  {crisis.emergencyLampsDistributed} / {crisis.emergencyLampsRequired}
                </span>
                <button
                  type="button"
                  onClick={handleDistributeLamps}
                  disabled={crisis.emergencyLampsDistributed >= crisis.emergencyLampsRequired}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer transition disabled:opacity-40"
                >
                  {crisis.emergencyLampsDistributed >= crisis.emergencyLampsRequired
                    ? 'Distributed ✓'
                    : 'Issue Lamp'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Resolution */}
        <div className="p-4 sm:px-6 bg-stone-900 border-t border-stone-800 flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs font-bold text-white">Crisis Resolution Status</div>
            <div className="text-[11px] text-stone-400">
              {crisis.completionRewardEarned
                ? 'Crisis fully stabilized. VC Commendation awarded.'
                : allTasksCompleted
                ? 'All emergency tasks complete! Ready to submit report to Vice-Chancellor.'
                : 'Fulfill all 4 relief operations to safeguard the campus.'}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClaimResolutionReward}
            disabled={!allTasksCompleted || crisis.completionRewardEarned}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black px-6 py-3 rounded-2xl text-xs shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            <Award className="w-4 h-4 text-stone-950" />
            <span>
              {crisis.completionRewardEarned ? 'Honors Claimed ✓' : 'Submit Relief Report & Claim ₦75,000'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
