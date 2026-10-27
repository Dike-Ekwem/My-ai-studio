import {
  WorldEvolutionState,
  InnovationProject,
  MysteryClue,
  MysterySuspect,
  CampusCultureEvent,
  CooperativeChallenge,
  MediaArticle,
  CrisisDisruptionState,
  RoomCustomizationState,
  LegacyRecord
} from './revolution';

export type FacultyType = 
  | 'Arts and Humanities'
  | 'Commerce and Management'
  | 'Engineering and Technology'
  | 'Medicine and Health Sciences'
  | 'Science and Computing';

export interface CourseData {
  id: string;
  name: string;
  faculty: FacultyType;
  durationYears: number;
  totalLevels: number; // 2 levels per year (1 semester = 1 level)
  codePrefix: string;
  description: string;
  careerPaths: string[];
  firstYearCourses: {
    code: string;
    title: string;
    credits: number;
    lecturer: string;
    venue: string;
    timeSlot: string; // e.g. "09:00 - 10:30"
    dayOfWeek: number; // 1 (Mon) - 5 (Fri)
    sampleQuiz: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };
  }[];
}

export type FinancialBackground = 'stretched' | 'working_class' | 'comfortable' | 'wealthy';

export type GenderType = 'boy' | 'girl' | 'non_binary';

export type PersonalityArchetype =
  | 'tech_bro'
  | 'party_baddie'
  | 'scholar_firstclass'
  | 'campus_pastor'
  | 'hustler_ceo';

export interface CharacterCustomization {
  gender: GenderType;
  personality: PersonalityArchetype;
  complexion?: string; // Melanin tone, e.g. '#3b2314', '#5c3826', '#875338', '#b87c56'
  faceVariant: string;
  hairStyle: string;
  hairColor?: string;
  outfitId: string;
  shirtColor: string;
  pantsColor: string;
  accessoryId: string;
  backpackId: string;
  shoesId: string;
  slangCatchphrase: string;
}

export interface AccommodationOption {
  id: string;
  name: string;
  occupancy: string;
  occupancyCount: number;
  pricePerSession: number; // in Naira
  location: 'inside' | 'outside';
  distanceToCampusCenter: string;
  description: string;
  pros: string[];
  cons: string[];
  facilities: string[];
}

export interface PlayerState {
  name: string;
  matricNo: string;
  courseId: string;
  financialBackground: FinancialBackground;
  customization?: CharacterCustomization;
  balance: number; // in Naira
  stamina: number; // 0 - 100 (Energy)
  hunger: number; // 0 - 100
  social?: number; // 0 - 100
  fun?: number; // 0 - 100
  hygiene?: number; // 0 - 100
  moodlet?: {
    title: string;
    desc: string;
    icon: string;
    color: string;
  };
  gpa: number; // 0.0 - 5.0
  academicLevel: number; // Level 1 is Year 1 Sem 1
  selectedAccommodationId: string | null;
  roomNumber?: string; // Designated permanent room number e.g. "Room 204"
  hostelBookedDate?: string;
  faculty?: string;
  registeredCourses?: string[];
  attendedClassesToday?: string[]; // Course codes completed today to prevent duplicate farming
  roommate: {
    name: string;
    department: string;
    personality: string;
    avatar: string;
    relationshipScore: number; // -100 to 100
  } | null;
  position: { x: number; y: number; z: number };
  inventory: InventoryItem[];
  attendance: Record<string, { attended: number; total: number }>;
  courseGrades: Record<string, { score: number; grade: string }>;
  carryovers: string[];
  day: number; // Day 1 to 100+
  dayOfWeek: number; // 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat, 7: Sun
  timeOfDay: number; // Minutes from 00:00 (e.g. 540 = 09:00)
  completedActivities: string[];
  transactions: BankTransaction[];
  chatHistory: Record<string, ChatMessage[]>;
  unreadChats: number;
  currentObjective: string;
  objectives?: ObjectiveItem[];
  roommateIntroduced?: boolean;
  reputationXP: number;

  // UNDERGRAD: REVOLUTION II EXTENSIONS
  worldEvolution?: WorldEvolutionState;
  roomCustomization?: RoomCustomizationState;
  innovationProjects?: InnovationProject[];
  mysteryClues?: MysteryClue[];
  mysterySuspects?: MysterySuspect[];
  mysterySolved?: boolean;
  cooperativeChallenges?: CooperativeChallenge[];
  mediaArticles?: MediaArticle[];
  crisisState?: CrisisDisruptionState;
  legacyRecords?: LegacyRecord[];
  organizedEvents?: CampusCultureEvent[];
}

export interface ObjectiveItem {
  id: string;
  title: string;
  description: string;
  timeSlot: string; // e.g. "07:00 AM", "08:00 AM"
  destinationPOIId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
  rewardXP?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'food' | 'book' | 'clothing' | 'tool' | 'electronics' | 'toiletry' | 'hostel_supply' | 'stationery';
  description: string;
  price: number;
  quantity: number;
  effect?: {
    stamina?: number;
    hunger?: number;
    studyBoost?: number;
  };
}

export interface BankTransaction {
  id: string;
  reference: string;
  date: string;
  time: string;
  description: string;
  type: 'debit' | 'credit';
  amount: number;
  balanceAfter: number;
  recipientOrSender?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isPlayer: boolean;
  replies?: {
    text: string;
    actionOutcome?: string;
    statImpact?: { balance?: number; relationship?: number; reputation?: number };
  }[];
}

export interface NPCContact {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  phone: string;
  status: string;
  department?: string;
  relationshipScore: number;
}

export interface TimetableEntry {
  courseCode: string;
  courseTitle: string;
  venue: string;
  day: number;
  startTime: string;
  endTime: string;
  lecturer: string;
}
