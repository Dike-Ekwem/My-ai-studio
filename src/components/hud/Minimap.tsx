import React, { useMemo } from 'react';
import { PlayerState } from '../../types/game';
import { CampusPOI, CAMPUS_POIS } from '../../data/campusLocations';
import { worldToMapPercent } from '../map/CampusMapModal';
import { sounds } from '../../utils/audio';
import { Compass, Navigation, Maximize2 } from 'lucide-react';

interface MinimapProps {
  player: PlayerState;
  activeWaypoint?: CampusPOI | null;
  onOpenFullMap: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  player,
  activeWaypoint,
  onOpenFullMap
}) => {
  // Radius of radar in world meters
  const RADAR_RADIUS = 75;

  // Filter nearby POIs within radar range
  const nearbyPOIs = useMemo(() => {
    return CAMPUS_POIS.filter((poi) => {
      const dx = poi.position[0] - player.position.x;
      const dz = poi.position[2] - player.position.z;
      const dist = Math.hypot(dx, dz);
      return dist <= RADAR_RADIUS;
    });
  }, [player.position]);

  // Player map percent for background coordinate shifting
  const playerPercent = worldToMapPercent(player.position.x, player.position.z);

  // Distance to active waypoint
  const waypointDistance = useMemo(() => {
    if (!activeWaypoint) return null;
    const dx = activeWaypoint.position[0] - player.position.x;
    const dz = activeWaypoint.position[2] - player.position.z;
    return Math.round(Math.hypot(dx, dz));
  }, [activeWaypoint, player.position]);

  return (
    <div
      onClick={() => {
        sounds.playClick();
        onOpenFullMap();
      }}
      className="pointer-events-auto relative group cursor-pointer transition transform hover:scale-105 active:scale-95"
      title="Click to open full FUO GTA-V Campus Map [M]"
    >
      {/* Outer Circular Bezel */}
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-stone-950/90 border-2 border-emerald-500/80 shadow-2xl backdrop-blur-md overflow-hidden relative p-1 flex items-center justify-center">
        {/* Radar Background Grid with moving center relative to world */}
        <div className="absolute inset-0 bg-[#0a0f1d] [background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-75" />

        {/* Radar Concentric Distance Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-emerald-500/20" />
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-emerald-500/30" />
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-emerald-500/40" />
        </div>

        {/* Crosshair Axes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-emerald-500/20" />
          <div className="h-full w-[1px] bg-emerald-500/20" />
        </div>

        {/* Nearby POI Blips */}
        <div className="absolute inset-0 pointer-events-none">
          {nearbyPOIs.map((poi) => {
            const dx = poi.position[0] - player.position.x;
            const dz = poi.position[2] - player.position.z;

            // Map dx, dz from [-RADAR_RADIUS, RADAR_RADIUS] to [0%, 100%]
            const leftPct = 50 + (dx / RADAR_RADIUS) * 44;
            const topPct = 50 + (dz / RADAR_RADIUS) * 44;

            const isWaypoint = activeWaypoint?.id === poi.id;

            return (
              <div
                key={poi.id}
                className={`absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md flex items-center justify-center ${
                  isWaypoint ? 'bg-purple-500 ring-2 ring-white animate-bounce' : ''
                }`}
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  backgroundColor: isWaypoint ? '#a855f7' : poi.color,
                  border: '1px solid #ffffff'
                }}
              />
            );
          })}
        </div>

        {/* Center Player Marker with Heading */}
        <div className="relative z-20 flex items-center justify-center pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-stone-950 flex items-center justify-center shadow-lg">
            <div className="w-1 h-1 rounded-full bg-stone-950" />
          </div>
          {/* Subtle Radar Sweep Ring */}
          <div className="absolute -top-1 -left-1 w-5.5 h-5.5 rounded-full bg-amber-400/30 animate-ping" />
        </div>

        {/* Compass Cardinal Points */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-amber-400 pointer-events-none">
          N
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-stone-500 pointer-events-none">
          S
        </div>
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-stone-500 pointer-events-none">
          W
        </div>
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-stone-500 pointer-events-none">
          E
        </div>

        {/* Hover Expand Icon */}
        <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition backdrop-blur-[1px] z-30">
          <div className="flex flex-col items-center">
            <Maximize2 className="w-5 h-5 text-amber-300" />
            <span className="text-[8px] font-black uppercase text-white mt-0.5">Map [M]</span>
          </div>
        </div>
      </div>

      {/* Active Waypoint Distance Pill */}
      {activeWaypoint && waypointDistance !== null && (
        <div className="mt-1 bg-stone-900/90 border border-purple-500/80 rounded-xl px-2 py-0.5 text-center shadow-lg backdrop-blur-md">
          <div className="text-[9px] font-black text-purple-300 flex items-center justify-center gap-1">
            <Navigation className="w-2.5 h-2.5 animate-pulse" />
            <span className="truncate max-w-[80px]">{activeWaypoint.label}</span>
          </div>
          <div className="text-[8px] font-mono text-white font-bold">
            {waypointDistance}m
          </div>
        </div>
      )}
    </div>
  );
};
