import {
  WorldEvolutionState,
  InnovationProject,
  MysteryClue,
  MysterySuspect,
  CooperativeChallenge,
  OffCampusLocation,
  RoomCustomizationState,
  CrisisDisruptionState,
  LegacyRecord,
  MediaArticle
} from '../types/revolution';

export const INITIAL_WORLD_EVOLUTION: WorldEvolutionState = {
  quadPavilionRenovated: false,
  stadiumTrophyShowcase: false,
  techHubInnovationPedestal: false,
  solarStreetlightsInstalled: false,
  culturalFestivalPavilion: false,
  drainageCanalReinforced: false
};

export const INITIAL_ROOM_CUSTOMIZATION: RoomCustomizationState = {
  wallPoster: 'afrobeat_legends',
  duvetStyle: 'ankara_gold',
  rugStyle: 'handwoven_geometric',
  deskRig: 'basic_study',
  trophyShelf: false,
  stringLightsActive: true,
  roomColor: '#312e81'
};

export const INITIAL_CRISIS_STATE: CrisisDisruptionState = {
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

export const INNOVATION_PROJECTS: InnovationProject[] = [
  {
    id: 'proj_keke_solar',
    title: 'Keke Solar Hybrid Inverter V2',
    category: 'cleantech',
    description: 'A rooftop 300W photovoltaic canopy inverter that doubles Keke Napep battery efficiency across campus roads.',
    requiredComponents: [
      { id: 'comp_solar_cell', name: 'Photovoltaic Solar Cells (x2)', count: 2 },
      { id: 'comp_lithium_pack', name: 'Lithium Iron Battery Pack', count: 1 },
      { id: 'comp_arduino_chip', name: 'Programmable Microcontroller', count: 1 }
    ],
    efficiencyScore: 88,
    isBuilt: false,
    isExhibited: false,
    grantEarned: 65000,
    academicBoost: 15,
    reputationXP: 120
  },
  {
    id: 'proj_biometric_beacon',
    title: 'Biometric Lecture Attendance Beacon',
    category: 'electronics',
    description: 'A bluetooth low-energy attendance logger that automates student presence recording for faculty auditoriums.',
    requiredComponents: [
      { id: 'comp_arduino_chip', name: 'Programmable Microcontroller', count: 1 },
      { id: 'comp_sensor_array', name: 'Biometric Fingerprint Sensor', count: 1 },
      { id: 'comp_lithium_pack', name: 'Lithium Iron Battery Pack', count: 1 }
    ],
    efficiencyScore: 94,
    isBuilt: false,
    isExhibited: false,
    grantEarned: 50000,
    academicBoost: 20,
    reputationXP: 100
  },
  {
    id: 'proj_cassava_packaging',
    title: 'Cassava Starch Biodegradable Packaging',
    category: 'biotech',
    description: 'Eco-friendly take-away food packaging made from cassava polymer for campus bukkas to replace single-use plastics.',
    requiredComponents: [
      { id: 'comp_cassava_resin', name: 'Organic Cassava Polymer Resin', count: 2 },
      { id: 'comp_sensor_array', name: 'Moisture Barrier Sensor', count: 1 }
    ],
    efficiencyScore: 91,
    isBuilt: false,
    isExhibited: false,
    grantEarned: 45000,
    academicBoost: 12,
    reputationXP: 90
  },
  {
    id: 'proj_smart_water_sensor',
    title: 'Smart Rainwater Harvesting & Level Monitor',
    category: 'cleantech',
    description: 'An automated ultrasonic tank gauge and filtration sensor that monitors hostel water supply reserves.',
    requiredComponents: [
      { id: 'comp_sensor_array', name: 'Ultrasonic Liquid Sensor', count: 1 },
      { id: 'comp_dynamo_motor', name: 'Low-Flow DC Pump Motor', count: 1 },
      { id: 'comp_arduino_chip', name: 'Programmable Microcontroller', count: 1 }
    ],
    efficiencyScore: 86,
    isBuilt: false,
    isExhibited: false,
    grantEarned: 55000,
    academicBoost: 14,
    reputationXP: 110
  }
];

export const MYSTERY_CLUES: MysteryClue[] = [
  {
    id: 'clue_archive_ledger',
    title: '1926 Foundation Registrar Ledger',
    location: 'Nnamdi Azikiwe Central Library (Archives Room)',
    description: 'A dust-covered leatherbound ledger from the university founding year. A page describing the ceremonial solid-brass Founders Mace is dog-eared with pencil notes.',
    discovered: false,
    linkedSuspectId: 'suspect_dean_okonjo',
    insight: 'Mentions that the Mace contains a secret inner chamber holding historical land deeds.'
  },
  {
    id: 'clue_encrypted_usb',
    title: 'Encrypted Blue USB Flash Drive',
    location: 'Senate Fountain Roundabout Lawn',
    description: 'Dropped behind the ornamental flowerbed near the landmark tower. Contains scanned drafts of upcoming General Studies examination papers stamped "CONFIDENTIAL".',
    discovered: false,
    linkedSuspectId: 'suspect_chidi_rep',
    insight: 'File metadata shows the exams were exported from a faculty desktop after 10:00 PM.'
  },
  {
    id: 'clue_bukka_overheard',
    title: 'Recorded Whisper Transcript',
    location: 'Mama Nkechi Bukka (Outdoor Verandah)',
    description: 'An overheard argument between a shadowy contractor and a student politician arguing over a "heavy brass souvenir" stored in a trunk.',
    discovered: false,
    linkedSuspectId: 'suspect_contractor_danladi',
    insight: 'The contractor claimed he needed funds to pay workers for the new stadium roof.'
  },
  {
    id: 'clue_lab_keycard_log',
    title: 'Altered Engineering Lab Access Log',
    location: 'Faculty of Engineering (Room 104)',
    description: 'A digital keycard printout showing that someone entered the secure research vault at 02:15 AM on the night of the blackout.',
    discovered: false,
    linkedSuspectId: 'suspect_blessing_sug',
    insight: 'The keycard used was registered to a student union executive member.'
  },
  {
    id: 'clue_sports_locker_receipt',
    title: 'Duplicate Locker Pawn Receipt',
    location: 'University Stadium (Grandstand Dressing Room)',
    description: 'A pawn ticket from an antique trader in Surulere Ojuelegba Market for an "ornamental academic staff".',
    discovered: false,
    linkedSuspectId: 'suspect_contractor_danladi',
    insight: 'The receipt has Alhaji Danladi\'s company stamp on the back!'
  }
];

export const MYSTERY_SUSPECTS: MysterySuspect[] = [
  {
    id: 'suspect_dean_okonjo',
    name: 'Professor Okonjo',
    role: 'Faculty Dean & Senate Custodian',
    avatar: '👨🏾‍🏫',
    motive: 'Was about to face a senate audit regarding missing historical faculty archives.',
    alibi: 'Claims he was in Abuja attending the Federal Ministry of Education accreditation summit.',
    isCulprit: false,
    testimony: '"My integrity as a senior academic is unblemished! Look at the contractor handling the renovation work instead!"'
  },
  {
    id: 'suspect_chidi_rep',
    name: 'Chidi Okonkwo',
    role: 'Department Course Representative',
    avatar: '👨🏾‍🎓',
    motive: 'Struggling with GPA and wanted leaked exam drafts to sell to desperate students.',
    alibi: 'Was studying in Hall A with his roommate until lights out.',
    isCulprit: false,
    testimony: '"Yes, I found the USB drive near the fountain, but I swear I did not steal the Mace! I was only curious about the exam leaks!"'
  },
  {
    id: 'suspect_contractor_danladi',
    name: 'Alhaji Danladi',
    role: 'Lead Campus Infrastructure Contractor',
    avatar: '👷🏾‍♂️',
    motive: 'Bank loan overdue for the stadium construction; pawned the ceremonial brass mace to an Ojuelegba antique dealer.',
    alibi: 'Claimed he never set foot inside the Senate archives or stadium vaults.',
    isCulprit: true,
    testimony: '"I built half these buildings! Why would I need a dusty old brass stick? Wait... who showed you that pawn slip from Ojuelegba?!"'
  },
  {
    id: 'suspect_blessing_sug',
    name: 'Blessing Adebayo',
    role: 'SUG Welfare Director',
    avatar: '👩🏾‍🎓',
    motive: 'Wanted leverage to push the administration to reduce hostel utility fees.',
    alibi: 'Was presiding over the student hall executive meeting.',
    isCulprit: false,
    testimony: '"I borrow keys to inspect student facilities, but stealing university heritage? Never! The student union stands for justice."'
  }
];

export const OFF_CAMPUS_LOCATIONS: OffCampusLocation[] = [
  {
    id: 'dist_ojuelegba',
    name: 'Surulere Ojuelegba Commercial & Tech Hub',
    district: 'ojuelegba',
    tagline: 'Electronics Bazaar, Otigba Computer Parts & Roadside Suya',
    description: 'Vibrant commercial hub 15 minutes from the university gate. Famous for engineering component vendors, laptop repairs, and authentic night street food.',
    imageIcon: '🏙️',
    fare: 150,
    availableActivities: [
      {
        id: 'act_buy_electronics',
        label: 'Buy Innovation Components (Otigba Stall)',
        cost: 12000,
        description: 'Purchase microcontrollers, solar cells, and sensor modules needed for university prototypes.',
        rewardItem: { id: 'comp_solar_cell', name: 'Photovoltaic Solar Cells (x2)', category: 'tool', price: 12000 },
        statImpact: { reputation: 15 }
      },
      {
        id: 'act_eat_suya',
        label: 'Feast at Mallam Garba Suya Spot',
        cost: 2500,
        description: 'Spicy peppered beef suya with onions, tomatoes, and chilled malt drink.',
        statImpact: { hunger: -60, stamina: 40, reputation: 5 }
      },
      {
        id: 'act_freelance_gig',
        label: 'Take Tech Bro Freelance Gig',
        cost: 0,
        description: 'Help an electronics dealer troubleshoot inverter circuit boards for cash.',
        statImpact: { balance: 22000, stamina: -25, reputation: 25 }
      }
    ]
  },
  {
    id: 'dist_yaba',
    name: 'Yaba Mainland Creative Arts & Youth Quarter',
    district: 'yaba',
    tagline: 'Merch Printing Studios, Indie Records & Tech Co-Working',
    description: 'The creative epicenter of the city. Students visit to screenprint association t-shirts, buy Afrobeat vinyl records, and work at tech incubators.',
    imageIcon: '🎨',
    fare: 200,
    availableActivities: [
      {
        id: 'act_print_event_merch',
        label: 'Screenprint Event Promotional Flyers & Merch',
        cost: 8000,
        description: 'Custom banners and flyers that drastically boost turnout for student-organized events.',
        statImpact: { reputation: 35 }
      },
      {
        id: 'act_cowork_study',
        label: 'Day Pass at Hub One Tech Lounge',
        cost: 3000,
        description: 'Uninterrupted fiber internet, constant AC, and gourmet coffee to finish assignments.',
        statImpact: { stamina: 30, reputation: 20 }
      }
    ]
  },
  {
    id: 'dist_outer_lodges',
    name: 'Outer University Lodges & Generator Depot',
    district: 'outer_lodges',
    tagline: 'Private Off-Campus Hostels & Diesel Fuel Depot',
    description: 'Residential suburb populated by senior students and lecturers. Features the local diesel filling station crucial during campus power shortages.',
    imageIcon: '🏘️',
    fare: 100,
    availableActivities: [
      {
        id: 'act_buy_diesel_can',
        label: 'Procure 25L Diesel Fuel Jerrican (Crisis Supply)',
        cost: 16000,
        description: 'High-grade diesel needed to keep the university health clinic generator running during power outages.',
        rewardItem: { id: 'item_diesel_can', name: '25L Diesel Fuel Jerrican', category: 'tool', price: 16000 },
        statImpact: { reputation: 40 }
      },
      {
        id: 'act_rest_lodge',
        label: 'Rest at Senior Lodge Study Garden',
        cost: 0,
        description: 'Quiet leafy courtyard with breeze to recharge energy away from campus noise.',
        statImpact: { stamina: 35, hunger: 10 }
      }
    ]
  }
];

export const COOPERATIVE_CHALLENGES: CooperativeChallenge[] = [
  {
    id: 'chal_solar_electrification',
    title: 'Campus Solar Electrification Initiative',
    category: 'electrification',
    description: 'A university-wide student crowdfund and engineering effort to install solar lighting along all main academic walkways.',
    targetAmount: 150000,
    currentAmount: 85000,
    stages: [
      { name: 'Procure Solar Panels & Inverters', threshold: 50000, achieved: true, benefit: 'Engineering lab unlocked new component imports.' },
      { name: 'Install Walkway Solar Lightposts', threshold: 100000, achieved: false, benefit: 'Bright lighting erected along West Academic Way, preventing night darkness.' },
      { name: 'Commission 24/7 Library Solar Grid', threshold: 150000, achieved: false, benefit: 'Central Library remains open until midnight with solar electricity!' }
    ],
    isCompleted: false,
    playerContributionTotal: 25000
  },
  {
    id: 'chal_nuga_stadium',
    title: 'NUGA Games 2026 Stadium Upgrade',
    category: 'stadium_upgrade',
    description: 'Prepare the university football stadium and basketball arena for the upcoming Nigerian University Games Association championship.',
    targetAmount: 180000,
    currentAmount: 110000,
    stages: [
      { name: 'Pitch Re-turfing & Drainage Lines', threshold: 60000, achieved: true, benefit: 'Ball rolling physics and turf traction enhanced.' },
      { name: 'Erect Champions Trophy Monument', threshold: 120000, achieved: false, benefit: 'Golden trophy plinth built at stadium turnstiles!' },
      { name: 'Install High-Output LED Floodlights', threshold: 180000, achieved: false, benefit: 'Night matches can now be played under brilliant illumination.' }
    ],
    isCompleted: false,
    playerContributionTotal: 15000
  },
  {
    id: 'chal_food_bank',
    title: 'Student Welfare Food Bank Drive',
    category: 'food_bank',
    description: 'Provide subsidised meal vouchers and staple groceries for indigent freshers and working students.',
    targetAmount: 80000,
    currentAmount: 45000,
    stages: [
      { name: 'Stockpile Rice & Gari Bags', threshold: 30000, achieved: true, benefit: 'Mama Nkechi Bukka subsidises freshers meals.' },
      { name: 'Emergency Meal Token System', threshold: 60000, achieved: false, benefit: 'Students with low funds can claim free lunch at the Bukka.' },
      { name: 'Permanent Campus Food Pantry', threshold: 80000, achieved: false, benefit: 'SUG Secretariat operates daily breakfast nutrition packs.' }
    ],
    isCompleted: false,
    playerContributionTotal: 10000
  }
];

export const INITIAL_MEDIA_ARTICLES: MediaArticle[] = [
  {
    id: 'art_1',
    headline: 'FUO Surulere Campus Welcomes Class of 2026 in Grand Matriculation',
    category: 'student_lifestyle',
    author: 'The Omo Voice Editorial Board',
    excerpt: 'Over 3,500 new undergraduates took the university solemn pledge yesterday under the historic clock tower.',
    tone: 'celebratory',
    readershipCount: 1420,
    moraleImpact: 6,
    datePublished: 'Day 1',
    published: true
  },
  {
    id: 'art_2',
    headline: 'Inter-Faculty Football Derby Reignites Fierce Campus Rivalry',
    category: 'sports_derby',
    author: 'Sports Editor Tunde',
    excerpt: 'Faculty of Engineering and Science & Computing clash this Saturday at the newly renovated university stadium.',
    tone: 'informative',
    readershipCount: 980,
    moraleImpact: 4,
    datePublished: 'Day 2',
    published: true
  }
];

export const DEFAULT_LEGACY_RECORDS: LegacyRecord[] = [
  {
    id: 'leg_2025_001',
    studentName: 'Emeka Chukwuma',
    matricNo: 'FUO/2021/0482',
    courseName: 'Electronic & Computer Engineering',
    finalGPA: 4.88,
    honor: 'First Class',
    sugOfficeHeld: 'SUG Director of Technology',
    sportsTrophies: 3,
    patentedInventions: 2,
    casesSolved: 1,
    achievements: ['Valedictorian', 'Innovator of the Year', 'NUGA Football Champion'],
    endowmentMessage: 'To all who walk these avenues: dare to build solutions that will illuminate our nation.',
    dateGraduated: 'Class of 2025'
  }
];
