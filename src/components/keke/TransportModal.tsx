import React, { useState } from 'react';
import { PlayerState, BankTransaction } from '../../types/game';
import { CAMPUS_POIS, CampusPOI } from '../../data/campusLocations';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import {
  Car,
  Bus,
  Footprints,
  MapPin,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

interface TransportModalProps {
  player: PlayerState;
  currentPOI: CampusPOI | null;
  onClose: () => void;
  onStartRide: (destinationPOI: CampusPOI, fare: number, vehicleType: 'keke' | 'shuttle') => void;
}

export const TransportModal: React.FC<TransportModalProps> = ({
  player,
  currentPOI,
  onClose,
  onStartRide
}) => {
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>(CAMPUS_POIS[0].id);
  const [vehicleType, setVehicleType] = useState<'keke' | 'shuttle'>('keke');
  const [isRiding, setIsRiding] = useState(false);
  const [rideMessage, setRideMessage] = useState<string | null>(null);
  const [rideError, setRideError] = useState<string | null>(null);

  const destination = CAMPUS_POIS.find((p) => p.id === selectedDestinationId) || CAMPUS_POIS[0];

  // Calculate fare based on specifications:
  // Keke within campus: ₦300
  // Campus shuttle: ₦500
  // Off-campus to campus: distance based between ₦200 and ₦500
  const isOffCampus = player.position.z > 100;
  let fare = 300;
  if (vehicleType === 'shuttle') {
    fare = 500;
  } else {
    // Keke
    if (isOffCampus) {
      fare = 400; // Off-campus keke fare
    } else {
      fare = 300; // Internal campus flat fare
    }
  }

  const handleConfirmRide = () => {
    setRideError(null);
    if (player.balance < fare) {
      sounds.playClick();
      setRideError(`Insufficient balance! You need ${formatNaira(fare)} to board. You can walk across campus for free.`);
      return;
    }

    sounds.playKekeHorn();
    sounds.playCashPing();
    setIsRiding(true);
    setRideMessage(`Boarded ${vehicleType === 'keke' ? 'Abuja Yellow Keke' : 'Campus Coaster Shuttle'}! Driving along Central Avenue...`);

    setTimeout(() => {
      onStartRide(destination, fare, vehicleType);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative max-w-lg w-full max-h-[92vh] overflow-y-auto bg-stone-900 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400 rounded-xl text-amber-400">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Campus Transport Service
              </div>
              <h2 className="text-lg font-black text-white">Keke Napep & Shuttle Terminal</h2>
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

        {/* Vehicle Selection */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => { sounds.playClick(); setVehicleType('keke'); }}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              vehicleType === 'keke'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Keke Napep</span>
            </div>
            <div className="text-xs text-amber-300 font-mono font-bold mt-1">
              {formatNaira(isOffCampus ? 400 : 300)}
            </div>
            <div className="text-[10px] text-stone-400">Quick 3-wheeler tricycle</div>
          </button>

          <button
            type="button"
            onClick={() => { sounds.playClick(); setVehicleType('shuttle'); }}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              vehicleType === 'shuttle'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <Bus className="w-4 h-4 text-emerald-400" />
              <span>Campus Shuttle</span>
            </div>
            <div className="text-xs text-emerald-300 font-mono font-bold mt-1">
              {formatNaira(500)}
            </div>
            <div className="text-[10px] text-stone-400">Air-conditioned coaster bus</div>
          </button>
        </div>

        {/* Destination Chooser */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
            Select Campus Destination:
          </label>
          <select
            value={selectedDestinationId}
            onChange={(e) => setSelectedDestinationId(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {CAMPUS_POIS.map((poi) => (
              <option key={poi.id} value={poi.id} className="bg-stone-900 text-white">
                {poi.name} ({poi.category})
              </option>
            ))}
          </select>

          <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 text-xs space-y-1">
            <div className="text-stone-300">
              Target: <strong className="text-white">{destination.label}</strong>
            </div>
            <div className="text-stone-400 text-[11px]">{destination.description}</div>
          </div>
        </div>

        {/* Fare Summary & Confirmation */}
        <div className="border-t border-stone-800 pt-3 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">Total Trip Fare:</span>
            <span className="font-mono font-black text-amber-400 text-base">{formatNaira(fare)}</span>
          </div>

          {rideError && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-xl text-xs text-red-200 flex items-center justify-between gap-2 animate-in fade-in">
              <span>{rideError}</span>
              <button
                type="button"
                onClick={() => setRideError(null)}
                className="text-red-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {rideMessage ? (
            <div className="p-3 bg-amber-500/20 border border-amber-400 rounded-xl text-xs text-amber-200 flex items-center gap-2 animate-pulse">
              <Car className="w-4 h-4 shrink-0" />
              <span>{rideMessage}</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={isRiding}
              onClick={handleConfirmRide}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-emerald-950 font-black py-3 rounded-2xl transition cursor-pointer shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <span>Pay {formatNaira(fare)} & Board Vehicle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
