import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { OffCampusLocation } from '../../types/revolution';
import { OFF_CAMPUS_LOCATIONS } from '../../data/revolutionData';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import {
  Car,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Compass,
  Utensils,
  Cpu,
  Fuel,
  ArrowLeft
} from 'lucide-react';

interface OffCampusDistrictSceneProps {
  player: PlayerState;
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
}

export const OffCampusDistrictScene: React.FC<OffCampusDistrictSceneProps> = ({
  player,
  onClose,
  onUpdatePlayer
}) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dist_ojuelegba');
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeDistrict =
    OFF_CAMPUS_LOCATIONS.find((d) => d.id === selectedDistrictId) || OFF_CAMPUS_LOCATIONS[0];

  const handlePerformActivity = (activity: OffCampusLocation['availableActivities'][0]) => {
    if (activity.cost > 0 && player.balance < activity.cost) {
      sounds.playNotification();
      setFeedback(`Insufficient funds! You need ${formatNaira(activity.cost)} in your Omo-Pay account.`);
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    sounds.playCashPing();

    onUpdatePlayer((prev) => {
      let newBalance = prev.balance - activity.cost;
      let newStamina = prev.stamina;
      let newHunger = prev.hunger;
      let newRep = prev.reputationXP;
      let newInventory = [...prev.inventory];
      let newTx = [...prev.transactions];

      if (activity.statImpact?.balance) {
        newBalance += activity.statImpact.balance;
      }
      if (activity.statImpact?.stamina) {
        newStamina = Math.min(100, Math.max(0, newStamina + activity.statImpact.stamina));
      }
      if (activity.statImpact?.hunger) {
        newHunger = Math.min(100, Math.max(0, newHunger + activity.statImpact.hunger));
      }
      if (activity.statImpact?.reputation) {
        newRep += activity.statImpact.reputation;
      }

      if (activity.rewardItem) {
        const existingItem = newInventory.find((i) => i.id === activity.rewardItem!.id);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          newInventory.push({
            id: activity.rewardItem.id,
            name: activity.rewardItem.name,
            category: activity.rewardItem.category as any,
            description: `Acquired from ${activeDistrict.name}`,
            price: activity.rewardItem.price,
            quantity: 1
          });
        }
      }

      if (activity.cost > 0) {
        newTx.unshift({
          id: `tx_${Date.now()}_off`,
          reference: `OFF-CAMPUS-${Math.floor(100000 + Math.random() * 900000)}`,
          date: `Day ${prev.day}`,
          time: 'Off-Campus',
          description: `${activity.label} (${activeDistrict.name})`,
          type: 'debit',
          amount: activity.cost,
          balanceAfter: newBalance,
          recipientOrSender: activeDistrict.name
        });
      } else if (activity.statImpact?.balance) {
        newTx.unshift({
          id: `tx_${Date.now()}_gig`,
          reference: `GIG-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
          date: `Day ${prev.day}`,
          time: 'Freelance Payout',
          description: `${activity.label}`,
          type: 'credit',
          amount: activity.statImpact.balance,
          balanceAfter: newBalance,
          recipientOrSender: activeDistrict.name
        });
      }

      return {
        ...prev,
        balance: newBalance,
        stamina: newStamina,
        hunger: newHunger,
        reputationXP: newRep,
        inventory: newInventory,
        transactions: newTx
      };
    });

    setFeedback(`✅ Completed: ${activity.label}! Updated inventory & stats.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-stone-950 border-2 border-amber-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950 border border-amber-500/60 rounded-2xl text-amber-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  Off-Campus Urban Districts
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  Lagos Mainland Corridor
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Connected commercial hubs, electronics markets, and outer student lodges beyond the university gates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { sounds.playClick(); onClose(); }}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Campus</span>
            </button>
            <button
              type="button"
              onClick={() => { sounds.playClick(); onClose(); }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Bar */}
        {feedback && (
          <div className="bg-emerald-950 border-b border-emerald-500/60 text-emerald-200 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* District Selection Tabs */}
        <div className="flex gap-2 p-4 bg-stone-900/60 border-b border-stone-800 overflow-x-auto shrink-0">
          {OFF_CAMPUS_LOCATIONS.map((loc) => {
            const isSelected = loc.id === activeDistrict.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => { sounds.playClick(); setSelectedDistrictId(loc.id); }}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 whitespace-nowrap cursor-pointer transition ${
                  isSelected
                    ? 'bg-amber-600 text-stone-950 font-black shadow-lg ring-1 ring-amber-400'
                    : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700'
                }`}
              >
                <span className="text-base">{loc.imageIcon}</span>
                <span>{loc.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-80">({formatNaira(loc.fare)} fare)</span>
              </button>
            );
          })}
        </div>

        {/* Main District Scene Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* District Atmosphere Hero Card */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 p-6 rounded-3xl border border-stone-800 shadow-2xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {activeDistrict.tagline}
                </span>
                <h1 className="text-2xl font-black text-white mt-1">
                  {activeDistrict.name}
                </h1>
                <p className="text-xs text-stone-300 mt-2 max-w-2xl leading-relaxed">
                  {activeDistrict.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-stone-400 uppercase font-bold">Transit Fare from Campus</div>
                <div className="text-lg font-black text-amber-300 font-mono">
                  {formatNaira(activeDistrict.fare)} Keke
                </div>
              </div>
            </div>
          </div>

          {/* District Local Activities & Vendors */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase text-stone-300 tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Available Urban Stalls & District Activities</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeDistrict.availableActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-stone-900/90 border border-stone-800 p-4.5 rounded-3xl flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition shadow-xl"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">
                        {act.id.includes('electronics')
                          ? '⚡'
                          : act.id.includes('suya')
                          ? '🥩'
                          : act.id.includes('gig')
                          ? '💻'
                          : act.id.includes('print')
                          ? '🖨️'
                          : act.id.includes('diesel')
                          ? '🛢️'
                          : '☕'}
                      </span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {act.cost > 0 ? formatNaira(act.cost) : 'Free / Paid Gig'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-white leading-snug">
                      {act.label}
                    </h3>

                    <p className="text-xs text-stone-400 leading-relaxed">
                      {act.description}
                    </p>

                    {act.rewardItem && (
                      <div className="mt-2 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/40">
                        🎁 Yields Item: {act.rewardItem.name}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePerformActivity(act)}
                    className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5 transform active:scale-95"
                  >
                    <span>Engage Activity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
