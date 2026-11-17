import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Award, ArrowUpRight, Check } from 'lucide-react';

interface Props {
  prData: {
    exercise: string;
    weight: number;
    oldPR: number;
  };
  onClose: () => void;
}

export const PRCelebrationModal: React.FC<Props> = ({ prData, onClose }) => {
  useEffect(() => {
    // Multi-stage confetti cannon burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f59e0b', '#10b981', '#38bdf8', '#fbbf24'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 md:p-8 bg-[#0c1017] border-2 border-amber-500/80 rounded-3xl shadow-2xl shadow-amber-500/20 text-center space-y-6 overflow-hidden">
        {/* Glow backdrop ring */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center shadow-xl shadow-amber-500/40 animate-bounce">
          <Trophy className="w-10 h-10 text-slate-950 stroke-[2.5]" />
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>MILESTONE BREACHED</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-100 uppercase leading-none">
            NEW PERSONAL RECORD!
          </h2>
          <p className="text-sm font-semibold text-slate-300 pt-1">
            {prData.exercise}
          </p>
        </div>

        {/* Big Weight Numbers */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center gap-6">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">PREVIOUS BEST</div>
            <div className="font-display text-2xl font-bold text-slate-400 line-through">
              {prData.oldPR} LBS
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <div className="text-[10px] font-bold text-amber-400 uppercase">NEW RECORD</div>
            <div className="font-display text-4xl font-bold text-emerald-400 leading-none">
              {prData.weight} LBS
            </div>
          </div>
        </div>

        {/* Rewards earned */}
        <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400">REPUTATION GAIN</div>
            <div className="text-amber-400 font-bold text-sm mt-0.5">+15 REP</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400">HYPERTROPHY STIMULUS</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">+MAX XP & MASS</div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-display text-2xl font-bold tracking-wider uppercase transition-all shadow-xl shadow-amber-500/25 cursor-pointer"
        >
          CLAIM GLORY & CONTINUE
        </button>
      </div>
    </div>
  );
};
