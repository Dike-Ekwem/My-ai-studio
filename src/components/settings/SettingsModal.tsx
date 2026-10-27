import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { saveGameState, clearGameState } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { useSoundtrack } from '../../utils/soundtrack';
import { Crest } from '../Crest';
import {
  Save,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Music,
  Radio,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle
} from 'lucide-react';

interface SettingsModalProps {
  player: PlayerState;
  onClose: () => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ player, onClose, onResetGame }) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // 5 Independent Audio Channels
  const [masterVol, setMasterVol] = useState(sounds.masterVolume);
  const [musicVol, setMusicVol] = useState(sounds.musicVolume);
  const [sfxVol, setSfxVol] = useState(sounds.sfxVolume);
  const [ambienceVol, setAmbienceVol] = useState(sounds.ambienceVolume);
  const [dialogueVol, setDialogueVol] = useState(sounds.dialogueVolume);

  const {
    currentTrack,
    isPlaying: isSoundtrackPlaying,
    isMuted: isSoundtrackMuted,
    volume: soundtrackVolume,
    isDucked,
    mode: soundtrackMode,
    playlist,
    togglePlay: toggleSoundtrackPlay,
    toggleMute: toggleSoundtrackMute,
    setVolume: setSoundtrackVolume,
    nextTrack: nextSoundtrack,
    previousTrack: prevSoundtrack,
    selectTrack: selectSoundtrack,
    setShuffleMode: setSoundtrackShuffle
  } = useSoundtrack();

  const handleSave = () => {
    sounds.playClick();
    const ok = saveGameState(player);
    if (ok) {
      sounds.playNotification();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleToggleMute = () => {
    sounds.isMuted = !sounds.isMuted;
    setIsMuted(sounds.isMuted);
    sounds.saveSettings();
    if (!sounds.isMuted) sounds.playClick();
  };

  const handleMasterVolChange = (val: number) => {
    sounds.masterVolume = val;
    setMasterVol(val);
    sounds.saveSettings();
  };

  const handleMusicVolChange = (val: number) => {
    sounds.musicVolume = val;
    setMusicVol(val);
    setSoundtrackVolume(val);
    sounds.saveSettings();
  };

  const handleSfxVolChange = (val: number) => {
    sounds.sfxVolume = val;
    setSfxVol(val);
    sounds.playClick();
    sounds.saveSettings();
  };

  const handleAmbienceVolChange = (val: number) => {
    sounds.ambienceVolume = val;
    setAmbienceVol(val);
    sounds.saveSettings();
  };

  const handleDialogueVolChange = (val: number) => {
    sounds.dialogueVolume = val;
    setDialogueVol(val);
    sounds.saveSettings();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative max-w-xl w-full max-h-[92vh] overflow-y-auto bg-stone-900 border-2 border-emerald-600/50 rounded-3xl p-5 sm:p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Crest size="sm" showTitle={false} />
            <div>
              <h2 className="text-base font-black text-white">Settings & Audio Options</h2>
              <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                Federal University of Omo • Soundtracks & Saves
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* 1. Campus Radio & Soundtracks (Aṣa & YG Marley) */}
          <div className="bg-stone-800/90 p-4 rounded-3xl border border-emerald-500/40 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-950 border border-emerald-400/50 rounded-xl text-amber-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm flex items-center gap-2">
                    <span>FUO Campus Radio & Soundtracks</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/40">
                      Official OST
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Featuring Nigerian soul icon Aṣa & YG Marley
                  </div>
                </div>
              </div>

              {/* Building Fade Indicator */}
              {isDucked ? (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/50 px-2 py-1 rounded-xl font-bold flex items-center gap-1 animate-pulse">
                  <span>🏢 In/Near Building (Softened)</span>
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-1 rounded-xl font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Campus Main Volume</span>
                </span>
              )}
            </div>

            {/* Now Playing Banner */}
            <div className="bg-stone-900/90 border border-stone-700/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-stone-950 shadow-md relative overflow-hidden shrink-0"
                  style={{ backgroundColor: currentTrack?.accentColor || '#10b981' }}
                >
                  <Music className="w-6 h-6 text-stone-950" />
                  {isSoundtrackPlaying && !isSoundtrackMuted && (
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-black/30 flex items-end justify-center gap-0.5 pb-0.5">
                      <span className="w-1 h-2 bg-white animate-pulse" />
                      <span className="w-1 h-3 bg-white animate-bounce" />
                      <span className="w-1 h-1.5 bg-white animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                    <span>Now Playing</span>
                    {soundtrackMode === 'shuffle' ? (
                      <span className="bg-stone-800 text-stone-300 px-1.5 py-0.2 rounded text-[9px] font-mono flex items-center gap-0.5">
                        <Shuffle className="w-2.5 h-2.5 text-emerald-400" /> Random Shuffle
                      </span>
                    ) : (
                      <span className="bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded text-[9px] font-mono border border-amber-600/40">
                        Selected Song
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-white truncate">
                    {currentTrack?.title || 'No Track Selected'}
                  </div>
                  <div className="text-[11px] text-stone-300 truncate">
                    {currentTrack?.artist} • <span className="text-stone-400">{currentTrack?.genre} ({currentTrack?.year})</span>
                  </div>
                </div>
              </div>

              {/* Player Playback Controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); prevSoundtrack(); }}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => { sounds.playClick(); toggleSoundtrackPlay(); }}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black shadow transition transform active:scale-95 cursor-pointer"
                  title={isSoundtrackPlaying ? 'Pause Music' : 'Play Music'}
                >
                  {isSoundtrackPlaying ? <Pause className="w-5 h-5 fill-stone-950" /> : <Play className="w-5 h-5 fill-stone-950" />}
                </button>

                <button
                  type="button"
                  onClick={() => { sounds.playClick(); nextSoundtrack(); }}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => { sounds.playClick(); setSoundtrackShuffle(); }}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    soundtrackMode === 'shuffle'
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow'
                      : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                  }`}
                  title="Shuffle randomly through all songs"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
              </div>
            </div>

            {/* Soundtrack Volume Slider & Mute Toggle */}
            <div className="bg-stone-900/60 p-3 rounded-2xl border border-stone-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); toggleSoundtrackMute(); }}
                  className={`p-2 rounded-xl border text-xs transition cursor-pointer shrink-0 ${
                    isSoundtrackMuted
                      ? 'bg-red-950/80 border-red-700 text-red-300'
                      : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white'
                  }`}
                  title={isSoundtrackMuted ? 'Unmute Soundtrack' : 'Mute Soundtrack'}
                >
                  {isSoundtrackMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-stone-300">
                    <span>Music Volume</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {isSoundtrackMuted ? '0%' : `${Math.round(soundtrackVolume * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isSoundtrackMuted ? 0 : soundtrackVolume}
                    onChange={(e) => setSoundtrackVolume(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Select a Particular Song (User-requested feature) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose a Particular Track</span>
                </div>
                <div className="text-[10px] text-stone-400">
                  Click any song to play directly
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1">
                {playlist.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        selectSoundtrack(track.id);
                      }}
                      className={`w-full p-2.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-r from-emerald-950 to-stone-900 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-400/50'
                          : 'bg-stone-900/60 hover:bg-stone-800/80 border-stone-800 text-stone-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isCurrent
                              ? 'bg-emerald-500 text-stone-950 shadow'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {isCurrent && isSoundtrackPlaying ? (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            idx + 1
                          )}
                        </span>
                        <div className="truncate">
                          <div className="font-extrabold text-xs text-white truncate">
                            {track.title}
                          </div>
                          <div className="text-[10px] text-stone-400 truncate">
                            {track.artist} • <span className="text-stone-500">{track.album} ({track.year})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-semibold text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-lg border border-stone-700/50 hidden sm:inline">
                          {track.genre}
                        </span>
                        {isCurrent ? (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                            {isSoundtrackPlaying ? 'Playing' : 'Selected'}
                          </span>
                        ) : (
                          <span className="text-[9px] text-stone-400 group-hover:text-emerald-400 font-medium">
                            Play ↵
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Fade Educational Tip */}
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-200/90 leading-relaxed flex items-start gap-2">
              <span className="text-base shrink-0 leading-none">🏢</span>
              <span>
                <strong>Smart Building Fade:</strong> The soundtrack volume automatically lowers when you enter lecture halls, hostel rooms, the supermarket, or bukka joints, so dialogues and sound effects stay prominent.
              </span>
            </div>
          </div>

          {/* 2. Comprehensive 5-Channel Audio Mixer */}
          <div className="bg-stone-800/90 p-4 rounded-3xl border border-stone-700/80 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-700/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-950 border border-emerald-500/50 rounded-lg text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">
                    Audio & Volume Mixer
                  </h3>
                  <p className="text-[10px] text-stone-400">Substantially louder default audio with independent channel sliders</p>
                </div>
              </div>

              {/* Master Mute Toggle */}
              <button
                type="button"
                onClick={handleToggleMute}
                className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer transition ${
                  isMuted
                    ? 'bg-red-950/80 border-red-700 text-red-300'
                    : 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                }`}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isMuted ? 'Muted' : 'Audio Active'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Channel 1: Master Volume */}
              <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-700/50 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-amber-400">Master Volume</span>
                  <span className="font-mono text-white">{Math.round(masterVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={masterVol}
                  onChange={(e) => handleMasterVolChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg appearance-none"
                />
              </div>

              {/* Channel 2: Music / Campus Radio */}
              <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-700/50 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-400">Music & Campus Radio</span>
                  <span className="font-mono text-white">{Math.round(musicVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVol}
                  onChange={(e) => handleMusicVolChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg appearance-none"
                />
              </div>

              {/* Channel 3: Sound Effects (SFX) */}
              <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-700/50 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-cyan-400">Sound Effects & Footsteps (SFX)</span>
                  <span className="font-mono text-white">{Math.round(sfxVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVol}
                  onChange={(e) => handleSfxVolChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg appearance-none"
                />
              </div>

              {/* Channel 4: Spatial Ambience & Weather */}
              <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-700/50 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-purple-400">Campus Ambience & Environment</span>
                  <span className="font-mono text-white">{Math.round(ambienceVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambienceVol}
                  onChange={(e) => handleAmbienceVolChange(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg appearance-none"
                />
              </div>

              {/* Channel 5: Dialogue & Security */}
              <div className="bg-stone-900/60 p-2.5 rounded-xl border border-stone-700/50 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-pink-400">Dialogue, Crowd & Security</span>
                  <span className="font-mono text-white">{Math.round(dialogueVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={dialogueVol}
                  onChange={(e) => handleDialogueVolChange(parseFloat(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Save Game Progress */}
          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-white text-sm">Save Game Progress</div>
                <div className="text-[10px] text-stone-400">Stores balance, grades, housing, and inventory locally</div>
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Now</span>
              </button>
            </div>
            {saveSuccess && (
              <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1 bg-emerald-950/80 p-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Game progress saved successfully!</span>
              </div>
            )}
          </div>

          {/* Controls Guide */}
          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700 space-y-1.5 text-stone-300">
            <div className="font-bold text-amber-300 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Campus Controls Guide</span>
            </div>
            <div className="flex justify-between">
              <span>Walk & Turn:</span>
              <span className="font-mono text-white">WASD or Arrow Keys</span>
            </div>
            <div className="flex justify-between">
              <span>Sprint:</span>
              <span className="font-mono text-white">Hold Shift</span>
            </div>
            <div className="flex justify-between">
              <span>Interact:</span>
              <span className="font-mono text-white">E / Spacebar</span>
            </div>
            <div className="flex justify-between">
              <span>Student Phone:</span>
              <span className="font-mono text-white">P Key</span>
            </div>
            <div className="flex justify-between">
              <span>Mobile Touch:</span>
              <span className="font-mono text-white">On-Screen Virtual Joystick</span>
            </div>
          </div>

          {/* Reset / New Game Option */}
          <div className="pt-2 border-t border-stone-800">
            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-900/60 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Student Game (Reset Progress)</span>
              </button>
            ) : (
              <div className="bg-red-950/80 border border-red-700 p-3 rounded-2xl space-y-2">
                <div className="text-red-200 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Are you sure? This will delete your current save!</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearGameState();
                      onResetGame();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
