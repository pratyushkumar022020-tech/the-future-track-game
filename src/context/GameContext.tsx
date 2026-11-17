import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import { PlayerStats, ExerciseType, TimeOfDay, MealItem, Competition, NPC } from '../types/game';
import { INITIAL_PLAYER_STATS, EXERCISES, NPCS, MEALS, COMPETITIONS, CAREER_MILESTONES } from '../data/gameData';
import { sound } from '../audio/soundEngine';

interface GameContextType {
  player: PlayerStats;
  currentExerciseId: ExerciseType;
  setCurrentExerciseId: (id: ExerciseType) => void;
  selectedWeight: number;
  setSelectedWeight: (w: number) => void;
  npcs: NPC[];
  lastPR: { exercise: string; weight: number; oldPR: number } | null;
  clearLastPR: () => void;
  activeNotification: string | null;
  setNotification: (msg: string | null) => void;

  // Actions
  recordRep: (exercise: ExerciseType, weight: number, formAccuracy: number) => boolean;
  buyMeal: (meal: MealItem) => boolean;
  restAndSleep: () => void;
  enterCompetition: (comp: Competition) => { won: boolean; message: string; playerScore: number; rivalScore: number };
  hireTrainer: (trainerId: string) => boolean;
  upgradeGymEquipment: () => boolean;
  setGymMembershipFee: (fee: number) => void;
  setGymInteriorStyle: (style: PlayerStats['gymEmpire']['interiorStyle']) => void;
  claimSponsorship: (sponsorName: string, moneyReward: number) => void;
  resetProgress: () => void;
  interactNPC: (npcId: string) => string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = 'ironverse_game_save_v1';

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, startTransition] = useTransition();
  const [player, setPlayer] = useState<PlayerStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...INITIAL_PLAYER_STATS, ...JSON.parse(saved) };
        } catch {
          // fallback to initial
        }
      }
    }
    return INITIAL_PLAYER_STATS;
  });

  const [currentExerciseId, setCurrentExerciseId] = useState<ExerciseType>('bench_press');
  const [selectedWeight, setSelectedWeight] = useState<number>(135);
  const [npcs, setNpcs] = useState<NPC[]>(NPCS);
  const [lastPR, setLastPR] = useState<{ exercise: string; weight: number; oldPR: number } | null>(null);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Sync selected weight when changing exercise
  useEffect(() => {
    const ex = EXERCISES.find((e) => e.id === currentExerciseId);
    if (ex) {
      setSelectedWeight(ex.defaultWeightLbs);
    }
  }, [currentExerciseId]);

  // Save on state change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    }
  }, [player]);

  const showNotification = useCallback((msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  const clearLastPR = useCallback(() => {
    setLastPR(null);
  }, []);

  // Biomechanics rep recorder
  const recordRep = useCallback(
    (exercise: ExerciseType, weight: number, formAccuracy: number): boolean => {
      let isNewPR = false;
      const exDef = EXERCISES.find((e) => e.id === exercise);
      const oldPR = player.personalRecords[exercise] || 0;

      if (weight > oldPR) {
        isNewPR = true;
        setLastPR({
          exercise: exDef ? exDef.name : exercise,
          weight,
          oldPR,
        });
        sound.playRepSuccess(true);
        sound.playCheer();
      } else {
        sound.playRepSuccess(false);
      }

      setPlayer((prev) => {
        const xpEarned = Math.round((weight * 0.1 + formAccuracy * 0.2) * 1.5);
        let newXp = prev.xp + xpEarned;
        let newLevel = prev.level;
        let newXpToNext = prev.xpToNextLevel;

        if (newXp >= newXpToNext) {
          newLevel += 1;
          newXp -= newXpToNext;
          newXpToNext = Math.round(newXpToNext * 1.35);
          showNotification(`LEVEL UP! You are now Level ${newLevel} Titan!`);
        }

        // Muscle hypertrophy: slight mass gain, slight fat burn
        const massGain = 0.015 * (formAccuracy / 100);
        const fatLoss = 0.008 * (formAccuracy / 100);

        // Attribute updates
        const newStrength = Math.min(100, prev.strength + 0.08);
        const newEndurance = Math.min(100, prev.endurance + (exercise === 'treadmill_sprint' ? 0.25 : 0.05));
        const newTechnique = Math.min(100, prev.technique + formAccuracy * 0.001);

        // Fatigue accumulation for target muscles
        const newFatigue = { ...prev.fatigue };
        if (exDef) {
          exDef.targetMuscles.forEach((m) => {
            if (m in newFatigue) {
              newFatigue[m] = Math.min(100, newFatigue[m] + 6.5);
            }
          });
        }
        newFatigue.overall = Math.min(100, newFatigue.overall + 4);

        // Energy & Hydration
        const newEnergy = Math.max(0, prev.energy - 4);
        const newHydration = Math.max(0, prev.hydration - 3);

        // Personal records
        const newPRs = { ...prev.personalRecords };
        if (weight > (newPRs[exercise] || 0)) {
          newPRs[exercise] = weight;
        }

        // Reputation
        const newRep = prev.reputation + (isNewPR ? 15 : 2);
        const newAthleticRep = prev.athleticRep + (isNewPR ? 10 : 1);

        // Career tier evaluation
        let newCareerTier = prev.careerTier;
        const nextMilestone = CAREER_MILESTONES.find((m) => m.tier === newCareerTier + 1);
        if (nextMilestone && newLevel >= nextMilestone.reqLevel && newRep >= nextMilestone.reqRep) {
          newCareerTier += 1;
          showNotification(`CAREER ADVANCEMENT: Promoted to ${nextMilestone.title}!`);
        }

        return {
          ...prev,
          level: newLevel,
          xp: newXp,
          xpToNextLevel: newXpToNext,
          muscleMassKg: Number((prev.muscleMassKg + massGain).toFixed(3)),
          bodyFatPercent: Math.max(7.5, Number((prev.bodyFatPercent - fatLoss).toFixed(2))),
          bodyWeightLbs: Math.round(prev.bodyWeightLbs + massGain * 2.2 - fatLoss * 0.8),
          strength: Number(newStrength.toFixed(1)),
          endurance: Number(newEndurance.toFixed(1)),
          technique: Number(newTechnique.toFixed(1)),
          fatigue: newFatigue,
          energy: newEnergy,
          hydration: newHydration,
          personalRecords: newPRs,
          totalRepsCompleted: prev.totalRepsCompleted + 1,
          totalWeightLiftedLbs: prev.totalWeightLiftedLbs + weight,
          reputation: newRep,
          athleticRep: newAthleticRep,
          careerTier: newCareerTier,
        };
      });

      return isNewPR;
    },
    [player.personalRecords, showNotification]
  );

  // Buy Meal / Supplements
  const buyMeal = useCallback(
    (meal: MealItem): boolean => {
      if (player.money < meal.cost) {
        showNotification("Not enough cash! Win competitions or work to earn money.");
        return false;
      }

      sound.playClick();
      setPlayer((prev) => {
        const newMoney = prev.money - meal.cost;
        const newEnergy = Math.min(100, prev.energy + 25);
        const newHydration = Math.min(100, prev.hydration + (meal.category === 'shake' ? 30 : 15));

        return {
          ...prev,
          money: newMoney,
          energy: newEnergy,
          hydration: newHydration,
          caloriesConsumed: prev.caloriesConsumed + meal.calories,
          proteinConsumed: prev.proteinConsumed + meal.protein,
          carbsConsumed: prev.carbsConsumed + meal.carbs,
          fatsConsumed: prev.fatsConsumed + meal.fats,
          waterLiters: Number((prev.waterLiters + (meal.category === 'shake' ? 0.6 : 0.3)).toFixed(1)),
        };
      });

      showNotification(`Consumed ${meal.name} (+${meal.protein}g Protein)`);
      return true;
    },
    [player.money, showNotification]
  );

  // Rest & Advance Day (8hr Sleep cycle)
  const restAndSleep = useCallback(() => {
    sound.playClick();
    setPlayer((prev) => {
      // Recovery based on protein intake and recovery rate
      const proteinMultiplier = prev.proteinConsumed >= 120 ? 1.4 : 0.8;
      const recoveryAmount = 45 * (prev.recoveryRate / 50) * proteinMultiplier;

      // Muscle gain bonus if protein goal met
      const nightGain = prev.proteinConsumed >= 140 ? 0.04 : 0.01;

      // Passive income from Gym Empire
      let dailyIncome = 0;
      if (prev.gymEmpire.owned) {
        dailyIncome = prev.gymEmpire.members * (prev.gymEmpire.monthlyFee / 30);
      }

      const nextDay = prev.day + 1;

      return {
        ...prev,
        day: nextDay,
        timeOfDay: 'morning',
        energy: 100,
        hydration: 85,
        fatigue: {
          chest: Math.max(0, prev.fatigue.chest - recoveryAmount),
          back: Math.max(0, prev.fatigue.back - recoveryAmount),
          legs: Math.max(0, prev.fatigue.legs - recoveryAmount),
          arms: Math.max(0, prev.fatigue.arms - recoveryAmount),
          shoulders: Math.max(0, prev.fatigue.shoulders - recoveryAmount),
          abs: Math.max(0, prev.fatigue.abs - recoveryAmount),
          overall: Math.max(0, prev.fatigue.overall - recoveryAmount * 1.2),
        },
        muscleMassKg: Number((prev.muscleMassKg + nightGain).toFixed(3)),
        money: Math.round(prev.money + dailyIncome),
        caloriesConsumed: 0,
        proteinConsumed: 0,
        carbsConsumed: 0,
        fatsConsumed: 0,
      };
    });

    showNotification("Restful 8-Hour Sleep completed! Muscles repaired and daily recovery applied.");
  }, [showNotification]);

  // Enter Competition
  const enterCompetition = useCallback(
    (comp: Competition) => {
      if (player.money < comp.entryFee) {
        return { won: false, message: 'Insufficient funds for registration fee.', playerScore: 0, rivalScore: 0 };
      }

      // Deduct entry fee
      setPlayer((prev) => ({ ...prev, money: prev.money - comp.entryFee }));

      const rival = npcs.find((n) => n.id === comp.rivalParticipantId) || npcs[0];
      const rivalScore = rival.stats.bench + rival.stats.squat + rival.stats.deadlift;

      const playerBigThree =
        player.personalRecords.bench_press +
        player.personalRecords.barbell_squat +
        player.personalRecords.deadlift;

      // Form technique & fatigue penalties
      const fatiguePenalty = player.fatigue.overall * 2;
      const playerScore = Math.round(playerBigThree * (player.technique / 40) - fatiguePenalty);

      const won = playerScore >= rivalScore * 0.88;

      if (won) {
        sound.playCheer();
        sound.playRepSuccess(true);
        setPlayer((prev) => ({
          ...prev,
          money: prev.money + comp.prizeMoney,
          reputation: prev.reputation + comp.reputationReward,
          athleticRep: prev.athleticRep + Math.round(comp.reputationReward * 0.6),
        }));

        setNpcs((prev) =>
          prev.map((n) =>
            n.id === rival.id ? { ...n, relationship: Math.min(100, n.relationship + 25), beatenInComp: true } : n
          )
        );

        showNotification(`CHAMPION! You placed 1st in ${comp.name}! Won $${comp.prizeMoney}`);
        return {
          won: true,
          message: `Dominant victory! You scored ${playerScore} points against ${rival.name}'s ${rivalScore}.`,
          playerScore,
          rivalScore,
        };
      } else {
        sound.playMetalClank(true);
        showNotification(`2nd Place in ${comp.name}. ${rival.name} edged you out. Train harder!`);
        return {
          won: false,
          message: `${rival.name} pulled ahead with ${rivalScore} pts vs your ${playerScore} pts. Improve your Max PRs and rest DOMS before retrying!`,
          playerScore,
          rivalScore,
        };
      }
    },
    [player.money, player.personalRecords, player.fatigue.overall, player.technique, npcs, showNotification]
  );

  // Gym Empire actions
  const upgradeGymEquipment = useCallback(() => {
    const cost = player.gymEmpire.equipmentLevel * 1200;
    if (player.money < cost) {
      showNotification(`Upgrade requires $${cost}!`);
      return false;
    }

    sound.playRepSuccess();
    setPlayer((prev) => ({
      ...prev,
      money: prev.money - cost,
      gymEmpire: {
        ...prev.gymEmpire,
        equipmentLevel: prev.gymEmpire.equipmentLevel + 1,
        members: prev.gymEmpire.members + 28,
        cleanliness: Math.min(100, prev.gymEmpire.cleanliness + 10),
      },
      reputation: prev.reputation + 45,
    }));
    showNotification("Facility Upgraded! High-grade Olympic bumper plates & ISO-lateral machines installed.");
    return true;
  }, [player.gymEmpire.equipmentLevel, player.money, showNotification]);

  const hireTrainer = useCallback(
    (trainerId: string) => {
      const cost = 450;
      if (player.money < cost) {
        showNotification("Need $450 to hire staff trainer!");
        return false;
      }
      setPlayer((prev) => ({
        ...prev,
        money: prev.money - cost,
        gymEmpire: {
          ...prev.gymEmpire,
          trainersHired: [...prev.gymEmpire.trainersHired, trainerId],
          members: prev.gymEmpire.members + 35,
        },
      }));
      showNotification(`Hired trainer to your staff! Member satisfaction surged.`);
      return true;
    },
    [player.money, showNotification]
  );

  const setGymMembershipFee = useCallback((fee: number) => {
    setPlayer((prev) => ({
      ...prev,
      gymEmpire: { ...prev.gymEmpire, monthlyFee: fee },
    }));
  }, []);

  const setGymInteriorStyle = useCallback((style: PlayerStats['gymEmpire']['interiorStyle']) => {
    setPlayer((prev) => ({
      ...prev,
      gymEmpire: { ...prev.gymEmpire, interiorStyle: style },
    }));
  }, []);

  const claimSponsorship = useCallback(
    (sponsorName: string, moneyReward: number) => {
      sound.playRepSuccess(true);
      setPlayer((prev) => ({
        ...prev,
        money: prev.money + moneyReward,
        sponsors: [...prev.sponsors, sponsorName],
        reputation: prev.reputation + 50,
      }));
      showNotification(`Signed contract with ${sponsorName}! Received $${moneyReward} endorsement.`);
    },
    [showNotification]
  );

  const interactNPC = useCallback(
    (npcId: string) => {
      const npc = npcs.find((n) => n.id === npcId);
      if (!npc) return "Hello lifter!";
      sound.playClick();
      const randomLine = npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)];
      setNpcs((prev) =>
        prev.map((n) => (n.id === npcId ? { ...n, relationship: Math.min(100, n.relationship + 5) } : n))
      );
      return randomLine;
    },
    [npcs]
  );

  const resetProgress = useCallback(() => {
    if (confirm("Reset career to day 1? All progress will be reset.")) {
      localStorage.removeItem(STORAGE_KEY);
      setPlayer(INITIAL_PLAYER_STATS);
      showNotification("Career reset to Day 1 Beginner.");
    }
  }, [showNotification]);

  return (
    <GameContext.Provider
      value={{
        player,
        currentExerciseId,
        setCurrentExerciseId,
        selectedWeight,
        setSelectedWeight,
        npcs,
        lastPR,
        clearLastPR,
        activeNotification,
        setNotification: setActiveNotification,
        recordRep,
        buyMeal,
        restAndSleep,
        enterCompetition,
        hireTrainer,
        upgradeGymEquipment,
        setGymMembershipFee,
        setGymInteriorStyle,
        claimSponsorship,
        resetProgress,
        interactNPC,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
