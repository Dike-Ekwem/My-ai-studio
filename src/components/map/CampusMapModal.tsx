import React, { useState, useMemo } from 'react';
import { PlayerState } from '../../types/game';
import { CampusPOI, CAMPUS_POIS, CAMPUS_FILLER_BUILDINGS } from '../../data/campusLocations';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import {
  Compass,
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  X,
  Search,
  Layers,
  Footprints,
  Car,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface CampusMapModalProps {
  player: PlayerState;
  onClose: () => void;
  onSetWaypoint?: (poi: CampusPOI | null) => void;
  activeWaypoint?: CampusPOI | null;
  onBoardKeke?: (destination: CampusPOI, fare: number, vehicleType: 'keke' | 'shuttle') => void;
}

type MapCategoryFilter = 'all' | 'academic' | 'residential' | 'commercial' | 'recreation' | 'service' | 'transport';

// Accurate campus coordinate bounds matching the expanded perimeter fence
const MAP_BOUNDS = {
  minX: -185,
  maxX: 220,
  minZ: -195,
  maxZ: 140,
  get width() { return this.maxX - this.minX; }, // 405m
  get height() { return this.maxZ - this.minZ; } // 335m
};

// Convert world (x, z) coordinates into SVG 0-100 percentage coordinates
export const worldToMapPercent = (x: number, z: number): { x: number; y: number } => {
  const px = Math.max(2, Math.min(98, ((x - MAP_BOUNDS.minX) / MAP_BOUNDS.width) * 100));
  const py = Math.max(2, Math.min(98, ((z - MAP_BOUNDS.minZ) / MAP_BOUNDS.height) * 100));
  return { x: px, y: py };
};

export const CampusMapModal: React.FC<CampusMapModalProps> = ({
  player,
  onClose,
  onSetWaypoint,
  activeWaypoint,
  onBoardKeke
}) => {
  const [categoryFilter, setCategoryFilter] = useState<MapCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPOI, setSelectedPOI] = useState<CampusPOI | null>(activeWaypoint || null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Merge primary campus POIs and architectural filler facilities
  const allLocations: CampusPOI[] = useMemo(() => {
    const fillerPOIs: CampusPOI[] = CAMPUS_FILLER_BUILDINGS.map((fb) => ({
      id: fb.id,
      name: fb.name,
      category: (fb.id.includes('tetfund') || fb.id.includes('arch') || fb.id.includes('law')
        ? 'academic'
        : fb.id.includes('bank')
        ? 'commercial'
        : 'service') as CampusPOI['category'],
      position: fb.position,
      size: fb.size,
      color: fb.color,
      roofColor: fb.roofColor,
      label: fb.label,
      description: `${fb.name} — Official faculty and learning complex on the Federal University of Omo grounds.`,
      interactionRadius: 10
    }));
    return [...CAMPUS_POIS, ...fillerPOIs];
  }, []);

  // Filtered locations
  const filteredPOIs = useMemo(() => {
    return allLocations.filter((poi) => {
      const matchesCategory = categoryFilter === 'all' || poi.category === categoryFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allLocations, categoryFilter, searchQuery]);

  // Compute player and target map positions
  const playerMapPos = worldToMapPercent(player.position.x, player.position.z);
  const selectedMapPos = selectedPOI ? worldToMapPercent(selectedPOI.position[0], selectedPOI.position[2]) : null;

  // Calculate distance from player to selected location
  const distanceToSelected = useMemo(() => {
    if (!selectedPOI) return 0;
    const dx = player.position.x - selectedPOI.position[0];
    const dz = player.position.z - selectedPOI.position[2];
    return Math.round(Math.hypot(dx, dz));
  }, [player.position, selectedPOI]);

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: Math.max(-250, Math.min(250, e.clientX - dragStart.x)),
      y: Math.max(-200, Math.min(200, e.clientY - dragStart.y))
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleResetView = () => {
    sounds.playClick();
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Waypoint toggle
  const handleToggleWaypoint = (poi: CampusPOI) => {
    sounds.playNotification();
    if (activeWaypoint?.id === poi.id) {
      if (onSetWaypoint) onSetWaypoint(null);
    } else {
      if (onSetWaypoint) onSetWaypoint(poi);
      setSelectedPOI(poi);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-stone-950 border-2 border-emerald-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-stone-900/95 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <Crest size="sm" showTitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase font-sans">
                  FUO Campus Satellite Atlas
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  GTA-V Live GPS
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium">
                Federal University of Omo • Complete Perimeter Fence [X: -185 to 220, Z: -195 to 140]
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search buildings, faculties..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => { sounds.playClick(); onClose(); }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              title="Close Map [Esc / M]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 bg-stone-900/60 border-b border-stone-800/80 overflow-x-auto shrink-0 text-xs">
          {[
            { id: 'all', label: 'All Blips' },
            { id: 'academic', label: 'Faculties [A]' },
            { id: 'residential', label: 'Hostels [H]' },
            { id: 'commercial', label: 'Bukkas & Mart [F/M]' },
            { id: 'recreation', label: 'Stadium & Arena [S]' },
            { id: 'service', label: 'Campus Services [Srv]' },
            { id: 'transport', label: 'Keke Parks [T]' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sounds.playClick();
                setCategoryFilter(cat.id as MapCategoryFilter);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                  : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Map Viewport Area */}
        <div className="flex-1 relative flex overflow-hidden">
          {/* Main SVG & Canvas Map Surface */}
          <div
            className={`flex-1 relative bg-[#090d16] overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Topographic Grid & High-Tech Radar Overlay */}
            <div
              className="absolute inset-0 [background-image:linear-gradient(to_right,#141e33_1px,transparent_1px),linear-gradient(to_bottom,#141e33_1px,transparent_1px)] [background-size:32px_32px] opacity-75 pointer-events-none"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center'
              }}
            />

            {/* Radar Concentric Distance Rings */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center'
              }}
            >
              <div className="w-[850px] h-[850px] rounded-full border border-emerald-500/10" />
              <div className="w-[600px] h-[600px] rounded-full border border-emerald-500/15" />
              <div className="w-[350px] h-[350px] rounded-full border border-emerald-500/20" />
            </div>

            {/* Scalable Container for Roads and Blips */}
            <div
              className="absolute inset-4 sm:inset-8 transition-transform duration-75"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center'
              }}
            >
              {/* ACCURATE ROAD NETWORK SVG */}
              <svg className="w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* 1. Complete Perimeter Fence Outline */}
                <rect
                  x="1.5"
                  y="1.5"
                  width="97"
                  height="97"
                  fill="#06121e"
                  fillOpacity="0.45"
                  stroke="#334155"
                  strokeWidth="0.7"
                  strokeDasharray="2 1.5"
                />

                {/* 2. Southern Off-Campus Expressway (Outside Gate) */}
                <line x1="1" y1="96" x2="99" y2="96" stroke="#334155" strokeWidth="3.2" />
                <line x1="1" y1="96" x2="99" y2="96" stroke="#f59e0b" strokeWidth="0.4" strokeDasharray="1.2 1.2" />

                {/* 3. Central Senate Boulevard (From Main Gate North to Senate) */}
                <line x1="45.7" y1="96" x2="45.7" y2="43.8" stroke="#384558" strokeWidth="3.6" />
                <line x1="45.7" y1="96" x2="45.7" y2="43.8" stroke="#facc15" strokeWidth="0.4" strokeDasharray="1.2 1.2" />

                {/* 4. Senate Fountain Roundabout (cx=45.7, cy=58.2 in percent) */}
                <circle cx="45.7" cy="58.2" r="4.6" fill="#091424" stroke="#10b981" strokeWidth="1.2" />
                <circle cx="45.7" cy="58.2" r="1.5" fill="#10b981" />

                {/* 5. Natural Pond & Arched Footbridge (z = 80 -> cy = 82%) */}
                <ellipse cx="45.7" cy="82.1" rx="6.2" ry="4.2" fill="#0369a1" fillOpacity="0.5" stroke="#38bdf8" strokeWidth="0.6" />
                <rect x="44.6" y="80" width="2.2" height="4.2" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.3" rx="0.4" />

                {/* 6. West Academic Loop & Avenue (Science, Engineering, Computing, Library) */}
                <line x1="45.7" y1="58.2" x2="12.3" y2="58.2" stroke="#384558" strokeWidth="2.8" />
                <line x1="12.3" y1="58.2" x2="12.3" y2="43.8" stroke="#384558" strokeWidth="2.4" />
                <line x1="12.3" y1="43.8" x2="45.7" y2="43.8" stroke="#384558" strokeWidth="2.4" />

                {/* 7. Hostel Village South Avenue (Hostel A, Hostel B, Palm Lodge) */}
                <line x1="45.7" y1="75.5" x2="11.1" y2="75.5" stroke="#384558" strokeWidth="2.6" />
                <line x1="11.1" y1="75.5" x2="11.1" y2="82.5" stroke="#384558" strokeWidth="2.0" />
                <line x1="28.4" y1="75.5" x2="28.4" y2="82.5" stroke="#384558" strokeWidth="2.0" />

                {/* 8. East Commercial Avenue (Supermarket, Mama Nkechi Bukka, Iya Basira, Services) */}
                <line x1="45.7" y1="75.5" x2="79.0" y2="75.5" stroke="#384558" strokeWidth="2.8" />

                {/* 9. East Service Road to Stadium & Arena */}
                <line x1="45.7" y1="58.2" x2="79.0" y2="58.2" stroke="#384558" strokeWidth="2.6" />

                {/* 10. Stadium & Arena Avenue (North-South Avenue at x=135 -> cx=79.0%) */}
                <line x1="79.0" y1="34.3" x2="79.0" y2="75.5" stroke="#384558" strokeWidth="2.8" />

                {/* 11. Basketball Arena Spur at z=-10 -> cy=55.2% */}
                <line x1="79.0" y1="55.2" x2="88.0" y2="55.2" stroke="#384558" strokeWidth="2.2" />

                {/* 12. North-East Health Clinic & Interfaith Avenue */}
                <line x1="45.7" y1="43.8" x2="72.8" y2="43.8" stroke="#384558" strokeWidth="2.2" />

                {/* GPS Waypoint Path Vector */}
                {activeWaypoint && (
                  <line
                    x1={`${playerMapPos.x}%`}
                    y1={`${playerMapPos.y}%`}
                    x2={`${worldToMapPercent(activeWaypoint.position[0], activeWaypoint.position[2]).x}%`}
                    y2={`${worldToMapPercent(activeWaypoint.position[0], activeWaypoint.position[2]).y}%`}
                    stroke="#a855f7"
                    strokeWidth="3.2"
                    strokeDasharray="4 3"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* LOCATION BLIP PINS */}
              {filteredPOIs.map((poi) => {
                const mapPos = worldToMapPercent(poi.position[0], poi.position[2]);
                const isSelected = selectedPOI?.id === poi.id;
                const isWaypoint = activeWaypoint?.id === poi.id;

                const getBlipBadge = () => {
                  switch (poi.category) {
                    case 'academic': return 'A';
                    case 'residential': return 'H';
                    case 'commercial': return poi.id.includes('supermarket') ? 'M' : 'F';
                    case 'recreation': return 'S';
                    case 'transport': return 'T';
                    default: return '✦';
                  }
                };

                return (
                  <button
                    key={poi.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      setSelectedPOI(poi);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-xl transition-all cursor-pointer ${
                      isWaypoint
                        ? 'w-7 h-7 ring-4 ring-purple-400 bg-purple-600 animate-bounce z-30'
                        : isSelected
                        ? 'w-6 h-6 ring-2 ring-white z-20 scale-125'
                        : 'w-5 h-5 hover:scale-125 z-10'
                    }`}
                    style={{
                      left: `${mapPos.x}%`,
                      top: `${mapPos.y}%`,
                      backgroundColor: poi.color,
                      border: '1.5px solid #ffffff'
                    }}
                    title={`${poi.name} (${poi.label})`}
                  >
                    {getBlipBadge()}
                  </button>
                );
              })}

              {/* LIVE PLAYER ICON & RADAR SWEEP */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 flex items-center justify-center"
                style={{
                  left: `${playerMapPos.x}%`,
                  top: `${playerMapPos.y}%`
                }}
              >
                {/* Yellow Heading Dot */}
                <div className="w-4 h-4 bg-amber-400 rounded-full border-2 border-stone-900 shadow-2xl flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                </div>
                {/* Radar Pulse Ring */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-amber-400/30 animate-ping" />
              </div>
            </div>

            {/* Bottom-Left Mini Map Controls */}
            <div className="absolute bottom-4 left-4 z-40 flex items-center gap-1.5 bg-stone-900/90 border border-stone-700/80 p-1.5 rounded-2xl shadow-xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => { sounds.playClick(); setZoom((z) => Math.min(2.5, z + 0.25)); }}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setZoom((z) => Math.max(0.75, z - 0.25)); }}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
                title="Reset View"
              >
                {Math.round(zoom * 100)}%
              </button>
            </div>

            {/* Top-Right Compass Rose */}
            <div className="absolute top-4 right-4 z-40 bg-stone-900/90 border border-stone-700/80 p-2 rounded-2xl shadow-xl backdrop-blur-md flex flex-col items-center">
              <div className="text-[10px] font-black text-amber-400 uppercase">N</div>
              <Compass className="w-5 h-5 text-emerald-400 my-0.5" />
              <div className="text-[9px] font-bold text-stone-400 uppercase">FUO</div>
            </div>
          </div>

          {/* Right Sidebar: Selected POI Details & Waypoint Actions */}
          <div className="w-80 sm:w-96 bg-stone-900/95 border-l border-stone-800 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto shrink-0 z-40">
            {selectedPOI ? (
              <div className="space-y-4">
                {/* Header Badge & Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: selectedPOI.color }}
                    >
                      {selectedPOI.category}
                    </span>
                    <span className="text-xs font-bold text-stone-400 font-mono">
                      {distanceToSelected}m away
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight">
                    {selectedPOI.name}
                  </h3>
                  <div className="text-xs text-amber-400 font-semibold mt-0.5">
                    {selectedPOI.label}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 text-xs text-stone-300 leading-relaxed">
                  {selectedPOI.description}
                </div>

                {/* Distance & Travel Options */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-800/80 border border-stone-700/60 rounded-2xl p-3 flex items-center gap-2.5">
                    <Footprints className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Walking</div>
                      <div className="font-extrabold text-white">
                        ~{Math.max(1, Math.round(distanceToSelected / 3.5))} mins
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-800/80 border border-stone-700/60 rounded-2xl p-3 flex items-center gap-2.5">
                    <Car className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Keke Napep</div>
                      <div className="font-extrabold text-white">
                        ~{Math.max(1, Math.round(distanceToSelected / 12.0))} mins
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordinates & Zone */}
                <div className="bg-stone-950/50 rounded-xl p-2.5 border border-stone-800 text-[11px] text-stone-400 flex items-center justify-between font-mono">
                  <span>World Coords:</span>
                  <span className="text-stone-200">
                    X: {Math.round(selectedPOI.position[0])}, Z: {Math.round(selectedPOI.position[2])}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-stone-400">
                <MapPin className="w-10 h-10 text-emerald-400 mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-white mb-1">Select Any Campus Location</h4>
                <p className="text-xs text-stone-400 max-w-[220px]">
                  Click on any faculty, hostel, bukka, stadium, or facility blip on the map to view details and set a GPS waypoint.
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            {selectedPOI && (
              <div className="space-y-2 pt-4 border-t border-stone-800">
                {/* Set Waypoint Button */}
                <button
                  type="button"
                  onClick={() => handleToggleWaypoint(selectedPOI)}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl transition cursor-pointer ${
                    activeWaypoint?.id === selectedPOI.id
                      ? 'bg-purple-600 hover:bg-purple-500 text-white ring-2 ring-purple-400'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  <span>
                    {activeWaypoint?.id === selectedPOI.id ? 'Clear GPS Waypoint' : 'Set GPS Waypoint'}
                  </span>
                </button>

                {/* Board Keke to here (if onBoardKeke provided) */}
                {onBoardKeke && distanceToSelected > 35 && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playCashPing();
                      onBoardKeke(selectedPOI, 150, 'keke');
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
                  >
                    <Car className="w-4 h-4" />
                    <span>Board Keke Directly (₦150)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
