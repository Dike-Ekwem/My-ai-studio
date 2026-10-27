// UNDERGRAD: REVOLUTION II — COMPREHENSIVE DATA ARCHITECTURE & TYPES

export interface WorldEvolutionState {
  quadPavilionRenovated: boolean;      // Solar canopy, painted benches, festoon lights at Academic Quad
  stadiumTrophyShowcase: boolean;     // Champions Trophy monument at stadium entrance
  techHubInnovationPedestal: boolean;  // Working prototype display at Engineering faculty
  solarStreetlightsInstalled: boolean; // Solar LED streetlamps along West Walkway
  culturalFestivalPavilion: boolean;  // Roundabout lawn pavilion built after campus gala
  drainageCanalReinforced: boolean;   // Reinforced stone culvert at natural pond bridge
}

export interface InnovationProject {
  id: string;
  title: string;
  category: 'electronics' | 'biotech' | 'software' | 'cleantech';
  description: string;
  requiredComponents: { id: string; name: string; count: number }[];
  efficiencyScore: number; // 0 - 100%
  isBuilt: boolean;
  isExhibited: boolean;
  grantEarned: number; // in Naira
  academicBoost: number;
  reputationXP: number;
}

export interface MysteryClue {
  id: string;
  title: string;
  location: string;
  description: string;
  discovered: boolean;
  linkedSuspectId?: string;
  insight: string;
}

export interface MysterySuspect {
  id: string;
  name: string;
  role: string;
  avatar: string;
  motive: string;
  alibi: string;
  isCulprit: boolean;
  testimony: string;
}

export interface CampusCultureEvent {
  id: string;
  title: string;
  eventType: 'tech_hackathon' | 'football_derby' | 'afrobeat_jam' | 'cultural_gala' | 'charity_drive';
  venueId: string;
  venueName: string;
  budgetSpent: number;
  ticketPrice: number;
  radioHypeActive: boolean;
  cateringOrdered: boolean;
  soundRigRented: boolean;
  turnoutAttendees: number;
  revenueEarned: number;
  reputationGained: number;
  completed: boolean;
  dateHeld: string;
}

export interface OffCampusLocation {
  id: string;
  name: string;
  district: 'ojuelegba' | 'yaba' | 'outer_lodges';
  tagline: string;
  description: string;
  imageIcon: string;
  fare: number;
  availableActivities: {
    id: string;
    label: string;
    cost: number;
    description: string;
    rewardItem?: { id: string; name: string; category: string; price: number };
    statImpact?: { balance?: number; stamina?: number; hunger?: number; reputation?: number };
  }[];
}

export interface CooperativeChallenge {
  id: string;
  title: string;
  category: 'electrification' | 'stadium_upgrade' | 'food_bank';
  description: string;
  targetAmount: number;
  currentAmount: number;
  stages: { name: string; threshold: number; achieved: boolean; benefit: string }[];
  isCompleted: boolean;
  playerContributionTotal: number;
}

export interface MediaArticle {
  id: string;
  headline: string;
  category: 'campus_investigation' | 'sports_derby' | 'technology_breakthrough' | 'student_lifestyle';
  author: string;
  excerpt: string;
  tone: 'investigative' | 'celebratory' | 'critical' | 'informative';
  readershipCount: number;
  moraleImpact: number; // -10 to +10
  datePublished: string;
  published: boolean;
}

export interface CrisisDisruptionState {
  isActive: boolean;
  stage: 'storm_hit' | 'blackout_fuel_ration' | 'clinic_emergency' | 'drainage_flood' | 'resolved';
  dieselCansAcquired: number; // Need 3
  dieselCansRequired: number;
  solarInverterConnected: boolean;
  drainageCleared: boolean;
  emergencyLampsDistributed: number; // Need 4
  emergencyLampsRequired: number;
  clinicSaved: boolean;
  completionRewardEarned: boolean;
}

export interface RoomCustomizationState {
  wallPoster: 'none' | 'afrobeat_legends' | 'super_eagles' | 'tech_matrix' | 'fuo_heritage';
  duvetStyle: 'standard' | 'ankara_gold' | 'emerald_velvet' | 'indigo_traditional';
  rugStyle: 'none' | 'handwoven_geometric' | 'round_plush_velvet';
  deskRig: 'basic_study' | 'dual_monitor_tech' | 'artist_drafting';
  trophyShelf: boolean;
  stringLightsActive: boolean;
  roomColor: string; // Hex color
}

export interface LegacyRecord {
  id: string;
  studentName: string;
  matricNo: string;
  courseName: string;
  finalGPA: number;
  honor: 'First Class' | 'Second Class Upper' | 'Second Class Lower';
  sugOfficeHeld?: string;
  sportsTrophies: number;
  patentedInventions: number;
  casesSolved: number;
  achievements: string[];
  endowmentMessage: string;
  dateGraduated: string;
}
