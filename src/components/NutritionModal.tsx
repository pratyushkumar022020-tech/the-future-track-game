import React from 'react';
import { useGame } from '../context/GameContext';
import { MEALS } from '../data/gameData';
import { MealItem } from '../types/game';
import { sound } from '../audio/soundEngine';
import {
  Utensils,
  Droplets,
  Flame,
  Zap,
  Moon,
  Plus,
  Check,
  ShoppingBag,
  HeartPulse,
} from 'lucide-react';

export const NutritionModal: React.FC = () => {
  const { player, buyMeal, restAndSleep } = useGame();

  const proteinGoal = Math.round(player.bodyWeightLbs * 1.0); // 1g per lb
  const calorieGoal = 3200;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#0c1017]/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-wide text-slate-100 uppercase flex items-center gap-2.5">
            <Utensils className="w-6 h-6 text-amber-400" />
            FUEL BAR, SUPPLEMENTS & MEAL PREP
          </h2>
          <p className="text-xs text-slate-400">
            Fuel protein synthesis, replenish glycogen, and hydrate for optimal compound strength output.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-emerald-400 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            CASH: ${player.money.toLocaleString()}
          </div>
          <button
            onClick={restAndSleep}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>8-HR SLEEP REST</span>
          </button>
        </div>
      </div>

      {/* Daily Macro Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Protein */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>PROTEIN TARGET</span>
            <span className="font-mono text-amber-400 font-bold">
              {player.proteinConsumed}g / {proteinGoal}g
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (player.proteinConsumed / proteinGoal) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">
            {player.proteinConsumed >= proteinGoal ? 'Optimal Muscle Protein Synthesis' : 'Under Target (Slow Recovery)'}
          </div>
        </div>

        {/* Calories */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>CALORIES</span>
            <span className="font-mono text-emerald-400 font-bold">
              {player.caloriesConsumed} / {calorieGoal} kcal
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (player.caloriesConsumed / calorieGoal) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">
            {player.caloriesConsumed >= calorieGoal ? 'Lean Hypertrophy Surplus' : 'Deficit / Cutting Mode'}
          </div>
        </div>

        {/* Water */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>HYDRATION</span>
            <span className="font-mono text-sky-400 font-bold">
              {player.waterLiters}L / 4.0L
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (player.waterLiters / 4) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500">
            Current Level: {player.hydration}%
          </div>
        </div>

        {/* Carbs & Fats */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-400 mb-1">MACRO BALANCE</div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-orange-400 font-bold">Carbs: {player.carbsConsumed}g</span>
            <span className="text-yellow-400 font-bold">Fats: {player.fatsConsumed}g</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Energy Reserves: {player.energy}%</div>
        </div>
      </div>

      {/* Fuel Bar Store Menu */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          NUTRITION COUNTER & FUEL BAR MENU
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MEALS.map((meal) => (
            <div
              key={meal.id}
              className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                    {meal.category}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    ${meal.cost}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-100 leading-snug">{meal.name}</div>
                <div className="text-[11px] text-emerald-400/90 mt-1 font-medium">{meal.bonus}</div>
              </div>

              {/* Macro row */}
              <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950 rounded-lg text-center text-[11px] font-mono">
                <div>
                  <div className="text-slate-500 text-[9px]">CAL</div>
                  <div className="font-bold text-slate-200">{meal.calories}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px]">PROTEIN</div>
                  <div className="font-bold text-amber-400">{meal.protein}g</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[9px]">CARBS</div>
                  <div className="font-bold text-sky-400">{meal.carbs}g</div>
                </div>
              </div>

              <button
                onClick={() => buyMeal(meal)}
                disabled={player.money < meal.cost}
                className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  player.money < meal.cost
                    ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>PURCHASE & CONSUME (${meal.cost})</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
