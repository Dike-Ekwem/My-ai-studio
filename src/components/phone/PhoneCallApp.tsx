import React, { useState, useEffect, useRef } from 'react';
import { PlayerState, BankTransaction } from '../../types/game';
import { sounds } from '../../utils/audio';
import { formatNaira } from '../../utils/storage';
import {
  PhoneCall,
  Video,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronLeft,
  Sparkles,
  Heart,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface CallEntity {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  avatarBg: string;
  tagline: string;
  status: string;
  dialogueIntro: string;
  videoStyle: {
    bgGradient: string;
    expression: string;
    decorEmoji: string;
  };
  options: {
    label: string;
    reply: string;
    reward?: {
      type: 'money' | 'stamina' | 'morale';
      amount: number;
      notice: string;
    };
  }[];
}

const FICTIONAL_CALL_ENTITIES: CallEntity[] = [
  {
    id: 'mummy',
    name: 'Mummy (Home)',
    role: 'Mother & Primary Sponsor',
    avatar: '👩🏾‍🦱',
    phone: '0803-OMO-MAMA',
    avatarBg: 'bg-amber-600',
    tagline: 'Always asking if you have eaten today',
    status: 'Online (Home in Lagos)',
    dialogueIntro: 'Hello my pikin! Good day! Hope you are eating well in that school? Make sure you don\'t follow bad friends o! Have you eaten today?',
    videoStyle: {
      bgGradient: 'from-amber-900 via-stone-900 to-amber-950',
      expression: '😊',
      decorEmoji: '🏡'
    },
    options: [
      {
        label: 'Mummy, please send some upkeep money, food is expensive!',
        reply: 'Aww my baby! I know things are tough. Let me transfer ₦5,000 into your Omo-Pay right away. Use it to buy healthy food o!',
        reward: {
          type: 'money',
          amount: 5000,
          notice: 'Received ₦5,000 Upkeep Allowance from Mummy! Credited to Omo-Pay.'
        }
      },
      {
        label: 'Mummy, I just ate jollof rice and I am reading in the library!',
        reply: 'That is my brilliant child! God will bless your studies and give you First Class! We are praying for you every morning.',
        reward: {
          type: 'morale',
          amount: 25,
          notice: 'Mummy praised your dedication! Morale boosted.'
        }
      },
      {
        label: 'Mummy, please pray for my upcoming university tests!',
        reply: 'In Jesus name, you will remember everything you read! You will be the head and never the tail in that university!',
        reward: {
          type: 'stamina',
          amount: 30,
          notice: 'Blessed by Mother\'s powerful prayer! Stamina restored.'
        }
      }
    ]
  },
  {
    id: 'courserep',
    name: 'Chinedu (Course Rep)',
    role: 'Department 100L Course Rep',
    avatar: '👨🏾‍🎓',
    phone: '0812-REP-CHIDI',
    avatarBg: 'bg-blue-600',
    tagline: 'Alerts on shifted lecture venues & past questions',
    status: 'Near Faculty Quad',
    dialogueIntro: 'Guy! Where you dey? Dr. Alabi just announced that tomorrow\'s test has been shifted to the TETFund Mega Complex! Don\'t come late o!',
    videoStyle: {
      bgGradient: 'from-blue-900 via-stone-900 to-indigo-950',
      expression: '🗣️',
      decorEmoji: '📚'
    },
    options: [
      {
        label: 'Thanks Chinedu! Is the assignment still due by 2 PM?',
        reply: 'Yes! Submit to my hostel room before 2 PM sharp so I can submit the entire department batch to the HOD office.'
      },
      {
        label: 'Abeg Chinedu, do you have the summary past questions PDF?',
        reply: 'I just uploaded the past questions summary to the group drive! Go through questions 1 to 5, that is Dr. Alabi\'s favourite format.',
        reward: {
          type: 'morale',
          amount: 20,
          notice: 'Exam tips acquired from Course Rep! Academic confidence increased.'
        }
      }
    ]
  },
  {
    id: 'dean',
    name: 'Prof. Okon (Dean Student Affairs)',
    role: 'Dean of Student Affairs & Discipline',
    avatar: '👨🏾‍🏫',
    phone: '0802-DEAN-OKON',
    avatarBg: 'bg-red-800',
    tagline: 'Campus discipline, hostel regulations & curfew',
    status: 'In Senate Tower',
    dialogueIntro: 'Good day, student. I am monitoring campus security and hostel compliance logs. Be strictly reminded that university curfew begins at 10:00 PM!',
    videoStyle: {
      bgGradient: 'from-red-950 via-stone-900 to-slate-950',
      expression: '🧐',
      decorEmoji: '🏛️'
    },
    options: [
      {
        label: 'Understood, Prof! I strictly adhere to the 10:00 PM curfew.',
        reply: 'Commendable! Discipline and punctuality are the foundation of excellence at the Federal University of Omo.'
      },
      {
        label: 'Sir, how can students qualify for the Vice-Chancellor\'s Honours?',
        reply: 'Maintain a cumulative GPA of 4.50 and above across both semesters without any academic misconduct or curfew violations.',
        reward: {
          type: 'morale',
          amount: 20,
          notice: 'Inspired by Dean\'s academic guidance!'
        }
      }
    ]
  },
  {
    id: 'crush',
    name: 'Amaka (Campus Bestie)',
    role: 'Faculty Best Friend (Hall B)',
    avatar: '👩🏾‍🦱',
    phone: '0809-GIST-AMAKA',
    avatarBg: 'bg-pink-600',
    tagline: 'Hostel gossip, lunch dates & hangout plans',
    status: 'Active on Campus',
    dialogueIntro: 'Hey! Are you still at lectures? We agreed to meet at Mama Nkechi\'s Bukka for jollof and fried dodo! Don\'t tell me you forgot our lunch date!',
    videoStyle: {
      bgGradient: 'from-pink-900 via-stone-900 to-rose-950',
      expression: '✨',
      decorEmoji: '🍲'
    },
    options: [
      {
        label: 'Haha I didn\'t forget! Let\'s meet at Bukka, dodo on me!',
        reply: 'Yay! You are the best! I am walking over right now. Order two plates of jollof with extra plantain!',
        reward: {
          type: 'morale',
          amount: 20,
          notice: 'Excited for lunch with Amaka! Morale boosted.'
        }
      },
      {
        label: 'Tell me the hot gist that happened at the faculty today!',
        reply: 'Omo! One student tried to sneak into the Chemistry lab without a lab coat and the technician sent him packing with his boots!'
      }
    ]
  },
  {
    id: 'porter',
    name: 'Baba Segun (Hostel Porter)',
    role: 'Hostel A Chief Porter & Warden',
    avatar: '🧔🏾',
    phone: '0805-HALL-PORTER',
    avatarBg: 'bg-emerald-800',
    tagline: 'Hall master, room keys & night gate locks',
    status: 'At Hostel Gatehouse',
    dialogueIntro: 'Hello! Hall occupant! Remember that by 10:00 PM sharp, I am locking the hostel gate with chain and padlock! Anyone outside will face the disciplinary panel!',
    videoStyle: {
      bgGradient: 'from-emerald-950 via-stone-900 to-slate-950',
      expression: '🗝️',
      decorEmoji: '🛏️'
    },
    options: [
      {
        label: 'Noted Baba Segun, I will be inside my room before 10 PM!',
        reply: 'Good! Better for you. Also keep your room clean, the sanitary inspectors are visiting tomorrow.'
      },
      {
        label: 'Baba, is running water available in the overhead tanks tonight?',
        reply: 'Yes, the pumping machine has filled the tanks. Use water wisely and ensure taps are turned off.'
      }
    ]
  },
  {
    id: 'maman_nkechi',
    name: 'Mama Nkechi (Bukka Kitchen)',
    role: 'Campus Bukka Head Chef',
    avatar: '👩🏾‍🍳',
    phone: '0807-BUKKA-MAMA',
    avatarBg: 'bg-orange-600',
    tagline: 'Fresh jollof, egusi & hot take-away orders',
    status: 'Cooking at Food Square',
    dialogueIntro: 'Ah, my student! Fresh party jollof with soft beef is hot on the fire! Do you want me to reserve a portion for you before the afternoon rush?',
    videoStyle: {
      bgGradient: 'from-orange-950 via-stone-900 to-amber-950',
      expression: '😋',
      decorEmoji: '🍲'
    },
    options: [
      {
        label: 'Yes Mama! Keep one hot plate of jollof and plantain for me!',
        reply: 'Done! Your takeaway pack is reserved in the hot food warmer. Just come and pay with your Omo-Pay!'
      },
      {
        label: 'Mama, what is your special soup for today?',
        reply: 'Today we have thick Egusi with bitterleaf, and fresh Catfish pepper soup! Sweet die!'
      }
    ]
  },
  {
    id: 'security_desk',
    name: 'Campus Security Helpline',
    role: 'FUO Security Emergency & Patrol Unit',
    avatar: '👮🏾‍♂️',
    phone: '0800-FUO-SECURE',
    avatarBg: 'bg-slate-700',
    tagline: '24/7 Security Patrol & Curfew Desk',
    status: 'Patrolling Campus Grounds',
    dialogueIntro: 'FUO Security Emergency Control Room. Officer on duty speaking. Report any emergency or security issues. Note that campus curfew is strictly 10:00 PM to 6:00 AM.',
    videoStyle: {
      bgGradient: 'from-slate-900 via-stone-900 to-blue-950',
      expression: '🛡️',
      decorEmoji: '🚨'
    },
    options: [
      {
        label: 'All clear Officer, just saving the emergency helpline.',
        reply: 'Understood. If you notice any suspicious activity or loiterers after 10 PM, dial us immediately.'
      },
      {
        label: 'Officer, what time do gates reopen in the morning?',
        reply: 'Campus gates and academic roads reopen at 6:00 AM sharp after the night security shift handover.'
      }
    ]
  }
];

interface PhoneCallAppProps {
  player: PlayerState;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
  onBack: () => void;
}

export const PhoneCallApp: React.FC<PhoneCallAppProps> = ({
  player,
  onUpdatePlayer,
  onBack
}) => {
  const [activeCall, setActiveCall] = useState<{
    entity: CallEntity;
    type: 'voice' | 'video';
    state: 'ringing' | 'connected';
    durationSec: number;
    currentMessage: string;
    hasReceivedReward: boolean;
  } | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Call Timer
  useEffect(() => {
    if (activeCall?.state === 'connected') {
      timerRef.current = window.setInterval(() => {
        setActiveCall((prev) => {
          if (!prev || prev.state !== 'connected') return prev;
          return { ...prev, durationSec: prev.durationSec + 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeCall?.state]);

  const formatCallDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Initiate Call
  const handleStartCall = (entity: CallEntity, type: 'voice' | 'video') => {
    sounds.playClick();
    setActiveCall({
      entity,
      type,
      state: 'ringing',
      durationSec: 0,
      currentMessage: 'Connecting...',
      hasReceivedReward: false
    });

    // Ring for 1.8 seconds, then auto-answer
    setTimeout(() => {
      sounds.playNotification();
      setActiveCall((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          state: 'connected',
          currentMessage: entity.dialogueIntro
        };
      });
    }, 1800);
  };

  // End Call
  const handleEndCall = () => {
    sounds.playClick();
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveCall(null);
  };

  // Select Dialogue Choice
  const handleSelectOption = (opt: {
    label: string;
    reply: string;
    reward?: { type: 'money' | 'stamina' | 'morale'; amount: number; notice: string };
  }) => {
    sounds.playClick();
    if (!activeCall) return;

    setActiveCall((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentMessage: opt.reply
      };
    });

    // Execute Reward if present and not already given
    if (opt.reward && !activeCall.hasReceivedReward) {
      setActiveCall((prev) => (prev ? { ...prev, hasReceivedReward: true } : null));

      if (opt.reward.type === 'money') {
        const amount = opt.reward.amount;
        const newTx: BankTransaction = {
          id: `tx_${Date.now()}`,
          reference: `OMO-CALL-${Math.floor(100000 + Math.random() * 900000)}`,
          date: `Day ${player.day}`,
          time: 'Phone Call Transfer',
          description: `Allowance from ${activeCall.entity.name}`,
          type: 'credit',
          amount,
          balanceAfter: player.balance + amount,
          recipientOrSender: activeCall.entity.name
        };

        onUpdatePlayer((prev) => ({
          ...prev,
          balance: prev.balance + amount,
          transactions: [newTx, ...prev.transactions]
        }));
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
        sounds.playCashPing();
      } else if (opt.reward.type === 'stamina') {
        const gain = opt.reward.amount;
        onUpdatePlayer((prev) => ({
          ...prev,
          stamina: Math.min(100, prev.stamina + gain)
        }));
      }

      showToast(`🎁 ${opt.reward.notice}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-950 text-white relative">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 border-b border-stone-800 bg-stone-900/90 z-20">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            if (activeCall) {
              handleEndCall();
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-1 text-xs text-amber-400 hover:text-white font-bold cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{activeCall ? 'End & Return' : 'Home'}</span>
        </button>

        <div className="text-xs font-black tracking-wider text-white flex items-center gap-1.5">
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span>OmoCall • Voice & Video</span>
        </div>

        <div className="w-12 text-right text-[10px] text-emerald-400 font-mono font-bold">
          4G HD
        </div>
      </div>

      {toastMessage && (
        <div className="absolute top-14 inset-x-4 z-40 flex justify-center animate-in fade-in">
          <div className="bg-emerald-950/95 border border-emerald-500/80 text-emerald-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-xl backdrop-blur-md">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Main View: Contacts List OR Active Call Screen */}
      {!activeCall ? (
        /* Contacts List */
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          <div className="bg-stone-900/80 p-3 rounded-2xl border border-stone-800 text-xs">
            <span className="text-amber-400 font-bold">Campus VoIP & Video Network:</span>
            <p className="text-[10px] text-stone-400 mt-0.5">
              Call university entities, parents, course reps, and campus emergency lines. Video calling displays live speaker reaction streams.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
              Fictional Campus Contacts ({FICTIONAL_CALL_ENTITIES.length})
            </div>

            {FICTIONAL_CALL_ENTITIES.map((contact) => (
              <div
                key={contact.id}
                className="bg-stone-900 border border-stone-800/80 hover:border-emerald-500/50 rounded-2xl p-3 flex items-center justify-between gap-3 shadow transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl ${contact.avatarBg} flex items-center justify-center text-xl shadow shrink-0`}
                  >
                    {contact.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                      <span>{contact.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold truncate">
                      {contact.role}
                    </div>
                    <div className="text-[9px] text-stone-400 truncate leading-none mt-0.5">
                      {contact.tagline}
                    </div>
                  </div>
                </div>

                {/* Call Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartCall(contact, 'voice')}
                    className="p-2.5 rounded-xl bg-stone-800 hover:bg-emerald-600 text-emerald-400 hover:text-white transition cursor-pointer shadow"
                    title={`Voice Call ${contact.name}`}
                  >
                    <PhoneCall className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartCall(contact, 'video')}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white transition cursor-pointer shadow transform active:scale-95"
                    title={`Video Call ${contact.name}`}
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ACTIVE CALL SCREEN (VOICE OR VIDEO) */
        <div className="flex-1 flex flex-col justify-between p-3 relative overflow-hidden bg-stone-950">
          {/* Top Status */}
          <div className="text-center py-2 z-10">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              {activeCall.type === 'video' ? '📹 Video Call' : '📞 Voice Call'}
            </span>
            <h3 className="text-base font-black text-white">{activeCall.entity.name}</h3>
            <div className="text-xs font-mono text-emerald-400 mt-0.5">
              {activeCall.state === 'ringing' ? 'Calling...' : formatCallDuration(activeCall.durationSec)}
            </div>
          </div>

          {/* Video or Voice Main Canvas */}
          {activeCall.type === 'video' ? (
            /* VIDEO CALL INTERFACE */
            <div className="relative flex-1 rounded-3xl overflow-hidden border-2 border-stone-700 bg-stone-900 shadow-2xl flex flex-col justify-between p-3">
              {/* Animated Background for Contact Video Feed */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${activeCall.entity.videoStyle.bgGradient} flex flex-col items-center justify-center p-4`}
              >
                {/* Contact Avatar Speaking */}
                <div className="relative flex flex-col items-center text-center space-y-2 animate-in zoom-in-95 duration-300">
                  <div className="w-28 h-28 rounded-full bg-stone-900/60 border-4 border-amber-400/80 flex items-center justify-center text-5xl shadow-2xl relative">
                    {activeCall.entity.avatar}
                    <div className="absolute -bottom-1 -right-1 text-2xl animate-bounce">
                      {activeCall.entity.videoStyle.expression}
                    </div>
                  </div>
                  <div className="bg-black/60 px-3 py-1 rounded-full text-xs font-bold text-amber-300 backdrop-blur-md">
                    {activeCall.entity.name} ({activeCall.entity.status})
                  </div>
                </div>
              </div>

              {/* Subtitles / Speech Bubble */}
              <div className="relative z-10 bg-black/75 border border-stone-600/80 rounded-2xl p-3 backdrop-blur-md shadow-xl max-w-sm mx-auto">
                <p className="text-xs sm:text-sm text-stone-100 font-medium leading-snug">
                  "{activeCall.currentMessage}"
                </p>
              </div>

              {/* Player Selfie Picture-in-Picture (PiP) Window */}
              <div className="absolute bottom-3 right-3 w-20 h-28 rounded-2xl bg-stone-950 border-2 border-emerald-400 shadow-2xl overflow-hidden z-20 flex flex-col items-center justify-center p-1">
                <div className="text-2xl mb-1">🤳</div>
                <div className="text-[8px] font-black text-amber-300 truncate max-w-full">
                  {player.name}
                </div>
                <div className="text-[7px] text-stone-400">You (Front Cam)</div>
              </div>
            </div>
          ) : (
            /* VOICE CALL INTERFACE */
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
              <div className="relative">
                <div
                  className={`w-28 h-28 rounded-full ${activeCall.entity.avatarBg} border-4 border-stone-700 flex items-center justify-center text-5xl shadow-2xl`}
                >
                  {activeCall.entity.avatar}
                </div>
                {activeCall.state === 'connected' && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
                )}
              </div>

              {/* Simulated Audio Waveform Bars */}
              {activeCall.state === 'connected' && (
                <div className="flex items-center justify-center gap-1 h-8">
                  {[12, 24, 32, 18, 28, 14, 20, 30, 16, 22].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                      style={{
                        height: `${h}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Dialogue Box */}
              <div className="bg-stone-900 border border-stone-700 rounded-2xl p-3.5 max-w-sm text-left shadow-xl">
                <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">
                  {activeCall.entity.name} says:
                </div>
                <p className="text-xs text-stone-200 leading-relaxed font-medium">
                  "{activeCall.currentMessage}"
                </p>
              </div>
            </div>
          )}

          {/* Interactive Dialogue Choices (Only when connected) */}
          {activeCall.state === 'connected' && (
            <div className="mt-3 space-y-1.5 z-10">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Select Reply / Action:
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {activeCall.entity.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className="w-full p-2 rounded-xl bg-stone-900/90 hover:bg-emerald-950 border border-stone-700/80 hover:border-emerald-500 text-left text-xs font-semibold text-stone-200 hover:text-white transition cursor-pointer flex items-center justify-between gap-2 shadow"
                  >
                    <span className="truncate">{opt.label}</span>
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0">Speak ↵</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Call Hardware Controls Bar */}
          <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-center gap-6 z-10">
            {/* Mute Mic */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsMuted(!isMuted);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
                isMuted ? 'bg-red-900 text-white' : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition transform active:scale-95 cursor-pointer"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Speaker Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsSpeaker(!isSpeaker);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
                isSpeaker ? 'bg-emerald-900 text-emerald-300' : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
              title="Speakerphone"
            >
              {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
