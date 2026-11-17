import React from 'react';
import { useGame } from '../context/GameContext';
import { sound } from '../audio/soundEngine';
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
  Sliders,
  Award,
  Paintbrush,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';

export const GymEmpireModal: React.FC = () => {
  const {
    player,
    upgradeGymEquipment,
    setGymMembershipFee,
    setGymInteriorStyle,
    hireTrainer,
  } = useGame();

  const empire = player.gymEmpire;
  const upgradeCost = empire.equipmentLevel * 1200;

  const interiorStyles: Array<{ id: typeof empire.interiorStyle; name: string; desc: string }> = [
    { id: 'cyber_neon', name: 'Cyber Neon Horizon', desc: 'Sleek dark matte tones with vibrant cyan & amber linear light bars.' },
    { id: 'matte_black_gold', name: 'Matte Black & Gold', desc: 'Luxury aesthetic with knurled brass hardware and leather upholstery.' },
    { id: 'industrial_concrete', name: 'Raw Industrial Iron', desc: 'Exposed concrete, heavy steel trusses, chalk dust, and bumper plates.' },
    { id: 'luxury_wood', name: 'Executive Wood & Stone', desc: 'High-end teakwood platforms, panoramic mirrors, and spa lounge.' },
  ];

  const candidateTrainers = [
    { id: 'trainer_sam', name: 'Samir "Quads" Patel', specialty: 'Hypertrophy & Posing', salary: '$450 Hire' },
    { id: 'trainer_kendra', name: 'Kendra Voss', specialty: 'Biomechanics & Powerlifting', salary: '$450 Hire' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#0c1017]/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-amber-400" />
            FITNESS EMPIRE & GYM MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400">
            Build, brand, and scale your personal fitness facility into a multi-tier world-class gym empire.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-display text-xl">
            {empire.name} (TIER {empire.tier})
          </span>
        </div>
      </div>

      {/* Top 4 Business Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Active Members */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>ACTIVE MEMBERS</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-slate-100">{empire.members}</span>
            <span className="text-xs text-emerald-400 font-semibold">+12 this week</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Capacity: 250 Members</div>
        </div>

        {/* Daily Cashflow */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>EST. DAILY CASHFLOW</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-emerald-400">
              ${Math.round(empire.members * (empire.monthlyFee / 30))}
            </span>
            <span className="text-xs text-slate-400">/ Day</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Collected each sleep cycle</div>
        </div>

        {/* Facility Cleanliness & Maintenance */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>CLEANLINESS RATING</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-slate-100">{empire.cleanliness}%</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Sanitized daily & chalk swept</div>
        </div>

        {/* Equipment Tier */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>EQUIPMENT LEVEL</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold text-slate-100">LVL {empire.equipmentLevel}</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-1">Hammer Strength & Eleiko</div>
        </div>
      </div>

      {/* Interactive Controls & Upgrades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Equipment Upgrade & Pricing */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            OPERATIONS & MEMBERSHIP PRICING
          </h3>

          {/* Monthly Fee Slider */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Monthly Membership Fee:</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">${empire.monthlyFee}/mo</span>
            </div>
            <input
              type="range"
              min="30"
              max="180"
              step="5"
              value={empire.monthlyFee}
              onChange={(e) => setGymMembershipFee(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Budget ($30)</span>
              <span>Standard ($65)</span>
              <span>Ultra Luxury ($180)</span>
            </div>
          </div>

          {/* Upgrade Equipment Button */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold text-slate-100">Upgrade Strength Equipment</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Install calibrated competition plates, custom dumbbell trees, and ISO-lateral cables.
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                ${upgradeCost}
              </span>
            </div>

            <button
              onClick={upgradeGymEquipment}
              disabled={player.money < upgradeCost}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                player.money < upgradeCost
                  ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>UPGRADE EQUIPMENT (+$45 REP, +28 MEMBERS)</span>
            </button>
          </div>
        </div>

        {/* Right: Interior Design Aesthetics */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-amber-400" />
            FACILITY INTERIOR & LIGHTING SCHEME
          </h3>

          <div className="space-y-2">
            {interiorStyles.map((style) => {
              const isSelected = empire.interiorStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => {
                    sound.playClick();
                    setGymInteriorStyle(style.id);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <span>{style.name}</span>
                      {isSelected && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{style.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hire Staff Trainers */}
          <div className="pt-2">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              HIRE PERSONAL TRAINERS
            </div>
            <div className="space-y-2">
              {candidateTrainers.map((t) => {
                const isHired = empire.trainersHired.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{t.name}</div>
                      <div className="text-[11px] text-amber-400">{t.specialty}</div>
                    </div>
                    <button
                      onClick={() => hireTrainer(t.id)}
                      disabled={isHired || player.money < 450}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isHired
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : player.money < 450
                          ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                          : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                      }`}
                    >
                      {isHired ? 'ON STAFF' : t.salary}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
