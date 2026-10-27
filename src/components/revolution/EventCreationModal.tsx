import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { CampusCultureEvent } from '../../types/revolution';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Sparkles,
  DollarSign,
  Users,
  Radio,
  Utensils,
  Volume2,
  CheckCircle2,
  Award,
  X,
  MapPin,
  TrendingUp,
  Layers
} from 'lucide-react';

interface EventCreationModalProps {
  player: PlayerState;
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
}

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  player,
  onClose,
  onUpdatePlayer
}) => {
  const [eventType, setEventType] = useState<CampusCultureEvent['eventType']>('afrobeat_jam');
  const [selectedVenue, setSelectedVenue] = useState<{ id: string; name: string }>({
    id: 'amphitheatre_lawn',
    name: 'Central Roundabout Lawn Amphitheatre'
  });
  const [ticketPrice, setTicketPrice] = useState<number>(500);
  const [includeRadioHype, setIncludeRadioHype] = useState<boolean>(true);
  const [includeCatering, setIncludeCatering] = useState<boolean>(true);
  const [includeSoundRig, setIncludeSoundRig] = useState<boolean>(true);
  const [eventResult, setEventResult] = useState<{
    turnout: number;
    revenue: number;
    profit: number;
    reputation: number;
  } | null>(null);

  // Budget calculations
  const radioCost = includeRadioHype ? 4000 : 0;
  const cateringCost = includeCatering ? 7500 : 0;
  const soundCost = includeSoundRig ? 6500 : 0;
  const baseCost = 5000;
  const totalCost = baseCost + radioCost + cateringCost + soundCost;

  // Execute Event
  const handleHostEvent = () => {
    if (player.balance < totalCost) {
      sounds.playNotification();
      alert(`Insufficient Omo-Pay balance! This event requires ${formatNaira(totalCost)} for preparation and logistics.`);
      return;
    }

    sounds.playCheer();
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });

    // Turnout formula influenced by marketing and amenities
    let baseTurnout = 65;
    if (includeRadioHype) baseTurnout += 75;
    if (includeCatering) baseTurnout += 50;
    if (includeSoundRig) baseTurnout += 60;
    if (ticketPrice > 1000) baseTurnout -= 30;

    const finalTurnout = Math.max(25, Math.round(baseTurnout * (0.85 + Math.random() * 0.3)));
    const revenue = finalTurnout * ticketPrice;
    const profit = revenue - totalCost;
    const repGained = Math.round(finalTurnout * 1.5) + (includeRadioHype ? 40 : 0);

    setEventResult({
      turnout: finalTurnout,
      revenue,
      profit,
      reputation: repGained
    });

    onUpdatePlayer((prev) => {
      const newEvent: CampusCultureEvent = {
        id: `event_${Date.now()}`,
        title:
          eventType === 'afrobeat_jam'
            ? 'FUO Afrobeat & Highlife Campus Jam'
            : eventType === 'tech_hackathon'
            ? 'Surulere Tech Hackathon & Innovation Expo'
            : eventType === 'football_derby'
            ? 'Inter-Faculty Championship Derby'
            : eventType === 'cultural_gala'
            ? 'Annual Student Cultural Unity Gala'
            : 'FUO Student Welfare Charity Drive',
        eventType,
        venueId: selectedVenue.id,
        venueName: selectedVenue.name,
        budgetSpent: totalCost,
        ticketPrice,
        radioHypeActive: includeRadioHype,
        cateringOrdered: includeCatering,
        soundRigRented: includeSoundRig,
        turnoutAttendees: finalTurnout,
        revenueEarned: revenue,
        reputationGained: repGained,
        completed: true,
        dateHeld: `Day ${prev.day}`
      };

      const updatedWorld = {
        ...(prev.worldEvolution || {
          quadPavilionRenovated: false,
          stadiumTrophyShowcase: false,
          techHubInnovationPedestal: false,
          solarStreetlightsInstalled: false,
          culturalFestivalPavilion: false,
          drainageCanalReinforced: false
        }),
        culturalFestivalPavilion: true
      };

      const debitTx = {
        id: `tx_${Date.now()}_cost`,
        reference: `EVENT-EXPENSE-${Math.floor(100000 + Math.random() * 900000)}`,
        date: `Day ${prev.day}`,
        time: 'Event Production',
        description: `Staging & Logistics: ${newEvent.title}`,
        type: 'debit' as const,
        amount: totalCost,
        balanceAfter: prev.balance - totalCost + revenue,
        recipientOrSender: 'Campus Event Logistics Board'
      };

      const creditTx = {
        id: `tx_${Date.now()}_rev`,
        reference: `TICKET-GATE-${Math.floor(100000 + Math.random() * 900000)}`,
        date: `Day ${prev.day}`,
        time: 'Gate Proceeds',
        description: `Ticket Box Office: ${newEvent.title}`,
        type: 'credit' as const,
        amount: revenue,
        balanceAfter: prev.balance - totalCost + revenue,
        recipientOrSender: 'Omo-Pay Ticketing Gateway'
      };

      return {
        ...prev,
        balance: prev.balance - totalCost + revenue,
        reputationXP: prev.reputationXP + repGained,
        transactions: [creditTx, debitTx, ...prev.transactions],
        worldEvolution: updatedWorld,
        organizedEvents: [newEvent, ...(prev.organizedEvents || [])]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-stone-950 border-2 border-purple-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-950 border border-purple-500/60 rounded-2xl text-purple-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  Campus Culture & Event Planner
                </h2>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-extrabold px-2.5 py-0.5 rounded-full border border-purple-400/40">
                  Player-Led Festivals
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Organize tournaments, highlife music nights, hackathons, and cultural galas that shape university social life
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

        {/* Form Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* Success Banner if Event Just Finished */}
          {eventResult && (
            <div className="bg-gradient-to-r from-emerald-950 via-green-950 to-stone-900 border-2 border-emerald-500 p-5 rounded-3xl shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>EVENT CELEBRATION WAS A MASSIVE TRIUMPH!</span>
                </div>
                <span className="text-xs bg-emerald-500 text-stone-950 font-black px-3 py-1 rounded-full">
                  +{eventResult.reputation} Campus XP
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Student Attendance</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    {eventResult.turnout} Students
                  </div>
                </div>

                <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Ticket Revenue</div>
                  <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                    {formatNaira(eventResult.revenue)}
                  </div>
                </div>

                <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Net Profit</div>
                  <div
                    className={`text-lg font-black font-mono mt-0.5 ${
                      eventResult.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatNaira(eventResult.profit)}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-emerald-200 text-center font-medium">
                🏛️ Permanent World Transformation Unlocked: The Cultural Festival Pavilion is now erected at the campus roundabout lawn!
              </div>
            </div>
          )}

          {/* Step 1: Event Theme Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider">
              1. Choose Campus Event Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'afrobeat_jam', name: 'Afrobeat & Highlife Jam', icon: '🎸', desc: 'Live student band performance & dance' },
                { id: 'tech_hackathon', name: 'Surulere Tech Hackathon', icon: '💻', desc: '24-hour programming & prototype showcase' },
                { id: 'football_derby', name: 'Inter-Faculty Football Cup', icon: '⚽', desc: 'High-stakes derby at the University Stadium' },
                { id: 'cultural_gala', name: 'SUG Cultural Unity Gala', icon: '👑', desc: 'Traditional attire, dance troupes & poetry' },
                { id: 'charity_drive', name: 'Freshers Food Bank Drive', icon: '🍲', desc: 'Student charity feast & donations drive' }
              ].map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => { sounds.playClick(); setEventType(ev.id as any); }}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    eventType === ev.id
                      ? 'bg-purple-950/80 border-purple-500 ring-2 ring-purple-400/50 text-white'
                      : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{ev.icon}</div>
                  <div className="font-extrabold text-xs text-white">{ev.name}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{ev.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Venue Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider">
              2. Select University Venue
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'amphitheatre_lawn', name: 'Central Roundabout Lawn Amphitheatre', cap: 'Capacity: 350 seats' },
                { id: 'football_stadium', name: 'University Stadium Covered Grandstand', cap: 'Capacity: 500 seats' },
                { id: 'senate_plaza', name: 'Senate Citadel Ceremonial Plaza', cap: 'Capacity: 280 seats' },
                { id: 'student_village', name: 'Student Village Bukka Courtyard', cap: 'Capacity: 200 seats' }
              ].map((venue) => (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() => { sounds.playClick(); setSelectedVenue(venue); }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                    selectedVenue.id === venue.id
                      ? 'bg-emerald-950/80 border-emerald-500 ring-1 ring-emerald-400/50 text-white'
                      : 'bg-stone-900/60 hover:bg-stone-800 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-white">{venue.name}</div>
                      <div className="text-[10px] text-stone-400">{venue.cap}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Event Production Amenities & Upgrades */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider">
              3. Event Amenities & Promotion Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                onClick={() => setIncludeRadioHype(!includeRadioHype)}
                className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                  includeRadioHype ? 'bg-purple-950/60 border-purple-500 text-white' : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Radio className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-bold text-amber-300">+₦4,000</span>
                </div>
                <div className="font-bold text-xs mt-2">Radio FUO 98.5 FM Hype</div>
                <div className="text-[10px] text-stone-400">+75 Attendance boost</div>
              </label>

              <label
                onClick={() => setIncludeCatering(!includeCatering)}
                className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                  includeCatering ? 'bg-amber-950/60 border-amber-500 text-white' : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Utensils className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">+₦7,500</span>
                </div>
                <div className="font-bold text-xs mt-2">Mama Nkechi Bukka Small Chops</div>
                <div className="text-[10px] text-stone-400">+50 Attendance boost</div>
              </label>

              <label
                onClick={() => setIncludeSoundRig(!includeSoundRig)}
                className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                  includeSoundRig ? 'bg-blue-950/60 border-blue-500 text-white' : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Volume2 className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-amber-300">+₦6,500</span>
                </div>
                <div className="font-bold text-xs mt-2">Concert Sound Rig & Lights</div>
                <div className="text-[10px] text-stone-400">+60 Attendance boost</div>
              </label>
            </div>
          </div>

          {/* Step 4: Ticket Price Configuration */}
          <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-white">Student Ticket Entry Fee</div>
              <div className="text-[10px] text-stone-400">Higher ticket prices increase revenue but slightly lower attendance</div>
            </div>
            <div className="flex items-center gap-2">
              {[200, 500, 1000, 1500].map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => setTicketPrice(price)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold cursor-pointer transition ${
                    ticketPrice === price
                      ? 'bg-amber-500 text-stone-950 font-black shadow'
                      : 'bg-stone-800 text-stone-300 hover:text-white'
                  }`}
                >
                  {formatNaira(price)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Budget & Launch */}
        <div className="p-4 sm:px-6 bg-stone-900 border-t border-stone-800 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400">Total Event Production Budget</div>
            <div className="text-base font-black text-amber-400 font-mono">
              {formatNaira(totalCost)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleHostEvent}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-7 py-3 rounded-2xl text-xs shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch Campus Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};
