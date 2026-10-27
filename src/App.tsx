import React, { useState, useEffect, useCallback } from 'react';
import { PlayerState, InventoryItem, BankTransaction } from './types/game';
import { CampusPOI, CAMPUS_POIS } from './data/campusLocations';
import { COURSES } from './data/courses';
import { loadGameState, saveGameState, clearGameState, formatNaira } from './utils/storage';
import { sounds } from './utils/audio';
import { soundtrack } from './utils/soundtrack';

// Existing Components
import { TitleScreen } from './components/title/TitleScreen';
import { AdmissionFlow } from './components/admission/AdmissionFlow';
import { CampusCanvas, CampusRide } from './components/game3d/CampusCanvas';
import { HUD } from './components/hud/HUD';
import { PhoneModal } from './components/phone/PhoneModal';
import { LectureModal } from './components/classroom/LectureModal';
import { FootballModal } from './components/sports/FootballModal';
import { BasketballModal } from './components/sports/BasketballModal';
import { TransportCutscene3D } from './components/keke/TransportCutscene3D';
import { SupermarketInteriorScene } from './components/shop/SupermarketInteriorScene';
import { HostelCutscene3D } from './components/hostel/HostelCutscene3D';
import { SugCutscene3D } from './components/sug/SugCutscene3D';
import { SettingsModal } from './components/settings/SettingsModal';
import { CampusMapModal } from './components/map/CampusMapModal';

// Dedicated In-World Interior Scenes
import { LibraryInteriorScene } from './components/interiors/LibraryInteriorScene';
import { InterfaithInteriorScene } from './components/interiors/InterfaithInteriorScene';
import { ClinicInteriorScene } from './components/interiors/ClinicInteriorScene';
import { SenateInteriorScene } from './components/interiors/SenateInteriorScene';
import { FoodVendorScene } from './components/interiors/FoodVendorScene';
import { CampusServicesScene } from './components/interiors/CampusServicesScene';
import { CurfewModal } from './components/security/CurfewModal';
import { CampusService, ServiceAction } from './data/shops';

// Revolution II: Ten Game-Changing Systems
import { ProjectWorkbenchModal } from './components/revolution/ProjectWorkbenchModal';
import { MysteryBoardModal } from './components/revolution/MysteryBoardModal';
import { EventCreationModal } from './components/revolution/EventCreationModal';
import { OffCampusDistrictScene } from './components/revolution/OffCampusDistrictScene';
import { CampusChallengesModal } from './components/revolution/CampusChallengesModal';
import { CampusMediaModal } from './components/revolution/CampusMediaModal';
import { ResilienceCrisisModal } from './components/revolution/ResilienceCrisisModal';
import { RoomDecoratorModal } from './components/revolution/RoomDecoratorModal';
import { LegacyDossierModal } from './components/revolution/LegacyDossierModal';
import { RevolutionModalType } from './components/hud/HUD';
import {
  InnovationProject,
  CampusCultureEvent,
  RoomCustomizationState,
  LegacyRecord,
  WorldEvolutionState,
  CrisisDisruptionState,
  MediaArticle
} from './types/revolution';

type GameScreen = 'title' | 'admission' | 'playing';
type ActiveModal =
  | 'none'
  | 'phone'
  | 'map'
  | 'lecture'
  | 'football'
  | 'basketball'
  | 'transport'
  | 'shop'
  | 'food_joint'
  | 'service'
  | 'hostel'
  | 'sug'
  | 'library'
  | 'interfaith'
  | 'clinic'
  | 'senate'
  | 'settings'
  | 'workbench'
  | 'mystery'
  | 'events'
  | 'off_campus'
  | 'challenges'
  | 'media'
  | 'crisis'
  | 'room_decorator'
  | 'legacy';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [nearPOI, setNearPOI] = useState<CampusPOI | null>(null);
  const [isRidingKeke, setIsRidingKeke] = useState(false);
  const [activeRide, setActiveRide] = useState<CampusRide | null>(null);
  const [phoneInitialApp, setPhoneInitialApp] = useState<'home' | 'map'>('home');
  const [notification, setNotification] = useState<string | null>(null);
  const [curfewIntercept, setCurfewIntercept] = useState<{ officerName: string; location: string } | null>(null);
  const [activeWaypoint, setActiveWaypoint] = useState<CampusPOI | null>(null);

  // Load existing save on initial mount
  useEffect(() => {
    const existing = loadGameState();
    if (existing) {
      setPlayer(existing);
    }
  }, []);

  // Show notification helper
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Soundtrack Playback: Play when user is actually playing the game, pause otherwise
  useEffect(() => {
    if (screen === 'playing') {
      soundtrack.play();
    } else {
      soundtrack.pause();
    }
  }, [screen]);

  // 2. Dynamic Building Ducking / Fade: Fade audio a little when interacting with or inside a building
  useEffect(() => {
    if (screen !== 'playing') return;

    const buildingModals: ActiveModal[] = [
      'lecture',
      'hostel',
      'shop',
      'food_joint',
      'library',
      'clinic',
      'senate',
      'sug',
      'interfaith',
      'football',
      'basketball',
      'workbench',
      'mystery',
      'events',
      'media',
      'crisis',
      'room_decorator',
      'legacy',
      'challenges'
    ];

    const isInsideOrInteractingWithBuilding = nearPOI !== null || buildingModals.includes(activeModal);
    soundtrack.setDucked(isInsideOrInteractingWithBuilding);
  }, [screen, nearPOI, activeModal]);

  // Keyboard shortcut listener with input isolation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing') return;

      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || (activeEl as HTMLElement).isContentEditable) {
          return;
        }
      }

      // Toggle Phone with P
      if (e.key === 'p' || e.key === 'P') {
        sounds.playClick();
        setPhoneInitialApp('home');
        setActiveModal((prev) => (prev === 'phone' ? 'none' : 'phone'));
      }

      // Toggle Full-Screen Campus Atlas Map with M
      if (e.key === 'm' || e.key === 'M') {
        sounds.playClick();
        setActiveModal((prev) => (prev === 'map' ? 'none' : 'map'));
      }

      // Close modal with Escape
      if (e.key === 'Escape') {
        if (activeModal !== 'none') {
          sounds.playClick();
          setActiveModal('none');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, activeModal]);

  // Central Accelerated Game Clock (Every 6 seconds = 5 in-game minutes)
  useEffect(() => {
    if (screen !== 'playing' || !player || activeModal !== 'none') return;

    const timer = setInterval(() => {
      setPlayer((prev) => {
        if (!prev) return prev;
        const newTime = prev.timeOfDay + 5;
        let newDay = prev.day;
        let newDayOfWeek = prev.dayOfWeek;

        // If time reaches past 23:00 (1380 mins), loop to morning 08:00 next day
        if (newTime >= 1380) {
          newDay += 1;
          newDayOfWeek = (newDayOfWeek % 7) + 1;
          return {
            ...prev,
            day: newDay,
            dayOfWeek: newDayOfWeek,
            timeOfDay: 480, // 08:00 AM
            hunger: Math.min(100, prev.hunger + 15),
            stamina: Math.max(20, prev.stamina - 20)
          };
        }

        // Natural subtle stamina drain and hunger build up during walking/exploring
        return {
          ...prev,
          timeOfDay: newTime,
          hunger: Math.min(100, prev.hunger + 0.4),
          stamina: Math.max(5, prev.stamina - 0.25)
        };
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [screen, activeModal]);

  // Handle POI Contextual Trigger: Opens dedicated in-world interior scenes
  const handleTriggerPOI = useCallback((poi: CampusPOI) => {
    sounds.playClick();

    if (poi.id === 'central_library') {
      setActiveModal('library');
      return;
    }
    if (poi.id === 'chapel_mosque') {
      setActiveModal('interfaith');
      return;
    }
    if (poi.id === 'admin_senate') {
      setActiveModal('senate');
      return;
    }
    if (poi.id === 'campus_clinic') {
      setActiveModal('clinic');
      return;
    }
    if (poi.id === 'football_pitch') {
      setActiveModal('football');
      return;
    }
    if (poi.id === 'basketball_court') {
      setActiveModal('basketball');
      return;
    }

    switch (poi.interactionType) {
      case 'lecture':
        setActiveModal('lecture');
        break;
      case 'football':
        setActiveModal('football');
        break;
      case 'basketball':
        setActiveModal('basketball');
        break;
      case 'food_joint':
        setActiveModal('food_joint');
        break;
      case 'service':
        setActiveModal('service');
        break;
      case 'keke':
      case 'shuttle':
        setActiveModal('transport');
        break;
      case 'shop':
        setActiveModal('shop');
        break;
      case 'hostel':
        setActiveModal('hostel');
        break;
      case 'sug':
        setActiveModal('sug');
        break;
      case 'admin':
        setActiveModal('senate');
        break;
      case 'clinic':
        setActiveModal('clinic');
        break;
      default:
        notify(`Arrived at ${poi.name}`);
        break;
    }
  }, []);

  // Start Admission flow
  const handleStartNewGame = () => {
    sounds.playClick();
    setScreen('admission');
  };

  // Resume saved game
  const handleResumeGame = () => {
    sounds.playClick();
    if (player) {
      setScreen('playing');
      notify(`Welcome back to campus, ${player.name}!`);
    }
  };

  // Complete admission onboarding
  const handleCompleteAdmission = (initialState: PlayerState) => {
    sounds.playNotification();
    setPlayer(initialState);
    saveGameState(initialState);
    setScreen('playing');
    notify(`Admission confirmed! Welcome to Federal University of Omo, ${initialState.name}!`);
  };

  // 1. Complete Classroom Lecture
  const handleCompleteClass = (courseCode: string, scoreGained: number) => {
    if (!player) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      const currentAtt = prev.attendance[courseCode] || { attended: 0, total: 0 };
      const updatedAttendance = {
        ...prev.attendance,
        [courseCode]: {
          attended: currentAtt.attended + 1,
          total: currentAtt.total + 1
        }
      };

      const updatedGPA = Math.min(5.0, prev.gpa + 0.02);
      const updatedState = {
        ...prev,
        attendance: updatedAttendance,
        gpa: updatedGPA,
        stamina: Math.max(10, prev.stamina - 15),
        hunger: Math.min(100, prev.hunger + 10),
        timeOfDay: prev.timeOfDay + 90, // 1.5 hours lecture duration
        reputationXP: prev.reputationXP + scoreGained,
        currentObjective: 'Lecture attended! Take time to explore campus, eat at Bukka, or play sports.'
      };
      saveGameState(updatedState);
      return updatedState;
    });

    notify(`Lecture ${courseCode} attendance marked! GPA: ${(player.gpa + 0.02).toFixed(2)}`);
  };

  // 2. Finish Football Sports Event
  const handleFinishFootball = (goalsScored: number, xpGained: number, cashReward?: number) => {
    if (!player) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      let newBalance = prev.balance;
      let newTxList = [...prev.transactions];
      if (cashReward && cashReward > 0) {
        newBalance += cashReward;
        const prizeTx: BankTransaction = {
          id: `tx_${Date.now()}`,
          reference: `OMO-SPT-${Math.floor(100000 + Math.random() * 900000)}`,
          date: `Day ${player.day}`,
          time: 'Sports Prize',
          description: 'FUO Football Matchday Prize Award',
          type: 'credit',
          amount: cashReward,
          balanceAfter: newBalance,
          recipientOrSender: 'FUO Sports Council'
        };
        newTxList = [prizeTx, ...newTxList];
      }

      const updated = {
        ...prev,
        balance: newBalance,
        transactions: newTxList,
        stamina: Math.max(10, prev.stamina - 20),
        hunger: Math.min(100, prev.hunger + 20),
        timeOfDay: prev.timeOfDay + 45, // 45 mins match duration
        reputationXP: prev.reputationXP + xpGained
      };
      saveGameState(updated);
      return updated;
    });

    notify(`Football match completed! Score: ${goalsScored} goal(s). Athletic XP boosted (+${xpGained})${cashReward ? ` & Won ${formatNaira(cashReward)}!` : '.'}`);
  };

  // 3. Finish Basketball Sports Event
  const handleFinishBasketball = (basketsMade: number, xpGained: number, cashReward?: number) => {
    if (!player) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      let newBalance = prev.balance;
      let newTxList = [...prev.transactions];
      if (cashReward && cashReward > 0) {
        newBalance += cashReward;
        const prizeTx: BankTransaction = {
          id: `tx_${Date.now()}`,
          reference: `OMO-BB-${Math.floor(100000 + Math.random() * 900000)}`,
          date: `Day ${player.day}`,
          time: 'Sports Prize',
          description: 'FUO Basketball Arena Contest Prize',
          type: 'credit',
          amount: cashReward,
          balanceAfter: newBalance,
          recipientOrSender: 'FUO Sports Council'
        };
        newTxList = [prizeTx, ...newTxList];
      }

      const updated = {
        ...prev,
        balance: newBalance,
        transactions: newTxList,
        stamina: Math.max(10, prev.stamina - 15),
        hunger: Math.min(100, prev.hunger + 15),
        timeOfDay: prev.timeOfDay + 45,
        reputationXP: prev.reputationXP + xpGained
      };
      saveGameState(updated);
      return updated;
    });

    notify(`Basketball game finished! Score: ${basketsMade} pt(s). (+${xpGained} XP)${cashReward ? ` & Won ${formatNaira(cashReward)}!` : '.'}`);
  };

  // 4. Library Study Revision
  const handleLibraryStudy = () => {
    if (!player) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        stamina: Math.max(10, prev.stamina - 15),
        gpa: Math.min(5.0, prev.gpa + 0.02),
        timeOfDay: prev.timeOfDay + 60, // 1 hour deep reading
        reputationXP: prev.reputationXP + 70
      };
      saveGameState(updated);
      return updated;
    });

    notify('Library study session concluded! GPA and Exam preparedness upgraded.');
  };

  // 5. Interfaith Fellowship & Prayers
  const handleInterfaithPray = () => {
    if (!player) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        stamina: Math.min(100, prev.stamina + 30),
        fun: Math.min(100, (prev.fun ?? 80) + 20),
        timeOfDay: prev.timeOfDay + 45,
        reputationXP: prev.reputationXP + 50
      };
      saveGameState(updated);
      return updated;
    });

    notify('Participated in fellowship prayers! Spiritual peace and stamina renewed.');
  };

  // 6. Clinic Medical Restoration
  const handleClinicRestore = () => {
    if (!player) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        stamina: 100,
        timeOfDay: prev.timeOfDay + 30
      };
      saveGameState(updated);
      return updated;
    });

    notify('Medical treatment received! Stamina fully restored to 100%.');
  };

  // 7. Buy Food from Eatery (Mama Nkechi, Iya Basira, Campus Grills)
  const handleBuyFoodItem = (item: { name: string; price: number; effect?: { hunger?: number; stamina?: number } }, vendorName: string) => {
    if (!player) return;

    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      reference: `OMO-FOOD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: `Day ${player.day}`,
      time: 'Eatery Purchase',
      description: `Meal: ${item.name} (${vendorName})`,
      type: 'debit',
      amount: item.price,
      balanceAfter: player.balance - item.price,
      recipientOrSender: vendorName
    };

    setPlayer((prev) => {
      if (!prev) return prev;
      const hungerReduction = item.effect?.hunger ? Math.abs(item.effect.hunger) : 40;
      const staminaGain = item.effect?.stamina || 30;

      const updated = {
        ...prev,
        balance: prev.balance - item.price,
        hunger: Math.max(0, prev.hunger - hungerReduction),
        stamina: Math.min(100, prev.stamina + staminaGain),
        timeOfDay: prev.timeOfDay + 20, // 20 mins to eat
        transactions: [newTx, ...prev.transactions]
      };
      saveGameState(updated);
      return updated;
    });

    notify(`Ate ${item.name} at ${vendorName}! Hunger satisfied.`);
  };

  // 7.1 Perform Student Village Service (Printing, Barber, Laundry, Phone Gadgets, Mini-Mart)
  const handlePerformService = (action: ServiceAction, service: CampusService) => {
    if (!player) return;

    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      reference: `OMO-SRV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: `Day ${player.day}`,
      time: 'Campus Service',
      description: `${action.name} (${service.name})`,
      type: 'debit',
      amount: action.price,
      balanceAfter: player.balance - action.price,
      recipientOrSender: service.name
    };

    setPlayer((prev) => {
      if (!prev) return prev;

      let updatedInventory = [...prev.inventory];
      if (action.itemReward) {
        const existingIdx = updatedInventory.findIndex((i) => i.id === action.itemReward!.id);
        if (existingIdx >= 0) {
          updatedInventory[existingIdx] = {
            ...updatedInventory[existingIdx],
            quantity: updatedInventory[existingIdx].quantity + 1
          };
        } else {
          updatedInventory.push({ ...action.itemReward, quantity: 1 });
        }
      }

      const updated = {
        ...prev,
        balance: prev.balance - action.price,
        stamina: action.effect.stamina !== undefined ? Math.max(5, Math.min(100, prev.stamina + action.effect.stamina)) : prev.stamina,
        hunger: action.effect.hunger !== undefined ? Math.max(0, Math.min(100, prev.hunger + action.effect.hunger)) : prev.hunger,
        gpa: action.effect.studyBoost !== undefined ? Math.min(5.0, prev.gpa + action.effect.studyBoost * 0.002) : prev.gpa,
        reputationXP: action.effect.reputationXP !== undefined ? prev.reputationXP + action.effect.reputationXP : prev.reputationXP,
        timeOfDay: prev.timeOfDay + action.durationMinutes,
        inventory: updatedInventory,
        transactions: [newTx, ...prev.transactions]
      };
      saveGameState(updated);
      return updated;
    });

    notify(`Completed: ${action.name} at ${service.name}!`);
  };

  // 8. Night Curfew Security Escort & Morning Awakening (10:00 PM to 6:00 AM)
  const handleCurfewSleep = () => {
    if (!player) return;
    setPlayer((prev) => {
      if (!prev) return prev;
      const isPastMidnight = prev.timeOfDay >= 1320;
      const nextDay = isPastMidnight ? prev.day + 1 : prev.day;
      const nextDayOfWeek = isPastMidnight ? ((prev.dayOfWeek % 7) + 1) : prev.dayOfWeek;
      const updated = {
        ...prev,
        stamina: 100,
        hunger: Math.max(0, prev.hunger - 35),
        timeOfDay: 360, // 06:00 AM
        day: nextDay,
        dayOfWeek: nextDayOfWeek,
        position: { x: -60, y: 0, z: 75 } // Spawn in front of hostel
      };
      saveGameState(updated);
      return updated;
    });
    setCurfewIntercept(null);
    notify('Good morning! Night curfew lifted. Gates reopened at 6:00 AM.');
  };

  // Transport Ride Execution (Conveys character through campus road network)
  const handleStartRide = (destinationPOI: CampusPOI, fare: number, vehicleType: 'keke' | 'shuttle') => {
    if (!player) return;

    if (player.balance < fare) {
      sounds.playClick();
      notify(`Insufficient Omo-Pay balance! Need ${formatNaira(fare)}.`);
      return;
    }

    setActiveModal('none');
    setIsRidingKeke(true);
    setActiveRide({
      id: `ride_${Date.now()}`,
      vehicleType,
      destinationPOI,
      fare
    });

    sounds.playKekeHorn();
    notify(`Boarded ${vehicleType === 'keke' ? 'Keke Napep' : 'Campus Shuttle'}! Driving along campus roads to ${destinationPOI.name}...`);
  };

  const handleFinishRide = () => {
    if (!player || !activeRide) return;

    const { destinationPOI, fare, vehicleType } = activeRide;
    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      reference: `OMO-TRP-${Math.floor(100000 + Math.random() * 900000)}`,
      date: `Day ${player.day}`,
      time: 'Transport Fare',
      description: `${vehicleType === 'keke' ? 'Keke Napep' : 'Campus Shuttle'} to ${destinationPOI.name}`,
      type: 'debit',
      amount: fare,
      balanceAfter: player.balance - fare,
      recipientOrSender: 'Campus Transport Union'
    };

    // Position player cleanly outside designated entrance portico per Section 4.1
    const entranceOffsetX = destinationPOI.entranceOffset ? destinationPOI.entranceOffset[0] : 0;
    const entranceOffsetZ = destinationPOI.entranceOffset ? destinationPOI.entranceOffset[2] : (destinationPOI.size[2] / 2 + 2);
    const targetX = destinationPOI.position[0] + entranceOffsetX;
    const targetZ = destinationPOI.position[2] + entranceOffsetZ + (entranceOffsetZ >= 0 ? 1.5 : -1.5);

    setPlayer((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        balance: prev.balance - fare,
        transactions: [newTx, ...prev.transactions],
        position: { x: targetX, y: 0, z: targetZ }, // Strictly y = 0 on ground!
        timeOfDay: prev.timeOfDay + 10 // 10 mins ride
      };
      saveGameState(updated);
      return updated;
    });

    setIsRidingKeke(false);
    setActiveRide(null);
    sounds.playCashPing();
    notify(`Arrived at ${destinationPOI.label} via ${vehicleType === 'keke' ? 'Keke' : 'Shuttle'}!`);
  };

  // Buy Shop Item
  const handleBuyShopItem = (item: Omit<InventoryItem, 'quantity'>, categoryName: string) => {
    if (!player) return;

    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      reference: `OMO-POS-${Math.floor(100000 + Math.random() * 900000)}`,
      date: `Day ${player.day}`,
      time: 'Store Purchase',
      description: `Purchase: ${item.name} (${categoryName})`,
      type: 'debit',
      amount: item.price,
      balanceAfter: player.balance - item.price,
      recipientOrSender: categoryName
    };

    setPlayer((prev) => {
      if (!prev) return prev;

      const existingItem = prev.inventory.find((i) => i.id === item.id);
      let updatedInv: InventoryItem[];
      if (existingItem) {
        updatedInv = prev.inventory.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedInv = [...prev.inventory, { ...item, quantity: 1 }];
      }

      const updated = {
        ...prev,
        balance: prev.balance - item.price,
        inventory: updatedInv,
        transactions: [newTx, ...prev.transactions]
      };
      saveGameState(updated);
      return updated;
    });
  };

  // Sleep / Rest in Hostel (advances to 08:00 AM next day)
  const handleHostelSleep = () => {
    if (!player) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        stamina: 100,
        hunger: 35,
        day: prev.day + 1,
        dayOfWeek: (prev.dayOfWeek % 7) + 1,
        timeOfDay: 480 // 08:00 AM next morning!
      };
      saveGameState(updated);
      return updated;
    });
    notify('Good morning! Fresh day on campus. Stamina at 100%.');
  };

  // Study in Hostel Desk
  const handleHostelStudy = () => {
    if (!player) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        stamina: Math.max(10, prev.stamina - 15),
        gpa: Math.min(5.0, prev.gpa + 0.02),
        timeOfDay: prev.timeOfDay + 120, // 2 hours revision
        reputationXP: prev.reputationXP + 40
      };
      saveGameState(updated);
      return updated;
    });
  };

  // Reset / Clear Game State
  const handleResetGame = () => {
    sounds.playClick();
    clearGameState();
    setPlayer(null);
    setActiveModal('none');
    setScreen('title');
  };

  // Checkout from FUO Supermarket Cart
  const handleSupermarketCheckout = (
    cart: { item: Omit<InventoryItem, 'quantity'>; quantity: number }[],
    totalCost: number
  ) => {
    if (!player || cart.length === 0) return;

    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      reference: `OMO-SUP-${Math.floor(100000 + Math.random() * 900000)}`,
      date: `Day ${player.day}`,
      time: 'Supermarket POS Checkout',
      description: `FUO Supermarket: ${cart.map((c) => `${c.quantity}x ${c.item.name}`).join(', ').slice(0, 65)}`,
      type: 'debit',
      amount: totalCost,
      balanceAfter: player.balance - totalCost,
      recipientOrSender: 'FUO Central Supermarket'
    };

    setPlayer((prev) => {
      if (!prev) return prev;
      let updatedInv = [...prev.inventory];
      cart.forEach(({ item, quantity }) => {
        const existingIdx = updatedInv.findIndex((i) => i.id === item.id);
        if (existingIdx >= 0) {
          updatedInv[existingIdx] = {
            ...updatedInv[existingIdx],
            quantity: updatedInv[existingIdx].quantity + quantity
          };
        } else {
          updatedInv.push({ ...item, quantity });
        }
      });

      const updated = {
        ...prev,
        balance: prev.balance - totalCost,
        inventory: updatedInv,
        transactions: [newTx, ...prev.transactions],
        reputationXP: prev.reputationXP + 35
      };
      saveGameState(updated);
      return updated;
    });

    notify(`Checked out ${cart.reduce((a, c) => a + c.quantity, 0)} items from FUO Supermarket!`);
  };
  const handlePositionChange = useCallback((pos: { x: number; y: number; z: number }) => {
    setPlayer((prev) => (prev ? { ...prev, position: pos } : prev));
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden bg-stone-950 font-sans text-stone-100 relative">
      {/* 1. Title Screen */}
      {screen === 'title' && (
        <TitleScreen
          savedGame={player}
          onNewGame={handleStartNewGame}
          onResumeGame={handleResumeGame}
          onOpenSettings={() => setActiveModal('settings')}
        />
      )}

      {/* 2. JAMB Admission & Arrival Cutscene Flow */}
      {screen === 'admission' && (
        <AdmissionFlow
          onComplete={handleCompleteAdmission}
        />
      )}

      {/* 3. Main Campus 3D Simulation Game */}
      {screen === 'playing' && player && (
        <div className="relative w-full h-full">
          {/* 3D Campus Canvas */}
          <CampusCanvas
            playerPosition={player.position}
            onPositionChange={handlePositionChange}
            onNearPOI={setNearPOI}
            onTriggerPOI={handleTriggerPOI}
            isPaused={activeModal !== 'none' || curfewIntercept !== null}
            isRidingKeke={isRidingKeke}
            timeOfDay={player.timeOfDay}
            activeRide={activeRide}
            onFinishRide={handleFinishRide}
            onCurfewIntercept={(officerName, location) => {
              setCurfewIntercept({ officerName, location });
            }}
            worldEvolution={player.worldEvolution}
          />

          {/* Heads Up Display (HUD) */}
          <HUD
            player={player}
            nearPOI={nearPOI}
            activeWaypoint={activeWaypoint}
            onOpenPhone={() => {
              setPhoneInitialApp('home');
              setActiveModal('phone');
            }}
            onOpenMap={() => {
              setActiveModal('map');
            }}
            onOpenSettings={() => setActiveModal('settings')}
            onTriggerInteraction={handleTriggerPOI}
            onOpenRevolutionModal={(modal) => setActiveModal(modal)}
          />

          {/* Notification Toast */}
          {notification && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/90 border-2 border-amber-400 text-amber-200 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
              🔔 {notification}
            </div>
          )}

          {/* Full-Screen GTA-V Interactive Campus Map Modal */}
          {activeModal === 'map' && (
            <CampusMapModal
              player={player}
              onClose={() => setActiveModal('none')}
              activeWaypoint={activeWaypoint}
              onSetWaypoint={(poi) => setActiveWaypoint(poi)}
              onBoardKeke={handleStartRide}
            />
          )}

          {/* In-Game Smartphone Modal */}
          {activeModal === 'phone' && (
            <PhoneModal
              player={player}
              initialApp={phoneInitialApp}
              onClose={() => setActiveModal('none')}
              onBoardKeke={handleStartRide}
              onUpdatePlayer={(updater) => {
                setPlayer((prev) => (prev ? updater(prev) : prev));
              }}
            />
          )}

          {/* 3D Classroom Lecture Scene */}
          {activeModal === 'lecture' && (
            <LectureModal
              player={player}
              onClose={() => setActiveModal('none')}
              onCompleteClass={handleCompleteClass}
            />
          )}

          {/* 3D Football Stadium Hub & Matchday Simulation */}
          {activeModal === 'football' && (
            <FootballModal
              player={player}
              onClose={() => setActiveModal('none')}
              onFinishMatch={handleFinishFootball}
            />
          )}

          {/* 3D Basketball Arena Hub & Courtside Simulation */}
          {activeModal === 'basketball' && (
            <BasketballModal
              player={player}
              onClose={() => setActiveModal('none')}
              onFinishChallenge={handleFinishBasketball}
            />
          )}

          {/* 3D Library Interior Scene */}
          {activeModal === 'library' && (
            <LibraryInteriorScene
              player={player}
              onClose={() => setActiveModal('none')}
              onStudy={handleLibraryStudy}
            />
          )}

          {/* 3D Interfaith Chapel & Mosque Scene */}
          {activeModal === 'interfaith' && (
            <InterfaithInteriorScene
              player={player}
              onClose={() => setActiveModal('none')}
              onPray={handleInterfaithPray}
            />
          )}

          {/* 3D Health Clinic Scene */}
          {activeModal === 'clinic' && (
            <ClinicInteriorScene
              player={player}
              onClose={() => setActiveModal('none')}
              onRestoreHealth={handleClinicRestore}
            />
          )}

          {/* 3D Senate Tower & Registry Scene */}
          {activeModal === 'senate' && (
            <SenateInteriorScene
              player={player}
              onClose={() => setActiveModal('none')}
            />
          )}

          {/* 3D Food Joint Eatery Scene (Mama Nkechi, Iya Basira, Campus Grills, Akara, Cafe) */}
          {activeModal === 'food_joint' && (
            <FoodVendorScene
              player={player}
              currentPOI={nearPOI}
              onClose={() => setActiveModal('none')}
              onBuyFood={handleBuyFoodItem}
            />
          )}

          {/* Student Village Essential Services (Barber, Printing, Laundry, Phone Accessories, Mini-Mart) */}
          {activeModal === 'service' && (
            <CampusServicesScene
              player={player}
              currentPOI={nearPOI}
              onClose={() => setActiveModal('none')}
              onPerformService={handlePerformService}
            />
          )}

          {/* Keke Napep & Transport 3D Cutscene */}
          {activeModal === 'transport' && (
            <TransportCutscene3D
              player={player}
              currentPOI={nearPOI}
              onClose={() => setActiveModal('none')}
              onStartRide={handleStartRide}
              onOpenOffCampus={() => setActiveModal('off_campus')}
            />
          )}

          {/* Campus Supermarket Dedicated Room Interior */}
          {activeModal === 'shop' && (
            <SupermarketInteriorScene
              player={player}
              onClose={() => setActiveModal('none')}
              onCheckout={handleSupermarketCheckout}
            />
          )}

          {/* Student Hostel 3D Room Cutscene */}
          {activeModal === 'hostel' && (
            <HostelCutscene3D
              player={player}
              onClose={() => setActiveModal('none')}
              onSleep={handleHostelSleep}
              onStudy={handleHostelStudy}
              onChatRoommate={() => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    roommate: prev.roommate
                      ? { ...prev.roommate, relationshipScore: Math.min(100, prev.roommate.relationshipScore + 10) }
                      : prev.roommate
                  };
                });
              }}
              onOpenRoomDecorator={() => setActiveModal('room_decorator')}
            />
          )}

          {/* Student Union Government (SUG) 3D Cutscene */}
          {activeModal === 'sug' && (
            <SugCutscene3D
              player={player}
              onClose={() => setActiveModal('none')}
              onVoteCandidate={(candidate) => {
                notify(`Voted for ${candidate} in the SUG Presidential election!`);
              }}
            />
          )}

          {/* -------------------------------------------------------- */}
          {/* REVOLUTION II: TEN AMBITIOUS GAME-CHANGING MODALS        */}
          {/* -------------------------------------------------------- */}
          {/* 1. Prototyping & TETFUND Innovation Workshop */}
          {activeModal === 'workbench' && (
            <ProjectWorkbenchModal
              player={player}
              onClose={() => setActiveModal('none')}
              onUpdatePlayer={(updater) => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  const updated = updater(prev);
                  saveGameState(updated);
                  return updated;
                });
              }}
            />
          )}

          {/* 2. Investigative Mystery Corkboard & Senate Tribunal */}
          {activeModal === 'mystery' && (
            <MysteryBoardModal
              player={player}
              onClose={() => setActiveModal('none')}
              onUpdatePlayer={(updater) => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  const updated = updater(prev);
                  saveGameState(updated);
                  return updated;
                });
              }}
            />
          )}

          {/* 3. Campus Culture & Event Planning Staging */}
          {activeModal === 'events' && (
            <EventCreationModal
              player={player}
              onClose={() => setActiveModal('none')}
              onUpdatePlayer={(updater) => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  const updated = updater(prev);
                  saveGameState(updated);
                  return updated;
                });
              }}
            />
          )}

          {/* 4. Connected Off-Campus Urban Districts */}
          {activeModal === 'off_campus' && (
            <OffCampusDistrictScene
              player={player}
              onClose={() => setActiveModal('none')}
              onUpdatePlayer={(updater) => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  const updated = updater(prev);
                  saveGameState(updated);
                  return updated;
                });
              }}
            />
          )}

          {/* 5. Cooperative Campus Crowdfunding Drives */}
          {activeModal === 'challenges' && (
            <CampusChallengesModal
              player={player}
              onClose={() => setActiveModal('none')}
              onUpdatePlayer={(updater) => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  const updated = updater(prev);
                  saveGameState(updated);
                  return updated;
                });
              }}
            />
          )}

          {/* 6. Campus Journalism & Live Studio Broadcasting */}
          {activeModal === 'media' && (
            <CampusMediaModal
              player={player}
              onClose={() => setActiveModal('none')}
              onUpdatePlayer={(updater) => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  const updated = updater(prev);
                  saveGameState(updated);
                  return updated;
                });
              }}
            />
          )}

          {/* 7. Survival & Resilience Scenario (Grid Deluge Crisis) */}
          {activeModal === 'crisis' && (
            <ResilienceCrisisModal
              player={player}
              onClose={() => setActiveModal('none')}
              onUpdatePlayer={(updater) => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  const updated = updater(prev);
                  saveGameState(updated);
                  return updated;
                });
              }}
            />
          )}

          {/* 8. Hostel Room Customizer & Ankara Interior Decor */}
          {activeModal === 'room_decorator' && (
            <RoomDecoratorModal
              player={player}
              onClose={() => setActiveModal('none')}
              onUpdatePlayer={(updater) => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  const updated = updater(prev);
                  saveGameState(updated);
                  return updated;
                });
              }}
            />
          )}

          {/* 9. Senate Hall of Fame & Legacy Dossier */}
          {activeModal === 'legacy' && (
            <LegacyDossierModal
              player={player}
              onClose={() => setActiveModal('none')}
              onArchiveLegacy={(record) => {
                setPlayer((prev) => {
                  if (!prev) return prev;
                  const updated = {
                    ...prev,
                    legacyRecords: [record, ...(prev.legacyRecords || [])]
                  };
                  saveGameState(updated);
                  return updated;
                });
                sounds.playNotification();
                notify(`Archived "${record.studentName}" into Senate Historical Registry!`);
              }}
            />
          )}

          {/* Night Curfew Security Patrol Intercept Modal */}
          {curfewIntercept && (
            <CurfewModal
              player={player}
              officerName={curfewIntercept.officerName}
              locationName={curfewIntercept.location}
              onEscortToHostel={handleCurfewSleep}
            />
          )}
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <SettingsModal
          player={player || ({ name: 'Student', matricNo: 'FUO/2026/0000' } as PlayerState)}
          onClose={() => setActiveModal('none')}
          onResetGame={handleResetGame}
        />
      )}
    </main>
  );
}
