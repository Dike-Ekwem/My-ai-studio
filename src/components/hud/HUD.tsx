import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { CampusPOI } from '../../data/campusLocations';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { useSoundtrack } from '../../utils/soundtrack';
import {
  Clock,
  Wallet,
  Smartphone,
  Settings,
  Battery,
  Flame,
  GraduationCap,
  Sparkles,
  MapPin,
  ChevronRight,
  Smile,
  Heart,
  BookOpen,
  Coffee,
  Activity,
  Layers,
  Map as MapIcon,
  Music,
  Radio,
  Zap,
  Search,
  Award,
  CloudRain,
  Palette,
  FolderKanban
} from 'lucide-react';
import { Minimap } from './Minimap';

export type RevolutionModalType =
  | 'workbench'
  | 'mystery'
  | 'events'
  | 'off_campus'
  | 'challenges'
  | 'media'
  | 'crisis'
  | 'room_decorator'
  | 'legacy';

interface HUDProps {
  player: PlayerState;
  nearPOI: CampusPOI | null;
  activeWaypoint?: CampusPOI | null;
  onOpenPhone: () => void;
  onOpenMap?: () => void;
  onOpenSettings: () => void;
  onTriggerInteraction: (poi: CampusPOI) => void;
  onOpenRevolutionModal?: (modal: RevolutionModalType) => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  nearPOI,
  activeWaypoint,
  onOpenPhone,
  onOpenMap,
  onOpenSettings,
  onTriggerInteraction,
  onOpenRevolutionModal
}) => {
  const [showSimsMotives, setShowSimsMotives] = useState(false);
  const [showRevolutionMenu, setShowRevolutionMenu] = useState(false);
  const { currentTrack, isPlaying: isSoundtrackPlaying, isDucked } = useSoundtrack();

  // Convert minutes of day to 12-hour format string
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins < 10 ? '0' : ''}${mins} ${ampm}`;
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayName = dayNames[(player.dayOfWeek - 1) % 7];

  // Plumbob color calculation based on Sims needs
  const getPlumbobState = () => {
    if (player.stamina < 30 || player.hunger > 75) {
      return { color: 'text-red-500 fill-red-500', bg: 'bg-red-500', status: 'Distressed' };
    }
    if (player.stamina < 60 || player.hunger > 50) {
      return { color: 'text-amber-400 fill-amber-400', bg: 'bg-amber-400', status: 'Needs Attention' };
    }
    return { color: 'text-emerald-400 fill-emerald-400', bg: 'bg-emerald-400', status: 'Inspired / Happy' };
  };

  const plumbob = getPlumbobState();

  // Active Sims Moodlet
  const activeMoodlet = player.moodlet || {
    title: player.hunger > 70 ? 'Hungry & Craving Jollof' : player.stamina < 30 ? 'Exhausted Fresher' : 'Inspired First Class Aspirant',
    desc: player.hunger > 70 ? 'Stomach is rumbling. Head to Mama Nkechi Bukka!' : player.stamina < 30 ? 'Low energy. Take a rest in your hostel room.' : 'High motivation! Study hard and attend your lectures.',
    icon: player.hunger > 70 ? '🍲' : player.stamina < 30 ? '😴' : '🌟',
    color: player.hunger > 70 ? 'amber' : player.stamina < 30 ? 'red' : 'emerald'
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 p-2 sm:p-5 flex flex-col justify-between">
      {/* Top Bar: University Branding, Clock, Balance, Needs */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Time and Day Card */}
        <div className="pointer-events-auto bg-stone-900/90 border border-emerald-600/50 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md flex items-center gap-3">
          <div className="p-2 bg-emerald-950 border border-emerald-500/40 rounded-xl text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-300 uppercase tracking-wide">
              {dayName} • Day {player.day}
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono leading-none mt-0.5">
              {formatTime(player.timeOfDay)}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              Level {player.academicLevel} (Sem {player.academicLevel})
            </div>
          </div>
        </div>

        {/* Center: The Sims Moodlet */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pointer-events-auto">
          <div className="hidden lg:flex bg-stone-900/90 border border-emerald-600/50 rounded-2xl px-3 py-1.5 shadow-xl backdrop-blur-md max-w-sm items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-sm shadow">
              {activeMoodlet.icon}
            </div>
            <div className="truncate">
              <div className="text-[9px] uppercase font-extrabold text-amber-400 tracking-wider">
                {activeMoodlet.title}
              </div>
              <div className="text-[11px] font-medium text-stone-300 truncate">
                {player.currentObjective}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bank Balance, Map, Phone, Settings */}
        <div className="flex items-center gap-2">
          {/* Balance */}
          <div className="pointer-events-auto bg-stone-900/90 border border-emerald-600/50 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950 border border-emerald-500/40 rounded-xl text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-emerald-400">Omo-Pay Account</div>
              <div className="text-sm sm:text-base font-black text-white font-mono">
                {formatNaira(player.balance)}
              </div>
            </div>
          </div>

          {/* GTA-V Campus Map Button */}
          <button
            type="button"
            onClick={() => { sounds.playClick(); onOpenMap ? onOpenMap() : onOpenPhone(); }}
            className="pointer-events-auto p-3 bg-stone-900/90 hover:bg-purple-900/90 border border-purple-500/60 rounded-2xl shadow-xl backdrop-blur-md text-purple-300 hover:text-white transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Open GTA-V Campus Map [M]"
          >
            <MapIcon className="w-6 h-6" />
          </button>

          {/* Phone Button */}
          <button
            type="button"
            onClick={() => { sounds.playClick(); onOpenPhone(); }}
            className="pointer-events-auto relative p-3 bg-stone-900/90 hover:bg-emerald-900/90 border border-emerald-600/60 rounded-2xl shadow-xl backdrop-blur-md text-amber-400 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Open Student Phone [P]"
          >
            <Smartphone className="w-6 h-6" />
            {player.unreadChats > 0 ? (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-stone-900">
                {player.unreadChats}
              </span>
            ) : null}
          </button>

          {/* Campus Radio & Music Button */}
          <button
            type="button"
            onClick={() => { sounds.playClick(); onOpenSettings(); }}
            className={`pointer-events-auto p-2.5 sm:px-3 sm:py-2 rounded-2xl border shadow-xl backdrop-blur-md transition transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 ${
              isDucked
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                : 'bg-stone-900/90 hover:bg-emerald-950/90 border-emerald-500/60 text-emerald-300'
            }`}
            title={`FUO Radio: ${currentTrack?.title || 'Campus Soundtrack'} by ${currentTrack?.artist || 'Aṣa'}${isDucked ? ' (Volume softened inside/near building)' : ''}. Click to open music settings.`}
          >
            <div className="relative flex items-center justify-center">
              <Music className={`w-5 h-5 ${isSoundtrackPlaying ? 'animate-pulse text-amber-400' : 'text-stone-400'}`} />
              {isSoundtrackPlaying && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div className="hidden md:flex flex-col text-left max-w-[130px]">
              <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider truncate leading-none">
                {isDucked ? 'Building Fade' : 'Campus Radio'}
              </span>
              <span className="text-[11px] font-bold text-white truncate leading-tight mt-0.5">
                {currentTrack?.title || 'Soundtrack'}
              </span>
            </div>
          </button>

          {/* Revolution II Systems Button & Popover */}
          <div className="relative pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowRevolutionMenu((prev) => !prev);
              }}
              className={`p-2.5 sm:px-3 sm:py-2.5 rounded-2xl border shadow-xl backdrop-blur-md transition transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                showRevolutionMenu
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-amber-500/20'
                  : 'bg-stone-900/90 hover:bg-amber-950/90 border-amber-500/60 text-amber-300'
              }`}
              title="Revolution Systems: Innovation, Mystery Board, Events, Radio, Off-Campus, Crisis & Legacy"
            >
              <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="hidden lg:inline text-xs font-black tracking-wide">
                Revolution II
              </span>
            </button>

            {/* Revolution Systems Dropdown Popover */}
            {showRevolutionMenu && (
              <div className="absolute right-0 top-14 w-80 sm:w-96 bg-stone-900/98 border-2 border-amber-500/80 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-200 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                      <Zap className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                        Revolution II Game Systems
                      </h3>
                      <p className="text-[10px] text-stone-400 font-medium">10 Ambitions Redefining Undergrad</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRevolutionMenu(false)}
                    className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {/* 1. Innovation Workshop */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevolutionMenu(false);
                      onOpenRevolutionModal?.('workbench');
                    }}
                    className="p-2.5 rounded-2xl bg-stone-950/80 hover:bg-emerald-950/60 border border-stone-800 hover:border-emerald-500/60 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-900/40 text-emerald-300">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          Innovation Workshop
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Prototyping & TETFUND Faculty Exhibition
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {player.innovationProjects?.filter((i) => i.isBuilt).length || 0}/4 Built
                    </span>
                  </button>

                  {/* 2. Mystery Evidence Board */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevolutionMenu(false);
                      onOpenRevolutionModal?.('mystery');
                    }}
                    className="p-2.5 rounded-2xl bg-stone-950/80 hover:bg-red-950/60 border border-stone-800 hover:border-red-500/60 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-red-900/40 text-red-300">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-red-300 transition">
                          Mace Mystery Case #1926
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Corkboard, Interrogation & Senate Tribunal
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                      {player.mysteryClues?.filter((c) => c.discovered).length || 0}/5 Clues
                    </span>
                  </button>

                  {/* 3. Event Creation */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevolutionMenu(false);
                      onOpenRevolutionModal?.('events');
                    }}
                    className="p-2.5 rounded-2xl bg-stone-950/80 hover:bg-purple-950/60 border border-stone-800 hover:border-purple-500/60 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-900/40 text-purple-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                          Campus Culture & Event Planner
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Derbies, Hackathons, Afrobeat Jams & Galas
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-400 border border-purple-800">
                      {player.organizedEvents?.length || 0} Staged
                    </span>
                  </button>

                  {/* 4. Connected Off-Campus Districts */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevolutionMenu(false);
                      onOpenRevolutionModal?.('off_campus');
                    }}
                    className="p-2.5 rounded-2xl bg-stone-950/80 hover:bg-orange-950/60 border border-stone-800 hover:border-orange-500/60 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-orange-900/40 text-orange-300">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-orange-300 transition">
                          Off-Campus Urban Districts
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Ojuelegba Market, Yaba Arts, Outer Lodges
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-orange-400">
                      🌆 Travel
                    </span>
                  </button>

                  {/* 5. Campus Crowdfunding Drives */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevolutionMenu(false);
                      onOpenRevolutionModal?.('challenges');
                    }}
                    className="p-2.5 rounded-2xl bg-stone-950/80 hover:bg-blue-950/60 border border-stone-800 hover:border-blue-500/60 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-900/40 text-blue-300">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-300 transition">
                          Cooperative Campus Drives
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Solar Walkway, NUGA Stadium, Food Bank
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400">
                      🤝 Pledges
                    </span>
                  </button>

                  {/* 6. Campus Media: Voice & Radio */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevolutionMenu(false);
                      onOpenRevolutionModal?.('media');
                    }}
                    className="p-2.5 rounded-2xl bg-stone-950/80 hover:bg-amber-950/60 border border-stone-800 hover:border-amber-500/60 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-900/40 text-amber-300">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                          The Omo Voice & Radio FUO 98.5
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Journalism, Newsroom & Live Studio
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400">
                      🎙️ Broadcast
                    </span>
                  </button>

                  {/* 7. Survival & Resilience Scenario */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevolutionMenu(false);
                      onOpenRevolutionModal?.('crisis');
                    }}
                    className="p-2.5 rounded-2xl bg-stone-950/80 hover:bg-sky-950/60 border border-stone-800 hover:border-sky-500/60 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-sky-900/40 text-sky-300">
                        <CloudRain className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                          Surulere Deluge & Grid Crisis
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Blackout, Diesel Cans, Clinic Solar Bridge
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                      {player.crisisState?.stage === 'resolved' ? 'Resolved' : 'Active'}
                    </span>
                  </button>

                  {/* 8. Room Customizer */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevolutionMenu(false);
                      onOpenRevolutionModal?.('room_decorator');
                    }}
                    className="p-2.5 rounded-2xl bg-stone-950/80 hover:bg-pink-950/60 border border-stone-800 hover:border-pink-500/60 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-pink-900/40 text-pink-300">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-pink-300 transition">
                          Hostel Room Interior Decorator
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Ankara Duvets, Posters, Dual Tech Desk, Fairy Lights
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-pink-400">
                      🎨 Style
                    </span>
                  </button>

                  {/* 9. Senate Hall of Fame & Legacy */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevolutionMenu(false);
                      onOpenRevolutionModal?.('legacy');
                    }}
                    className="p-2.5 rounded-2xl bg-stone-950/80 hover:bg-yellow-950/60 border border-stone-800 hover:border-yellow-500/60 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-yellow-900/40 text-yellow-300">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-yellow-300 transition">
                          Senate Hall of Fame & Legacy
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Alumni Endowment, Honors & Generational Echoes
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-yellow-400">
                      🏛️ Records
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => { sounds.playClick(); onOpenSettings(); }}
            className="pointer-events-auto p-3 bg-stone-900/90 hover:bg-stone-800 border border-stone-700 rounded-2xl shadow-xl backdrop-blur-md text-stone-300 hover:text-white transition cursor-pointer"
            title="Settings, Soundtracks & Save Game"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Middle Contextual Interaction Prompt */}
      <div className="flex flex-col items-center justify-center mb-16 sm:mb-4">
        {nearPOI ? (
          <div className="pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => { sounds.playClick(); onTriggerInteraction(nearPOI); }}
              className="group bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-800 hover:from-emerald-600 hover:to-green-500 border-2 border-amber-400 text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all transform hover:scale-105 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-sm shadow">
                E
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                  {nearPOI.category} • The Sims Actions
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white">
                  {nearPOI.label}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Bottom Bar: THE SIMS MOTIVES SYSTEM (COLLAPSED BY DEFAULT PER USER REQUEST) */}
      <div className="flex items-end justify-between gap-3 relative">
        {/* Sims Motives Button & Floating Menu */}
        <div className="relative pointer-events-auto">
          {/* Expanded Motives Popover Menu */}
          {showSimsMotives && (
            <div className="absolute bottom-14 left-0 w-80 sm:w-96 bg-stone-900/95 border-2 border-emerald-500/80 rounded-3xl p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-200 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <svg width="18" height="26" viewBox="0 0 24 36" className="drop-shadow animate-pulse">
                    <polygon points="12,2 22,18 12,34 2,18" className={plumbob.color} stroke="#ffffff" strokeWidth="1.5" />
                  </svg>
                  <div>
                    <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      Student Motives & Needs
                    </h3>
                    <p className="text-[10px] text-stone-300 font-medium">State: <span className="font-bold text-white">{plumbob.status}</span></p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setShowSimsMotives(false); }}
                  className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer"
                  title="Close Motives"
                >
                  ✕
                </button>
              </div>

              {/* Active Sims Moodlet */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-base shadow">
                  {activeMoodlet.icon}
                </div>
                <div className="truncate">
                  <div className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                    {activeMoodlet.title}
                  </div>
                  <div className="text-[11px] font-medium text-stone-300 truncate">
                    {player.currentObjective}
                  </div>
                </div>
              </div>

              {/* Needs Bars */}
              <div className="space-y-2 text-xs">
                {/* Energy */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Battery className="w-3.5 h-3.5" /> Energy / Stamina
                    </span>
                    <span className="font-mono text-stone-200">{Math.round(player.stamina)}%</span>
                  </div>
                  <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden border border-stone-700">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${player.stamina}%` }}
                    />
                  </div>
                </div>

                {/* Hunger */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Flame className="w-3.5 h-3.5" /> Hunger (Appetite)
                    </span>
                    <span className="font-mono text-stone-200">{Math.round(player.hunger)}%</span>
                  </div>
                  <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden border border-stone-700">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        player.hunger > 70 ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${player.hunger}%` }}
                    />
                  </div>
                </div>

                {/* Academics */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <GraduationCap className="w-3.5 h-3.5" /> Academics (Cumulative GPA)
                    </span>
                    <span className="font-mono text-stone-200">{player.gpa.toFixed(2)} / 5.0</span>
                  </div>
                  <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden border border-stone-700">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(player.gpa / 5.0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Secondary Needs (Social, Fun, Hygiene) */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-800">
                  <div>
                    <div className="text-[10px] text-pink-400 font-bold flex items-center gap-1 mb-0.5">
                      <Heart className="w-3 h-3" /> Social
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: `${player.social ?? 85}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-yellow-400 font-bold flex items-center gap-1 mb-0.5">
                      <Smile className="w-3 h-3" /> Fun
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${player.fun ?? 80}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 mb-0.5">
                      <Activity className="w-3 h-3" /> Hygiene
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${player.hygiene ?? 90}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed Motives Toggle Button */}
          <button
            type="button"
            onClick={() => { sounds.playClick(); setShowSimsMotives((prev) => !prev); }}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border backdrop-blur-md shadow-2xl transition transform hover:scale-105 active:scale-95 cursor-pointer ${
              showSimsMotives
                ? 'bg-emerald-950 border-amber-400 ring-2 ring-amber-400/50 text-white'
                : 'bg-stone-900/90 hover:bg-stone-800 border-emerald-600/60 text-stone-200'
            }`}
          >
            {/* Spinning Sims Plumbob SVG Badge */}
            <svg width="18" height="26" viewBox="0 0 24 36" className="drop-shadow animate-pulse">
              <polygon points="12,2 22,18 12,34 2,18" className={plumbob.color} stroke="#ffffff" strokeWidth="1.5" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider leading-tight flex items-center gap-1">
                <span>Motives</span>
                <span className={`w-1.5 h-1.5 rounded-full ${plumbob.bg}`} />
              </div>
              <div className="text-[11px] font-bold text-white leading-none mt-0.5">
                {plumbob.status}
              </div>
            </div>
          </button>
        </div>

        {/* Right: Real-Time HUD Minimap & Mobile Phone Button */}
        <div className="flex items-end gap-3 pointer-events-auto">
          {/* Quick Mobile Phone Button for Small Screens */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => { sounds.playClick(); onOpenPhone(); }}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-emerald-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-xl cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Phone</span>
            </button>
          </div>

          {/* Minimap Component */}
          <Minimap
            player={player}
            activeWaypoint={activeWaypoint}
            onOpenFullMap={onOpenMap || onOpenPhone}
          />
        </div>
      </div>
    </div>
  );
};
