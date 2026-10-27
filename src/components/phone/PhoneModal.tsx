import React, { useState, useEffect } from 'react';
import { PlayerState, BankTransaction, InventoryItem, ChatMessage } from '../../types/game';
import { COURSES } from '../../data/courses';
import { CAMPUS_POIS, CampusPOI, CAMPUS_FILLER_BUILDINGS } from '../../data/campusLocations';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import { PhoneCameraApp } from './PhoneCameraApp';
import { PhoneCallApp } from './PhoneCallApp';
import {
  CreditCard,
  MessageSquare,
  Calendar,
  Map as MapIcon,
  Briefcase,
  Package,
  Radio,
  X,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Compass,
  Zap,
  MapPin,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Navigation,
  Camera,
  PhoneCall,
  Video
} from 'lucide-react';

interface PhoneModalProps {
  player: PlayerState;
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
  onBoardKeke?: (destination: CampusPOI, fare: number, vehicleType: 'keke' | 'shuttle') => void;
  initialApp?: 'home' | 'omo_pay' | 'omo_gist' | 'timetable' | 'map' | 'jobs' | 'inventory' | 'news' | 'camera' | 'calls';
}

type PhoneApp =
  | 'home'
  | 'omo_pay'
  | 'omo_gist'
  | 'timetable'
  | 'map'
  | 'jobs'
  | 'inventory'
  | 'news'
  | 'camera'
  | 'calls';

// Dynamic Non-Repetitive Chat Contacts
interface ContactProfile {
  id: string;
  name: string;
  role: string;
  icon: string;
  avatarBg: string;
  status: string;
}

const CHAT_CONTACTS: ContactProfile[] = [
  { id: 'roommate', name: 'Tunde', role: 'Roommate (Hall A)', icon: '🛏️', avatarBg: 'bg-emerald-600', status: 'Online' },
  { id: 'zainab', name: 'Zainab', role: 'Course Mate & Crush', icon: '✨', avatarBg: 'bg-pink-600', status: 'Active 5m ago' },
  { id: 'courserep', name: 'Chidi', role: 'Department Course Rep', icon: '📚', avatarBg: 'bg-blue-600', status: 'In Faculty Block' },
  { id: 'parents', name: 'Papa & Mama', role: 'Family (Chief & Lolo)', icon: '👨‍👩‍👧', avatarBg: 'bg-amber-600', status: 'Online' },
  { id: 'sug', name: 'SUG President', role: 'Student Union Gov.', icon: '🏛️', avatarBg: 'bg-purple-600', status: 'SUG Secretariat' },
  { id: 'emeka', name: 'Emeka Tech', role: 'Freelance Tech Bro', icon: '💻', avatarBg: 'bg-cyan-600', status: 'Coding at Cafe' },
  { id: 'group_freshers', name: 'FUO Freshers 2026 🎓', role: 'Official 100-Level Group', icon: '👥', avatarBg: 'bg-indigo-600', status: '240 Members' }
];

export const PhoneModal: React.FC<PhoneModalProps> = ({
  player,
  onClose,
  onUpdatePlayer,
  onBoardKeke,
  initialApp = 'home'
}) => {
  const [activeApp, setActiveApp] = useState<PhoneApp>(initialApp);

  // OMO-PAY State
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);
  const [transferErrorMsg, setTransferErrorMsg] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<BankTransaction | null>(null);

  // OMO-GIST State
  const [selectedChatContact, setSelectedChatContact] = useState<string>('roommate');
  const [customChatMessage, setCustomChatMessage] = useState('');
  // Track used response indices per contact to guarantee non-repetitive dialogue!
  const [usedResponseHistory, setUsedResponseHistory] = useState<{ [contactId: string]: string[] }>({});

  // GTA-STYLE MAP State
  const [selectedMapPOI, setSelectedMapPOI] = useState<CampusPOI | null>(null);
  const [gpsWaypointPOI, setGpsWaypointPOI] = useState<CampusPOI | null>(null);
  const [mapCategoryFilter, setMapCategoryFilter] = useState<'all' | 'academic' | 'residential' | 'commercial' | 'recreation' | 'transport' | 'service'>('all');
  const [mapZoom, setMapZoom] = useState<number>(1.0);
  const [mapNotice, setMapNotice] = useState<string | null>(null);
  const [jobNotice, setJobNotice] = useState<string | null>(null);

  const course = COURSES.find((c) => c.id === player.courseId) || COURSES[0];

  // Clear unread notifications when opening Omo-Gist
  useEffect(() => {
    if (activeApp === 'omo_gist') {
      onUpdatePlayer((prev) => ({
        ...prev,
        unreadChats: 0
      }));
    }
  }, [activeApp, onUpdatePlayer]);

  // ==========================================
  // OMO-PAY: FICTIONAL TRANSFERS & FINANCES
  // ==========================================
  const handlePerformTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferSuccessMsg(null);
    setTransferErrorMsg(null);

    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferErrorMsg('Please enter a valid in-game amount.');
      return;
    }

    if (amountNum > player.balance) {
      setTransferErrorMsg('Insufficient Omo-Pay balance! Transfer declined.');
      return;
    }

    if (!transferRecipient.trim()) {
      setTransferErrorMsg('Please specify recipient name or matric number.');
      return;
    }

    sounds.playCashPing();

    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      reference: `OMO-TRF-${Math.floor(100000 + Math.random() * 900000)}`,
      date: `Day ${player.day}`,
      time: 'Just now',
      description: `Transfer to ${transferRecipient.trim()}${transferNote ? ` (${transferNote.trim()})` : ''}`,
      type: 'debit',
      amount: amountNum,
      balanceAfter: player.balance - amountNum,
      recipientOrSender: transferRecipient.trim()
    };

    onUpdatePlayer((prev) => ({
      ...prev,
      balance: prev.balance - amountNum,
      transactions: [newTx, ...prev.transactions]
    }));

    setActiveReceipt(newTx);
    setTransferSuccessMsg(`Sent ${formatNaira(amountNum)} to ${transferRecipient.trim()} successfully!`);
    setTransferRecipient('');
    setTransferAmount('');
    setTransferNote('');
  };

  // ==========================================
  // OMO-GIST: SMART NON-REPETITIVE DIALOGUE SYSTEM
  // ==========================================
  const getContextualNonRepetitiveReply = (contactId: string, playerInput: string): { sender: string; text: string } => {
    const lower = playerInput.toLowerCase();
    const contact = CHAT_CONTACTS.find((c) => c.id === contactId) || CHAT_CONTACTS[0];
    const pastUsed = usedResponseHistory[contactId] || [];

    // Helper to pick unused line from candidates
    const pickUnique = (candidates: string[]): string => {
      const unused = candidates.filter((c) => !pastUsed.includes(c));
      const pool = unused.length > 0 ? unused : candidates;
      const chosen = pool[Math.floor(Math.random() * pool.length)];

      setUsedResponseHistory((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []).slice(-15), chosen]
      }));
      return chosen;
    };

    if (contactId === 'roommate') {
      if (lower.includes('money') || lower.includes('cash') || lower.includes('2k') || lower.includes('transfer')) {
        return {
          sender: 'Tunde (Roommate)',
          text: pickUnique([
            `Omo ${player.name.split(' ')[0]}, sapa dey choke me too o! Abeg if your Papa send upkeep, remember your roommate!`,
            'Bro I just checked my Omo-Pay account, remaining ₦450. We dey inside this battle together!',
            'If you get urgent 2k abeg drop am, make we use am buy bread and eggs for dinner.'
          ])
        };
      }
      if (lower.includes('food') || lower.includes('eat') || lower.includes('cook') || lower.includes('indomie') || lower.includes('hungry')) {
        return {
          sender: 'Tunde (Roommate)',
          text: pickUnique([
            'I get two packs of Indomie Belleful for room! Come back quickly make I turn on hot plate.',
            'Guy, Mama Nkechi bukka egusi soup today is hitting different. Let us stroll there now!',
            'Hunger wan tear my intestine. Please buy pure water and suya when coming back from campus.'
          ])
        };
      }
      if (lower.includes('lecture') || lower.includes('assignment') || lower.includes('exam') || lower.includes('class')) {
        return {
          sender: 'Tunde (Roommate)',
          text: pickUnique([
            'Prof said submission deadline is 4 PM prompt at the faculty office! Have you printed your copy?',
            'Guy, the test syllabus is massive! Bring your notebook tonight make we do night reading.',
            'I attend the 8 AM lecture for you, but you owe me gala and drink for signing attendance!'
          ])
        };
      }
      if (lower.includes('water') || lower.includes('light') || lower.includes('hostel') || lower.includes('room')) {
        return {
          sender: 'Tunde (Roommate)',
          text: pickUnique([
            'NEPA just brought light! Plug your phone, powerbank and laptop right now before they take am!',
            'Pumping machine is on downstairs! Grab your bucket make we go fetch water sharp sharp.',
            'Our hostel room is clean, swept and smelling fresh. Come chill.'
          ])
        };
      }
      // General roommate banter
      return {
        sender: 'Tunde (Roommate)',
        text: pickUnique([
          `No wahala ${player.name.split(' ')[0]}! I dey inside room reading slides. Let me know when you're heading back.`,
          'Senior man! How was lectures today? Hope the lecturers didn’t give sudden surprise quiz?',
          'Guy, where you dey? Keke park is crowded today, better walk through Senate walkway.',
          'Safe bro! Let us play FIFA on phone when you return to the hostel.'
        ])
      };
    }

    if (contactId === 'zainab') {
      if (lower.includes('assignment') || lower.includes('notes') || lower.includes('study') || lower.includes('library')) {
        return {
          sender: 'Zainab',
          text: pickUnique([
            `Hey ${player.name.split(' ')[0]}! I summarized chapter 3 and 4 in my notes. Want to meet at the library 2nd floor to crosscheck?`,
            'The lecturer gave a tricky bonus question! I think the formula is in the departmental course pack.',
            'Let us do group study this evening. You explain the practicals, I will explain the theory!'
          ])
        };
      }
      if (lower.includes('food') || lower.includes('lunch') || lower.includes('bukka') || lower.includes('eat')) {
        return {
          sender: 'Zainab',
          text: pickUnique([
            'Aww you are inviting me? Mama Nkechi fried plantain and jollof sounds perfect right now! Meet me in 10 minutes?',
            'I am actually starving! The 2-hour lecture drained all my energy. Let us grab snacks at the supermarket.',
            'Sounds great! Make sure you don’t let the boys from Engineering steal our table at the cafe!'
          ])
        };
      }
      return {
        sender: 'Zainab',
        text: pickUnique([
          `Hey ${player.name.split(' ')[0]}! Saw you walking across Senate roundabout earlier with your backpack. Looking very serious! 😊`,
          'How is your 100-level session going so far? University life is definitely more hectic than secondary school!',
          'Don’t read too hard and forget to have fun o! See you in class tomorrow.',
          'Thank you for texting! Send me that PDF slide when you get to your hostel.'
        ])
      };
    }

    if (contactId === 'courserep') {
      if (lower.includes('venue') || lower.includes('lecture') || lower.includes('time') || lower.includes('class')) {
        return {
          sender: 'Chidi (Course Rep)',
          text: pickUnique([
            'IMPORTANT NOTICE: Prof moved the 10 AM class to Hall 4B due to air conditioning repairs. Do not go to the old venue!',
            'Lecture holds prompt at 9:00 AM. Prof is strictly marking attendance, anyone who comes late will be locked outside!',
            'Check your Lecture Timetable on Omo-Pay smartphone, all updated class codes are uploaded there.'
          ])
        };
      }
      if (lower.includes('assignment') || lower.includes('submission') || lower.includes('project')) {
        return {
          sender: 'Chidi (Course Rep)',
          text: pickUnique([
            'Gentle reminder: All 100-level assignment scripts must be submitted to my hostel room or faculty rep desk before 5 PM!',
            'Please write your Full Name and Matric Number clearly on the cover page. Prof rejects scripts without matric numbers.',
            'I have collected 48 scripts so far. Submit yours on time so I can bind everything together.'
          ])
        };
      }
      return {
        sender: 'Chidi (Course Rep)',
        text: pickUnique([
          `Received, ${player.name}! Remember that 75% attendance is required to sit for the semester examinations. Keep it up!`,
          'Course materials for week 2 are available at the Campus Cyber Cafe beside the Bank.',
          'If you need past questions for PHY101 or MTH101, send me a DM later tonight.'
        ])
      };
    }

    if (contactId === 'parents') {
      if (lower.includes('money') || lower.includes('cash') || lower.includes('allowance') || lower.includes('broke')) {
        return {
          sender: 'Papa (Chief Okafor)',
          text: pickUnique([
            `My child ${player.name.split(' ')[0]}, money is not plucked from trees! Manage your allowance wisely in Omo-Pay. I will send supplementary funds next week.`,
            'Papa says: prioritize your textbooks and food first before any campus enjoyment! We will top up your wallet soon.',
            'We hear you. Mama is praying for you. Use what you have prudently and avoid extravagant spendings.'
          ])
        };
      }
      return {
        sender: 'Mama (Lolo Okafor)',
        text: pickUnique([
          `God bless you, my precious child ${player.name.split(' ')[0]}! Remember what Papa said at the gate: do not join bad clubs, face your studies!`,
          'Have you cooked the dry fish and provisions we packed inside your Ghana-Must-Go bag? Eat well and drink clean water o!',
          'We received your message with joy! Every Sunday evening make sure you call our line to give full updates.',
          'Papa was asking about your matriculation ceremony preparation. Make sure your gown and documents are in order!'
        ])
      };
    }

    if (contactId === 'sug') {
      return {
        sender: 'Hon. SUG President',
        text: pickUnique([
          'Comrades of the Federal University of Omo! The SUG executive is currently dialoguing with management on hostel power supply.',
          'All 100-level freshers are officially invited to the SUG Welcome Bonfire & Cultural Gala this Friday at the Student Union Building!',
          'Stand up for academic excellence! If any lecturer victimizes you or demands unauthorized levies, report directly to the SUG secretariat.'
        ])
      };
    }

    if (contactId === 'emeka') {
      return {
        sender: 'Emeka Tech',
        text: pickUnique([
          'Bro! I just secured a freelance React/Tailwind gig from an Abuja startup. Big things happening on campus!',
          'If you ever want to learn UI/UX or coding during semester breaks, let me know. Tech is the real oil money now!',
          'Do you know the password for the Faculty of Science 5G WiFi? Mine stopped connecting at the cafeteria.'
        ])
      };
    }

    // Group chat: dynamic voices
    const fresherVoices = [
      { name: 'Blessing (Biochem)', text: 'Guys, who solved question 4 in the Chemistry tutorial sheet? It is giving me headache!' },
      { name: 'Kelechi (CompSci)', text: 'Keke drivers at Main Gate are charging ₦300 now, but shuttle bus is still ₦500. Plan your movement!' },
      { name: 'Amina (Economics)', text: 'Don’t forget the SUG fresher orientation seminar is holding tomorrow at the Senate amphitheatre.' },
      { name: 'David (Civil Eng)', text: 'Who wants to play table tennis at the Student Center after afternoon lectures?' },
      { name: 'Fatima (MassComm)', text: 'Mama Nkechi bukka has the best jollof rice on campus, hands down! No debate.' }
    ];
    const pickedVoice = fresherVoices[Math.floor(Math.random() * fresherVoices.length)];
    return {
      sender: pickedVoice.name,
      text: pickedVoice.text
    };
  };

  const handleSendChatMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;
    sounds.playNotification();

    const cleanText = textToSend.trim();
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: 'player',
      senderName: player.name,
      text: cleanText,
      timestamp: 'Just now',
      isPlayer: true
    };

    const npcReply = getContextualNonRepetitiveReply(selectedChatContact, cleanText);

    onUpdatePlayer((prev) => {
      const currentContactMsgs = prev.chatHistory[selectedChatContact] || [];
      return {
        ...prev,
        chatHistory: {
          ...prev.chatHistory,
          [selectedChatContact]: [...currentContactMsgs, newMsg]
        }
      };
    });

    setCustomChatMessage('');

    // Trigger NPC auto-reply with typing feel
    setTimeout(() => {
      sounds.playNotification();
      const replyMsg: ChatMessage = {
        id: `m_rep_${Date.now()}`,
        senderId: selectedChatContact,
        senderName: npcReply.sender,
        text: npcReply.text,
        timestamp: 'Just now',
        isPlayer: false
      };

      onUpdatePlayer((prev) => {
        const existing = prev.chatHistory[selectedChatContact] || [];
        return {
          ...prev,
          chatHistory: {
            ...prev.chatHistory,
            [selectedChatContact]: [...existing, replyMsg]
          }
        };
      });
    }, 1100);
  };

  // Inventory Consumption
  const handleUseItem = (item: InventoryItem) => {
    sounds.playClick();
    if (!item.effect) return;

    onUpdatePlayer((prev) => {
      const updatedInv = prev.inventory
        .map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);

      const newStamina = Math.min(100, Math.max(0, prev.stamina + (item.effect?.stamina || 0)));
      const newHunger = Math.max(0, prev.hunger + (item.effect?.hunger || 0));

      return {
        ...prev,
        inventory: updatedInv,
        stamina: newStamina,
        hunger: newHunger
      };
    });
  };

  // Student Jobs
  const handleWorkJob = (jobTitle: string, pay: number, staminaCost: number) => {
    if (player.stamina < staminaCost) {
      sounds.playClick();
      setJobNotice('⚠️ You are too exhausted to work this shift! Have a meal or rest at your hostel.');
      setTimeout(() => setJobNotice(null), 3500);
      return;
    }

    sounds.playCashPing();
    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      reference: `OMO-WAGE-${Math.floor(100000 + Math.random() * 900000)}`,
      date: `Day ${player.day}`,
      time: 'Shift Complete',
      description: `Wages earned: ${jobTitle}`,
      type: 'credit',
      amount: pay,
      balanceAfter: player.balance + pay,
      recipientOrSender: 'FUO Student Work Scheme'
    };

    onUpdatePlayer((prev) => ({
      ...prev,
      balance: prev.balance + pay,
      stamina: prev.stamina - staminaCost,
      hunger: Math.min(100, prev.hunger + 15),
      timeOfDay: prev.timeOfDay + 120,
      transactions: [newTx, ...prev.transactions],
      reputationXP: prev.reputationXP + 50
    }));

    setJobNotice(`🎉 Completed shift at ${jobTitle}! Earned ${formatNaira(pay)} deposited to Omo-Pay.`);
    setTimeout(() => setJobNotice(null), 3500);
  };

  // Comprehensive list of EVERY relevant location in the university
  const allCampusPOIs: CampusPOI[] = [
    ...CAMPUS_POIS,
    ...CAMPUS_FILLER_BUILDINGS.map((fb) => ({
      id: fb.id,
      name: fb.name,
      category: (fb.id.includes('tetfund') || fb.id.includes('arch') || fb.id.includes('law')
        ? 'academic'
        : fb.id.includes('bank')
        ? 'commercial'
        : 'service') as CampusPOI['category'],
      position: fb.position,
      size: fb.size,
      color: fb.color,
      roofColor: fb.roofColor,
      label: fb.label,
      description: `${fb.name} (${fb.category}) — Official facility on the Federal University of Omo campus grounds.`,
      interactionRadius: 10
    }))
  ];

  // Filtered POIs for GTA Map
  const filteredPOIs = allCampusPOIs.filter(
    (poi) => mapCategoryFilter === 'all' || poi.category === mapCategoryFilter
  );

  // Set GTA Waypoint handler
  const handleSetWaypoint = (poi: CampusPOI) => {
    sounds.playNotification();
    setGpsWaypointPOI(poi);
  };

  const handleClearWaypoint = () => {
    sounds.playClick();
    setGpsWaypointPOI(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      {/* Smartphone Hardware Casing */}
      <div className="relative w-full max-w-[420px] h-[740px] max-h-[94vh] bg-stone-950 rounded-[44px] p-3.5 shadow-2xl border-4 border-stone-800 flex flex-col overflow-hidden">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-stone-900 mr-2" />
          <div className="w-2 h-2 rounded-full bg-blue-950" />
        </div>

        {/* Screen Header Bar */}
        <div className="flex items-center justify-between px-4 pt-2 pb-1 text-[11px] text-stone-300 font-semibold z-20">
          <span>09:41</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="text-[10px]">FUO-NET 5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Screen Body */}
        <div className="flex-1 rounded-[30px] bg-stone-900 border border-stone-800 flex flex-col overflow-hidden relative text-white">
          {/* App Top Title / Navigation Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-stone-950/90 border-b border-stone-800 shrink-0">
            {activeApp === 'home' ? (
              <div className="flex items-center gap-2">
                <Crest size="sm" showTitle={false} />
                <span className="font-extrabold text-xs tracking-wider text-amber-400">FUO SmartPhone</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { sounds.playClick(); setActiveApp('home'); }}
                className="text-xs text-amber-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Back
              </button>
            )}

            {/* Active App Title */}
            {activeApp !== 'home' && (
              <span className="text-xs font-black uppercase tracking-wider text-stone-200">
                {activeApp === 'omo_pay' && 'Omo-Pay'}
                {activeApp === 'omo_gist' && 'Omo-Gist'}
                {activeApp === 'timetable' && 'Lectures'}
                {activeApp === 'map' && 'GTA-V Campus Atlas'}
                {activeApp === 'camera' && 'FUO OmoCam'}
                {activeApp === 'calls' && 'OmoCall VoIP'}
                {activeApp === 'jobs' && 'Student Gigs'}
                {activeApp === 'inventory' && 'Backpack'}
                {activeApp === 'news' && 'Campus Bulletin'}
              </span>
            )}

            <button
              type="button"
              onClick={() => { sounds.playClick(); onClose(); }}
              className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              title="Close Phone [Esc / P]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MAIN APP CONTENT */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* ==================================================== */}
            {/* 1. HOME SCREEN */}
            {/* ==================================================== */}
            {activeApp === 'home' && (
              <div className="space-y-4">
                {/* Student ID Widget */}
                <div className="bg-gradient-to-br from-emerald-950 via-green-900 to-stone-950 p-3.5 rounded-2xl border border-emerald-600/50 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        Student Digital Identity
                      </div>
                      <h3 className="font-black text-sm text-white">{player.name}</h3>
                      <div className="text-xs text-amber-300 font-mono">{player.matricNo}</div>
                    </div>
                    <Crest size="sm" showTitle={false} />
                  </div>
                  <div className="mt-2 text-[11px] text-stone-200 border-t border-emerald-800/40 pt-1.5 flex justify-between items-center">
                    <span className="truncate pr-2">{course.name}</span>
                    <span className="font-bold text-amber-400 shrink-0">GPA: {player.gpa.toFixed(2)}</span>
                  </div>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[
                    {
                      id: 'camera',
                      name: 'OmoCam',
                      subtitle: 'Selfie & Filters',
                      icon: Camera,
                      color: 'bg-gradient-to-br from-pink-600 via-rose-600 to-red-700 text-white',
                      badge: 'HD'
                    },
                    {
                      id: 'calls',
                      name: 'OmoCall',
                      subtitle: 'Voice & Video',
                      icon: PhoneCall,
                      color: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 text-white',
                      badge: 'Live'
                    },
                    {
                      id: 'map',
                      name: 'Campus Map',
                      subtitle: 'GTA-V GPS Atlas',
                      icon: MapIcon,
                      color: 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white',
                      badge: null
                    },
                    {
                      id: 'omo_pay',
                      name: 'Omo-Pay',
                      subtitle: 'Bank & Wallet',
                      icon: CreditCard,
                      color: 'bg-gradient-to-br from-emerald-600 to-green-700 text-white',
                      badge: null
                    },
                    {
                      id: 'omo_gist',
                      name: 'Omo-Gist',
                      subtitle: 'Messages & Chats',
                      icon: MessageSquare,
                      color: 'bg-gradient-to-br from-blue-600 to-cyan-700 text-white',
                      badge: player.unreadChats > 0 ? player.unreadChats : null
                    },
                    {
                      id: 'timetable',
                      name: 'Lectures',
                      subtitle: 'Attendance & Venues',
                      icon: Calendar,
                      color: 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white',
                      badge: null
                    },
                    {
                      id: 'jobs',
                      name: 'Student Gigs',
                      subtitle: 'Earn Wages',
                      icon: Briefcase,
                      color: 'bg-gradient-to-br from-amber-600 to-orange-700 text-white',
                      badge: null
                    },
                    {
                      id: 'inventory',
                      name: 'Backpack',
                      subtitle: 'Items & Books',
                      icon: Package,
                      color: 'bg-gradient-to-br from-orange-600 to-amber-700 text-white',
                      badge: player.inventory.length > 0 ? player.inventory.length : null
                    },
                    {
                      id: 'news',
                      name: 'SUG Hub',
                      subtitle: 'Bulletins & News',
                      icon: Radio,
                      color: 'bg-gradient-to-br from-red-600 to-rose-700 text-white',
                      badge: null
                    }
                  ].map((app) => {
                    const Icon = app.icon;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setActiveApp(app.id as PhoneApp);
                        }}
                        className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/70 hover:border-emerald-500/50 transition cursor-pointer group relative"
                      >
                        {app.badge !== null && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                            {app.badge}
                          </span>
                        )}
                        <div className={`w-11 h-11 rounded-2xl ${app.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold text-white mt-1.5 leading-tight">{app.name}</span>
                        <span className="text-[9px] text-stone-400 leading-none mt-0.5">{app.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 2. OMO-PAY: ALL FINANCES, ALLOWANCE & TRANSFERS */}
            {/* ==================================================== */}
            {activeApp === 'omo_pay' && (
              <div className="space-y-4">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-950 p-4 rounded-2xl border-2 border-emerald-500/60 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-15">
                    <DollarSign className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center justify-between">
                      <span>Omo-Pay In-Game Wallet</span>
                      <span className="font-mono text-[9px] text-amber-300">TIER-1 STUDENT</span>
                    </div>
                    <div className="text-2xl font-black text-white mt-1 font-mono tracking-tight">
                      {formatNaira(player.balance)}
                    </div>
                    <div className="text-[10px] text-emerald-200 mt-0.5 flex items-center gap-1 font-mono">
                      <span>Acc: {player.matricNo.replace('/', '')}</span>
                      <span>•</span>
                      <span>FUO Microfinance</span>
                    </div>
                  </div>
                </div>

                {/* Transfer Form */}
                <form onSubmit={handlePerformTransfer} className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/80 space-y-2.5">
                  <div className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Send In-Game Transfer</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-300 block mb-0.5">Recipient (Name / Matric)</label>
                    <input
                      type="text"
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="e.g. Tunde (Roommate) or Mama Nkechi"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-300 block mb-0.5">Amount (₦)</label>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="e.g. 2000"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-300 block mb-0.5">Note (Optional)</label>
                    <input
                      type="text"
                      value={transferNote}
                      onChange={(e) => setTransferNote(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="e.g. Dinner indomie contribution"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {transferSuccessMsg && (
                    <div className="text-[11px] text-emerald-300 font-medium bg-emerald-950/70 p-2 rounded-lg flex items-center gap-1 border border-emerald-600/40">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>{transferSuccessMsg}</span>
                    </div>
                  )}

                  {transferErrorMsg && (
                    <div className="text-[11px] text-red-300 font-medium bg-red-950/70 p-2 rounded-lg flex items-center gap-1 border border-red-600/40">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span>{transferErrorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-emerald-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Fictional Transfer</span>
                  </button>
                </form>

                {/* Receipt Preview */}
                {activeReceipt && (
                  <div className="bg-stone-950 p-3 rounded-xl border border-emerald-500/50 text-xs space-y-1 font-mono">
                    <div className="flex justify-between items-center text-amber-400 font-bold">
                      <span>📄 Omo-Pay E-Receipt</span>
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(null)}
                        className="text-stone-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-[11px] text-stone-300">Ref: {activeReceipt.reference}</div>
                    <div className="text-[11px] text-stone-300">Desc: {activeReceipt.description}</div>
                    <div className="text-emerald-400 font-black">Amount: {formatNaira(activeReceipt.amount)}</div>
                    <div className="text-[10px] text-stone-400">Balance After: {formatNaira(activeReceipt.balanceAfter)}</div>
                  </div>
                )}

                {/* Transactions History */}
                <div>
                  <div className="text-xs font-bold text-stone-300 mb-1.5 flex justify-between items-center">
                    <span>Recent Transactions</span>
                    <span className="text-[10px] text-stone-400">{player.transactions.length} records</span>
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {player.transactions.map((tx) => (
                      <div key={tx.id} className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-700/60 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <div className="font-bold text-white truncate">{tx.description}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{tx.reference} • {tx.time}</div>
                        </div>
                        <div className={`font-mono font-black text-right shrink-0 ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 3. OMO-GIST: SMART NON-REPETITIVE MESSAGING */}
            {/* ==================================================== */}
            {activeApp === 'omo_gist' && (
              <div className="flex flex-col h-full space-y-2">
                {/* Contact Tabs */}
                <div className="flex gap-1.5 border-b border-stone-800 pb-2 overflow-x-auto shrink-0">
                  {CHAT_CONTACTS.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => { sounds.playClick(); setSelectedChatContact(contact.id); }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0 ${
                        selectedChatContact === contact.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
                      }`}
                    >
                      <span>{contact.icon}</span>
                      <span>{contact.name}</span>
                    </button>
                  ))}
                </div>

                {/* Active Contact Sub-Header */}
                {(() => {
                  const currentContact = CHAT_CONTACTS.find((c) => c.id === selectedChatContact) || CHAT_CONTACTS[0];
                  return (
                    <div className="flex items-center justify-between px-2 py-1 bg-stone-800/60 rounded-xl border border-stone-700/50 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg ${currentContact.avatarBg} flex items-center justify-center text-xs shadow`}>
                          {currentContact.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{currentContact.name}</div>
                          <div className="text-[9px] text-stone-400">{currentContact.role}</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {currentContact.status}
                      </span>
                    </div>
                  );
                })()}

                {/* Messages Scroll Area */}
                <div className="flex-1 space-y-2.5 min-h-[250px] max-h-[295px] overflow-y-auto p-2 bg-stone-950/70 rounded-2xl border border-stone-800/80">
                  {(player.chatHistory[selectedChatContact] || [
                    {
                      id: 'default',
                      senderId: selectedChatContact,
                      senderName: CHAT_CONTACTS.find((c) => c.id === selectedChatContact)?.name || 'Contact',
                      text: selectedChatContact === 'courserep'
                        ? 'Guy, lecture holds at 9 AM sharp at the faculty block. Prof said no African time o!'
                        : selectedChatContact === 'zainab'
                        ? 'Hey! Did you get the lecture slides for our general course? Let me know if you want to study together.'
                        : selectedChatContact === 'parents'
                        ? 'Call us whenever you settle down in your hostel, my child! Mama is praying for you.'
                        : selectedChatContact === 'group_freshers'
                        ? 'Welcome freshers to Federal University of Omo! Share hostel tips, room allocations and lecture venues here.'
                        : 'How far with your hostel room unpacking, roomie?',
                      timestamp: '09:15 AM',
                      isPlayer: false
                    }
                  ]).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${msg.isPlayer ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className="text-[10px] text-stone-400 font-bold mb-0.5">{msg.senderName}</div>
                      <div
                        className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                          msg.isPlayer
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-stone-800 border border-stone-700 text-stone-100 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-stone-500 mt-0.5">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>

                {/* Message Composition: Real Typing Text Input */}
                <div className="pt-1 border-t border-stone-800 space-y-1.5 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage(customChatMessage);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={customChatMessage}
                      onChange={(e) => setCustomChatMessage(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Type custom message in Omo-Gist..."
                      className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!customChatMessage.trim()}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                        customChatMessage.trim()
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>

                  {/* Contextual Quick Reply Chips */}
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-stone-400">Contextual Replies:</div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'I am on my way to the faculty block!',
                        'Did you finish the assignment? Let us crosscheck.',
                        'Meet me at Mama Nkechi Bukka for lunch!',
                        'NEPA just brought light to the hostel!'
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendChatMessage(chip)}
                          className="text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-2 py-1 rounded-lg border border-stone-700 cursor-pointer transition text-left"
                        >
                          💬 {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 4. GTA-V INSPIRED HIGH-TECH CAMPUS MAP ATLAS */}
            {/* ==================================================== */}
            {activeApp === 'map' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-purple-400" />
                    <span>FUO GTA-V GPS Atlas</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono">
                    <button
                      type="button"
                      onClick={() => setMapZoom((prev) => Math.min(1.8, prev + 0.2))}
                      className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapZoom((prev) => Math.max(0.8, prev - 0.2))}
                      className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <span>{Math.round(mapZoom * 100)}%</span>
                  </div>
                </div>

                {mapNotice && (
                  <div className="bg-amber-500/20 border border-amber-500/60 text-amber-300 px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-between gap-2 animate-in fade-in">
                    <span>{mapNotice}</span>
                    <button
                      type="button"
                      onClick={() => setMapNotice(null)}
                      className="text-amber-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Category Filter Pills */}
                <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                  {[
                    { id: 'all', label: 'All Blips' },
                    { id: 'academic', label: 'Faculties [A]' },
                    { id: 'residential', label: 'Hostels [H]' },
                    { id: 'commercial', label: 'Bukkas/Mart [F/M]' },
                    { id: 'service', label: 'Services [Srv]' },
                    { id: 'recreation', label: 'Sports [S]' },
                    { id: 'transport', label: 'Keke Park [T]' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setMapCategoryFilter(cat.id as any)}
                      className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition ${
                        mapCategoryFilter === cat.id
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* GTA-Style 2D Topdown Map Radar Canvas */}
                <div className="relative w-full h-80 bg-slate-950 rounded-2xl border-2 border-purple-500/50 overflow-hidden shadow-2xl">
                  {/* Styled GTA-V Asphalt & Topographic Grid */}
                  <div className="absolute inset-0 bg-[#0f172a] [background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-80" />

                  {/* Satellite Radar Rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-cyan-500/15 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-cyan-500/20 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-cyan-500/25 pointer-events-none" />

                  {/* DETAILED ROAD NETWORK TO EVERYWHERE */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Perimeter Campus Fence Boundary */}
                    <rect x="2.5" y="2" width="95" height="82" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.7" />

                    {/* Southern Off-Campus Highway */}
                    <line x1="2" y1="89" x2="98" y2="89" stroke="#475569" strokeWidth="3.2" />
                    <line x1="2" y1="89" x2="98" y2="89" stroke="#eab308" strokeWidth="0.4" strokeDasharray="1 1" />
                    {/* Road to Outside Lodges */}
                    <line x1="32.8" y1="89" x2="32.8" y2="96.5" stroke="#475569" strokeWidth="2.2" />
                    <line x1="64.3" y1="89" x2="64.3" y2="96.5" stroke="#475569" strokeWidth="2.2" />

                    {/* Central Senate Boulevard (From Gate y=82.3% North to Senate y=3.8%) */}
                    <line x1="48.5" y1="89" x2="48.5" y2="3.8" stroke="#475569" strokeWidth="3.6" />
                    <line x1="48.5" y1="89" x2="48.5" y2="3.8" stroke="#fbbf24" strokeWidth="0.4" strokeDasharray="1.2 1.2" />

                    {/* Water Canal & Bridge */}
                    <rect x="25" y="66" width="48" height="4" fill="#0369a1" opacity="0.35" rx="2" />
                    <rect x="46" y="65" width="5.2" height="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.4" rx="0.5" />

                    {/* Senate Fountain Roundabout (z=-48 to z=0) */}
                    <circle cx="48.5" cy="46.8" r="4.8" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
                    <circle cx="48.5" cy="46.8" r="1.6" fill="#10b981" />

                    {/* West Academic Avenue & Loop (Science, Engineering, Computing, Library) */}
                    <line x1="48.5" y1="34.6" x2="10" y2="34.6" stroke="#475569" strokeWidth="2.6" />
                    <line x1="10" y1="34.6" x2="10" y2="40.5" stroke="#475569" strokeWidth="2.4" />
                    <line x1="10" y1="40.5" x2="48.5" y2="40.5" stroke="#475569" strokeWidth="2.4" />

                    {/* East Commercial Avenue (Supermarket, Mama Nkechi Bukka, Iya Basira, Grills) */}
                    <line x1="48.5" y1="67.1" x2="91.4" y2="67.1" stroke="#475569" strokeWidth="2.8" />

                    {/* North-East Clinic & Interfaith Service Avenue */}
                    <line x1="48.5" y1="27.1" x2="78.5" y2="27.1" stroke="#475569" strokeWidth="2.4" />

                    {/* Sports Complex Link Avenue (Football Stadium & Basketball Arena) */}
                    <line x1="78.5" y1="27.1" x2="95.7" y2="27.1" stroke="#475569" strokeWidth="2.2" />
                    <line x1="95.7" y1="27.1" x2="95.7" y2="44.3" stroke="#475569" strokeWidth="2.2" />

                    {/* Hostel Village Boulevard (Hostel A, Hostel B, Palm Lodge) */}
                    <line x1="48.5" y1="60.8" x2="7.1" y2="60.8" stroke="#475569" strokeWidth="2.6" />

                    {/* Walkway paths to all building doorways */}
                    <line x1="48.5" y1="12" x2="48.5" y2="4" stroke="#64748b" strokeWidth="1" strokeDasharray="0.6 0.6" />
                    <line x1="34.3" y1="34.6" x2="34.3" y2="26.1" stroke="#64748b" strokeWidth="1" strokeDasharray="0.6 0.6" />
                    <line x1="21.4" y1="34.6" x2="21.4" y2="26.1" stroke="#64748b" strokeWidth="1" strokeDasharray="0.6 0.6" />
                    <line x1="10" y1="34.6" x2="10" y2="26.1" stroke="#64748b" strokeWidth="1" strokeDasharray="0.6 0.6" />
                    <line x1="31.4" y1="60.8" x2="31.4" y2="69.1" stroke="#64748b" strokeWidth="1" strokeDasharray="0.6 0.6" />
                    <line x1="18.5" y1="60.8" x2="18.5" y2="69.1" stroke="#64748b" strokeWidth="1" strokeDasharray="0.6 0.6" />
                    <line x1="7.1" y1="60.8" x2="7.1" y2="69.1" stroke="#64748b" strokeWidth="1" strokeDasharray="0.6 0.6" />
                  </svg>

                  {/* Senate Fountain Roundabout Label */}
                  <div className="absolute top-[46.8%] left-[48.5%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-emerald-950/90 border border-emerald-400 flex items-center justify-center text-[7px] font-black text-amber-300 z-12">
                    SENATE
                  </div>

                  {/* University Main Gate in South */}
                  <div className="absolute top-[82.3%] left-[48.5%] -translate-x-1/2 -translate-y-1/2 bg-emerald-950 border border-emerald-400 text-emerald-200 text-[8px] font-black px-2 py-0.5 rounded shadow z-15 pointer-events-none">
                    GATE ARCH
                  </div>

                  {/* GPS Route Vector Line from Player to Selected Waypoint */}
                  {gpsWaypointPOI && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                      <line
                        x1={`${Math.max(2, Math.min(97, ((player.position.x - (-170)) / 350) * 100))}%`}
                        y1={`${Math.max(2, Math.min(97, ((player.position.z - (-185)) / 395) * 100))}%`}
                        x2={`${Math.max(2, Math.min(97, ((gpsWaypointPOI.position[0] - (-170)) / 350) * 100))}%`}
                        y2={`${Math.max(2, Math.min(97, ((gpsWaypointPOI.position[2] - (-185)) / 395) * 100))}%`}
                        stroke="#c084fc"
                        strokeWidth="3.5"
                        strokeDasharray="5 4"
                        className="animate-pulse"
                      />
                    </svg>
                  )}

                  {/* ALL Location Blip Pins (Every Single University Location!) */}
                  {filteredPOIs.map((poi) => {
                    const leftPct = Math.max(3, Math.min(96, ((poi.position[0] - (-170)) / 350) * 100));
                    const topPct = Math.max(3, Math.min(96, ((poi.position[2] - (-185)) / 395) * 100));

                    const isSelected = selectedMapPOI?.id === poi.id;
                    const isWaypoint = gpsWaypointPOI?.id === poi.id;

                    const blipLetter =
                      poi.category === 'academic' ? 'A' :
                      poi.category === 'residential' ? 'H' :
                      poi.category === 'commercial' ? (poi.id.includes('supermarket') ? 'M' : 'F') :
                      poi.category === 'recreation' ? 'S' :
                      poi.category === 'transport' ? 'T' : 'G';

                    return (
                      <button
                        key={poi.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setSelectedMapPOI(poi);
                        }}
                        title={poi.name}
                        className={`absolute w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 flex items-center justify-center font-black text-[9px] text-white shadow-lg transition-transform ${
                          isWaypoint
                            ? 'scale-150 ring-4 ring-purple-400 bg-purple-600 animate-bounce'
                            : isSelected
                            ? 'scale-140 ring-2 ring-white'
                            : 'hover:scale-125'
                        }`}
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          backgroundColor: poi.color,
                          border: '1.5px solid #ffffff'
                        }}
                      >
                        {blipLetter}
                      </button>
                    );
                  })}

                  {/* Live Player Position Blip (Yellow Heading Marker) */}
                  <div
                    className="absolute w-4 h-4 bg-amber-400 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 z-25 shadow-xl flex items-center justify-center"
                    style={{
                      left: `${Math.max(3, Math.min(96, ((player.position.x - (-170)) / 350) * 100))}%`,
                      top: `${Math.max(3, Math.min(96, ((player.position.z - (-185)) / 395) * 100))}%`
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
                    <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-amber-400/40 animate-ping" />
                  </div>
                </div>

                {/* Selected POI Details / Distance / Waypoint Button */}
                {selectedMapPOI ? (
                  <div className="bg-stone-800/90 rounded-2xl p-3 border border-purple-500/50 text-xs space-y-2 animate-in fade-in">
                    <div className="flex justify-between items-center font-bold text-amber-300">
                      <span className="font-black text-sm">{selectedMapPOI.name}</span>
                      <span className="text-[10px] uppercase bg-purple-900/80 px-2 py-0.5 rounded text-purple-200">
                        {selectedMapPOI.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-snug">{selectedMapPOI.description}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-700/60">
                      <div className="text-[10px] text-emerald-400 font-mono">
                        ~{Math.round(
                          Math.hypot(
                            player.position.x - selectedMapPOI.position[0],
                            player.position.z - selectedMapPOI.position[2]
                          )
                        )}m away • ~1 min walk
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {onBoardKeke && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (player.balance < 100) {
                                  sounds.playClick();
                                  setMapNotice(`⚠️ Insufficient Omo-Pay balance! Keke fare is ${formatNaira(100)}.`);
                                  setTimeout(() => setMapNotice(null), 3500);
                                  return;
                                }
                                sounds.playKekeHorn();
                                onBoardKeke(selectedMapPOI, 100, 'keke');
                                onClose();
                              }}
                              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 shadow cursor-pointer transition transform active:scale-95"
                              title="Hail Keke to Destination via Campus Roads"
                            >
                              <span>🛺 Hail Keke (₦100)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (player.balance < 150) {
                                  sounds.playClick();
                                  setMapNotice(`⚠️ Insufficient Omo-Pay balance! Shuttle fare is ${formatNaira(150)}.`);
                                  setTimeout(() => setMapNotice(null), 3500);
                                  return;
                                }
                                sounds.playKekeHorn();
                                onBoardKeke(selectedMapPOI, 150, 'shuttle');
                                onClose();
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 shadow cursor-pointer transition transform active:scale-95"
                              title="Hail Coaster Shuttle to Destination via Campus Roads"
                            >
                              <span>🚌 Shuttle (₦150)</span>
                            </button>
                          </>
                        )}

                        {gpsWaypointPOI?.id === selectedMapPOI.id ? (
                          <button
                            type="button"
                            onClick={handleClearWaypoint}
                            className="bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            ✕ Clear Waypoint
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetWaypoint(selectedMapPOI)}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>GPS Waypoint</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-400 flex items-center justify-between px-1">
                    <span>🟡 Live Player Location</span>
                    <span>Tap any blip [A, H, F, S, T] to inspect</span>
                  </div>
                )}
              </div>
            )}

            {/* ==================================================== */}
            {/* 5. TIMETABLE & ACADEMIC PROGRESS */}
            {/* ==================================================== */}
            {activeApp === 'timetable' && (
              <div className="space-y-3">
                <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Academic Standing</div>
                  <div className="text-sm font-black text-white">{course.name}</div>
                  <div className="text-xs text-amber-300 font-semibold mt-0.5">
                    Cumulative GPA: {player.gpa.toFixed(2)} / 5.0 (First Class Standing)
                  </div>
                </div>

                <div className="text-xs font-bold text-stone-300">Registered Semester 1 Courses</div>

                <div className="space-y-2">
                  {course.firstYearCourses.map((c) => {
                    const att = player.attendance[c.code] || { attended: 0, total: 0 };
                    const attPct = att.total > 0 ? Math.round((att.attended / att.total) * 100) : 100;

                    return (
                      <div key={c.code} className="bg-stone-800/60 p-3 rounded-xl border border-stone-700 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-400">{c.code}</span>
                          <span className="text-[10px] bg-stone-700 px-2 py-0.5 rounded text-stone-300">{c.credits} Credits</span>
                        </div>
                        <div className="font-bold text-white text-xs">{c.title}</div>
                        <div className="text-[11px] text-stone-400">Lecturer: {c.lecturer}</div>
                        <div className="text-[11px] text-emerald-400">Venue: {c.venue}</div>
                        <div className="flex items-center justify-between text-[10px] text-stone-300 pt-1 border-t border-stone-700/60">
                          <span>Time: {c.timeSlot}</span>
                          <span className={`font-bold ${attPct >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                            Attendance: {attPct}% ({att.attended}/{att.total})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* 6. STUDENT JOBS HUB */}
            {/* ==================================================== */}
            {activeApp === 'jobs' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-amber-300">Available Campus Gigs & Shifts</div>

                {jobNotice && (
                  <div className="bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-between gap-2 animate-in fade-in">
                    <span>{jobNotice}</span>
                    <button
                      type="button"
                      onClick={() => setJobNotice(null)}
                      className="text-emerald-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {[
                  { title: 'Library Assistant', venue: 'Main University Library', pay: 12000, stamina: 25, req: 'Quiet, organized' },
                  { title: 'Cafeteria Dispatcher', venue: 'Mama Nkechi Bukka', pay: 8000, stamina: 20, req: 'Fast on foot' },
                  { title: 'Sports Field Marshaling', venue: 'Campus Sports Arena', pay: 15000, stamina: 35, req: 'High energy' },
                  { title: 'Department Lab Tech', venue: 'Science & Engineering Complex', pay: 20000, stamina: 30, req: 'GPA >= 3.5' }
                ].map((job, idx) => (
                  <div key={idx} className="bg-stone-800/70 p-3 rounded-2xl border border-stone-700 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{job.title}</span>
                      <span className="font-mono font-black text-emerald-400">+{formatNaira(job.pay)}</span>
                    </div>
                    <div className="text-[11px] text-stone-400">{job.venue} • Req: {job.req}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-amber-400">Stamina Cost: -{job.stamina}%</span>
                      <button
                        type="button"
                        onClick={() => handleWorkJob(job.title, job.pay, job.stamina)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Work Shift
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ==================================================== */}
            {/* 7. BACKPACK & INVENTORY */}
            {/* ==================================================== */}
            {activeApp === 'inventory' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-stone-300 flex justify-between items-center">
                  <span>Student Backpack</span>
                  <span className="text-[10px] text-stone-400">{player.inventory.length} items</span>
                </div>

                {player.inventory.length === 0 ? (
                  <div className="text-center py-10 text-stone-500 text-xs">
                    Your backpack is empty. Visit the Campus Supermarket or Bukka to buy provisions!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {player.inventory.map((item) => (
                      <div key={item.id} className="bg-stone-800/70 p-3 rounded-xl border border-stone-700 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[10px] text-stone-400">{item.description}</div>
                          <div className="text-[10px] text-amber-400 font-bold mt-0.5">Quantity: x{item.quantity}</div>
                        </div>

                        {item.effect && (
                          <button
                            type="button"
                            onClick={() => handleUseItem(item)}
                            className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black px-3 py-1.5 rounded-xl text-xs transition cursor-pointer shrink-0 ml-2"
                          >
                            Use Item
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==================================================== */}
            {/* 8. CAMPUS BULLETIN & SUG NEWS */}
            {/* ==================================================== */}
            {activeApp === 'news' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-amber-300">SUG Official Campus Bulletins</div>

                {[
                  {
                    title: '100-Level Matriculation Ceremony Date Confirmed',
                    date: 'Today',
                    body: 'All freshers must collect academic gowns from their faculty officers before Friday. Rehearsals hold at the Senate Amphitheatre.'
                  },
                  {
                    title: 'Hostel Maintenance & Water Pumping Schedule',
                    date: 'Yesterday',
                    body: 'Generators will run daily from 7 PM to 11 PM. Water pumping operates 6 AM to 9 AM and 4 PM to 7 PM in all halls.'
                  },
                  {
                    title: 'Inter-Faculty Football Championship Kicks Off',
                    date: '2 days ago',
                    body: 'Faculty of Science faces Faculty of Engineering in the opening derby at the Campus Sports Complex.'
                  }
                ].map((news, idx) => (
                  <div key={idx} className="bg-stone-800/70 p-3 rounded-2xl border border-stone-700 text-xs space-y-1">
                    <div className="flex justify-between items-center text-amber-400 font-bold">
                      <span className="truncate pr-2">{news.title}</span>
                      <span className="text-[9px] text-stone-400 shrink-0 font-mono">{news.date}</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">{news.body}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ==================================================== */}
            {/* 9. CAMERA APP: FUO OMOCAM */}
            {/* ==================================================== */}
            {activeApp === 'camera' && (
              <div className="h-full">
                <PhoneCameraApp
                  player={player}
                  onBack={() => setActiveApp('home')}
                />
              </div>
            )}

            {/* ==================================================== */}
            {/* 10. VOICE & VIDEO CALLS: OMOCALL */}
            {/* ==================================================== */}
            {activeApp === 'calls' && (
              <div className="h-full">
                <PhoneCallApp
                  player={player}
                  onUpdatePlayer={onUpdatePlayer}
                  onBack={() => setActiveApp('home')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
