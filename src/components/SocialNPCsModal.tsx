import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sound } from '../audio/soundEngine';
import {
  Users,
  MessageSquare,
  Flame,
  Dumbbell,
  Shield,
  Heart,
  Sparkles,
  MapPin,
  ChevronRight,
} from 'lucide-react';

export const SocialNPCsModal: React.FC = () => {
  const { npcs, interactNPC, player } = useGame();
  const [activeNpcId, setActiveNpcId] = useState<string>(npcs[0].id);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);

  const activeNpc = npcs.find((n) => n.id === activeNpcId) || npcs[0];

  const handleTalk = (npcId: string) => {
    const line = interactNPC(npcId);
    setActiveDialogue(line);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#0c1017]/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            LIVING GYM SOCIETY, TRAINERS & RIVALS
          </h2>
          <p className="text-xs text-slate-400">
            Interact with gym athletes, build relationships, hire coaches, and challenge fierce rivals.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Gym Reputation:{' '}
          <span className="font-mono text-amber-400 font-bold">{player.reputation} / 1000</span>
        </div>
      </div>

      {/* Main Layout: Left Roster & Right Interactive Detail */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Roster List (5 Cols) */}
        <div className="md:col-span-5 space-y-2">
          {npcs.map((npc) => {
            const isSelected = npc.id === activeNpc.id;
            return (
              <button
                key={npc.id}
                onClick={() => {
                  sound.playClick();
                  setActiveNpcId(npc.id);
                  setActiveDialogue(null);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500/60 shadow-lg'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-display text-xl font-bold text-slate-950 shrink-0"
                  style={{ backgroundColor: npc.avatarColor }}
                >
                  {npc.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 truncate">{npc.name}</span>
                    {npc.isRival && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        RIVAL
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{npc.title}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{npc.currentZone}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Selected NPC Detail & Dialogue (7 Cols) */}
        <div className="md:col-span-7 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-display text-3xl font-bold text-slate-950 shadow-lg"
                style={{ backgroundColor: activeNpc.avatarColor }}
              >
                {activeNpc.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-2xl font-bold text-slate-100 uppercase leading-none">
                    {activeNpc.name}
                  </h3>
                  {activeNpc.isRival && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                      RIVAL ENFORCER
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-400 font-medium mt-0.5">{activeNpc.title}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <ActivityIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Currently: {activeNpc.currentActivity}</span>
                </div>
              </div>
            </div>

            {/* Benchmark Stats Comparison */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                ATHLETIC BENCHMARKS
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-bold">BENCH</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">{activeNpc.stats.bench}#</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-bold">SQUAT</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">{activeNpc.stats.squat}#</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-bold">DEADLIFT</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">{activeNpc.stats.deadlift}#</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-bold">SCORE</div>
                  <div className="font-mono font-bold text-amber-400 mt-0.5">{activeNpc.stats.physiqueScore}</div>
                </div>
              </div>
            </div>

            {/* Relationship Meter */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>RELATIONSHIP & RESPECT</span>
                <span className="font-mono text-emerald-400">{activeNpc.relationship}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${activeNpc.relationship}%` }}
                />
              </div>
            </div>

            {/* Live Dialogue Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 min-h-[90px] flex items-center">
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{activeDialogue || activeNpc.dialogue[0]}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => handleTalk(activeNpc.id)}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>TALK & ASK FOR CUES</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = ({ className }: { className?: string }) => (
  <span className={className}>⚡</span>
);
