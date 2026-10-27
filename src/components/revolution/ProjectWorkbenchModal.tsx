import React, { useState } from 'react';
import { PlayerState } from '../../types/game';
import { InnovationProject } from '../../types/revolution';
import { INNOVATION_PROJECTS } from '../../data/revolutionData';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { Crest } from '../Crest';
import confetti from 'canvas-confetti';
import {
  Cpu,
  Zap,
  Wrench,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  X,
  AlertCircle,
  TrendingUp,
  FlaskConical
} from 'lucide-react';

interface ProjectWorkbenchModalProps {
  player: PlayerState;
  onClose: () => void;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
}

export const ProjectWorkbenchModal: React.FC<ProjectWorkbenchModalProps> = ({
  player,
  onClose,
  onUpdatePlayer
}) => {
  const [projects, setProjects] = useState<InnovationProject[]>(
    player.innovationProjects && player.innovationProjects.length > 0
      ? player.innovationProjects
      : INNOVATION_PROJECTS
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj_keke_solar');
  const [testingProgress, setTestingProgress] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Helper to check if player has required components in inventory or if they can acquire them
  const hasComponent = (compId: string, requiredCount: number) => {
    const item = player.inventory.find((i) => i.id === compId);
    return item ? item.quantity >= requiredCount : false;
  };

  const allComponentsAvailable = activeProject.requiredComponents.every((c) =>
    hasComponent(c.id, c.count)
  );

  // Quick prototype build handler
  const handleBuildPrototype = () => {
    sounds.playClick();
    setTestingProgress(10);

    const interval = setInterval(() => {
      setTestingProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          finishBuilding();
          return null;
        }
        return prev + 25;
      });
    }, 250);
  };

  const finishBuilding = () => {
    sounds.playCashPing();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id ? { ...p, isBuilt: true } : p
      )
    );

    onUpdatePlayer((prev) => {
      // Remove used components if present in inventory
      const updatedInv = prev.inventory.map((invItem) => {
        const req = activeProject.requiredComponents.find((c) => c.id === invItem.id);
        if (req) {
          return { ...invItem, quantity: Math.max(0, invItem.quantity - req.count) };
        }
        return invItem;
      }).filter((item) => item.quantity > 0);

      const updatedProjects = (prev.innovationProjects || INNOVATION_PROJECTS).map((p) =>
        p.id === activeProject.id ? { ...p, isBuilt: true } : p
      );

      return {
        ...prev,
        inventory: updatedInv,
        reputationXP: prev.reputationXP + activeProject.reputationXP,
        gpa: Math.min(5.0, prev.gpa + 0.05),
        innovationProjects: updatedProjects
      };
    });

    setActionNotice(`🎉 Successfully assembled ${activeProject.title}! Ready for testing and faculty showcase.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Exhibit prototype at TETFUND engineering pedestal
  const handleExhibitAtShowcase = () => {
    sounds.playCheer();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id ? { ...p, isExhibited: true } : p
      )
    );

    onUpdatePlayer((prev) => {
      const updatedProjects = (prev.innovationProjects || INNOVATION_PROJECTS).map((p) =>
        p.id === activeProject.id ? { ...p, isExhibited: true } : p
      );

      const updatedWorld = {
        ...(prev.worldEvolution || {
          quadPavilionRenovated: false,
          stadiumTrophyShowcase: false,
          techHubInnovationPedestal: false,
          solarStreetlightsInstalled: false,
          culturalFestivalPavilion: false,
          drainageCanalReinforced: false
        }),
        techHubInnovationPedestal: true
      };

      const newTx = {
        id: `tx_${Date.now()}`,
        reference: `TETFUND-GRANT-${Math.floor(100000 + Math.random() * 900000)}`,
        date: `Day ${prev.day}`,
        time: 'Showcase Grant',
        description: `Research Commercialization Grant: ${activeProject.title}`,
        type: 'credit' as const,
        amount: activeProject.grantEarned,
        balanceAfter: prev.balance + activeProject.grantEarned,
        recipientOrSender: 'Federal University Innovation Council'
      };

      return {
        ...prev,
        balance: prev.balance + activeProject.grantEarned,
        reputationXP: prev.reputationXP + 150,
        transactions: [newTx, ...prev.transactions],
        innovationProjects: updatedProjects,
        worldEvolution: updatedWorld
      };
    });

    setActionNotice(`🏆 Exhibited at TETFUND Showcase! Awarded ${formatNaira(activeProject.grantEarned)} Research Grant & Innovation Pedestal placed on campus!`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-stone-950 border-2 border-emerald-600/70 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 border border-emerald-500/60 rounded-2xl text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  TETFUND Student Innovation Workshop
                </h2>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-400/40">
                  Engineering Lab 104
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Design, assemble, and exhibit practical technological solutions for Nigerian university challenges
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/60 text-emerald-200 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Blueprint Selection */}
          <div className="w-80 sm:w-96 bg-stone-900/60 border-r border-stone-800 p-4 overflow-y-auto space-y-2.5 shrink-0">
            <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider mb-2">
              Available Project Blueprints
            </div>

            {projects.map((proj) => {
              const isSelected = proj.id === activeProject.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => { sounds.playClick(); setSelectedProjectId(proj.id); }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950 to-stone-900 border-emerald-500 ring-1 ring-emerald-400/50 shadow-lg'
                      : 'bg-stone-900/80 hover:bg-stone-800 border-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-800 text-amber-300">
                      {proj.category}
                    </span>
                    {proj.isExhibited ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-400/40">
                        <Award className="w-3 h-3" /> Exhibited
                      </span>
                    ) : proj.isBuilt ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400/40">
                        <CheckCircle2 className="w-3 h-3" /> Built
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">Blueprint</span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-white leading-snug">
                    {proj.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono mt-1 pt-1.5 border-t border-stone-800/80">
                    <span>Grant: {formatNaira(proj.grantEarned)}</span>
                    <span className="text-emerald-400 font-bold">+{proj.reputationXP} XP</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Area: Workbench & Diagnostic Simulator */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Active Blueprint Banner */}
              <div className="bg-gradient-to-br from-stone-900 to-stone-950 p-5 rounded-3xl border border-stone-800 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                      {activeProject.category} Innovation
                    </span>
                    <h2 className="text-xl font-black text-white mt-1">
                      {activeProject.title}
                    </h2>
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed max-w-2xl">
                      {activeProject.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase font-bold text-stone-400">Commercial Grant</div>
                    <div className="text-lg font-black text-amber-300 font-mono">
                      {formatNaira(activeProject.grantEarned)}
                    </div>
                  </div>
                </div>

                {/* Efficiency & Impact Meter */}
                <div className="mt-4 pt-4 border-t border-stone-800/80 grid grid-cols-3 gap-3">
                  <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Efficiency Rating</div>
                    <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                      {activeProject.efficiencyScore}% Tested
                    </div>
                  </div>

                  <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Academic GPA Impact</div>
                    <div className="text-base font-black text-blue-400 font-mono mt-0.5">
                      +{activeProject.academicBoost}% Bonus
                    </div>
                  </div>

                  <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Reputation Gain</div>
                    <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                      +{activeProject.reputationXP} XP
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill of Materials / Components Required */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-stone-300 tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span>Required Technological Components</span>
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    Components can be acquired from Otigba vendors at Surulere Ojuelegba Market or Engineering Stores
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeProject.requiredComponents.map((comp) => {
                    const isAvailable = hasComponent(comp.id, comp.count);
                    return (
                      <div
                        key={comp.id}
                        className={`p-3.5 rounded-2xl border transition ${
                          isAvailable
                            ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                            : 'bg-stone-900/50 border-stone-800 text-stone-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-lg">⚙️</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isAvailable
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {isAvailable ? 'In Inventory' : 'Lab Standard (Ready)'}
                          </span>
                        </div>
                        <div className="font-extrabold text-xs text-white">{comp.name}</div>
                        <div className="text-[10px] text-stone-400 mt-1">Requires {comp.count} unit(s)</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Testing Diagnostic Progress */}
              {testingProgress !== null && (
                <div className="bg-stone-900/90 border border-blue-500/60 p-4 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-blue-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-spin" />
                      Running Diagnostic Circuitry & Stress Tests...
                    </span>
                    <span className="font-mono text-white">{testingProgress}%</span>
                  </div>
                  <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${testingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-white">Project Status</div>
                <div className="text-[11px] text-stone-400">
                  {activeProject.isExhibited
                    ? 'Exhibited on campus innovation pedestal; research grant collected.'
                    : activeProject.isBuilt
                    ? 'Prototype fully assembled; ready to exhibit at TETFUND faculty showcase.'
                    : 'Awaiting assembly at engineering workbench.'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!activeProject.isBuilt ? (
                  <button
                    type="button"
                    onClick={handleBuildPrototype}
                    disabled={testingProgress !== null}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Assemble & Test Prototype</span>
                  </button>
                ) : !activeProject.isExhibited ? (
                  <button
                    type="button"
                    onClick={handleExhibitAtShowcase}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black px-6 py-3 rounded-2xl text-xs shadow-xl flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95"
                  >
                    <Award className="w-4 h-4 text-stone-950" />
                    <span>Exhibit at Showcase & Claim {formatNaira(activeProject.grantEarned)}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/60 px-5 py-2.5 rounded-2xl text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Showcase Exhibition Live at Engineering Pedestal</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
