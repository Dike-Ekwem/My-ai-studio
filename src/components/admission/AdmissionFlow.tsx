import React, { useState } from 'react';
import { COURSES, FINANCIAL_BACKGROUNDS } from '../../data/courses';
import { ACCOMMODATIONS, POTENTIAL_ROOMMATES } from '../../data/accommodations';
import {
  PlayerState,
  FinancialBackground,
  GenderType,
  PersonalityArchetype,
  CharacterCustomization,
  BankTransaction,
  InventoryItem
} from '../../types/game';
import { generateMatricNo, formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import { ArrivalScene3D } from './ArrivalScene3D';
import { CharacterPreview3D } from './CharacterPreview3D';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Award,
  Wallet,
  Building,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Users,
  ShieldCheck,
  Luggage,
  Bus,
  User,
  Scissors,
  Shirt,
  Flame,
  Palette
} from 'lucide-react';

interface AdmissionFlowProps {
  onComplete: (initialState: PlayerState) => void;
}

type Step =
  | 'custom_identity'
  | 'custom_appearance'
  | 'custom_drip'
  | 'custom_family'
  | 'utme'
  | 'admission_letter'
  | 'gate_arrival'
  | 'accommodation';

export const AdmissionFlow: React.FC<AdmissionFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('custom_identity');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GenderType>('boy');
  const [selectedCourseId, setSelectedCourseId] = useState(COURSES[4].id); // ECE default
  const [personality, setPersonality] = useState<PersonalityArchetype>('scholar_firstclass');

  // Appearance & Drip states
  const [faceVariant, setFaceVariant] = useState<string>('student_boy_fade');
  const [shirtColor, setShirtColor] = useState<string>('#047857'); // University green
  const [pantsColor, setPantsColor] = useState<string>('#1e293b');
  const [outfitStyle, setOutfitStyle] = useState<string>('streetwear');
  const [accessoryId, setAccessoryId] = useState<string>('chain');
  const [backpackId, setBackpackId] = useState<string>('orange');
  const [shoesId, setShoesId] = useState<string>('jordans');

  // Financial Background
  const [selectedBackground, setSelectedBackground] = useState<FinancialBackground>('comfortable');

  // UTME & Housing
  const [utmeScore, setUtmeScore] = useState<number | null>(null);
  const [isSimulatingUtme, setIsSimulatingUtme] = useState(false);
  const [matricNo, setMatricNo] = useState('');
  const [chosenAccommodationId, setChosenAccommodationId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCourse = COURSES.find((c) => c.id === selectedCourseId) || COURSES[0];
  const selectedBgData =
    FINANCIAL_BACKGROUNDS.find((b) => b.id === selectedBackground) || FINANCIAL_BACKGROUNDS[2];

  const currentCustomization: CharacterCustomization = {
    gender,
    personality,
    faceVariant,
    hairStyle: faceVariant,
    outfitId: outfitStyle,
    shirtColor,
    pantsColor,
    accessoryId,
    backpackId,
    shoesId,
    slangCatchphrase:
      personality === 'tech_bro'
        ? 'Opor! Building the next $1B startup from my hostel room!'
        : personality === 'party_baddie'
        ? 'No cap! We outside and the drip is permanently spotless!'
        : personality === 'hustler_ceo'
        ? "Idan energy! Let's get this bag started without hesitation!"
        : personality === 'campus_pastor'
        ? 'Aluta with grace! The blessing of the Lord maketh rich.'
        : 'First-Class honors is non-negotiable! 5.0 GPA loading!'
  };

  const handleStartUtme = () => {
    sounds.playClick();
    setIsSimulatingUtme(true);
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        const score = Math.floor(275 + Math.random() * 62);
        setUtmeScore(score);
        setIsSimulatingUtme(false);
        sounds.playCheer();
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      }
    }, 150);
  };

  const handleProceedToLetter = () => {
    sounds.playClick();
    const newMatric = generateMatricNo(selectedCourse.codePrefix);
    setMatricNo(newMatric);
    setStep('admission_letter');
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  };

  const handleConfirmAccommodationAndStart = () => {
    if (!chosenAccommodationId) return;

    const acc = ACCOMMODATIONS.find((a) => a.id === chosenAccommodationId);
    if (!acc) return;

    const startingBalance = selectedBgData.startingBalance;
    if (startingBalance < acc.pricePerSession) {
      setFormError('Insufficient funds for this accommodation. Please choose an option within your budget.');
      return;
    }
    setFormError(null);

    sounds.playCashPing();
    const remainingBalance = startingBalance - acc.pricePerSession;

    let assignedRoommate = null;
    if (acc.id === 'shared_outside' || acc.id === 'federal_hostel_a' || acc.id === 'federal_hostel_b') {
      const randomIdx = Math.floor(Math.random() * POTENTIAL_ROOMMATES.length);
      assignedRoommate = POTENTIAL_ROOMMATES[randomIdx];
    }

    const starterInventory: InventoryItem[] = [
      {
        id: 'item_student_id',
        name: 'FUO Student Identity Card',
        category: 'tool',
        description: `Official biometric ID for ${name} (${matricNo}).`,
        price: 0,
        quantity: 1
      },
      {
        id: 'item_notebook',
        name: 'Higher Education 60-Leaves Notebook',
        category: 'book',
        description: 'Fresh ruled notebook for taking lecture notes.',
        price: 1000,
        quantity: 2,
        effect: { studyBoost: 10 }
      },
      {
        id: 'item_water',
        name: 'Eva Bottled Water',
        category: 'food',
        description: 'Chilled spring water to beat the Abuja afternoon heat.',
        price: 250,
        quantity: 2,
        effect: { stamina: 15 }
      }
    ];

    const startingPos =
      acc.location === 'inside'
        ? { x: -45, y: 0, z: 35 } // Ground level!
        : { x: 0, y: 0, z: 125 };

    const initialState: PlayerState = {
      name,
      matricNo,
      courseId: selectedCourse.id,
      financialBackground: selectedBackground,
      customization: currentCustomization,
      balance: remainingBalance,
      stamina: 100,
      hunger: 20,
      social: 85,
      fun: 80,
      hygiene: 90,
      moodlet: {
        title: 'Fresh Matriculant (Idan)',
        desc: 'Opor! Stepping onto campus with maximum main character energy!',
        icon: '🌟',
        color: 'emerald'
      },
      gpa: 4.5,
      academicLevel: 1,
      selectedAccommodationId: acc.id,
      roommate: assignedRoommate,
      position: startingPos,
      inventory: starterInventory,
      attendance: {
        [selectedCourse.firstYearCourses[0].code]: { attended: 0, total: 0 },
        [selectedCourse.firstYearCourses[1].code]: { attended: 0, total: 0 }
      },
      courseGrades: {},
      carryovers: [],
      day: 1,
      dayOfWeek: 1,
      timeOfDay: 510,
      completedActivities: ['registration', 'customization', 'utme', 'gate_arrival', 'housing_paid'],
      transactions: [
        {
          id: 'tx_init',
          reference: `OMO-START-${Math.floor(100000 + Math.random() * 900000)}`,
          date: 'Day 1',
          time: '08:00 AM',
          description: `Initial Session Allowance (${selectedBgData.title})`,
          type: 'credit',
          amount: startingBalance,
          balanceAfter: startingBalance,
          recipientOrSender: 'Parents / Family Bank Transfer'
        },
        {
          id: 'tx_acc',
          reference: `OMO-HOU-${Math.floor(100000 + Math.random() * 900000)}`,
          date: 'Day 1',
          time: '08:15 AM',
          description: `Accommodation Rent: ${acc.name}`,
          type: 'debit',
          amount: acc.pricePerSession,
          balanceAfter: remainingBalance,
          recipientOrSender: 'FUO Housing Directorate'
        }
      ],
      chatHistory: {
        parents: [
          {
            id: 'p1',
            senderId: 'parents',
            senderName: 'Papa & Mama',
            text: `We have arrived back safely. We sent your initial allowance to your student account. Focus on your books and make us proud! Opor!`,
            timestamp: '09:00 AM',
            isPlayer: false
          }
        ]
      },
      unreadChats: 1,
      currentObjective: `Check your timetable on phone [P] and attend your first lecture at ${selectedCourse.firstYearCourses[0].venue}!`,
      reputationXP: 100
    };

    onComplete(initialState);
  };

  return (
    <div className="w-full h-full min-h-0 overflow-y-auto overscroll-contain select-text bg-gradient-to-br from-emerald-950 via-stone-900 to-green-950 text-white flex flex-col items-center justify-start py-6 sm:py-10 px-3 sm:px-6 pb-24">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* ======================================================== */}
      {/* STEP 1: IDENTITY & GENDER & PERSONALITY ARCHETYPE        */}
      {/* ======================================================== */}
      {step === 'custom_identity' && (
        <div className="relative max-w-2xl w-full bg-stone-900/95 border border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl my-4 space-y-5 animate-in fade-in duration-300">
          <div className="text-center">
            <Crest size="sm" showTitle={false} />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/60 inline-block mt-2">
              Character Creation • Page 1/4
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-400 font-serif mt-1">
              Let's Get This Bag Started!
            </h1>
            <p className="text-xs text-stone-300 mt-1">
              Define your student identity and personal brand before entering Federal University of Omo.
            </p>
          </div>

          <div className="space-y-4">
            {/* Candidate Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                Candidate Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samuel Adekunle or Chioma Okonkwo"
                className="w-full bg-stone-800 border border-emerald-700/60 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                Choose Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'boy', label: 'Boy / Guy', icon: '👦🏾' },
                  { id: 'girl', label: 'Girl / Lady', icon: '👧🏾' },
                  { id: 'non_binary', label: 'Non-Binary', icon: '✨' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setGender(g.id as GenderType);
                      if (g.id === 'girl' && faceVariant === 'student_boy_fade') {
                        setFaceVariant('student_girl_braids');
                      } else if (g.id === 'boy' && faceVariant === 'student_girl_braids') {
                        setFaceVariant('student_boy_fade');
                      }
                    }}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                      gender === g.id
                        ? 'bg-emerald-900 border-amber-400 text-white shadow-md'
                        : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-emerald-600'
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-xs font-black">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Programme / Department */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                Programme of Study (10 Courses across 5 Faculties)
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  sounds.playClick();
                  setSelectedCourseId(e.target.value);
                }}
                className="w-full bg-stone-800 border border-emerald-700/60 rounded-xl px-4 py-3 text-amber-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {COURSES.map((course) => (
                  <option key={course.id} value={course.id} className="bg-stone-900 text-white">
                    {course.faculty}: {course.name} ({course.durationYears} Years)
                  </option>
                ))}
              </select>
            </div>

            {/* Personality Archetype with Nigerian Slang */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                Campus Personality & Vibe (Nigerian Slang Archetype)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'scholar_firstclass',
                    name: 'Bookworm Idan (First-Class Chaser)',
                    desc: 'GPA 5.0 or nothing. Front-row seat, always prepares past questions.',
                    tag: 'Opor! Scholar vibes'
                  },
                  {
                    id: 'tech_bro',
                    name: 'Hostel Tech Bro / Tech Sis',
                    desc: 'Coding at 2 AM, mechanical keyboard, building next unicorn.',
                    tag: 'Startup Founder'
                  },
                  {
                    id: 'party_baddie',
                    name: 'Campus Baddie / Slay Queen',
                    desc: 'Spotless drip, Friday night clubbing, main character energy.',
                    tag: 'No cap, we outside'
                  },
                  {
                    id: 'hustler_ceo',
                    name: 'Business Mogul / Crypto Idan',
                    desc: 'Sells perfumes, sneakers, and crypto arbitrage between lectures.',
                    tag: 'Money making machine'
                  },
                  {
                    id: 'campus_pastor',
                    name: 'Fellowship President / Choir Lead',
                    desc: 'Early morning devotion, spiritual defense, prayer warrior.',
                    tag: 'Grace & Aluta'
                  }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setPersonality(p.id as PersonalityArchetype);
                    }}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      personality === p.id
                        ? 'bg-emerald-950 border-amber-400 shadow-md ring-1 ring-amber-400'
                        : 'bg-stone-800/80 border-stone-700 hover:border-emerald-600'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-white">{p.name}</div>
                    <div className="text-[11px] text-stone-400 leading-tight mt-0.5">{p.desc}</div>
                    <span className="text-[9px] font-bold text-amber-300 bg-stone-900 px-2 py-0.5 rounded-full inline-block mt-1">
                      {p.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => {
                sounds.playClick();
                setStep('custom_appearance');
              }}
              className={`w-full mt-2 py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                name.trim()
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 hover:scale-[1.01] cursor-pointer'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>Next: Customize 3D Face & Hair</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: FACE, HAIRSTYLE, HEADWEAR & GLASSES              */}
      {/* ======================================================== */}
      {step === 'custom_appearance' && (
        <div className="relative max-w-4xl w-full bg-stone-900/95 border border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl my-4 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/60">
                Character Creation • Page 2/4
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 font-serif mt-1">
                Pick Your Face & Hair Drip
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setStep('custom_identity');
              }}
              className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* 3D LIVE PREVIEW */}
            <div className="h-[280px]">
              <CharacterPreview3D customization={currentCustomization} />
            </div>

            {/* SELECTION TILES */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                Choose Hairstyle & Cultural Headwear
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {[
                  { id: 'student_boy_fade', label: 'Clean Low Fade & Mustache', icon: '💈' },
                  { id: 'student_boy_afro', label: 'Classic Round Afro', icon: '🪮' },
                  { id: 'student_boy_dreads', label: 'Short Dreads & Gold Rings', icon: '🦁' },
                  { id: 'student_girl_braids', label: 'Fulani Box Braids with Beads', icon: '✨' },
                  { id: 'student_girl_afro_puff', label: 'Twin Afro Puffs', icon: '👑' },
                  { id: 'student_girl_hijab', label: 'Sky-Blue Hijab', icon: '🧕🏾' },
                  { id: 'student_girl_gele', label: 'Golden Pleated Gele', icon: '🎉' },
                  { id: 'student', label: 'Mortarboard Graduation Cap', icon: '🎓' },
                  { id: 'student_beanie', label: 'Streetwear Knitted Beanie', icon: '🧢' },
                  { id: 'npc_sunglasses', label: 'Cool Campus Dark Shades', icon: '🕶️' },
                  { id: 'npc_monocle', label: 'Distinguished Gold Monocle', icon: '🧐' }
                ].map((hair) => (
                  <button
                    key={hair.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setFaceVariant(hair.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                      faceVariant === hair.id
                        ? 'bg-emerald-950 border-amber-400 ring-1 ring-amber-400 text-white'
                        : 'bg-stone-800/80 border-stone-700 hover:border-emerald-600 text-stone-300'
                    }`}
                  >
                    <span className="text-xl shrink-0">{hair.icon}</span>
                    <span className="text-xs font-bold leading-tight">{hair.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setStep('custom_drip');
                }}
                className="w-full mt-2 py-3 px-6 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Next: Outfits, Colors & Accessories</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: OUTFITS, COLOR SWATCHES, BAGS & SHOES           */}
      {/* ======================================================== */}
      {step === 'custom_drip' && (
        <div className="relative max-w-4xl w-full bg-stone-900/95 border border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl my-4 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/60">
                Character Creation • Page 3/4
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 font-serif mt-1">
                Outfit & Footwear Customizer
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setStep('custom_appearance');
              }}
              className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* 3D LIVE PREVIEW */}
            <div className="h-[280px]">
              <CharacterPreview3D customization={currentCustomization} />
            </div>

            {/* OUTFIT & COLOR CHOICES */}
            <div className="space-y-3.5 text-xs">
              {/* Shirt Color Swatches */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Shirt / Polo Color</span>
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#047857', label: 'University Green' },
                    { color: '#1d4ed8', label: 'Navy Blue' },
                    { color: '#b91c1c', label: 'Crimson' },
                    { color: '#d97706', label: 'Ochre Gold' },
                    { color: '#7e22ce', label: 'Royal Purple' },
                    { color: '#0f172a', label: 'Midnight Black' }
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setShirtColor(c.color);
                      }}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                      className={`w-8 h-8 rounded-full border-2 transition cursor-pointer transform hover:scale-110 ${
                        shirtColor === c.color ? 'border-amber-400 scale-110 shadow-lg' : 'border-stone-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Pants Color Swatches */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-300 mb-1.5">
                  Trousers / Jeans Color
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#1e293b', label: 'Dark Navy' },
                    { color: '#334155', label: 'Slate Grey' },
                    { color: '#171717', label: 'Pitch Black' },
                    { color: '#78350f', label: 'Khaki Brown' },
                    { color: '#0f766e', label: 'Teal Cargo' }
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setPantsColor(c.color);
                      }}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                      className={`w-8 h-8 rounded-full border-2 transition cursor-pointer transform hover:scale-110 ${
                        pantsColor === c.color ? 'border-amber-400 scale-110 shadow-lg' : 'border-stone-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Backpack & Shoes */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
                    Student Bag
                  </label>
                  <select
                    value={backpackId}
                    onChange={(e) => {
                      sounds.playClick();
                      setBackpackId(e.target.value);
                    }}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white cursor-pointer"
                  >
                    <option value="orange">Orange Student Backpack</option>
                    <option value="tech">Black Tech Laptop Bag</option>
                    <option value="crossbody">Leather Crossbody Bag</option>
                    <option value="none">No Bag (Hand-carry)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
                    Campus Footwear
                  </label>
                  <select
                    value={shoesId}
                    onChange={(e) => {
                      sounds.playClick();
                      setShoesId(e.target.value);
                    }}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white cursor-pointer"
                  >
                    <option value="jordans">Red/White Retro Jordans</option>
                    <option value="loafers">Leather Oxford Brogues</option>
                    <option value="slides">Comfort Slides with Socks</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setStep('custom_family');
                }}
                className="w-full mt-2 py-3 px-6 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Next: Family Financial Background</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: FAMILY FINANCIAL BACKGROUND & NIGERIAN SLANG     */}
      {/* ======================================================== */}
      {step === 'custom_family' && (
        <div className="relative max-w-2xl w-full bg-stone-900/95 border border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl my-4 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/60">
                Character Creation • Page 4/4
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 font-serif mt-1">
                Family Background & Starting Allowance
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setStep('custom_drip');
              }}
              className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <p className="text-xs text-stone-300">
            Pick your family's financial bracket. This determines your starting allowance in your Omo-Pay account and monthly support.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'wealthy',
                name: 'Odogwu Royalty / Trust Fund Baby',
                allowance: '₦1,200,000 Starting Fund',
                slang: 'Opor! Sapa cannot catch us. Private lodge, AC, and daily Shawarma.',
                monthly: '₦250,000/mo'
              },
              {
                id: 'comfortable',
                name: 'Comfortable Middle-Class',
                allowance: '₦600,000 Starting Fund',
                slang: 'No cap! Adequate funds for 2-man federal hostel and regular provisions.',
                monthly: '₦120,000/mo'
              },
              {
                id: 'working_class',
                name: 'Working Class Hustler',
                allowance: '₦320,000 Starting Fund',
                slang: 'God abeg! Moderate budget, 4-man room, smart budgeting at Mama Nkechi.',
                monthly: '₦65,000/mo'
              },
              {
                id: 'stretched',
                name: 'Indigent / Survival Mode (Pure Hustle)',
                allowance: '₦180,000 Starting Fund',
                slang: 'True idan energy! Requires side hustles, scholarships, and pure discipline.',
                monthly: '₦35,000/mo'
              }
            ].map((bg) => (
              <button
                key={bg.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedBackground(bg.id as FinancialBackground);
                }}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  selectedBackground === bg.id
                    ? 'bg-emerald-950 border-amber-400 ring-2 ring-amber-400 shadow-xl text-white'
                    : 'bg-stone-800/80 border-stone-700 hover:border-emerald-600 text-stone-300'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs text-amber-300">{bg.name}</div>
                  <div className="text-sm font-black font-mono text-white mt-0.5">{bg.allowance}</div>
                  <p className="text-[11px] text-stone-300 italic mt-1 leading-snug">"{bg.slang}"</p>
                </div>
                <div className="mt-2 text-[10px] text-emerald-400 font-bold bg-stone-900/80 px-2 py-0.5 rounded-full inline-block">
                  Allowance: {bg.monthly}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setStep('utme');
            }}
            className="w-full mt-3 py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-stone-950 hover:scale-[1.01] flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <span>Lock In Character & Take UTME Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 5: SIMULATED UTME CBT EXAM                           */}
      {/* ======================================================== */}
      {step === 'utme' && (
        <div className="relative max-w-lg w-full bg-stone-900/95 border border-emerald-600/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center my-4 animate-in fade-in duration-300">
          <Crest size="sm" showTitle={false} />
          <h2 className="text-xl sm:text-2xl font-black text-amber-400 mt-2 font-serif">
            JOINT ADMISSIONS & MATRICULATION BOARD
          </h2>
          <p className="text-xs text-stone-400 mt-0.5 uppercase tracking-wider">
            Simulated Unified Tertiary Matriculation Examination (UTME)
          </p>

          <div className="my-6 bg-stone-800/80 rounded-2xl p-5 border border-stone-700 text-left space-y-2">
            <div className="flex justify-between text-xs border-b border-stone-700/60 pb-2">
              <span className="text-stone-400">Candidate:</span>
              <span className="font-bold text-white">{name}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-stone-700/60 pb-2">
              <span className="text-stone-400">Chosen Institution:</span>
              <span className="font-bold text-emerald-400">Federal University of Omo</span>
            </div>
            <div className="flex justify-between text-xs border-b border-stone-700/60 pb-2">
              <span className="text-stone-400">First Choice Course:</span>
              <span className="font-bold text-amber-300">{selectedCourse.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Vibe Check:</span>
              <span className="font-semibold text-emerald-300 italic">{currentCustomization.slangCatchphrase}</span>
            </div>
          </div>

          {!utmeScore ? (
            <div className="space-y-4">
              <p className="text-xs text-stone-300">
                Click below to start the UTME computer-based test (CBT) and compute your aggregate score!
              </p>
              <button
                type="button"
                onClick={handleStartUtme}
                disabled={isSimulatingUtme}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-6 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSimulatingUtme ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Evaluating CBT Responses...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Take UTME CBT Test</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                  Official UTME Result Slip
                </div>
                <div className="text-4xl font-black text-amber-400 my-1 font-mono">
                  {utmeScore} <span className="text-lg text-stone-400 font-sans">/ 400</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  STATUS: SUCCESSFUL & ADMISSION CLEARED
                </div>
              </div>

              <p className="text-xs text-stone-300">
                Opor! With a massive aggregate score of <strong className="text-amber-300">{utmeScore}</strong>, the Senate of Federal University of Omo has offered you provisional admission.
              </p>

              <button
                type="button"
                onClick={handleProceedToLetter}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-400 text-emerald-950 font-black py-3.5 px-6 rounded-2xl shadow-lg hover:from-amber-400 hover:to-amber-300 transition flex items-center justify-center gap-2 cursor-pointer text-base"
              >
                <span>View Official Admission Letter</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 6: OFFICIAL ADMISSION LETTER                        */}
      {/* ======================================================== */}
      {step === 'admission_letter' && (
        <div className="relative max-w-2xl w-full bg-amber-50 text-stone-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-emerald-800 my-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-emerald-900/30 pb-4 mb-4 gap-3 text-center sm:text-left">
            <Crest size="sm" showTitle={false} />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-serif tracking-tight">
                FEDERAL UNIVERSITY OF OMO
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                P.M.B. 1001, Central Abuja, Federal Capital Territory, Nigeria
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono bg-emerald-900 text-emerald-100 px-2 py-1 rounded">
                PROVISIONAL OFFER
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex justify-between border-b border-stone-300 pb-2">
              <span><strong>Candidate Name:</strong> {name}</span>
              <span><strong>Matric No:</strong> <span className="font-mono text-emerald-900 font-bold">{matricNo}</span></span>
            </div>

            <p>
              Dear <strong>{name}</strong>,
            </p>
            <p>
              Following your stellar performance in the Unified Tertiary Matriculation Examination (Score: <strong>{utmeScore}</strong>), we are pleased to inform you that you have been offered provisional admission into the <strong>Department of {selectedCourse.name}</strong>, Faculty of {selectedCourse.faculty}, for the 2026/2027 Academic Session.
            </p>
            <p>
              You are requested to proceed to the main campus for registration and housing verification.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-emerald-900/30 flex justify-between items-center">
            <div className="text-[10px] text-stone-500 font-mono">
              Registrar: Dr. O. A. Balogun (PhD, FIIA)
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setStep('gate_arrival');
              }}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
            >
              <span>Arrive at Campus Gate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 7: GATE ARRIVAL 3D SIMS CINEMATIC                    */}
      {/* ======================================================== */}
      {step === 'gate_arrival' && (
        <div className="relative max-w-4xl w-full my-4">
          <ArrivalScene3D
            studentName={name.trim()}
            courseName={selectedCourse.name}
            onFinishArrival={() => {
              sounds.playClick();
              setStep('accommodation');
            }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 8: CHOOSE ACCOMMODATION & HOUSING PORTAL            */}
      {/* ======================================================== */}
      {step === 'accommodation' && (
        <div className="relative max-w-4xl w-full bg-stone-900/95 border-2 border-emerald-600/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl my-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-700 pb-4 mb-4 gap-2">
            <div>
              <h2 className="text-2xl font-black text-amber-400 font-serif flex items-center gap-2">
                <Building className="w-6 h-6 text-emerald-400" />
                <span>Student Housing & Lodge Portal</span>
              </h2>
              <p className="text-xs text-stone-300">
                Official Housing Board • 2026/2027 Academic Session Rates
              </p>
            </div>
            <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-2xl px-4 py-2 flex items-center gap-2 text-right">
              <Wallet className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-400">Current Student Balance</div>
                <div className="text-lg font-black text-white font-mono">{formatNaira(selectedBgData.startingBalance)}</div>
              </div>
            </div>
          </div>

          {formError && (
            <div className="mb-3 p-3 rounded-2xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold text-center animate-in fade-in">
              ⚠️ {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[58vh] overflow-y-auto pr-1">
            {ACCOMMODATIONS.map((acc) => {
              const isSelected = chosenAccommodationId === acc.id;
              const canAfford = selectedBgData.startingBalance >= acc.pricePerSession;

              return (
                <div
                  key={acc.id}
                  onClick={() => canAfford && setChosenAccommodationId(acc.id)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-950/80 border-amber-400 ring-2 ring-amber-400 shadow-xl'
                      : canAfford
                      ? 'bg-stone-800/80 border-stone-700 hover:border-emerald-500'
                      : 'bg-stone-900/50 border-red-950/50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        acc.location === 'inside' ? 'bg-emerald-900 text-emerald-200' : 'bg-purple-950 text-purple-200'
                      }`}>
                        {acc.location === 'inside' ? 'On Campus' : 'Off Campus Lodge'}
                      </span>
                      <h3 className="font-extrabold text-base text-white mt-1">{acc.name}</h3>
                      <div className="text-xs text-amber-300 flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{acc.occupancy}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-emerald-400 text-sm">
                        {formatNaira(acc.pricePerSession)}
                      </div>
                      <div className="text-[10px] text-stone-400">per session</div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 mt-2">{acc.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 flex justify-end">
            <button
              type="button"
              disabled={!chosenAccommodationId}
              onClick={handleConfirmAccommodationAndStart}
              className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl transition ${
                chosenAccommodationId
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 hover:scale-105 cursor-pointer'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>Confirm Housing & Enter Campus World</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
