import React from 'react';
import { useGame } from '../context/GameContext';
import { CAREER_MILESTONES } from '../data/gameData';
import { sound } from '../audio/soundEngine';
import {
  Award,
  CheckCircle2,
  Lock,
  DollarSign,
  Trophy,
  Sparkles,
  Shield,
  Star,
} from 'lucide-react';

export const CareerModal: React.FC = () => {
  const { player, claimSponsorship, resetProgress } = useGame();

  const sponsorsList = [
    {
      name: 'IronCore Athletic Apparel',
      reqTier: 2,
      payout: 350,
      desc: 'Branded lifting belts, wrist wraps, and stealth compression shorts.',
    },
    {
      name: 'BioOptima Elite Nutrition',
      reqTier: 3,
      payout: 850,
      desc: 'Hydration formulas, Creapure creatine, and ultra-filtered whey isolate.',
    },
    {
      name: 'Rogue Titan Equipment',
      reqTier: 4,
      payout: 2500,
      desc: 'Signature knurled Olympic barbells and calibrated cast iron plates.',
    },
    {
      name: 'Olympus Global Sports Media',
      reqTier: 6,
      payout: 8000,
      desc: 'Worldwide magazine covers, documentary series, and signature footwear line.',
    },
  ];

  const achievementsList = [
    { id: 'first_rep', title: 'First Rep Completed', desc: 'Step into the gym and complete your first repetition.', unlocked: player.totalRepsCompleted > 0 },
    { id: 'two_plates', title: 'Two Plates Club (225 lbs)', desc: 'Bench press or squat at least 225 lbs.', unlocked: (player.personalRecords.bench_press >= 225 || player.personalRecords.barbell_squat >= 225) },
    { id: 'three_plates', title: 'Three Plates Club (315 lbs)', desc: 'Deadlift or squat 315 lbs with clean lockout.', unlocked: (player.personalRecords.deadlift >= 315 || player.personalRecords.barbell_squat >= 315) },
    { id: 'thousand_total', title: '1,000 Lb Club Member', desc: 'Combined Bench, Squat, and Deadlift total exceeds 1,000 lbs.', unlocked: ((player.personalRecords.bench_press + player.personalRecords.barbell_squat + player.personalRecords.deadlift) >= 1000) },
    { id: 'fifty_reps', title: 'Iron Discipline (50 Reps)', desc: 'Complete 50 total clean repetitions across any exercises.', unlocked: player.totalRepsCompleted >= 50 },
    { id: 'gym_owner', title: 'Gym Franchise Owner', desc: 'Purchase and manage your personal fitness facility.', unlocked: player.gymEmpire.owned || player.careerTier >= 4 },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#0c1017]/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            CAREER TIERS, SPONSORS & ACHIEVEMENTS
          </h2>
          <p className="text-xs text-slate-400">
            Progress through 7 legendary athletic tiers from rookie lifter to world-renowned fitness icon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-display text-lg">
            CURRENT: TIER {player.careerTier} TITAN
          </span>
        </div>
      </div>

      {/* 7-Tier Career Road map */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          7-TIER ATHLETIC CAREER ROADMAP
        </h3>

        <div className="space-y-2">
          {CAREER_MILESTONES.map((tier) => {
            const isCompleted = player.careerTier > tier.tier;
            const isCurrent = player.careerTier === tier.tier;
            const isLocked = player.careerTier < tier.tier;

            return (
              <div
                key={tier.tier}
                className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                    : isCompleted
                    ? 'bg-slate-900/80 border-slate-800 opacity-90'
                    : 'bg-slate-950/40 border-slate-800/40 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-display text-xl font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tier.tier}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{tier.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                          ACTIVE TIER
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{tier.subtitle}</p>
                  </div>
                </div>

                {/* Requirements & Rewards */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                    Req: Lvl {tier.reqLevel}, {tier.reqRep} Rep
                  </span>
                  <div className="flex gap-1.5">
                    {tier.rewards.map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-slate-800 text-amber-400/90 text-[11px] font-medium"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand Endorsement Sponsorship Deals */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          BRAND ENDORSEMENT CONTRACTS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sponsorsList.map((sponsor) => {
            const isClaimed = player.sponsors.includes(sponsor.name);
            const isEligible = player.careerTier >= sponsor.reqTier;

            return (
              <div
                key={sponsor.name}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100">{sponsor.name}</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      ${sponsor.payout.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{sponsor.desc}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500">Requires Career Tier {sponsor.reqTier}</span>
                  <button
                    onClick={() => claimSponsorship(sponsor.name, sponsor.payout)}
                    disabled={isClaimed || !isEligible}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isClaimed
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : isEligible
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    {isClaimed ? 'SIGNED & ACTIVE' : isEligible ? 'ACCEPT CONTRACT' : 'LOCKED'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hall of Achievements */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          LIFETIME MILESTONES & ACHIEVEMENTS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {achievementsList.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-emerald-500/40'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-60'
              }`}
            >
              {ach.unlocked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className={`text-xs font-bold ${ach.unlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                  {ach.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{ach.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Reset Option */}
      <div className="pt-4 border-t border-slate-800/80 flex justify-end">
        <button
          onClick={resetProgress}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
        >
          Reset Career to Day 1
        </button>
      </div>
    </div>
  );
};
