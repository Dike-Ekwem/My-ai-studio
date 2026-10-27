import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { MediaArticle } from '../../types/revolution';
import { INITIAL_MEDIA_ARTICLES } from '../../data/revolutionData';
import { sounds } from '../../utils/audio';
import { useSoundtrack } from '../../utils/soundtrack';
import { Crest } from '../Crest';
import confetti from 'canvas-confetti';
import {
  Radio,
  Newspaper,
  Mic,
  Send,
  Sparkles,
  TrendingUp,
  Volume2,
  Users,
  Eye,
  CheckCircle2,
  X,
  Play,
  Music,
  Share2
} from 'lucide-react';

interface CampusMediaModalProps {
  player: PlayerState;
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
}

export const CampusMediaModal: React.FC<CampusMediaModalProps> = ({
  player,
  onClose,
  onUpdatePlayer
}) => {
  const [activeTab, setActiveTab] = useState<'newspaper' | 'radio'>('newspaper');
  const [articles, setArticles] = useState<MediaArticle[]>(
    player.mediaArticles && player.mediaArticles.length > 0 ? player.mediaArticles : INITIAL_MEDIA_ARTICLES
  );

  // Article Composition State
  const [draftHeadline, setDraftHeadline] = useState('');
  const [draftCategory, setDraftCategory] = useState<MediaArticle['category']>('campus_investigation');
  const [draftTone, setDraftTone] = useState<MediaArticle['tone']>('investigative');
  const [draftExcerpt, setDraftExcerpt] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Radio On-Air State
  const [onAirMessage, setOnAirMessage] = useState<string>('Broadcasting live across Federal University of Omo campus grounds on 98.5 FM!');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const { currentTrack, isPlaying, togglePlay } = useSoundtrack();

  // Publish Article
  const handlePublishArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftHeadline.trim() || !draftExcerpt.trim()) {
      sounds.playNotification();
      setFeedback('Please provide both a headline and story content.');
      return;
    }

    sounds.playCheer();
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });

    const newArticle: MediaArticle = {
      id: `art_${Date.now()}`,
      headline: draftHeadline.trim(),
      category: draftCategory,
      author: `${player.name} (Student Journalist)`,
      excerpt: draftExcerpt.trim(),
      tone: draftTone,
      readershipCount: Math.floor(800 + Math.random() * 1200),
      moraleImpact: draftTone === 'celebratory' ? 8 : draftTone === 'investigative' ? 5 : 2,
      datePublished: `Day ${player.day}`,
      published: true
    };

    const updatedArticles = [newArticle, ...articles];
    setArticles(updatedArticles);

    onUpdatePlayer((prev) => ({
      ...prev,
      reputationXP: prev.reputationXP + 80,
      mediaArticles: updatedArticles
    }));

    setDraftHeadline('');
    setDraftExcerpt('');
    setFeedback(`📰 Published to The Omo Voice! Readership estimated at ${newArticle.readershipCount} students (+80 XP).`);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Broadcast Radio PSA
  const handleBroadcastPSA = (announcement: string) => {
    sounds.playNotification();
    setIsBroadcasting(true);
    setOnAirMessage(`🎙️ ON-AIR: "${announcement}"`);

    onUpdatePlayer((prev) => ({
      ...prev,
      reputationXP: prev.reputationXP + 35
    }));

    setTimeout(() => {
      setIsBroadcasting(false);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-stone-950 border-2 border-cyan-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950 border border-cyan-500/60 rounded-2xl text-cyan-300">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  FUO Campus Media & Broadcasting House
                </h2>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-extrabold px-2.5 py-0.5 rounded-full border border-cyan-400/40">
                  The Omo Voice & Radio 98.5 FM
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Student investigative journalism, editorial publications, and live campus radio broadcasting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-stone-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { sounds.playClick(); setActiveTab('newspaper'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                  activeTab === 'newspaper' ? 'bg-cyan-600 text-white shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                The Omo Voice
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setActiveTab('radio'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                  activeTab === 'radio' ? 'bg-purple-600 text-white shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                Radio 98.5 FM
              </button>
            </div>

            <button
              type="button"
              onClick={() => { sounds.playClick(); onClose(); }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="bg-cyan-950/90 border-b border-cyan-500/60 text-cyan-200 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Main Body */}
        {activeTab === 'newspaper' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Feed of Published Articles */}
            <div className="w-80 sm:w-96 bg-stone-900/60 border-r border-stone-800 p-4 overflow-y-auto space-y-3 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
                  Campus Editions
                </span>
                <span className="text-[10px] text-stone-400">{articles.length} Published</span>
              </div>

              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-stone-900/90 border border-stone-800 p-3.5 rounded-2xl space-y-1.5 shadow"
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span className="uppercase font-extrabold text-cyan-400">
                      {art.category.replace('_', ' ')}
                    </span>
                    <span>{art.datePublished}</span>
                  </div>

                  <h3 className="font-extrabold text-xs text-white leading-snug">
                    {art.headline}
                  </h3>

                  <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-[10px] text-stone-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Eye className="w-3 h-3 text-cyan-400" /> {art.readershipCount}
                    </span>
                    <span className="text-emerald-400 font-bold">+{art.moraleImpact} Morale</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Journalist Article Writing Studio */}
            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handlePublishArticle} className="space-y-4 max-w-2xl">
                <div>
                  <h3 className="text-base font-black text-white">Write a New Investigative Scoop</h3>
                  <p className="text-xs text-stone-400">
                    Report on university infrastructure, sports tournaments, student union politics, or campus achievements
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Article Section</label>
                    <select
                      value={draftCategory}
                      onChange={(e) => setDraftCategory(e.target.value as any)}
                      className="w-full mt-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="campus_investigation">Campus Investigation</option>
                      <option value="sports_derby">Sports Derby & Athletics</option>
                      <option value="technology_breakthrough">Student Innovation Expo</option>
                      <option value="student_lifestyle">Student Life & Welfare</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase">Editorial Tone</label>
                    <select
                      value={draftTone}
                      onChange={(e) => setDraftTone(e.target.value as any)}
                      className="w-full mt-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="investigative">Investigative (Facts & Evidence)</option>
                      <option value="celebratory">Celebratory (High Morale Boost)</option>
                      <option value="critical">Critical (Holding Officials Accountable)</option>
                      <option value="informative">Informative (Public Notice)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Headline Title</label>
                  <input
                    type="text"
                    value={draftHeadline}
                    onChange={(e) => setDraftHeadline(e.target.value)}
                    placeholder="e.g., Engineering Students Unveil Solar-Powered Keke Inverter Prototype"
                    className="w-full mt-1 bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Report Body & Observations</label>
                  <textarea
                    rows={6}
                    value={draftExcerpt}
                    onChange={(e) => setDraftExcerpt(e.target.value)}
                    placeholder="Provide evidence, witness quotes, and verified facts gathered during your university exploration..."
                    className="w-full mt-1 bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish to Campus Bulletin (+80 XP)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Radio 98.5 FM Live Studio */
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Live On-Air Marquee */}
            <div className="bg-gradient-to-r from-purple-950 via-stone-900 to-purple-950 p-5 rounded-3xl border border-purple-500/50 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    isBroadcasting ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                  }`}
                />
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-purple-300">
                    Live Broadcast Status
                  </div>
                  <div className="text-sm font-black text-white font-mono mt-0.5">{onAirMessage}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Music className="w-4 h-4" />
                <span>Now Playing: {currentTrack?.title || 'Campus Soundtrack'}</span>
              </div>
            </div>

            {/* Quick Broadcast Console */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Mic className="w-4 h-4" />
                <span>Transmit Live Public Service Announcements</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  'Attention all students: Faculty derby kick-off holds this afternoon at the stadium!',
                  'General Studies examination timetable has been officially posted at the Senate citadel.',
                  'Hostel notice: Conserve water during peak evening hours as tank maintenance is underway.',
                  'Support student innovation: Visit the TETFUND engineering lab for prototype demonstrations!',
                  'Mama Nkechi Bukka is serving hot Jollof rice and smoked fish for lunchtime freshers.'
                ].map((psa, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleBroadcastPSA(psa)}
                    className="p-3.5 rounded-2xl bg-stone-900/80 hover:bg-purple-950/70 border border-stone-800 hover:border-purple-500/60 text-left transition cursor-pointer flex flex-col justify-between space-y-2"
                  >
                    <div className="text-xs text-white font-medium italic">"{psa}"</div>
                    <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold pt-1 border-t border-stone-800">
                      <span>Air on Radio FUO</span>
                      <span>+35 XP</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
