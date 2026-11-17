import React from 'react';
import { useGame } from '../context/GameContext';
import {
  User,
  Activity,
  Zap,
  TrendingUp,
  Flame,
  Award,
  Shield,
  Heart,
  BarChart3,
  Dumbbell,
} from 'lucide-react';

export const BodyStatsModal: React.FC = () => {
  const { player } = useGame();

  const bigThreeTotal =
    (player.personalRecords.bench_press || 0) +
    (player.personalRecords.barbell_squat || 0) +
    (player.personalRecords.deadlift || 0);

  const muscleGroups = [
    { name: 'Chest (Pectorals)', val: player.fatigue.chest, color: 'from-amber-500 to-red-500' },
    { name: 'Back (Latissimus & Traps)', val: player.fatigue.back, color: 'from-blue-500 to-indigo-500' },
    { name: 'Legs (Quads & Hamstrings)', val: player.fatigue.legs, color: 'from-emerald-500 to-teal-500' },
    { name: 'Arms (Biceps & Triceps)', val: player.fatigue.arms, color: 'from-purple-500 to-pink-500' },
    { name: 'Shoulders (Deltoids)', val: player.fatigue.shoulders, color: 'from-amber-400 to-yellow-500' },
    { name: 'Core & Abdominals', val: player.fatigue.abs, color: 'from-orange-500 to-amber-600' },
  ];

  // Visual vascularity & definition score
  const vascularityScore = Math.max(1, Math.min(10, Math.round((22 - player.bodyFatPercent) * 0.7 + (player.muscleMassKg - 30) * 0.15)));

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#0c1017]/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <User className="w-6 h-6 text-amber-400" />
            ATHLETE BIOMETRICS & TRANSFORMATION
          </h2>
          <p className="text-xs text-slate-400">
            Real-time physical metamorphosis tracking through training consistency and nutrition.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-display text-lg tracking-wider">
            BIG THREE TOTAL: {bigThreeTotal} LBS
          </span>
        </div>
      </div>

      {/* Top 4 Key Physical Vitals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Muscle Mass */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>LEAN MUSCLE MASS</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-slate-100">{player.muscleMassKg}</span>
            <span className="text-sm font-bold text-emerald-400">KG</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            +{((player.muscleMassKg - 34.5) * 2.2).toFixed(1)} lbs gained since Day 1
          </div>
        </div>

        {/* Body Fat % */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>BODY FAT PERCENT</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-slate-100">{player.bodyFatPercent}%</span>
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            {player.bodyFatPercent < 10 ? 'Contest Shredded' : player.bodyFatPercent < 14 ? 'Athletic Defined' : 'Off-Season Full'}
          </div>
        </div>

        {/* Body Weight */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>TOTAL WEIGHT</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-slate-100">{player.bodyWeightLbs}</span>
            <span className="text-sm font-bold text-sky-400">LBS</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Height: {player.heightCm} cm
          </div>
        </div>

        {/* Vascularity Level */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>VASCULARITY RATING</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-slate-100">{vascularityScore}</span>
            <span className="text-sm font-bold text-purple-400">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Deltoid & Bicep Vein Prominence
          </div>
        </div>
      </div>

      {/* Core Attributes */}
      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-amber-400" />
          ATHLETE STAT ATTRIBUTES
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Raw Strength</span>
              <span className="text-amber-400 font-mono">{player.strength}/100</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${player.strength}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Cardio Stamina</span>
              <span className="text-sky-400 font-mono">{player.endurance}/100</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500" style={{ width: `${player.endurance}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Lifting Technique</span>
              <span className="text-emerald-400 font-mono">{player.technique}/100</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${player.technique}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Recovery Rate</span>
              <span className="text-purple-400 font-mono">{player.recoveryRate}/100</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${player.recoveryRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Muscle Group Fatigue (DOMS) Breakdown */}
      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-400" />
            MUSCLE GROUP SORENESS & DOMS (0% = Fresh, 100% = Exhausted)
          </h3>
          <span className="text-xs text-slate-400">
            Overall Fatigue: <span className="text-amber-400 font-mono font-bold">{Math.round(player.fatigue.overall)}%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {muscleGroups.map((mg) => (
            <div key={mg.name} className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>{mg.name}</span>
                <span className={`font-mono font-bold ${mg.val > 70 ? 'text-red-400' : mg.val > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {Math.round(mg.val)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${mg.color}`}
                  style={{ width: `${Math.min(100, mg.val)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hall of Records */}
      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-yellow-400" />
          PERSONAL LIFETIME RECORDS
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {[
            { label: 'Bench Press', val: `${player.personalRecords.bench_press} lbs` },
            { label: 'Back Squat', val: `${player.personalRecords.barbell_squat} lbs` },
            { label: 'Deadlift', val: `${player.personalRecords.deadlift} lbs` },
            { label: 'Incline Curls', val: `${player.personalRecords.dumbbell_curls} lbs` },
            { label: 'Lat Pulldown', val: `${player.personalRecords.lat_pulldown} lbs` },
            { label: 'Sprint Speed', val: `${player.personalRecords.treadmill_sprint} mph` },
          ].map((item) => (
            <div key={item.label} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{item.label}</div>
              <div className="font-display text-xl font-bold text-amber-400 mt-0.5">{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
