import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { COMPETITIONS } from '../data/gameData';
import { Competition } from '../types/game';
import { sound } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Medal,
  Flame,
  Swords,
  DollarSign,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  Volume2,
} from 'lucide-react';

export const CompetitionArena: React.FC = () => {
  const { player, npcs, enterCompetition } = useGame();
  const [selectedComp, setSelectedComp] = useState<Competition>(COMPETITIONS[0]);
  const [compResult, setCompResult] = useState<{
    won: boolean;
    message: string;
    playerScore: number;
    rivalScore: number;
  } | null>(null);
  const [isCompeting, setIsCompeting] = useState<boolean>(false);
  const [refereeLights, setRefereeLights] = useState<boolean[]>([true, true, true]);

  const rival = npcs.find((n) => n.id === selectedComp.rivalParticipantId) || npcs[0];

  const handleStartComp = () => {
    sound.playClick();
    setIsCompeting(true);
    setCompResult(null);

    // Simulated dramatic 3-referee review
    setTimeout(() => {
      const result = enterCompetition(selectedComp);
      setIsCompeting(false);
      setCompResult(result);

      if (result.won) {
        setRefereeLights([true, true, true]);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } else {
        setRefereeLights([true, false, false]);
      }
    }, 1600);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#0c1017]/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            CHAMPIONSHIP ARENA & POWERLIFTING MEETS
          </h2>
          <p className="text-xs text-slate-400">
            Step onto the national stage under spotlights, referees, and roaring crowds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            YOUR CASH: ${player.money.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tournament Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {COMPETITIONS.map((comp) => {
          const isSelected = comp.id === selectedComp.id;
          const isLocked = player.careerTier < comp.tier;
          return (
            <button
              key={comp.id}
              onClick={() => {
                if (!isLocked) {
                  sound.playClick();
                  setSelectedComp(comp);
                  setCompResult(null);
                }
              }}
              disabled={isLocked}
              className={`p-4 rounded-xl text-left transition-all border relative flex flex-col justify-between cursor-pointer ${
                isLocked
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-gradient-to-b from-amber-500/15 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-amber-400">TIER {comp.tier}</span>
                  <span className="font-mono text-emerald-400">${comp.prizeMoney} PRIZE</span>
                </div>
                <div className="font-display text-xl font-bold text-slate-100 leading-tight">
                  {comp.name}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Fee: ${comp.entryFee}</span>
                <span className="text-amber-400 font-semibold">+{comp.reputationReward} Rep</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Tournament Stage & Rival Face-Off */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              OFFICIAL SANCTIONED EVENT
            </div>
            <h3 className="font-display text-3xl font-bold text-slate-100 uppercase">
              {selectedComp.name}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              {selectedComp.description}
            </p>
          </div>

          {/* 3 Referee Decision Lights */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
              REFEREE JUDGES PANEL
            </div>
            <div className="flex items-center gap-2 justify-center">
              {refereeLights.map((white, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                    white
                      ? 'bg-slate-100 text-slate-900 shadow-slate-100/50'
                      : 'bg-red-600 text-white shadow-red-600/50'
                  }`}
                  title={white ? 'White Light (Good Lift)' : 'Red Light (No Lift)'}
                >
                  {white ? '⚪' : '🔴'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Head-to-Head Athlete VS Rival Matchup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Player Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center font-display text-2xl font-bold text-slate-950">
              YOU
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-100">Contender (Level {player.level})</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Big Three Total:{' '}
                <span className="font-mono text-amber-400 font-bold">
                  {(player.personalRecords.bench_press || 0) +
                    (player.personalRecords.barbell_squat || 0) +
                    (player.personalRecords.deadlift || 0)}{' '}
                  lbs
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-0.5">
                Form Technique: {player.technique}/100 • Fatigue: {Math.round(player.fatigue.overall)}%
              </div>
            </div>
          </div>

          {/* Rival Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-2xl font-bold text-slate-950"
              style={{ backgroundColor: rival.avatarColor }}
            >
              RIVAL
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-100 flex items-center justify-between">
                <span>{rival.name}</span>
                <span className="text-[10px] text-red-400 uppercase font-mono">REIGNING TITAN</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Combined Score:{' '}
                <span className="font-mono text-red-400 font-bold">
                  {rival.stats.bench + rival.stats.squat + rival.stats.deadlift} pts
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                "{rival.dialogue[0]}"
              </div>
            </div>
          </div>
        </div>

        {/* Live Result Output */}
        {compResult && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-start gap-3 animate-fade-in ${
              compResult.won
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {compResult.won ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-base mb-1">
                {compResult.won ? '🏆 1ST PLACE CHAMPIONSHIP TITLE EARNED!' : '🥈 PODIUM RUNNER-UP'}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">{compResult.message}</p>
            </div>
          </div>
        )}

        {/* Compete Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            Registration Fee: <span className="font-mono text-slate-200">${selectedComp.entryFee}</span>
          </div>

          <button
            onClick={handleStartComp}
            disabled={isCompeting || player.money < selectedComp.entryFee}
            className={`px-6 py-3.5 rounded-xl font-display text-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xl ${
              isCompeting
                ? 'bg-amber-500/50 text-slate-950 animate-pulse cursor-wait'
                : player.money < selectedComp.entryFee
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
            }`}
          >
            <Swords className="w-5 h-5" />
            <span>{isCompeting ? 'REFEREES REVIEWING LIFTS...' : 'STEP ONTO PLATFORM & COMPETE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
