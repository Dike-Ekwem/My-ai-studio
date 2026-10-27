export interface CampusPOI {
  id: string;
  name: string;
  category: 'academic' | 'residential' | 'recreation' | 'commercial' | 'service' | 'transport';
  position: [number, number, number]; // x, y, z in Three.js coordinates
  size: [number, number, number]; // width, height, depth for 3D representation
  color: string;
  roofColor: string;
  roofType?: 'flat' | 'gable' | 'hipped' | 'pyramidal' | 'dome';
  floors?: number;
  label: string;
  description: string;
  interactionType?: 'lecture' | 'hostel' | 'shop' | 'food_joint' | 'football' | 'basketball' | 'keke' | 'shuttle' | 'clinic' | 'sug' | 'admin' | 'service';
  interactionRadius: number;
  entranceOffset?: [number, number, number]; // offset from building center to designated main door
}

export const CAMPUS_POIS: CampusPOI[] = [
  // ============================================================
  // 1. ADMINISTRATIVE CITADEL (NORTH APEX)
  // Positioned north of Senate Plaza drop-off loop (road ends at z=-145)
  // ============================================================
  {
    id: 'admin_senate',
    name: 'Senate Building & Administrative Tower',
    category: 'service',
    position: [0, 0, -170],
    size: [28, 26, 22],
    color: '#1E293B',
    roofColor: '#0F172A',
    roofType: 'hipped',
    floors: 5,
    label: 'Senate Building & Clock Tower',
    description: 'Office of the Vice-Chancellor, Registrar, Academic Planning Unit, and Admissions Registry.',
    interactionType: 'admin',
    interactionRadius: 12,
    entranceOffset: [0, 0, 11.5] // Faces South directly toward drop-off loop
  },

  // ============================================================
  // 2. ACADEMIC QUADRANGLE (WEST SECTOR)
  // Set back alongside West Secondary Academic Loop (z = -48)
  // ============================================================
  {
    id: 'central_library',
    name: 'Nnamdi Azikiwe Central Library',
    category: 'academic',
    position: [-50, 0, -82],
    size: [26, 18, 22],
    color: '#0F766E',
    roofColor: '#134E4A',
    roofType: 'hipped',
    floors: 4,
    label: 'Central University Library',
    description: 'Four floors of reading tables, e-learning terminal, reference archives, and silent study cubicles.',
    interactionType: 'lecture',
    interactionRadius: 12,
    entranceOffset: [0, 0, 11.5] // Faces South to Academic Loop
  },
  {
    id: 'fac_eng',
    name: 'Faculty of Engineering & Technology',
    category: 'academic',
    position: [-95, 0, -82],
    size: [24, 16, 20],
    color: '#8B4513',
    roofColor: '#5C2E0B',
    roofType: 'gable',
    floors: 4,
    label: 'Engineering Faculty Block',
    description: 'Departments of Electronic & Computer Engineering, Mechanical Engineering, laboratories & workshops.',
    interactionType: 'lecture',
    interactionRadius: 12,
    entranceOffset: [0, 0, 10.5] // Faces South to Academic Loop
  },
  {
    id: 'fac_sci',
    name: 'Faculty of Science & Computing',
    category: 'academic',
    position: [-135, 0, -82],
    size: [24, 16, 20],
    color: '#1D4ED8',
    roofColor: '#1E3A8A',
    roofType: 'pyramidal',
    floors: 4,
    label: 'Science & Computing Complex',
    description: 'Departments of Computer Science, Microbiology, software laboratories, and biological science units.',
    interactionType: 'lecture',
    interactionRadius: 12,
    entranceOffset: [0, 0, 10.5] // Faces South to Academic Loop
  },
  {
    id: 'fac_comm',
    name: 'Faculty of Commerce & Management',
    category: 'academic',
    position: [-50, 0, -25],
    size: [22, 13, 18],
    color: '#D97706',
    roofColor: '#92400E',
    roofType: 'gable',
    floors: 3,
    label: 'Commerce & Management',
    description: 'Departments of Accounting, Business Administration, seminar halls, and executive development centre.',
    interactionType: 'lecture',
    interactionRadius: 11,
    entranceOffset: [0, 0, -9.5] // Faces North to Academic Loop
  },
  {
    id: 'fac_arts',
    name: 'Faculty of Arts and Humanities',
    category: 'academic',
    position: [-95, 0, -25],
    size: [22, 12, 18],
    color: '#7E22CE',
    roofColor: '#581C87',
    roofType: 'hipped',
    floors: 3,
    label: 'Arts & Humanities Block',
    description: 'Departments of English & Literary Studies, History & International Studies, language lab and drama quadrangle.',
    interactionType: 'lecture',
    interactionRadius: 11,
    entranceOffset: [0, 0, -9.5] // Faces North to Academic Loop
  },
  {
    id: 'fac_med',
    name: 'College of Health Sciences & Medicine',
    category: 'academic',
    position: [-95, 0, -125],
    size: [26, 17, 22],
    color: '#F8FAFC',
    roofColor: '#DC2626',
    roofType: 'dome',
    floors: 4,
    label: 'College of Health Sciences',
    description: 'Departments of Medicine & Surgery, Medical Laboratory Science, anatomy dissecting theatre & clinics.',
    interactionType: 'lecture',
    interactionRadius: 12,
    entranceOffset: [0, 0, 11.5]
  },

  // ============================================================
  // 3. COMMERCIAL DISTRICT & CAMPUS SUPERMARKET (EAST SECTOR)
  // Set back alongside East Secondary Commercial Road (z = +52)
  // ============================================================
  {
    id: 'supermarket_store',
    name: 'FUO Central Supermarket & Department Store',
    category: 'commercial',
    position: [60, 0, 80],
    size: [26, 12, 22],
    color: '#0284C7',
    roofColor: '#0369A1',
    roofType: 'flat',
    floors: 2,
    label: 'FUO Central Supermarket',
    description: 'Full 7-department student store: provisions, stationery, toiletries, clothing, electronics, beddings, and dorm kitchenware.',
    interactionType: 'shop',
    interactionRadius: 12,
    entranceOffset: [0, 0, -11.5] // Faces North toward Commercial Avenue
  },
  {
    id: 'food_bukka',
    name: 'Mama Nkechi Campus Bukka',
    category: 'commercial',
    position: [100, 0, 80],
    size: [18, 8, 16],
    color: '#15803D',
    roofColor: '#166534',
    roofType: 'gable',
    floors: 1,
    label: 'Mama Nkechi Bukka (Local Meals)',
    description: 'Hot party jollof, white rice & stew, pounded yam & egusi, eba, beans & dodo.',
    interactionType: 'food_joint',
    interactionRadius: 10,
    entranceOffset: [0, 0, -8.5]
  },
  {
    id: 'food_snacks',
    name: 'Iya Basira Quick Bites & Bakery',
    category: 'commercial',
    position: [126, 0, 80],
    size: [16, 7, 15],
    color: '#D97706',
    roofColor: '#B45309',
    roofType: 'gable',
    floors: 1,
    label: 'Iya Basira Snacks (Puff-Puff & Pies)',
    description: 'Warm beef meat pies, sausage rolls, sweet doughnuts, hot puff-puff, sandwiches & cold drinks.',
    interactionType: 'food_joint',
    interactionRadius: 10,
    entranceOffset: [0, 0, -8.0]
  },
  {
    id: 'food_grill',
    name: 'Campus Grills, Shawarma & Noodles',
    category: 'commercial',
    position: [150, 0, 80],
    size: [16, 7, 15],
    color: '#DC2626',
    roofColor: '#991B1B',
    roofType: 'flat',
    floors: 1,
    label: 'Campus Grills & Shawarma',
    description: 'Double Indomie & eggs, chicken shawarma, grilled quarter chicken & chips, beef suya, burgers.',
    interactionType: 'food_joint',
    interactionRadius: 10,
    entranceOffset: [0, 0, -8.0]
  },
  {
    id: 'food_akara',
    name: 'Mama Bimpe Akara & Fried Yam Stand',
    category: 'commercial',
    position: [172, 0, 80],
    size: [14, 6, 14],
    color: '#B45309',
    roofColor: '#78350F',
    roofType: 'gable',
    floors: 1,
    label: 'Akara & Fresh Bread Stand',
    description: 'Hot bean cakes fresh out of groundnut oil, sweet Agege bread, fried yam chunks, dodo & pap.',
    interactionType: 'food_joint',
    interactionRadius: 10,
    entranceOffset: [0, 0, -7.5]
  },
  {
    id: 'food_cafe',
    name: 'The Campus Oasis Café',
    category: 'commercial',
    position: [165, 0, 26],
    size: [16, 7, 15],
    color: '#0F766E',
    roofColor: '#115E59',
    roofType: 'hipped',
    floors: 1,
    label: 'Campus Oasis Café & Teas',
    description: 'Air-conditioned study café with caramel lattes, hot Milo, smoothies, toasted chicken paninis & charging ports.',
    interactionType: 'food_joint',
    interactionRadius: 10,
    entranceOffset: [0, 0, 8.0]
  },
  {
    id: 'service_cybercafe',
    name: 'FUO Cybercafé & Print Express',
    category: 'service',
    position: [86, 0, 26],
    size: [16, 7, 15],
    color: '#1E3A8A',
    roofColor: '#172554',
    roofType: 'flat',
    floors: 1,
    label: 'Cybercafé & Print Hub',
    description: 'Laser slide printing, project spiral binding, exam past questions photocopying & passport photos.',
    interactionType: 'service',
    interactionRadius: 10,
    entranceOffset: [0, 0, 8.0]
  },
  {
    id: 'service_barber',
    name: 'Executive Campus Barber & Salon',
    category: 'service',
    position: [140, 0, 26],
    size: [15, 7, 15],
    color: '#78350F',
    roofColor: '#451A03',
    roofType: 'gable',
    floors: 1,
    label: 'Campus Barber & Salon',
    description: 'Undergraduate low cuts, skin taper fades, beard styling, hot towel treatment and head massage.',
    interactionType: 'service',
    interactionRadius: 10,
    entranceOffset: [0, 0, 8.0]
  },
  {
    id: 'service_laundry',
    name: 'Omo Campus Laundromat & Dry Cleaners',
    category: 'service',
    position: [36, 0, 80],
    size: [15, 7, 14],
    color: '#0891B2',
    roofColor: '#155E75',
    roofType: 'flat',
    floors: 1,
    label: 'Campus Laundromat & Dry Clean',
    description: 'Washing, machine drying, heavy bedsheet laundry, steam ironing and native attire starching.',
    interactionType: 'service',
    interactionRadius: 10,
    entranceOffset: [0, 0, -7.5]
  },
  {
    id: 'service_phoneshop',
    name: 'Slot & Gadgets Mobile Hub',
    category: 'service',
    position: [80, 0, 80],
    size: [14, 7, 14],
    color: '#581C87',
    roofColor: '#3B0764',
    roofType: 'hipped',
    floors: 1,
    label: 'Phone Accessories & Gadgets',
    description: 'Heavy duty 20,000mAh power banks, fast-charging cables, noise-canceling earphones and 9D ceramic screen protectors.',
    interactionType: 'service',
    interactionRadius: 10,
    entranceOffset: [0, 0, -7.5]
  },
  {
    id: 'service_minimart',
    name: 'Student Village Express Mini-Mart',
    category: 'commercial',
    position: [38, 0, 26],
    size: [15, 7, 14],
    color: '#065F46',
    roofColor: '#064E3B',
    roofType: 'flat',
    floors: 1,
    label: 'Village Express Mini-Mart',
    description: 'Quick provisions, cold beverages, toiletries, midnight exam snack packs and high-speed student night data.',
    interactionType: 'service',
    interactionRadius: 10,
    entranceOffset: [0, 0, 8.0]
  },

  // ============================================================
  // 4. HEALTH, WORSHIP & STUDENT CIVICS (NORTH-EAST SECTOR)
  // Set back alongside East Secondary Service Road (z = -48)
  // ============================================================
  {
    id: 'campus_clinic',
    name: 'University Health Centre & Pharmacy',
    category: 'service',
    position: [60, 0, -78],
    size: [22, 12, 18],
    color: '#F1F5F9',
    roofColor: '#0284C7',
    roofType: 'hipped',
    floors: 3,
    label: 'University Health Centre',
    description: 'Emergency primary healthcare, certified doctor consultations, observation ward, and dispensary.',
    interactionType: 'clinic',
    interactionRadius: 11,
    entranceOffset: [0, 0, 9.5] // Faces South toward Service Road
  },
  {
    id: 'chapel_mosque',
    name: 'Interfaith Centre (Chapel & Mosque)',
    category: 'service',
    position: [105, 0, -78],
    size: [26, 15, 20],
    color: '#F8FAFC',
    roofColor: '#10B981',
    roofType: 'dome',
    floors: 3,
    label: 'Chapel of Grace & Campus Mosque',
    description: 'Serene place of prayer, student fellowships, quiet contemplation, and spiritual reflection.',
    interactionType: 'admin',
    interactionRadius: 11,
    entranceOffset: [0, 0, 10.5] // Faces South toward Service Road
  },
  {
    id: 'sug_building',
    name: 'Student Union Government (SUG) Secretariat',
    category: 'service',
    position: [60, 0, 26],
    size: [22, 11, 18],
    color: '#0369A1',
    roofColor: '#075985',
    roofType: 'flat',
    floors: 2,
    label: 'SUG Secretariat & Parliament',
    description: 'Seat of student activism, electoral debates, event ticket bookings, and student advocacy.',
    interactionType: 'sug',
    interactionRadius: 11,
    entranceOffset: [0, 0, 9.5]
  },

  // ============================================================
  // 5. SPORTS & RECREATION DISTRICT (FAR EAST SECTOR)
  // ============================================================
  {
    id: 'football_pitch',
    name: 'University Stadium & Football Field',
    category: 'recreation',
    position: [165, 0, -50],
    size: [40, 3, 28],
    color: '#15803D',
    roofColor: '#166534',
    roofType: 'flat',
    floors: 1,
    label: 'University Football Stadium (3 Modes)',
    description: 'Full-size regulation pitch with covered grandstands, goalposts, floodlights, and match-day atmosphere.',
    interactionType: 'football',
    interactionRadius: 18,
    entranceOffset: [-33, 0, 0] // Approach from West Road turnstile
  },
  {
    id: 'basketball_court',
    name: 'Campus Basketball Arena',
    category: 'recreation',
    position: [165, 0, -10],
    size: [28, 4, 18],
    color: '#EA580C',
    roofColor: '#C2410C',
    roofType: 'flat',
    floors: 1,
    label: 'Campus Basketball Arena (3 Modes)',
    description: 'Tournament acrylic court with glass backboards, bleachers, 24s shot clock, and floodlights.',
    interactionType: 'basketball',
    interactionRadius: 14,
    entranceOffset: [-14, 0, 0]
  },

  // ============================================================
  // 6. RESIDENTIAL HALLS VILLAGE (SOUTH-WEST SECTOR)
  // Set back alongside West Hostels Loop (z = +55)
  // ============================================================
  {
    id: 'hostel_a',
    name: 'Federal Hostel A (Moremi Hall)',
    category: 'residential',
    position: [-60, 0, 88],
    size: [24, 16, 20],
    color: '#E0E7FF',
    roofColor: '#4338CA',
    roofType: 'gable',
    floors: 4,
    label: 'Federal Hostel A (2/Room)',
    description: 'Four-storey federal hall of residence with double-room suites, courtyard and study lounge.',
    interactionType: 'hostel',
    interactionRadius: 12,
    entranceOffset: [0, 0, -10.5] // Faces North toward Hostels Road
  },
  {
    id: 'hostel_b',
    name: 'Federal Hostel B (Independence Hall)',
    category: 'residential',
    position: [-105, 0, 88],
    size: [26, 16, 20],
    color: '#FEF3C7',
    roofColor: '#B45309',
    roofType: 'hipped',
    floors: 4,
    label: 'Federal Hostel B (4/Room)',
    description: 'Four-storey federal hall of residence with balconies, vibrant common room, and buttery.',
    interactionType: 'hostel',
    interactionRadius: 12,
    entranceOffset: [0, 0, -10.5] // Faces North toward Hostels Road
  },
  {
    id: 'private_inside_lodge',
    name: 'Campus Palm Lodge (Private Ensuite)',
    category: 'residential',
    position: [-145, 0, 88],
    size: [20, 13, 16],
    color: '#ECFDF5',
    roofColor: '#059669',
    roofType: 'pyramidal',
    floors: 3,
    label: 'Palm Lodge (Private Inside)',
    description: 'Ensuite single-occupancy air-conditioned studio units inside campus grounds.',
    interactionType: 'hostel',
    interactionRadius: 11,
    entranceOffset: [0, 0, -8.5]
  },

  // ============================================================
  // 7. TRANSPORT STOPS & MAIN ENTRANCE GATE
  // ============================================================
  {
    id: 'main_gate',
    name: 'Main University Gate & Security Monument',
    category: 'transport',
    position: [0, 0, 140],
    size: [32, 10, 6],
    color: '#166534',
    roofColor: '#14532D',
    roofType: 'hipped',
    floors: 1,
    label: 'Federal University of Omo Main Gate',
    description: 'Grand monumental stone archway entrance on the university perimeter fence.',
    interactionType: 'keke',
    interactionRadius: 14,
    entranceOffset: [0, 0, 0]
  },
  {
    id: 'gate_keke_park',
    name: 'University Keke Napep Park & Shuttle Terminal',
    category: 'transport',
    position: [22, 0, 135],
    size: [14, 4, 10],
    color: '#FACC15',
    roofColor: '#CA8A04',
    roofType: 'flat',
    floors: 1,
    label: 'Main Gate Transport Terminal',
    description: 'Official terminal for tricycles (Keke) and university coaster buses.',
    interactionType: 'keke',
    interactionRadius: 10,
    entranceOffset: [0, 0, 0]
  },
  {
    id: 'stop_hostels',
    name: 'Hostels Village Keke & Shuttle Stop',
    category: 'transport',
    position: [-75, 0, 55],
    size: [10, 4, 8],
    color: '#FACC15',
    roofColor: '#CA8A04',
    roofType: 'flat',
    floors: 1,
    label: 'Hostels Village Transport Stop',
    description: 'Board Keke or Shuttle directly from the residential halls.',
    interactionType: 'keke',
    interactionRadius: 10,
    entranceOffset: [0, 0, 0]
  },
  {
    id: 'stop_faculties',
    name: 'Academic Quadrangle Keke & Shuttle Stop',
    category: 'transport',
    position: [-80, 0, -48],
    size: [10, 4, 8],
    color: '#FACC15',
    roofColor: '#CA8A04',
    roofType: 'flat',
    floors: 1,
    label: 'Faculty Quadrangle Transport Stop',
    description: 'Direct transport stop outside lecture halls and central library.',
    interactionType: 'keke',
    interactionRadius: 10,
    entranceOffset: [0, 0, 0]
  },

  // ============================================================
  // 8. OFF-CAMPUS TOWN & LODGES (STRICTLY OUTSIDE PERIMETER FENCE)
  // All located at z > 150, beyond the perimeter fence!
  // ============================================================
  {
    id: 'outside_junction',
    name: 'Off-Campus University Town Junction',
    category: 'transport',
    position: [0, 0, 175],
    size: [16, 4, 10],
    color: '#64748B',
    roofColor: '#475569',
    roofType: 'flat',
    floors: 1,
    label: 'Off-Campus Keke & Taxi Stand',
    description: 'Bustling junction outside gate connecting off-campus lodges to the city highway.',
    interactionType: 'keke',
    interactionRadius: 10,
    entranceOffset: [0, 0, 0]
  },
  {
    id: 'outside_diamond_lodge',
    name: 'Diamond Lodge (Off-Campus Private)',
    category: 'residential',
    position: [-55, 0, 195],
    size: [24, 14, 18],
    color: '#FDBA74',
    roofColor: '#C2410C',
    roofType: 'gable',
    floors: 4,
    label: 'Diamond Lodge (Off-Campus)',
    description: 'Gated 4-storey off-campus private lodge with balconies, DSTV dishes, and security fence.',
    interactionType: 'hostel',
    interactionRadius: 12,
    entranceOffset: [0, 0, -9.5]
  },
  {
    id: 'outside_green_villa',
    name: 'Green Villa (Off-Campus Shared Lodge)',
    category: 'residential',
    position: [55, 0, 195],
    size: [22, 12, 16],
    color: '#86EFAC',
    roofColor: '#16A34A',
    roofType: 'hipped',
    floors: 3,
    label: 'Green Villa (Shared Flat)',
    description: 'Shared 2-person student flat outside campus perimeter with assigned roommate.',
    interactionType: 'hostel',
    interactionRadius: 12,
    entranceOffset: [0, 0, -8.5]
  }
];

// ============================================================
// FUNCTIONAL FILLER BUILDINGS (NON-INTERACTABLE BUT LABELED)
// ============================================================
export interface FillerBuilding {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  roofColor: string;
  roofType?: 'flat' | 'gable' | 'hipped' | 'pyramidal';
  floors?: number;
  label: string;
  category: string;
}

export const CAMPUS_FILLER_BUILDINGS: FillerBuilding[] = [
  {
    id: 'filler_tetfund',
    name: 'TETFund Mega Lecture Theatre Complex (750-Seater)',
    position: [-135, 0, -25],
    size: [26, 15, 20],
    color: '#E2E8F0',
    roofColor: '#0284C7',
    roofType: 'pyramidal',
    floors: 4,
    label: 'TETFund Mega Lecture Complex',
    category: 'Academic Facility'
  },
  {
    id: 'filler_law',
    name: 'Faculty of Law & Hon. Justice Moot Court',
    position: [60, 0, -25],
    size: [22, 13, 18],
    color: '#FEF08A',
    roofColor: '#78350F',
    roofType: 'hipped',
    floors: 3,
    label: 'Faculty of Law & Moot Court',
    category: 'Faculty'
  },
  {
    id: 'filler_bank',
    name: 'University Microfinance Bank & ATM Gallery',
    position: [105, 0, -25],
    size: [16, 8, 14],
    color: '#CBD5E1',
    roofColor: '#1E293B',
    roofType: 'flat',
    floors: 2,
    label: 'Campus Bank & 24/7 ATM Gallery',
    category: 'Financial Service'
  },
  {
    id: 'filler_arch',
    name: 'Department of Architecture & Environmental Design Studios',
    position: [-135, 0, 32],
    size: [20, 11, 16],
    color: '#FDE047',
    roofColor: '#CA8A04',
    roofType: 'gable',
    floors: 3,
    label: 'Architecture Design Studios',
    category: 'Department'
  },
  {
    id: 'filler_auditorium',
    name: 'University 2000-Capacity Multipurpose Auditorium',
    position: [110, 0, 26],
    size: [28, 16, 22],
    color: '#E0E7FF',
    roofColor: '#4338CA',
    roofType: 'hipped',
    floors: 4,
    label: 'Grand Convocation Auditorium',
    category: 'Civic Facility'
  }
];
