import { InventoryItem } from '../types/game';

export interface ShopItem extends Omit<InventoryItem, 'quantity'> {
  icon: string;
}

export interface SupermarketDepartment {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  bannerColor: string;
  description: string;
  items: ShopItem[];
}

export interface FoodVendor {
  id: string;
  name: string;
  vendorTitle: string;
  categoryType: 'local_meals' | 'snacks_bites' | 'alternative_meals' | 'traditional_breakfast' | 'cafe_beverages';
  tagline: string;
  avatar: string;
  color: string;
  accent: string;
  openTime: number; // minutes from midnight (e.g. 480 = 08:00 AM)
  closeTime: number; // minutes from midnight (e.g. 1320 = 10:00 PM)
  items: ShopItem[];
}

export interface ServiceAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  durationMinutes: number;
  effect: {
    stamina?: number;
    studyBoost?: number;
    reputationXP?: number;
    hunger?: number;
  };
  itemReward?: ShopItem;
}

export interface CampusService {
  id: string;
  name: string;
  serviceTitle: string;
  categoryType: 'printing' | 'barber' | 'laundry' | 'phone_gadgets' | 'minimart';
  tagline: string;
  avatar: string;
  color: string;
  accent: string;
  openTime: number;
  closeTime: number;
  actions: ServiceAction[];
}

// ============================================================
// 7 DISTINCT SUPERMARKET AISLES / DEPARTMENTS (REQUIREMENT 7)
// ============================================================
export const SUPERMARKET_DEPARTMENTS: SupermarketDepartment[] = [
  {
    id: 'stationery',
    name: 'Books & Stationery',
    shortName: 'Stationery',
    icon: '📚',
    bannerColor: 'from-blue-700 to-indigo-800',
    description: 'Official academic textbooks, lecture pads, scientific tools, and writing materials.',
    items: [
      {
        id: 'sup_hardcover_pack',
        name: 'Higher Education Notebooks (Set of 4)',
        category: 'book',
        icon: '📓',
        description: '60-leaves ruled hardback notebooks for lecture notes and class assignments.',
        price: 3600,
        effect: { studyBoost: 12 }
      },
      {
        id: 'sup_casio_fx',
        name: 'Casio Scientific Calculator FX-991EX',
        category: 'electronics',
        icon: '🧮',
        description: 'Approved advanced non-programmable calculator for engineering, mathematics and science exams.',
        price: 13500,
        effect: { studyBoost: 25 }
      },
      {
        id: 'sup_geometry_set',
        name: 'Helix Oxford Geometry Mathematical Set',
        category: 'stationery',
        icon: '📐',
        description: 'Metal compass, divider, protractor, set squares, sharpener and pencils.',
        price: 2400,
        effect: { studyBoost: 10 }
      },
      {
        id: 'sup_pen_pack',
        name: 'Pack of 10 Smooth Flow Ballpoint Pens',
        category: 'stationery',
        icon: '🖊️',
        description: 'Assorted blue, black and red smudge-proof pens for examinations and test writing.',
        price: 1200,
        effect: { studyBoost: 6 }
      },
      {
        id: 'sup_textbook_gst',
        name: 'General Studies (GST 101) Official Textbook',
        category: 'book',
        icon: '📖',
        description: 'Compulsory first-year syllabus textbook on communication skills in English.',
        price: 4500,
        effect: { studyBoost: 20 }
      }
    ]
  },
  {
    id: 'clothing',
    name: 'Clothing & Footwear',
    shortName: 'Clothing',
    icon: '👕',
    bannerColor: 'from-purple-700 to-pink-800',
    description: 'Student campus wear, official university crested merchandise, casual wear, and footwear.',
    items: [
      {
        id: 'sup_fuo_hoodie',
        name: 'FUO Crested Heavy Cotton Hoodie',
        category: 'clothing',
        icon: '🧥',
        description: 'Warm fleece pullover with green embroidered Federal University of Omo seal.',
        price: 15000,
        effect: { stamina: 10 }
      },
      {
        id: 'sup_polo_tshirt',
        name: 'Smart Casual Pique Polo Shirt',
        category: 'clothing',
        icon: '👕',
        description: 'Breathable collared shirt suitable for lectures and presentations.',
        price: 6500,
        effect: { stamina: 5 }
      },
      {
        id: 'sup_denim_jeans',
        name: 'Durable Fitted Denim Jeans',
        category: 'clothing',
        icon: '👖',
        description: 'Sturdy dark wash denim jeans built for everyday campus hustling.',
        price: 9500,
        effect: { stamina: 5 }
      },
      {
        id: 'sup_running_sneakers',
        name: 'Comfortable Campus Walking Sneakers',
        category: 'clothing',
        icon: '👟',
        description: 'Cushioned athletic sneakers that make walking between faculties effortless.',
        price: 16500,
        effect: { stamina: 25 }
      },
      {
        id: 'sup_rubber_slippers',
        name: 'Hostel Bathroom Rubber Slides',
        category: 'clothing',
        icon: '🩴',
        description: 'Waterproof anti-slip rubber slides for hostel showers and room relaxation.',
        price: 2500,
        effect: { stamina: 5 }
      }
    ]
  },
  {
    id: 'groceries',
    name: 'Food & Groceries',
    shortName: 'Groceries',
    icon: '🛒',
    bannerColor: 'from-amber-700 to-yellow-800',
    description: 'Provisions, packaged noodles, quick breakfast cereals, drinks, and snacks.',
    items: [
      {
        id: 'sup_indomie_carton',
        name: 'Indomie Instant Noodles (Pack of 10)',
        category: 'food',
        icon: '🍜',
        description: 'Essential survival food for university students. Quick to cook in the hostel.',
        price: 4800,
        effect: { hunger: -60, stamina: 30 }
      },
      {
        id: 'sup_golden_morn',
        name: 'Nestle Golden Morn Grain Cereal (500g)',
        category: 'food',
        icon: '🥣',
        description: 'Wholesome nutritious maize cereal fortified with vitamin A and iron.',
        price: 2800,
        effect: { hunger: -35, stamina: 25 }
      },
      {
        id: 'sup_milo_powder',
        name: 'Milo Chocolate Malt Refill (500g)',
        category: 'food',
        icon: '🍫',
        description: 'Energy-rich cocoa malt drink for late night reading and early morning focus.',
        price: 3200,
        effect: { stamina: 35, hunger: -15 }
      },
      {
        id: 'sup_peak_milk',
        name: 'Peak Full Cream Milk Powder (400g)',
        category: 'food',
        icon: '🥛',
        description: 'Rich creamy powdered milk to pair with cereals, garri, or tea.',
        price: 3000,
        effect: { hunger: -20, stamina: 20 }
      },
      {
        id: 'sup_garri_pack',
        name: 'Ijebu Crisp White Garri (1kg Pack)',
        category: 'food',
        icon: '🌾',
        description: 'Crisp sour white garri, perfect for afternoon soaking with groundnuts and cold water.',
        price: 1500,
        effect: { hunger: -40, stamina: 15 }
      }
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics & Accessories',
    shortName: 'Electronics',
    icon: '🔌',
    bannerColor: 'from-teal-700 to-emerald-800',
    description: 'Power banks, chargers, audio earphones, rechargeable lamps and cables.',
    items: [
      {
        id: 'sup_powerbank_20k',
        name: 'Oraimo 20,000mAh Dual Fast Power Bank',
        category: 'electronics',
        icon: '🔋',
        description: 'High-capacity emergency power bank to keep your smartphone charged during power cuts.',
        price: 14000,
        effect: { studyBoost: 15 }
      },
      {
        id: 'sup_rechargeable_lamp',
        name: 'Rechargeable LED Desk Reading Lamp',
        category: 'electronics',
        icon: '💡',
        description: 'Bright 3-mode desk lamp with flexible neck for night reading in shared rooms.',
        price: 5500,
        effect: { studyBoost: 20 }
      },
      {
        id: 'sup_earphones',
        name: 'Noise-Isolating In-Ear Headphones',
        category: 'electronics',
        icon: '🎧',
        description: 'Clear audio earphones for listening to recorded lectures and study playlists.',
        price: 3500,
        effect: { studyBoost: 10 }
      },
      {
        id: 'sup_usbc_charger',
        name: 'Fast 33W USB-C Wall Charger & Cable',
        category: 'electronics',
        icon: '🔌',
        description: 'Rapid charging adapter compatible with all modern smartphones.',
        price: 4500,
        effect: { studyBoost: 5 }
      },
      {
        id: 'sup_extension_cable',
        name: '4-Way Surge Protector Extension Box',
        category: 'electronics',
        icon: '🪢',
        description: '3-meter heavy duty multi-socket extension cord for room appliances.',
        price: 4200,
        effect: { studyBoost: 5 }
      }
    ]
  },
  {
    id: 'toiletries',
    name: 'Toiletries & Personal Care',
    shortName: 'Toiletries',
    icon: '🧼',
    bannerColor: 'from-cyan-700 to-blue-800',
    description: 'Soaps, toothpaste, detergents, sanitizers, sponges and personal hygiene.',
    items: [
      {
        id: 'sup_dettol_soap',
        name: 'Dettol Antibacterial Bath Soap (Pack of 3)',
        category: 'toiletry',
        icon: '🧼',
        description: 'Maximum protection against germs and campus heat rashes.',
        price: 2100,
        effect: { stamina: 10 }
      },
      {
        id: 'sup_oralb_paste',
        name: 'Oral-B Complete Toothpaste & Brush Kit',
        category: 'toiletry',
        icon: '🪥',
        description: 'Mint fresh cavity protection toothpaste with medium bristle toothbrush.',
        price: 1800,
        effect: { stamina: 5 }
      },
      {
        id: 'sup_ariel_detergent',
        name: 'Ariel Automatic Laundry Powder (900g)',
        category: 'toiletry',
        icon: '🧺',
        description: 'Tough stain remover powder detergent for sparkling clean hostel laundry.',
        price: 2900,
        effect: { stamina: 5 }
      },
      {
        id: 'sup_rollon_deodorant',
        name: 'Nivea 48h Fresh Antiperspirant Roll-On',
        category: 'toiletry',
        icon: '🧴',
        description: 'Stay fresh and confident all day through long lectures.',
        price: 2200,
        effect: { stamina: 10 }
      },
      {
        id: 'sup_tissue_pack',
        name: 'Soft Toilet Tissue Rolls (Pack of 4)',
        category: 'toiletry',
        icon: '🧻',
        description: 'Soft 2-ply embossed bathroom tissue rolls.',
        price: 1600,
        effect: { stamina: 5 }
      }
    ]
  },
  {
    id: 'hostel_supplies',
    name: 'Hostel & Room Supplies',
    shortName: 'Hostel Gear',
    icon: '🛏️',
    bannerColor: 'from-amber-800 to-orange-900',
    description: 'Bedsheets, pillows, buckets, hangers, storage boxes, and room maintenance.',
    items: [
      {
        id: 'sup_bedsheet_set',
        name: 'Cotton Student Bedsheet & 2 Pillowcases',
        category: 'hostel_supply',
        icon: '🛏️',
        description: 'Fitted single bedsheet in serene university green with soft pillow covers.',
        price: 6500,
        effect: { stamina: 15 }
      },
      {
        id: 'sup_plastic_bucket',
        name: 'Heavy Duty 20L Water Bucket with Lid',
        category: 'hostel_supply',
        icon: '🪣',
        description: 'Indispensable hostel bucket with strong steel handle for morning water fetching.',
        price: 2800,
        effect: { stamina: 5 }
      },
      {
        id: 'sup_cloth_hangers',
        name: 'Durable Plastic Clothes Hangers (Set of 12)',
        category: 'hostel_supply',
        icon: '👔',
        description: 'Non-slip wardrobe hangers to keep shirts and native attire crease-free.',
        price: 1800,
        effect: { stamina: 5 }
      },
      {
        id: 'sup_mosquito_net',
        name: 'Treated Single Bunk Mosquito Net',
        category: 'hostel_supply',
        icon: '🕸️',
        description: 'Long-lasting insecticide treated net to guarantee uninterrupted sound sleep.',
        price: 4200,
        effect: { stamina: 20 }
      },
      {
        id: 'sup_padlock_brass',
        name: 'Solid Brass Double Padlock Set',
        category: 'hostel_supply',
        icon: '🔒',
        description: 'Secure heavy-duty padlocks for hostel door and personal wardrobe locker.',
        price: 3200,
        effect: { studyBoost: 5 }
      }
    ]
  },
  {
    id: 'misc_supplies',
    name: 'School Supplies & Miscellaneous',
    shortName: 'Merchandise',
    icon: '🎒',
    bannerColor: 'from-emerald-700 to-teal-900',
    description: 'Backpacks, water flasks, umbrellas, lab accessories and university souvenirs.',
    items: [
      {
        id: 'sup_ergonomic_backpack',
        name: 'Waterproof Laptop & Student Backpack',
        category: 'tool',
        icon: '🎒',
        description: 'Padded multi-compartment bag with anti-theft zipper for heavy textbooks.',
        price: 12500,
        effect: { stamina: 15 }
      },
      {
        id: 'sup_water_flask',
        name: 'Vacuum Insulated Stainless Steel Flask (1L)',
        category: 'tool',
        icon: '🍶',
        description: 'Keeps water chilled for 24 hours under intense tropical sun.',
        price: 4800,
        effect: { stamina: 12 }
      },
      {
        id: 'sup_rain_umbrella',
        name: 'Windproof Compact Auto-Open Umbrella',
        category: 'tool',
        icon: '☂️',
        description: 'Essential gear for sudden heavy afternoon tropical downpours.',
        price: 3500,
        effect: { stamina: 8 }
      },
      {
        id: 'sup_fuo_lanyard',
        name: 'FUO ID Card Holder & Neck Lanyard',
        category: 'tool',
        icon: '🪪',
        description: 'Durable nylon strap with card sleeve to display student matric card.',
        price: 1000,
        effect: { studyBoost: 5 }
      }
    ]
  }
];

// ============================================================
// 3 DISTINCT FOOD JOINTS / VENDORS (REQUIREMENT 8)
// ============================================================
export const FOOD_VENDORS: FoodVendor[] = [
  // 1. LOCAL MEALS: MAMA NKECHI CAMPUS BUKKA
  {
    id: 'food_bukka',
    name: 'Mama Nkechi Campus Bukka',
    vendorTitle: 'Traditional Nigerian Kitchen',
    categoryType: 'local_meals',
    tagline: 'Hearty firewood jollof, tender goat meat, and authentic swallow dishes cooked with motherly love!',
    avatar: '🍲',
    color: 'bg-emerald-900 border-emerald-500',
    accent: '#10b981',
    openTime: 450, // 07:30 AM
    closeTime: 1290, // 09:30 PM
    items: [
      {
        id: 'dish_jollof_chicken',
        name: 'Smoky Firewood Jollof & Fried Chicken',
        category: 'food',
        icon: '🍗',
        description: 'Authentic Nigerian party jollof served with spiced crispy chicken and fried sweet dodo.',
        price: 2500,
        effect: { hunger: -55, stamina: 40 }
      },
      {
        id: 'dish_fried_rice_fish',
        name: 'Savory Fried Rice & Peppered Titus Fish',
        category: 'food',
        icon: '🐟',
        description: 'Carrot and green-pea seasoned rice served with spicy peppered fish steak.',
        price: 2400,
        effect: { hunger: -50, stamina: 35 }
      },
      {
        id: 'dish_white_rice_stew',
        name: 'White Rice, Fried Plantain & Beef Stew',
        category: 'food',
        icon: '🍛',
        description: 'Steaming white rice drizzled with rich aromatic tomato stew, beef chunks and dodo.',
        price: 2200,
        effect: { hunger: -45, stamina: 30 }
      },
      {
        id: 'dish_beans_dodo',
        name: 'Ewa Aganyin Honey Beans & Fried Plantain',
        category: 'food',
        icon: '🫘',
        description: 'Soft slow-cooked honey beans drenched in fiery blackened palm oil sauce.',
        price: 1800,
        effect: { hunger: -50, stamina: 30 }
      },
      {
        id: 'dish_pounded_yam_egusi',
        name: 'Pounded Yam & Egusi Soup with Goat Meat',
        category: 'food',
        icon: '🍲',
        description: 'Hot smooth pounded yam paired with melon seed egusi soup, bitterleaf, and tender goat meat.',
        price: 3200,
        effect: { hunger: -65, stamina: 45 }
      },
      {
        id: 'dish_eba_ogbono',
        name: 'Yellow Garri Eba & Rich Ogbono Soup',
        category: 'food',
        icon: '🥣',
        description: 'Steaming yellow eba with slippery draw soup loaded with smoked fish and cow skin (kanda).',
        price: 2400,
        effect: { hunger: -55, stamina: 35 }
      },
      {
        id: 'dish_semovita_efo',
        name: 'Semovita & Vegetable Efo Riro Soup',
        category: 'food',
        icon: '🥬',
        description: 'Velvety semovita with spiced spinach efo riro, shaki, and dried prawns.',
        price: 2600,
        effect: { hunger: -55, stamina: 35 }
      },
      {
        id: 'dish_yam_eggsauce',
        name: 'Boiled Yam & Spicy Tomato-Egg Sauce',
        category: 'food',
        icon: '🍳',
        description: 'Soft buttery white yam tubers served with scrambled farm egg and habanero pepper sauce.',
        price: 2000,
        effect: { hunger: -40, stamina: 30 }
      }
    ]
  },

  // 2. SNACKS & QUICK BITES: IYA BASIRA BITES & BAKERY
  {
    id: 'food_snacks',
    name: 'Iya Basira Quick Bites & Bakery',
    vendorTitle: 'Pastries, Finger Foods & Cold Drinks',
    categoryType: 'snacks_bites',
    tagline: 'Warm golden meat pies, spicy sausage rolls, hot puff-puff and icy drinks for students on the go!',
    avatar: '🥧',
    color: 'bg-amber-900 border-amber-500',
    accent: '#f59e0b',
    openTime: 480, // 08:00 AM
    closeTime: 1230, // 08:30 PM
    items: [
      {
        id: 'bite_meat_pie',
        name: 'Golden Flaky Beef Meat Pie',
        category: 'food',
        icon: '🥧',
        description: 'Crisp golden pastry filled with seasoned minced beef, soft potatoes and carrots.',
        price: 900,
        effect: { hunger: -25, stamina: 20 }
      },
      {
        id: 'bite_sausage_roll',
        name: 'Peppered Chicken Sausage Roll',
        category: 'food',
        icon: '🌭',
        description: 'Baked buttery crust rolled around spicy seasoned chicken sausage meat.',
        price: 750,
        effect: { hunger: -20, stamina: 15 }
      },
      {
        id: 'bite_glazed_doughnut',
        name: 'Sugar-Glazed Jam Doughnut',
        category: 'food',
        icon: '🍩',
        description: 'Soft fluffy fried yeast doughnut with sweet strawberry jam filling.',
        price: 600,
        effect: { hunger: -15, stamina: 18 }
      },
      {
        id: 'bite_puff_puff',
        name: 'Hot Crispy Puff-Puff (Bag of 6)',
        category: 'food',
        icon: '🧆',
        description: 'Freshly fried golden sweet dough balls infused with aromatic nutmeg.',
        price: 600,
        effect: { hunger: -20, stamina: 15 }
      },
      {
        id: 'bite_club_sandwich',
        name: 'Triple-Decker Chicken & Egg Sandwich',
        category: 'food',
        icon: '🥪',
        description: 'Toasted bread packed with boiled eggs, chicken mayo spread, cucumber and tomatoes.',
        price: 1400,
        effect: { hunger: -30, stamina: 25 }
      },
      {
        id: 'bite_bread_omelette',
        name: 'Fresh Agege Bread & 2-Egg Omelette',
        category: 'food',
        icon: '🍞',
        description: 'Sweet chewy bakery bread sandwiched with spicy fried pepper omelette.',
        price: 1200,
        effect: { hunger: -35, stamina: 25 }
      },
      {
        id: 'bite_small_chops',
        name: 'Campus Small Chops Platter',
        category: 'food',
        icon: '🍢',
        description: 'Delicious assortment of samosa, spring rolls, puff-puff and peppered gizzard.',
        price: 1800,
        effect: { hunger: -30, stamina: 25 }
      },
      {
        id: 'bite_chilled_malt',
        name: 'Ice Cold Maltina Can (33cl)',
        category: 'food',
        icon: '🥤',
        description: 'Fortified malt drink served freezing cold from the cooler.',
        price: 750,
        effect: { stamina: 22, hunger: -10 }
      },
      {
        id: 'bite_pure_water',
        name: 'Chilled Bottle Spring Water (75cl)',
        category: 'food',
        icon: '💧',
        description: 'Refreshing pure bottled water to quench campus thirst.',
        price: 250,
        effect: { stamina: 12, hunger: 0 }
      }
    ]
  },

  // 3. ALTERNATIVE MEALS: CAMPUS GRILLS, SHAWARMA & NOODLES
  {
    id: 'food_grill',
    name: 'Campus Grills, Shawarma & Noodles',
    vendorTitle: 'Modern Street-Food & Grills',
    categoryType: 'alternative_meals',
    tagline: 'Juicy chicken shawarma, loaded Indomie stir-fry, spicy beef suya, and gourmet burgers!',
    avatar: '🌯',
    color: 'bg-red-950 border-orange-500',
    accent: '#f97316',
    openTime: 840, // 02:00 PM
    closeTime: 1350, // 10:30 PM
    items: [
      {
        id: 'alt_double_indomie',
        name: 'Loaded Belleful Indomie & 2 Fried Eggs',
        category: 'food',
        icon: '🍜',
        description: 'Two packs of Indomie cooked with bell peppers, sweet corn, crayfish and two sunny-side eggs.',
        price: 1500,
        effect: { hunger: -45, stamina: 30 }
      },
      {
        id: 'alt_stirfry_spag',
        name: 'Spicy Shredded Chicken Stir-Fry Spaghetti',
        category: 'food',
        icon: '🍝',
        description: 'Wok-tossed spaghetti pasta with chicken strips, spring onions, sesame oil and chili.',
        price: 2200,
        effect: { hunger: -50, stamina: 35 }
      },
      {
        id: 'alt_beef_shawarma',
        name: 'Special Beef & Sausage Shawarma (Big Wrap)',
        category: 'food',
        icon: '🌯',
        description: 'Warm pita wrap packed with grilled spiced beef, chicken franks, cabbage and garlic mayo.',
        price: 2800,
        effect: { hunger: -55, stamina: 40 }
      },
      {
        id: 'alt_grilled_chicken_chips',
        name: 'Quarter Grilled Pepper Chicken & Chips',
        category: 'food',
        icon: '🍗',
        description: 'Fire-grilled BBQ chicken quarter served with golden potato French fries and ketchup.',
        price: 3500,
        effect: { hunger: -60, stamina: 45 }
      },
      {
        id: 'alt_campus_burger',
        name: 'Double Gourmet Beef Cheese Burger',
        category: 'food',
        icon: '🍔',
        description: 'Toasted brioche bun, seasoned beef patty, melted cheddar cheese, onions and pickles.',
        price: 2600,
        effect: { hunger: -50, stamina: 35 }
      },
      {
        id: 'alt_beef_suya',
        name: 'Abuja Night Market Spicy Beef Suya Platter',
        category: 'food',
        icon: '🥩',
        description: 'Thinly sliced tender beef skewers grilled over open charcoal with yaji pepper and sliced onions.',
        price: 2000,
        effect: { hunger: -40, stamina: 30 }
      },
      {
        id: 'alt_yam_chips',
        name: 'Crispy Fried Yam Chips with Pepper Sauce',
        category: 'food',
        icon: '🍟',
        description: 'Golden crunchy fried yam batons served with spicy tomato-habanero dipping sauce.',
        price: 1200,
        effect: { hunger: -30, stamina: 20 }
      }
    ]
  },

  // 4. TRADITIONAL BREAKFAST & EVENING STAND: MAMA BIMPE AKARA & BREAD
  {
    id: 'food_akara',
    name: 'Mama Bimpe Akara & Fried Yam Stand',
    vendorTitle: 'Fresh Morning & Evening Fry Stand',
    categoryType: 'traditional_breakfast',
    tagline: 'Hot fiery bean cakes straight out of the hot groundnut oil with soft Agege bread & pap!',
    avatar: '🧆',
    color: 'bg-amber-950 border-yellow-600',
    accent: '#eab308',
    openTime: 390, // 06:30 AM (Morning rush) to 11:30 AM, reopens 04:30 PM to 10:00 PM
    closeTime: 1320,
    items: [
      {
        id: 'akara_10_bread',
        name: 'Hot Crispy Akara (10 pcs) & Sweet Agege Bread',
        category: 'food',
        icon: '🥖',
        description: 'Piping hot pepper-onion bean cakes stuffed inside a fresh soft loaf of Agege bakery bread.',
        price: 1000,
        effect: { hunger: -45, stamina: 30 }
      },
      {
        id: 'akara_pap_ogi',
        name: 'Warm Akara Balls & Steaming Sweet Ogi (Pap)',
        category: 'food',
        icon: '🥣',
        description: 'Traditional fermented corn meal pudding sweetened with sugar and milk, paired with 6 crunchy akara.',
        price: 850,
        effect: { hunger: -40, stamina: 28 }
      },
      {
        id: 'fried_yam_sauce',
        name: 'Fried White Yam Chunks & Pepper Sauce',
        category: 'food',
        icon: '🍠',
        description: 'Deep-fried golden crunchy yam slabs served with hot habanero palm oil stew.',
        price: 1100,
        effect: { hunger: -40, stamina: 25 }
      },
      {
        id: 'fried_plantain_dodo',
        name: 'Hot Sweet Fried Plantain (Dodo Bowl)',
        category: 'food',
        icon: '🍌',
        description: 'Caramelized sweet ripe plantain slices fried fresh on order.',
        price: 800,
        effect: { hunger: -30, stamina: 20 }
      }
    ]
  },

  // 5. CAFE & BEVERAGES: THE CAMPUS OASIS CAFE
  {
    id: 'food_cafe',
    name: 'The Campus Oasis Café',
    vendorTitle: 'Artisan Coffee, Teas & Sandwiches',
    categoryType: 'cafe_beverages',
    tagline: 'Quiet air-conditioned study café with fresh brews, milkshakes, toasties and charging ports.',
    avatar: '☕',
    color: 'bg-stone-900 border-teal-500',
    accent: '#14b8a6',
    openTime: 450, // 07:30 AM
    closeTime: 1200, // 08:00 PM
    items: [
      {
        id: 'cafe_espresso_latte',
        name: 'Creamy Caramel Iced Latte (500ml)',
        category: 'food',
        icon: '☕',
        description: 'Double espresso shot blended with chilled whole milk, caramel syrup and ice.',
        price: 1600,
        effect: { stamina: 35, hunger: -15 }
      },
      {
        id: 'cafe_hot_milo',
        name: 'Steaming Rich Milo & Full Cream Milk',
        category: 'food',
        icon: '🍵',
        description: 'Thick hot chocolate malt drink with whipped milk foam to fuel study marathons.',
        price: 1000,
        effect: { stamina: 28, hunger: -20 }
      },
      {
        id: 'cafe_toasted_panini',
        name: 'Smoked Chicken & Mozzarella Toastie',
        category: 'food',
        icon: '🥪',
        description: 'Pressed sourdough sandwich with seasoned shredded chicken, melted cheese and sweet mustard.',
        price: 2200,
        effect: { hunger: -50, stamina: 35 }
      },
      {
        id: 'cafe_fruit_smoothie',
        name: 'Tropical Mango-Pineapple Smoothie',
        category: 'food',
        icon: '🥤',
        description: 'Freshly blended mango, pineapple, banana and yogurt smoothie with zero added sugar.',
        price: 1500,
        effect: { stamina: 30, hunger: -15 }
      }
    ]
  }
];

// ============================================================
// STUDENT VILLAGE ESSENTIAL SERVICES (PHASE 3A)
// Barber, Printing/Cybercafe, Laundry, Phone Gadgets, Mini-Mart
// ============================================================
export const CAMPUS_SERVICES: CampusService[] = [
  {
    id: 'service_cybercafe',
    name: 'FUO Cybercafé, Printing & Photocopy Express',
    serviceTitle: 'Document Printing, Binding & Exam Past Questions',
    categoryType: 'printing',
    tagline: 'High-speed laser printing, 20-kobo photocopying, project spiral binding, and online course registration.',
    avatar: '🖨️',
    color: 'bg-blue-950 border-blue-500',
    accent: '#3b82f6',
    openTime: 480, // 08:00 AM
    closeTime: 1260, // 09:00 PM
    actions: [
      {
        id: 'srv_print_slides',
        name: 'Print 15-Page Course Lecture Slides',
        icon: '📄',
        description: 'Crisp double-sided laser prints of current week lecture handouts for reading.',
        price: 750,
        durationMinutes: 10,
        effect: { studyBoost: 15, stamina: -2 }
      },
      {
        id: 'srv_photocopy_pq',
        name: 'Photocopy 5-Year Exam Past Questions & Answers',
        icon: '📚',
        description: 'Full compilation of departmental past questions with verified solutions.',
        price: 1200,
        durationMinutes: 15,
        effect: { studyBoost: 25, stamina: -3 }
      },
      {
        id: 'srv_spiral_binding',
        name: 'Project Spiral Ring Binding & Clear Cover',
        icon: '📑',
        description: 'Professional presentation binding for term papers, lab manuals and seminar reports.',
        price: 1500,
        durationMinutes: 20,
        effect: { studyBoost: 20, reputationXP: 30 }
      },
      {
        id: 'srv_passport_photos',
        name: 'Instant Passport Photographs (8 Copies)',
        icon: '📸',
        description: 'Studio white-background passport photos required for faculty course registration forms.',
        price: 1000,
        durationMinutes: 10,
        effect: { reputationXP: 25 }
      }
    ]
  },
  {
    id: 'service_barber',
    name: 'Executive Campus Barber & Salon',
    serviceTitle: 'Haircuts, Fades & Grooming Salon',
    categoryType: 'barber',
    tagline: 'Sharp clippers, sterilized blades, skin fades, beard sculpting and hair treatment in air conditioning.',
    avatar: '💈',
    color: 'bg-amber-950 border-yellow-500',
    accent: '#eab308',
    openTime: 540, // 09:00 AM
    closeTime: 1320, // 10:00 PM
    actions: [
      {
        id: 'srv_clean_lowcut',
        name: 'Smart Undergraduate Low-Cut & Line Up',
        icon: '✂️',
        description: 'Clean classic student haircut with razor sharp perimeter outline.',
        price: 1500,
        durationMinutes: 25,
        effect: { stamina: 15, reputationXP: 30 }
      },
      {
        id: 'srv_skin_fade',
        name: 'Executive Taper Fade & Beard Sculpting',
        icon: '🪒',
        description: 'Gradual taper skin fade, hot towel shave, beard oil nourishment and razor finish.',
        price: 2500,
        durationMinutes: 40,
        effect: { stamina: 25, reputationXP: 55 }
      },
      {
        id: 'srv_shampoo_treatment',
        name: 'Deep Scalp Shampoo & Conditioning Wash',
        icon: '💆',
        description: 'Mentholated invigorating head massage, hair conditioning and hot blow dry.',
        price: 1800,
        durationMinutes: 20,
        effect: { stamina: 35, reputationXP: 25 }
      }
    ]
  },
  {
    id: 'service_laundry',
    name: 'Omo Campus Laundromat & Dry Cleaners',
    serviceTitle: 'Washing, Machine Drying & Starch Pressing',
    categoryType: 'laundry',
    tagline: 'Never worry about hostel water shortages. We wash, dry, starch and press your wardrobe pristine.',
    avatar: '🧺',
    color: 'bg-cyan-950 border-cyan-500',
    accent: '#06b6d4',
    openTime: 480, // 08:00 AM
    closeTime: 1200, // 08:00 PM
    actions: [
      {
        id: 'srv_wash_wardrobe',
        name: 'Wash & Steam-Press 10 Daily Student Clothes',
        icon: '👕',
        description: 'Gentle detergent wash, tumble dry and crisp steam press for shirts, trousers and jeans.',
        price: 2500,
        durationMinutes: 15,
        effect: { stamina: 30, reputationXP: 30 }
      },
      {
        id: 'srv_heavy_bedsheet',
        name: 'Hostel Duvet, Bedsheets & Curtains Wash',
        icon: '🛏️',
        description: 'Heavy cycle industrial wash for bulky dorm beddings with fresh fragrance softener.',
        price: 3200,
        durationMinutes: 20,
        effect: { stamina: 25, reputationXP: 20 }
      },
      {
        id: 'srv_dryclean_native',
        name: 'Dry Clean & Heavy Starch Native Agbada / Kaftan',
        icon: '👔',
        description: 'Delicate dry cleaning and crisp starching for Sunday worship and formal university events.',
        price: 3500,
        durationMinutes: 15,
        effect: { reputationXP: 60, stamina: 20 }
      }
    ]
  },
  {
    id: 'service_phoneshop',
    name: 'Slot & Gadgets Mobile Accessories Hub',
    serviceTitle: 'Power Banks, Fast Chargers, Audio & Screen Guards',
    categoryType: 'phone_gadgets',
    tagline: 'Reliable high-capacity power banks to survive campus NEPA power outages, original cables and audio gear.',
    avatar: '📱',
    color: 'bg-purple-950 border-purple-500',
    accent: '#a855f7',
    openTime: 540, // 09:00 AM
    closeTime: 1260, // 09:00 PM
    actions: [
      {
        id: 'srv_buy_powerbank',
        name: '20,000mAh 22.5W Fast Charging Power Bank',
        icon: '🔋',
        description: 'Heavy duty polymer power bank with digital display. Keeps phone and tablet charged for 4 days.',
        price: 16500,
        durationMinutes: 5,
        effect: { stamina: 10, reputationXP: 40 },
        itemReward: {
          id: 'tool_powerbank',
          name: '20,000mAh Fast Power Bank',
          category: 'electronics',
          icon: '🔋',
          description: 'High-capacity battery bank for phone and tablet.',
          price: 16500,
          effect: { stamina: 10 }
        }
      },
      {
        id: 'srv_buy_earphones',
        name: 'Deep Bass Noise-Isolating In-Ear Earphones',
        icon: '🎧',
        description: 'Braided tangle-free cable with built-in microphone for phone calls and library study music.',
        price: 3500,
        durationMinutes: 5,
        effect: { studyBoost: 15, reputationXP: 20 },
        itemReward: {
          id: 'tool_earphones',
          name: 'Noise-Isolating Wired Earphones',
          category: 'electronics',
          icon: '🎧',
          description: 'Comfortable earphones for lectures and audio study.',
          price: 3500,
          effect: { studyBoost: 15 }
        }
      },
      {
        id: 'srv_screen_guard',
        name: 'Install 9D Tempered Glass Screen Protector',
        icon: '🛡️',
        description: 'Scratch-resistant, shatter-proof ceramic screen shield installed with bubble-free precision.',
        price: 1800,
        durationMinutes: 10,
        effect: { reputationXP: 20 }
      },
      {
        id: 'srv_fast_cable',
        name: 'Durable 6A Braided Type-C Fast-Charge Cable (2m)',
        icon: '🔌',
        description: 'Reinforced nylon braided cable that withstands constant hostel bending.',
        price: 2200,
        durationMinutes: 5,
        effect: { stamina: 5 }
      }
    ]
  },
  {
    id: 'service_minimart',
    name: 'Student Village Express Mini-Mart',
    serviceTitle: 'Quick Provisions, Cold Drinks & Daily Essentials',
    categoryType: 'minimart',
    tagline: 'Open early till late night for cold bottled drinks, biscuits, toilet rolls, biscuits and quick bites.',
    avatar: '🏪',
    color: 'bg-emerald-950 border-emerald-500',
    accent: '#10b981',
    openTime: 420, // 07:00 AM
    closeTime: 1320, // 10:00 PM
    actions: [
      {
        id: 'srv_energy_bundle',
        name: 'Student Exam Midnight Study Snack Pack',
        icon: '🍫',
        description: 'Cold Lucozade Boost drink, cabin biscuits, roasted groundnuts and dark chocolate bar.',
        price: 1800,
        durationMinutes: 5,
        effect: { hunger: -35, stamina: 30, studyBoost: 15 }
      },
      {
        id: 'srv_toiletries_pack',
        name: 'Hostel Morning Hygiene Essentials Kit',
        icon: '🧼',
        description: 'Dettol antiseptic soap, Colgate toothpaste, medium toothbrush and soft bathroom tissue.',
        price: 2200,
        durationMinutes: 5,
        effect: { stamina: 20 }
      },
      {
        id: 'srv_recharge_data',
        name: 'Instant 10GB Student Night Campus Data Plan',
        icon: '📶',
        description: 'High-speed 4G data subscription for downloading textbooks and research articles.',
        price: 3000,
        durationMinutes: 5,
        effect: { studyBoost: 30, reputationXP: 25 }
      }
    ]
  }
];

// Backward compatibility export so old references compile without errors
export const SHOPS = [
  {
    id: 'bukka',
    name: 'Mama Nkechi Campus Bukka',
    vendorName: 'Mama Nkechi',
    tagline: 'Hot, delicious Nigerian meals cooked with love!',
    items: FOOD_VENDORS[0].items
  },
  {
    id: 'supermarket',
    name: 'Campus Heritage Supermarket',
    vendorName: 'FUO Central Store',
    tagline: 'All university supplies, groceries, clothing and books!',
    items: SUPERMARKET_DEPARTMENTS[0].items
  }
];

export type ShopCategory = (typeof SHOPS)[number];

