import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { EXERCISES } from '../data/gameData';
import { ExerciseType } from '../types/game';
import { sound } from '../audio/soundEngine';
import {
  Dumbbell,
  Play,
  RotateCcw,
  Sparkles,
  Wind,
  Activity,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sliders,
  Maximize2,
} from 'lucide-react';

interface Props {
  onRepProgressUpdate: (progress: number, isStrain: boolean) => void;
  onExerciseChange: (id: ExerciseType) => void;
  onWeightChange: (weight: number) => void;
}

export const WorkoutHUD: React.FC<Props> = ({
  onRepProgressUpdate,
  onExerciseChange,
  onWeightChange,
}) => {
  const {
    player,
    currentExerciseId,
    setCurrentExerciseId,
    selectedWeight,
    setSelectedWeight,
    recordRep,
  } = useGame();

  const currentExercise = EXERCISES.find((e) => e.id === currentExerciseId) || EXERCISES[0];

  // Lifting mechanics state
  const [repPhase, setRepPhase] = useState<'idle' | 'lowering' | 'bottom_pause' | 'driving' | 'completed' | 'failed'>('idle');
  const [barPosition, setBarPosition] = useState<number>(0); // 0 (top lockout) to 100 (chest touch/deep hole)
  const [balanceOffset, setBalanceOffset] = useState<number>(0); // -50 to +50 (0 is perfect balance)
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'brace' | 'exhale' | 'ready'>('ready');
  const [currentSetReps, setCurrentSetReps] = useState<number>(0);
  const [currentSetNumber, setCurrentSetNumber] = useState<number>(1);
  const [staminaStrain, setStaminaStrain] = useState<boolean>(false);
  const [formScoreFeedback, setFormScoreFeedback] = useState<string | null>(null);
  const [restTimer, setRestTimer] = useState<number>(0);

  const animationFrameRef = useRef<number | null>(null);
  const descentStartTime = useRef<number>(0);

  // Sync weight changes
  const handleWeightSelect = (weight: number) => {
    sound.playMetalClank(weight >= 225);
    setSelectedWeight(weight);
    onWeightChange(weight);
  };

  const handleExerciseSelect = (id: ExerciseType) => {
    sound.playClick();
    setCurrentExerciseId(id);
    onExerciseChange(id);
    setRepPhase('idle');
    setBarPosition(0);
    setCurrentSetReps(0);
    onRepProgressUpdate(0, false);
  };

  // Rest timer countdown
  useEffect(() => {
    if (restTimer > 0) {
      const timer = setInterval(() => {
        setRestTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [restTimer]);

  // Handle keyboard shortcuts (W/S or Up/Down for barbell drive, A/D for balance, Space for drive)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 's' || e.key === 'ArrowDown') {
        startDescent();
      } else if (e.key === 'w' || e.key === 'ArrowUp' || e.key === ' ') {
        startConcentricDrive();
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        setBalanceOffset((prev) => Math.max(-40, prev - 12));
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        setBalanceOffset((prev) => Math.min(40, prev + 12));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'ArrowDown') {
        // stopped lowering
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [repPhase, barPosition, selectedWeight]);

  // Interactive Descent
  const startDescent = useCallback(() => {
    if (repPhase === 'driving' || repPhase === 'lowering') return;

    sound.playBreathing(true);
    setBreathingPhase('inhale');
    setRepPhase('lowering');
    descentStartTime.current = Date.now();

    // Check strain vs player strength
    const isHeavy = selectedWeight > (player.personalRecords[currentExerciseId] || 135) * 0.9;
    setStaminaStrain(isHeavy || currentSetReps >= 6);
  }, [repPhase, selectedWeight, player.personalRecords, currentExerciseId, currentSetReps]);

  // Lowering loop
  useEffect(() => {
    if (repPhase === 'lowering') {
      const step = () => {
        setBarPosition((prev) => {
          const next = prev + 2.2;
          onRepProgressUpdate(next / 100, staminaStrain);

          // Random slight bar wobble
          setBalanceOffset((b) => b + (Math.random() - 0.5) * 4);

          if (next >= 95) {
            // Reached chest touch / deep squat hole!
            setRepPhase('bottom_pause');
            setBreathingPhase('brace');
            sound.playClick();
            return 100;
          }
          return next;
        });
        animationFrameRef.current = requestAnimationFrame(step);
      };
      animationFrameRef.current = requestAnimationFrame(step);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [repPhase, onRepProgressUpdate, staminaStrain]);

  // Concentric Drive (Pushing back up to lockout)
  const startConcentricDrive = useCallback(() => {
    if (repPhase !== 'bottom_pause' && barPosition < 50) return;

    sound.playBreathing(false);
    setBreathingPhase('exhale');
    setRepPhase('driving');

    // Calculate drive speed based on player strength vs weight
    const strengthRatio = (player.strength + 20) / (selectedWeight * 0.15 + 10);
    const driveSpeed = Math.max(1.2, Math.min(3.8, strengthRatio * 2.0));

    if (staminaStrain) {
      sound.playHeartbeat();
    }

    const driveLoop = () => {
      setBarPosition((prev) => {
        const next = prev - driveSpeed;
        onRepProgressUpdate(Math.max(0, next) / 100, staminaStrain);

        // Adjust balance
        setBalanceOffset((b) => b * 0.85);

        if (next <= 2) {
          // Lockout successful!
          completeRep();
          return 0;
        }
        animationFrameRef.current = requestAnimationFrame(driveLoop);
        return next;
      });
    };
    animationFrameRef.current = requestAnimationFrame(driveLoop);
  }, [repPhase, barPosition, player.strength, selectedWeight, staminaStrain, onRepProgressUpdate]);

  // Complete Rep evaluation
  const completeRep = () => {
    setRepPhase('completed');
    setBreathingPhase('ready');
    onRepProgressUpdate(0, false);

    // Calculate form accuracy
    const balancePenalty = Math.abs(balanceOffset);
    const accuracy = Math.round(Math.max(75, 100 - balancePenalty * 0.4));

    recordRep(currentExerciseId, selectedWeight, accuracy);
    setCurrentSetReps((r) => r + 1);

    if (accuracy >= 95) {
      setFormScoreFeedback(`PERFECT FORM (${accuracy}%) - Clean lockouts & core brace!`);
    } else if (accuracy >= 85) {
      setFormScoreFeedback(`GREAT REP (${accuracy}%) - Minor bar wobble, solid drive.`);
    } else {
      setFormScoreFeedback(`STAGGERED REP (${accuracy}%) - Watch balance bar drift.`);
    }

    setTimeout(() => {
      setRepPhase('idle');
      setFormScoreFeedback(null);
    }, 1200);
  };

  // Plate calculation
  const barWeight = 45;
  const plateWeightPerSide = Math.max(0, (selectedWeight - barWeight) / 2);
  const num45s = Math.floor(plateWeightPerSide / 45);
  const remainderAfter45s = plateWeightPerSide % 45;
  const num25s = Math.floor(remainderAfter45s / 25);
  const num10s = Math.floor((remainderAfter45s % 25) / 10);

  return (
    <div className="flex flex-col gap-3 w-full max-w-6xl mx-auto pointer-events-auto select-none">
      {/* Exercise Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#0e131d]/90 backdrop-blur-md rounded-xl border border-slate-800 scrollbar-none shadow-xl">
        {EXERCISES.map((ex) => {
          const isSelected = ex.id === currentExerciseId;
          const personalRecord = player.personalRecords[ex.id] || 0;
          return (
            <button
              key={ex.id}
              onClick={() => handleExerciseSelect(ex.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{ex.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-amber-400'}`}>
                PR: {personalRecord} lbs
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Biomechanics HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Weight Plate Loader & Specs (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0d121c]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">RACKED WEIGHT</span>
              <span className="text-xs font-mono text-emerald-400">
                {selectedWeight > (player.personalRecords[currentExerciseId] || 0) ? '🔥 PR ATTEMPT' : 'TRAINING LOAD'}
              </span>
            </div>

            {/* Huge Weight Number */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display text-5xl font-bold text-slate-100 tracking-tight leading-none">
                {selectedWeight}
              </span>
              <span className="text-lg font-bold text-amber-400 font-display">LBS</span>
              <span className="text-xs text-slate-500 font-mono ml-auto">
                (~{Math.round(selectedWeight * 0.453592)} KG)
              </span>
            </div>

            {/* Visual Plate Breakdown */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 mb-4">
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>BARBELL LOADING (Per Side)</span>
                <span className="font-mono text-slate-300">{plateWeightPerSide} lbs/side</span>
              </div>
              <div className="flex items-center gap-1.5 h-12 px-2 bg-slate-900/80 rounded-lg border border-slate-800 overflow-x-auto">
                {/* Barbell sleeve */}
                <div className="w-4 h-3 bg-slate-400 rounded-l" title="45lb Olympic Bar" />
                {Array.from({ length: num45s }).map((_, i) => (
                  <div
                    key={`45-${i}`}
                    className="w-4 h-10 bg-blue-600 rounded-sm flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                    title="45 lb plate"
                  >
                    45
                  </div>
                ))}
                {Array.from({ length: num25s }).map((_, i) => (
                  <div
                    key={`25-${i}`}
                    className="w-3.5 h-8 bg-emerald-600 rounded-sm flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                    title="25 lb plate"
                  >
                    25
                  </div>
                ))}
                {Array.from({ length: num10s }).map((_, i) => (
                  <div
                    key={`10-${i}`}
                    className="w-3 h-6 bg-amber-600 rounded-sm flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                    title="10 lb plate"
                  >
                    10
                  </div>
                ))}
                {plateWeightPerSide === 0 && (
                  <span className="text-[11px] text-slate-500 italic pl-1">Empty Bar (45 lbs)</span>
                )}
              </div>
            </div>

            {/* Quick Weight Plate Presets */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {currentExercise.availableWeights.map((w) => (
                <button
                  key={w}
                  onClick={() => handleWeightSelect(w)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    w === selectedWeight
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {w}#
                </button>
              ))}
            </div>
          </div>

          {/* Form Technique Coaching Cue */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COACH TECHNIQUE CUE</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {currentExercise.techniqueCue}
            </p>
          </div>
        </div>

        {/* Center/Right: Interactive Biomechanical Lift Controller (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0d121c]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-2xl">
          {/* Header Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                SET <span className="text-amber-400 font-mono text-sm">{currentSetNumber}</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
                REPS <span className="text-emerald-400 font-mono text-sm">{currentSetReps}</span>
              </div>
              {staminaStrain && (
                <div className="flex items-center gap-1 text-xs text-red-400 font-bold animate-pulse">
                  <Flame className="w-4 h-4 fill-red-400 text-red-400" />
                  <span>MAX EFFORT STRAIN!</span>
                </div>
              )}
            </div>

            {/* Breathing State Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Breathing:</span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                  breathingPhase === 'inhale'
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                    : breathingPhase === 'brace'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : breathingPhase === 'exhale'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span className="uppercase text-[10px] tracking-wider font-mono">
                  {breathingPhase === 'brace' ? 'VALSALVA BRACE' : breathingPhase}
                </span>
              </div>
            </div>
          </div>

          {/* Biomechanics Visualizer (Bar trajectory & Balance meter) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {/* Range of Motion (ROM) Trajectory Bar */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
                <span>RANGE OF MOTION (ROM)</span>
                <span className="font-mono text-amber-400">{Math.round(barPosition)}% DEPTH</span>
              </div>

              {/* Vertical Trajectory Track */}
              <div className="relative w-full h-20 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center px-4">
                {/* Green Sweet Spot Zone (Parallel / Chest Touch) */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-24 bg-emerald-500/20 border-l border-emerald-500/50 flex items-center justify-center text-[10px] font-bold text-emerald-400"
                  style={{ left: '75%' }}
                >
                  SWEET SPOT
                </div>

                {/* Moving Barbell Indicator */}
                <div
                  className={`absolute h-10 w-2.5 rounded-full transition-all duration-75 shadow-lg ${
                    barPosition >= 85
                      ? 'bg-emerald-400 shadow-emerald-500/50'
                      : barPosition > 20
                      ? 'bg-amber-400 shadow-amber-500/50'
                      : 'bg-slate-300'
                  }`}
                  style={{ left: `${Math.min(96, Math.max(2, barPosition))}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-2">
                <span>LOCKOUT (0%)</span>
                <span>MID-WAY</span>
                <span className="text-emerald-400 font-bold">CHEST / DEPTH (100%)</span>
              </div>
            </div>

            {/* Horizontal Bar Balance Stabilizer */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
                <span>LATERAL BALANCE STABILIZER</span>
                <span className={`font-mono ${Math.abs(balanceOffset) > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {Math.abs(balanceOffset) < 10 ? 'BALANCED' : balanceOffset > 0 ? 'TILT RIGHT' : 'TILT LEFT'}
                </span>
              </div>

              {/* Horizontal Balance Track */}
              <div className="relative w-full h-20 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                {/* Center target zone */}
                <div className="w-16 h-full bg-emerald-500/20 border-x border-emerald-500/40 flex items-center justify-center" />
                <div className="absolute w-0.5 h-full bg-slate-600" />

                {/* Bubble */}
                <div
                  className={`absolute w-7 h-7 rounded-full transition-all duration-75 flex items-center justify-center text-[10px] font-bold shadow-lg ${
                    Math.abs(balanceOffset) < 15
                      ? 'bg-emerald-400 text-slate-950 shadow-emerald-500/50'
                      : 'bg-red-500 text-white shadow-red-500/50 animate-pulse'
                  }`}
                  style={{ transform: `translateX(${balanceOffset * 2.5}px)` }}
                >
                  ●
                </div>
              </div>

              <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-2">
                <span>[A] TILT LEFT</span>
                <span className="text-emerald-400 font-bold">CENTER (100% POWER)</span>
                <span>[D] TILT RIGHT</span>
              </div>
            </div>
          </div>

          {/* Real-Time Form Accuracy / Feedback banner */}
          {formScoreFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>{formScoreFeedback}</span>
            </div>
          )}

          {/* Interactive Control Action Bar (S / W or Touch Buttons) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800/80">
            {/* Step 1: Lower weight / Eccentric Descent button */}
            <button
              onMouseDown={startDescent}
              onTouchStart={startDescent}
              disabled={repPhase === 'lowering' || repPhase === 'driving'}
              className={`flex-1 w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                repPhase === 'lowering'
                  ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
              }`}
            >
              <Play className="w-4 h-4 rotate-90" />
              <span>1. LOWER BAR [S / ↓]</span>
            </button>

            {/* Step 2: Explosive Drive / Concentric Push button */}
            <button
              onClick={startConcentricDrive}
              disabled={barPosition < 40 || repPhase === 'driving'}
              className={`flex-1 w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                barPosition >= 90
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 ring-4 ring-emerald-500/40 animate-pulse-glow'
                  : barPosition > 40
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 -rotate-90" />
              <span>2. EXPLOSIVE DRIVE [W / SPACE]</span>
            </button>

            {/* Rest & Complete Set */}
            <button
              onClick={() => {
                sound.playClick();
                setCurrentSetNumber((s) => s + 1);
                setCurrentSetReps(0);
                setRestTimer(60);
              }}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>{restTimer > 0 ? `RESTING (${restTimer}s)` : 'REST SET'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
