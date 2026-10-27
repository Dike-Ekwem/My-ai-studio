import { PlayerState } from '../types/game';

const STORAGE_KEY = 'undergrad_fuo_savedata_v1';

export const saveGameState = (state: PlayerState): boolean => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save game state to localStorage:', err);
    return false;
  }
};

export const loadGameState = (): PlayerState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlayerState;
    if (!parsed.name || !parsed.matricNo || !parsed.courseId) {
      return null;
    }

    // Hydrate Revolution II state defaults if missing in prior saves
    if (!parsed.worldEvolution) {
      parsed.worldEvolution = {
        quadPavilionRenovated: false,
        stadiumTrophyShowcase: false,
        techHubInnovationPedestal: false,
        solarStreetlightsInstalled: false,
        culturalFestivalPavilion: false,
        drainageCanalReinforced: false
      };
    }
    if (!parsed.roomCustomization) {
      parsed.roomCustomization = {
        wallPoster: 'afrobeat_legends',
        duvetStyle: 'ankara_gold',
        rugStyle: 'handwoven_geometric',
        deskRig: 'basic_study',
        trophyShelf: false,
        stringLightsActive: true,
        roomColor: '#312e81'
      };
    }
    if (!parsed.crisisState) {
      parsed.crisisState = {
        isActive: false,
        stage: 'storm_hit',
        dieselCansAcquired: 0,
        dieselCansRequired: 3,
        solarInverterConnected: false,
        drainageCleared: false,
        emergencyLampsDistributed: 0,
        emergencyLampsRequired: 4,
        clinicSaved: false,
        completionRewardEarned: false
      };
    }
    if (!parsed.legacyRecords) {
      parsed.legacyRecords = [];
    }

    return parsed;
  } catch (err) {
    console.error('Failed to parse save game state:', err);
    return null;
  }
};

export const clearGameState = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

export const generateMatricNo = (courseCodePrefix: string): string => {
  const year = '2026';
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `FUO/${year}/${courseCodePrefix}/${randomDigits}`;
};

export const formatNaira = (amount: number): string => {
  return '₦' + amount.toLocaleString('en-NG');
};
