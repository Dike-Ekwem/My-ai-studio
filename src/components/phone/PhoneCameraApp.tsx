import React, { useState, useRef } from 'react';
import { PlayerState } from '../../types/game';
import { sounds } from '../../utils/audio';
import {
  Camera,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Check,
  Trash2,
  Share2,
  ChevronLeft,
  X,
  Smile,
  Zap,
  Sliders,
  Sun
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhotoItem {
  id: string;
  timestamp: string;
  mode: 'selfie' | 'campus';
  filter: string;
  sticker: string;
  location: string;
  playerName: string;
  courseName: string;
}

interface PhoneCameraAppProps {
  player: PlayerState;
  onSetWallpaper?: (photo: PhotoItem) => void;
  onBack: () => void;
}

export const PhoneCameraApp: React.FC<PhoneCameraAppProps> = ({
  player,
  onSetWallpaper,
  onBack
}) => {
  const [cameraMode, setCameraMode] = useState<'selfie' | 'campus'>('selfie');
  const [activeFilter, setActiveFilter] = useState<'normal' | 'vintage' | 'sunset' | 'cyber' | 'noir'>('normal');
  const [activeSticker, setActiveSticker] = useState<string>('fresher');
  const [poseIndex, setPoseIndex] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery'>('camera');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stored photos in phone gallery
  const [gallery, setGallery] = useState<PhotoItem[]>([
    {
      id: 'photo_initial_matric',
      timestamp: 'Day 1 • 10:15 AM',
      mode: 'selfie',
      filter: 'sunset',
      sticker: 'fresher',
      location: 'Senate Building Plaza',
      playerName: player.name,
      courseName: 'Orientation Day'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const poses = ['✌️ Peace Sign', '😎 Cool Fresher', '🎓 Matric Smile', '🔥 Swag / Focus'];

  const filters = [
    { id: 'normal', name: 'Original', style: '' },
    { id: 'vintage', name: 'Vintage 90s', style: 'sepia(0.4) contrast(1.1) brightness(0.95)' },
    { id: 'sunset', name: 'Lagos Dusk', style: 'saturate(1.4) hue-rotate(-15deg) contrast(1.1)' },
    { id: 'cyber', name: 'Cyber Neon', style: 'saturate(1.8) hue-rotate(60deg) contrast(1.2)' },
    { id: 'noir', name: 'Black & White', style: 'grayscale(1) contrast(1.25)' }
  ];

  const stickers = [
    { id: 'none', label: 'None' },
    { id: 'fresher', label: '🎓 FUO Fresher 2026' },
    { id: 'firstclass', label: '💯 5.0 GPA Chase' },
    { id: 'unilife', label: '🌴 Campus Life' },
    { id: 'omo_baller', label: '🇳🇬 Omo Baller' }
  ];

  // Capture Snapshot
  const handleSnapPhoto = () => {
    sounds.playCashPing();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 140);

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');

    const newPhoto: PhotoItem = {
      id: `photo_${Date.now()}`,
      timestamp: `Day ${player.day} • ${hours}:${mins}`,
      mode: cameraMode,
      filter: activeFilter,
      sticker: activeSticker,
      location: cameraMode === 'selfie' ? 'Hostel / Campus Selfie' : 'Federal University of Omo Grounds',
      playerName: player.name,
      courseName: `Level ${player.academicLevel}`
    };

    setGallery((prev) => [newPhoto, ...prev]);
    showToast('📸 Photo saved to Phone Gallery!');
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
  };

  const handleDeletePhoto = (id: string) => {
    sounds.playClick();
    setGallery((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
    showToast('Photo removed from Gallery');
  };

  return (
    <div className="flex flex-col h-full bg-stone-950 text-white relative">
      {/* Top App Bar */}
      <div className="flex items-center justify-between p-3 border-b border-stone-800 bg-stone-900/90 z-20">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="flex items-center gap-1 text-xs text-amber-400 hover:text-white font-bold cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="text-xs font-black tracking-wider text-white flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>FUO OmoCam</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab((prev) => (prev === 'camera' ? 'gallery' : 'camera'));
          }}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition flex items-center gap-1 cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-emerald-500 text-stone-950 shadow'
              : 'bg-stone-800 text-stone-300 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Gallery ({gallery.length})</span>
        </button>
      </div>

      {toastMessage && (
        <div className="absolute top-14 inset-x-4 z-40 flex justify-center animate-in fade-in">
          <div className="bg-emerald-950/95 border border-emerald-500/80 text-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-md">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'camera' ? (
        <div className="flex-1 flex flex-col justify-between p-3 relative overflow-hidden">
          {/* Flash Overlay */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-150 pointer-events-none" />
          )}

          {/* Camera Viewfinder Screen */}
          <div
            className="relative w-full flex-1 rounded-3xl border-2 border-stone-700 overflow-hidden shadow-2xl flex flex-col justify-between p-3 select-none bg-stone-900"
            style={{
              filter: filters.find((f) => f.id === activeFilter)?.style || 'none'
            }}
          >
            {/* Viewfinder Background Simulation */}
            {cameraMode === 'selfie' ? (
              <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-emerald-950/70 to-stone-950 flex flex-col items-center justify-center pointer-events-none">
                {/* 2D/3D Procedural Student Character Head & Selfie Pose */}
                <div className="relative flex flex-col items-center transform scale-110 -translate-y-2 animate-in zoom-in-95 duration-200">
                  {/* Head */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-b from-amber-700 to-amber-900 border-2 border-amber-600/60 shadow-xl flex flex-col items-center justify-center relative">
                    {/* Hair */}
                    <div className="absolute -top-1 w-24 h-10 bg-stone-950 rounded-t-full" />
                    {/* Eyes */}
                    <div className="flex gap-4 mt-3 z-10">
                      <div className="w-3 h-3 bg-stone-950 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full -translate-x-0.5 -translate-y-0.5" />
                      </div>
                      <div className="w-3 h-3 bg-stone-950 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full -translate-x-0.5 -translate-y-0.5" />
                      </div>
                    </div>
                    {/* Cheerful Smile */}
                    <div className="w-6 h-3 border-b-2 border-amber-950 rounded-full mt-2" />
                  </div>

                  {/* Torso with Customized Outfit */}
                  <div
                    className="w-36 h-28 rounded-t-3xl mt-1 shadow-lg flex flex-col items-center pt-2 relative"
                    style={{ backgroundColor: player.customization?.shirtColor || '#059669' }}
                  >
                    {/* Student Matric Badge */}
                    <div className="bg-amber-400 text-emerald-950 text-[8px] font-black px-2 py-0.5 rounded shadow">
                      FUO • {player.matricNo}
                    </div>
                    {/* Pose Indicator Badge */}
                    <div className="mt-2 text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {poses[poseIndex]}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Campus Rear Camera View
              <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-emerald-950 to-stone-950 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-center space-y-1">
                  <div className="text-4xl">🏛️</div>
                  <div className="text-xs font-black uppercase text-amber-300 tracking-wider">
                    Federal University of Omo
                  </div>
                  <div className="text-[10px] text-stone-300">Senate Tower & Quad Vista</div>
                </div>
              </div>
            )}

            {/* Viewfinder Camera HUD Overlay (Crosshairs, 4K, Grid) */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              {/* Top HUD */}
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/80">
                <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">4K 60FPS</span>
                <span className="bg-red-600/80 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE
                </span>
                <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                  {cameraMode === 'selfie' ? 'FRONT CAM' : 'WIDE 1X'}
                </span>
              </div>

              {/* Center Crosshairs */}
              <div className="self-center w-16 h-16 border border-white/20 rounded-xl relative flex items-center justify-center">
                <div className="w-2 h-0.5 bg-yellow-400" />
                <div className="w-0.5 h-2 bg-yellow-400 absolute" />
              </div>

              {/* Bottom Sticker / Filter Watermark */}
              <div className="flex items-end justify-between">
                {activeSticker !== 'none' && (
                  <div className="bg-amber-400 text-stone-950 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-lg border border-white/40">
                    {stickers.find((s) => s.id === activeSticker)?.label}
                  </div>
                )}
                <div className="text-[9px] font-mono text-white/60 bg-black/40 px-1.5 py-0.5 rounded ml-auto">
                  ISO 100 • F1.8
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="mt-3 space-y-2.5">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
              <span className="text-[10px] text-stone-400 font-bold uppercase shrink-0">Filters:</span>
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveFilter(f.id as any);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap cursor-pointer transition ${
                    activeFilter === f.id
                      ? 'bg-amber-500 text-stone-950 font-black shadow'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Sticker Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
              <span className="text-[10px] text-stone-400 font-bold uppercase shrink-0">Stickers:</span>
              {stickers.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveSticker(s.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap cursor-pointer transition ${
                    activeSticker === s.id
                      ? 'bg-purple-600 text-white font-black shadow'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Bottom Shutter & Mode Switch Buttons */}
            <div className="flex items-center justify-between px-6 pt-1">
              {/* Pose / Change Selfie Reaction */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setPoseIndex((prev) => (prev + 1) % poses.length);
                }}
                className="w-10 h-10 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Change Pose / Mood"
              >
                <Smile className="w-5 h-5 text-amber-400" />
              </button>

              {/* Master Shutter Button */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="w-16 h-16 rounded-full bg-white hover:bg-stone-200 border-4 border-stone-800 flex items-center justify-center shadow-2xl transition transform active:scale-90 cursor-pointer"
                title="Take Picture"
              >
                <div className="w-12 h-12 rounded-full border-2 border-stone-900 bg-white" />
              </button>

              {/* Front / Rear Camera Flip */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCameraMode((prev) => (prev === 'selfie' ? 'campus' : 'selfie'));
                }}
                className="w-10 h-10 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Flip Camera (Selfie / Campus)"
              >
                <RotateCcw className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Gallery Tab */
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          <div className="text-xs font-black text-amber-300 flex items-center justify-between">
            <span>Captured Photos ({gallery.length})</span>
            <span className="text-[10px] text-stone-400 font-normal">Tap photo to view or set as wallpaper</span>
          </div>

          {gallery.length === 0 ? (
            <div className="p-8 text-center text-stone-500 space-y-2">
              <Camera className="w-10 h-10 mx-auto text-stone-600" />
              <p className="text-xs">No photos in gallery yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className="text-xs text-amber-400 font-bold hover:underline"
              >
                Take your first campus snapshot!
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {gallery.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedPhoto(photo);
                  }}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow cursor-pointer group hover:border-emerald-500/60 transition"
                >
                  <div className="h-28 bg-gradient-to-br from-emerald-950 via-stone-900 to-amber-950 flex flex-col items-center justify-center relative p-2">
                    <div className="text-2xl">{photo.mode === 'selfie' ? '🤳' : '🏛️'}</div>
                    <span className="text-[9px] font-bold text-amber-300 mt-1 truncate max-w-full">
                      {photo.location}
                    </span>
                    <span className="text-[8px] text-stone-400 font-mono">{photo.timestamp}</span>
                  </div>
                  <div className="p-2 flex items-center justify-between bg-stone-950 text-[10px]">
                    <span className="text-stone-300 truncate font-semibold">{photo.playerName}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      className="text-stone-500 hover:text-red-400 p-1"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fullscreen Photo Modal */}
          {selectedPhoto && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-stone-900 border-2 border-emerald-500 rounded-3xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                  <div className="text-xs font-bold text-white">{selectedPhoto.location}</div>
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="text-stone-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-48 rounded-2xl bg-gradient-to-br from-emerald-950 via-stone-900 to-amber-950 flex flex-col items-center justify-center p-3 text-center border border-stone-800">
                  <div className="text-5xl mb-2">{selectedPhoto.mode === 'selfie' ? '🤳' : '🏛️'}</div>
                  <div className="text-xs font-black text-amber-300">{selectedPhoto.playerName}</div>
                  <div className="text-[10px] text-stone-300">{selectedPhoto.courseName}</div>
                  <div className="text-[9px] text-emerald-400 font-mono mt-1">{selectedPhoto.timestamp}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      if (onSetWallpaper) onSetWallpaper(selectedPhoto);
                      showToast('🌟 Set as Phone Wallpaper!');
                      setSelectedPhoto(null);
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Set as Wallpaper
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                    className="px-3 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
