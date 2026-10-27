import { AccommodationOption } from '../types/game';

export const ACCOMMODATIONS: AccommodationOption[] = [
  {
    id: 'federal_hostel_a',
    name: 'Federal Hostel A (Hall 1 - Moremi)',
    occupancy: '2 students per room',
    occupancyCount: 2,
    pricePerSession: 120000,
    location: 'inside',
    distanceToCampusCenter: '350m (5 mins walk to main lecture theatres)',
    description: 'Renovated government university hostel with double-bunk spacious room, personal wardrobes, ceiling fans, and regular campus electricity.',
    pros: [
      'Very close to lecture halls and central library',
      '24/7 campus security patrol and verified entry',
      'Affordable official university rate'
    ],
    cons: [
      'Shared bathroom facilities on the corridor',
      'Scheduled tap water hours in morning & evening'
    ],
    facilities: ['Study desk', 'Wardrobe', 'Ceiling fan', 'Common room TV', 'Borehole water']
  },
  {
    id: 'federal_hostel_b',
    name: 'Federal Hostel B (Hall 2 - Independence)',
    occupancy: '4 students per room',
    occupancyCount: 4,
    pricePerSession: 80000,
    location: 'inside',
    distanceToCampusCenter: '450m (6 mins walk)',
    description: 'Bustling classic student hostel block. High camaraderie, lively discussions, and cheapest on-campus accommodation.',
    pros: [
      'Most economical option (₦80,000/session)',
      'Lively student network and study groups',
      'Direct walking distance to sports arena'
    ],
    cons: [
      '4 roommates per room (higher noise & activity)',
      'Crowded laundry lines and shared washrooms'
    ],
    facilities: ['Bunk beds', 'Locker unit', 'Balcony drying line', 'Reading room']
  },
  {
    id: 'private_inside',
    name: 'Campus Palm Lodge (Private Inside)',
    occupancy: 'Single occupancy (Self-contain)',
    occupancyCount: 1,
    pricePerSession: 300000,
    location: 'inside',
    distanceToCampusCenter: '250m (3 mins walk)',
    description: 'Premium on-campus private self-contained studio with ensuite tiled bathroom, private kitchenette, personal generator backup, and high-speed campus WiFi.',
    pros: [
      'Complete personal privacy with zero roommate disturbance',
      'Private ensuite bathroom & personal kitchenette',
      'Inside campus with 24/7 security'
    ],
    cons: [
      'Highest rental cost on campus (₦300,000/session)'
    ],
    facilities: ['Ensuite bathroom', 'Kitchenette', 'Study table & executive chair', 'Inverter power', 'Tiled floor']
  },
  {
    id: 'private_outside',
    name: 'Diamond Lodge (Private Outside Campus)',
    occupancy: 'Single occupancy (Self-contain)',
    occupancyCount: 1,
    pricePerSession: 200000,
    location: 'outside',
    distanceToCampusCenter: '1.2km (Requires Keke or 15 mins walk to Gate)',
    description: 'Modern fenced 3-storey student lodge off-campus in the university town neighbourhood. Gated security, borehole water, DSTV lounge, and balcony view.',
    pros: [
      'Private studio apartment with ensuite bathroom',
      'Quiet environment away from hostel commotion',
      'Close to off-campus local eateries and markets'
    ],
    cons: [
      'Requires daily Keke ride (₦200-₦300) or longer walk to campus gate',
      'NEPA power cuts require generator schedule'
    ],
    facilities: ['Ensuite toilet', 'DSTV connection', 'Borehole', 'Security gateman', 'Prepaid meter']
  },
  {
    id: 'shared_outside',
    name: 'Green Villa (Shared Lodge Outside Campus)',
    occupancy: '2 people sharing (Roommate assigned)',
    occupancyCount: 2,
    pricePerSession: 150000,
    location: 'outside',
    distanceToCampusCenter: '1.0km (Requires Keke or 12 mins walk to Gate)',
    description: 'Comfortable shared two-student flat outside campus. You will be paired with an assigned university roommate with their own distinct personality and habits!',
    pros: [
      'Great balance between price and off-campus comfort',
      'Spacious room with shared kitchen and balcony',
      'Chance to build strong friendship with roommate'
    ],
    cons: [
      'Randomly assigned roommate (could be studious, nocturnal, or messy)',
      'Transport cost to enter campus'
    ],
    facilities: ['Shared kitchen', 'Balcony', 'Borehole water', 'Gated compound']
  }
];

export const POTENTIAL_ROOMMATES = [
  {
    name: 'Segun "Baba" Adeleke',
    department: 'Computer Science',
    personality: 'Chill tech bro who codes till 3 AM, listens to Afrobeats, and always shares fried plantain.',
    avatar: '👨🏾‍💻',
    relationshipScore: 65
  },
  {
    name: 'Emeka Okafor',
    department: 'Accounting',
    personality: 'Sharp entrepreneur, checks crypto and stock rates at dawn, meticulously splits every NEPA bill.',
    avatar: '👨🏾‍💼',
    relationshipScore: 50
  },
  {
    name: 'Ifeanyi "Pastor" Eze',
    department: 'History and International Studies',
    personality: 'Devout fellowship leader, exceptionally tidy, wakes up early for devotion, very polite and generous.',
    avatar: '🙏🏾',
    relationshipScore: 70
  },
  {
    name: 'Kabiru Mohammed',
    department: 'Mechanical Engineering',
    personality: 'Football enthusiast, loves Arsenal FC, plays FIFA on laptop, knows all the best Suya joints in Abuja.',
    avatar: '⚽',
    relationshipScore: 60
  }
];
