export type MuscleGroup = 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'abs';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type ExerciseType =
  | 'bench_press'
  | 'barbell_squat'
  | 'deadlift'
  | 'dumbbell_curls'
  | 'lat_pulldown'
  | 'treadmill_sprint';

export interface ExerciseDef {
  id: ExerciseType;
  name: string;
  targetMuscles: MuscleGroup[];
  zone: 'strength' | 'bodybuilding' | 'cardio' | 'functional';
  defaultWeightLbs: number;
  availableWeights: number[];
  description: string;
  techniqueCue: string;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  money: number;
  reputation: number; // 0 - 1000
  athleticRep: number;
  gymRep: number;
  careerTier: number; // 1 to 7

  // Physical stats
  muscleMassKg: number; // starts ~35kg, up to ~65kg
  bodyFatPercent: number; // starts ~19%, down to ~8%
  bodyWeightLbs: number; // starts ~155lbs, up to ~225lbs
  heightCm: number;

  // Attributes
  strength: number; // 10 - 100
  endurance: number; // 10 - 100
  technique: number; // 10 - 100
  recoveryRate: number; // 10 - 100

  // Energy & Daily
  energy: number; // 0 - 100
  hydration: number; // 0 - 100
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatsConsumed: number;
  waterLiters: number;

  // Muscle Fatigue (DOMS 0 - 100)
  fatigue: {
    chest: number;
    back: number;
    legs: number;
    arms: number;
    shoulders: number;
    abs: number;
    overall: number;
  };

  // Personal Records in lbs
  personalRecords: {
    bench_press: number;
    barbell_squat: number;
    deadlift: number;
    dumbbell_curls: number;
    lat_pulldown: number;
    treadmill_sprint: number; // top speed in mph
  };

  totalWorkoutsCompleted: number;
  totalRepsCompleted: number;
  totalWeightLiftedLbs: number;
  day: number;
  timeOfDay: TimeOfDay;

  sponsors: string[];
  achievements: string[];
  unlockedEquipment: string[];

  // Gym Empire
  gymEmpire: {
    owned: boolean;
    name: string;
    tier: number; // 1: Warehouse Iron, 2: Modern Fitness Club, 3: Elite High-Rise Empire
    members: number;
    cleanliness: number;
    monthlyFee: number;
    dailyIncome: number;
    equipmentLevel: number;
    interiorStyle: 'cyber_neon' | 'matte_black_gold' | 'industrial_concrete' | 'luxury_wood';
    trainersHired: string[];
  };
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  role: 'rival' | 'trainer' | 'nutritionist' | 'member';
  avatarColor: string;
  stats: {
    bench: number;
    squat: number;
    deadlift: number;
    physiqueScore: number;
  };
  dialogue: string[];
  relationship: number; // 0 - 100
  isRival?: boolean;
  beatenInComp?: boolean;
  currentActivity?: string;
  currentZone?: string;
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  cost: number;
  bonus: string;
  category: 'meal' | 'shake' | 'supplement';
}

export interface Competition {
  id: string;
  name: string;
  tier: number;
  category: 'powerlifting' | 'bodybuilding' | 'functional';
  entryFee: number;
  prizeMoney: number;
  reputationReward: number;
  minStrengthRequired: number;
  rivalParticipantId: string;
  description: string;
}

export interface CareerMilestone {
  tier: number;
  title: string;
  subtitle: string;
  reqLevel: number;
  reqRep: number;
  rewards: string[];
}
