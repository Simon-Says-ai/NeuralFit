import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DayNutritionLog,
  ExerciseSessionLog,
  MealItem,
  PersonalRecord,
  StrengthRecord,
  UserProfile,
  WeightRecord,
  WorkoutDay,
  WorkoutHistoryLog,
  WorkoutPlan,
} from '../types/fitness';
import { calculateFullProfileMetrics, calculateOneRepMax } from '../utils/fitnessCalculations';
import {
  createInitialProfile,
  generateInitialNutrition,
  generateInitialPersonalRecords,
  generateInitialStrengthHistory,
  generateInitialWeightHistory,
  generateInitialWorkoutLogs,
} from '../utils/initialDemoData';
import { generateWorkoutPlan } from '../utils/regimenGenerator';

interface FitnessContextType {
  profile: UserProfile;
  workoutPlan: WorkoutPlan;
  weightHistory: WeightRecord[];
  strengthHistory: StrengthRecord[];
  personalRecords: PersonalRecord[];
  workoutHistory: WorkoutHistoryLog[];
  dailyNutrition: DayNutritionLog;
  activeWorkoutDay: WorkoutDay | null;
  activeWorkoutSessionLogs: ExerciseSessionLog[];
  activeWorkoutElapsedSeconds: number;
  activeView: 'plan' | 'live' | 'progress' | 'nutrition' | 'profile';
  setActiveView: (view: 'plan' | 'live' | 'progress' | 'nutrition' | 'profile') => void;
  updateProfile: (updated: UserProfile) => void;
  regeneratePlan: () => void;
  startLiveWorkout: (day: WorkoutDay) => void;
  cancelLiveWorkout: () => void;
  logLiveSet: (exerciseId: string, setNumber: number, weightKg: number, reps: number, completed: boolean) => void;
  finishLiveWorkout: (durationMin: number, rating: 1 | 2 | 3 | 4 | 5, notes: string) => void;
  addWeightRecord: (weightKg: number, bodyFatPct?: number, note?: string) => void;
  addStrengthRecord: (exerciseName: string, weightKg: number, reps: number) => void;
  addMeal: (meal: Omit<MealItem, 'id'>) => void;
  removeMeal: (id: string) => void;
  addWater: (amountMl: number) => void;
  resetWater: () => void;
  resetToDemoData: () => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'neuralfit_profile_v1',
  PLAN: 'neuralfit_plan_v1',
  WEIGHT: 'neuralfit_weight_v1',
  STRENGTH: 'neuralfit_strength_v1',
  PRS: 'neuralfit_prs_v1',
  WORKOUT_LOGS: 'neuralfit_logs_v1',
  NUTRITION: 'neuralfit_nutrition_v1',
};

function getSavedItem(key: string, legacyKey: string): string | null {
  return localStorage.getItem(key) || localStorage.getItem(legacyKey);
}

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = getSavedItem(STORAGE_KEYS.PROFILE, 'vanguard_profile_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return createInitialProfile();
  });

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return generateWorkoutPlan(
      profile.fitnessLevel,
      profile.primaryGoal,
      profile.availableEquipment,
      profile.trainingDaysPerWeek
    );
  });

  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEIGHT);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return generateInitialWeightHistory();
  });

  const [strengthHistory, setStrengthHistory] = useState<StrengthRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STRENGTH);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return generateInitialStrengthHistory();
  });

  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return generateInitialPersonalRecords();
  });

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return generateInitialWorkoutLogs();
  });

  const [dailyNutrition, setDailyNutrition] = useState<DayNutritionLog>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NUTRITION);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.date === today) return parsed;
      } catch {}
    }
    return generateInitialNutrition();
  });

  const [activeWorkoutDay, setActiveWorkoutDay] = useState<WorkoutDay | null>(null);
  const [activeWorkoutSessionLogs, setActiveWorkoutSessionLogs] = useState<ExerciseSessionLog[]>([]);
  const [activeWorkoutElapsedSeconds, setActiveWorkoutElapsedSeconds] = useState<number>(0);
  const [activeView, setActiveView] = useState<'plan' | 'live' | 'progress' | 'nutrition' | 'profile'>('plan');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEIGHT, JSON.stringify(weightHistory));
  }, [weightHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STRENGTH, JSON.stringify(strengthHistory));
  }, [strengthHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(personalRecords));
  }, [personalRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NUTRITION, JSON.stringify(dailyNutrition));
  }, [dailyNutrition]);

  // Active workout timer tick
  useEffect(() => {
    if (!activeWorkoutDay) return;
    const interval = setInterval(() => {
      setActiveWorkoutElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkoutDay]);

  const updateProfile = (updated: UserProfile) => {
    setProfile(updated);
    // Regenerate plan if frequency, equipment, level, or goal changed
    if (
      updated.trainingDaysPerWeek !== profile.trainingDaysPerWeek ||
      updated.availableEquipment !== profile.availableEquipment ||
      updated.fitnessLevel !== profile.fitnessLevel ||
      updated.primaryGoal !== profile.primaryGoal
    ) {
      const newPlan = generateWorkoutPlan(
        updated.fitnessLevel,
        updated.primaryGoal,
        updated.availableEquipment,
        updated.trainingDaysPerWeek
      );
      setWorkoutPlan(newPlan);
    }
  };

  const regeneratePlan = () => {
    const newPlan = generateWorkoutPlan(
      profile.fitnessLevel,
      profile.primaryGoal,
      profile.availableEquipment,
      profile.trainingDaysPerWeek
    );
    setWorkoutPlan(newPlan);
  };

  const startLiveWorkout = (day: WorkoutDay) => {
    setActiveWorkoutDay(day);
    setActiveWorkoutElapsedSeconds(0);
    // Initialize session logs
    const sessionLogs: ExerciseSessionLog[] = day.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      sets: Array.from({ length: ex.sets }, (_, idx) => ({
        setNumber: idx + 1,
        targetReps: ex.reps,
        actualWeightKg: 0,
        actualReps: parseInt(ex.reps.split('-')[0]) || 10,
        completed: false,
      })),
    }));
    setActiveWorkoutSessionLogs(sessionLogs);
    setActiveView('live');
  };

  const cancelLiveWorkout = () => {
    setActiveWorkoutDay(null);
    setActiveWorkoutSessionLogs([]);
    setActiveWorkoutElapsedSeconds(0);
    setActiveView('plan');
  };

  const logLiveSet = (
    exerciseId: string,
    setNumber: number,
    weightKg: number,
    reps: number,
    completed: boolean
  ) => {
    setActiveWorkoutSessionLogs(prev =>
      prev.map(item => {
        if (item.exerciseId !== exerciseId) return item;
        return {
          ...item,
          sets: item.sets.map(s => {
            if (s.setNumber !== setNumber) return s;
            return {
              ...s,
              actualWeightKg: weightKg,
              actualReps: reps,
              completed,
            };
          }),
        };
      })
    );

    // If this set is heavy and completed, check if it's a new PR or strength milestone
    if (completed && weightKg > 0 && reps > 0) {
      const exercise = activeWorkoutSessionLogs.find(e => e.exerciseId === exerciseId);
      if (exercise) {
        checkAndUpdatePR(exercise.exerciseName, weightKg, reps);
      }
    }
  };

  const checkAndUpdatePR = (exerciseName: string, weightKg: number, reps: number) => {
    const existing = personalRecords.find(p => p.exerciseName.toLowerCase() === exerciseName.toLowerCase());
    const isNew = !existing || weightKg > existing.weightKg;

    if (isNew) {
      const today = new Date().toISOString().split('T')[0];
      setPersonalRecords(prev => {
        const filtered = prev.filter(p => p.exerciseName.toLowerCase() !== exerciseName.toLowerCase());
        return [
          {
            exerciseName,
            weightKg,
            reps,
            date: today,
            previousWeightKg: existing ? existing.weightKg : Math.round(weightKg * 0.9),
          },
          ...filtered,
        ];
      });

      // Also record strength history point
      const oneRepMax = calculateOneRepMax(weightKg, reps);
      setStrengthHistory(prev => [
        ...prev,
        {
          id: `str-${Date.now()}`,
          date: today,
          exerciseName,
          weightKg,
          reps,
          estimatedOneRepMax: oneRepMax,
        },
      ]);
    }
  };

  const finishLiveWorkout = (durationMin: number, rating: 1 | 2 | 3 | 4 | 5, notes: string) => {
    if (!activeWorkoutDay) return;

    let totalVolumeKg = 0;
    activeWorkoutSessionLogs.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed && s.actualWeightKg > 0 && s.actualReps > 0) {
          totalVolumeKg += s.actualWeightKg * s.actualReps;
        }
      });
    });

    const newLog: WorkoutHistoryLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dayTitle: activeWorkoutDay.dayName,
      durationMin: Math.max(1, durationMin),
      totalVolumeKg,
      caloriesBurned: Math.round(activeWorkoutDay.estimatedCaloriesBurned * (durationMin / (activeWorkoutDay.estimatedDurationMin || 45))),
      exercises: activeWorkoutSessionLogs,
      feelingRating: rating,
      notes,
    };

    setWorkoutHistory(prev => [newLog, ...prev]);
    setActiveWorkoutDay(null);
    setActiveWorkoutSessionLogs([]);
    setActiveWorkoutElapsedSeconds(0);
    setActiveView('progress');
  };

  const addWeightRecord = (weightKg: number, bodyFatPct?: number, note?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newRecord: WeightRecord = {
      id: `w-${Date.now()}`,
      date: today,
      weightKg,
      bodyFatPct,
      note,
    };

    // Update weight history, replace if today already exists
    setWeightHistory(prev => {
      const filtered = prev.filter(r => r.date !== today);
      return [...filtered, newRecord].sort((a, b) => a.date.localeCompare(b.date));
    });

    // Update current weight in profile and recalculate targets
    setProfile(prev => {
      const updated = { ...prev, weightKg };
      return calculateFullProfileMetrics(updated);
    });
  };

  const addStrengthRecord = (exerciseName: string, weightKg: number, reps: number) => {
    const today = new Date().toISOString().split('T')[0];
    const estimatedOneRepMax = calculateOneRepMax(weightKg, reps);

    setStrengthHistory(prev => [
      ...prev,
      {
        id: `str-${Date.now()}`,
        date: today,
        exerciseName,
        weightKg,
        reps,
        estimatedOneRepMax,
      },
    ]);

    checkAndUpdatePR(exerciseName, weightKg, reps);
  };

  const addMeal = (meal: Omit<MealItem, 'id'>) => {
    const newMeal: MealItem = {
      ...meal,
      id: `meal-${Date.now()}`,
    };
    setDailyNutrition(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal],
    }));
  };

  const removeMeal = (id: string) => {
    setDailyNutrition(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== id),
    }));
  };

  const addWater = (amountMl: number) => {
    setDailyNutrition(prev => ({
      ...prev,
      waterLoggedMl: Math.max(0, prev.waterLoggedMl + amountMl),
    }));
  };

  const resetWater = () => {
    setDailyNutrition(prev => ({
      ...prev,
      waterLoggedMl: 0,
    }));
  };

  const resetToDemoData = () => {
    localStorage.clear();
    const initProfile = createInitialProfile();
    setProfile(initProfile);
    setWorkoutPlan(generateWorkoutPlan(initProfile.fitnessLevel, initProfile.primaryGoal, initProfile.availableEquipment, initProfile.trainingDaysPerWeek));
    setWeightHistory(generateInitialWeightHistory());
    setStrengthHistory(generateInitialStrengthHistory());
    setPersonalRecords(generateInitialPersonalRecords());
    setWorkoutHistory(generateInitialWorkoutLogs());
    setDailyNutrition(generateInitialNutrition());
    setActiveWorkoutDay(null);
    setActiveWorkoutSessionLogs([]);
    setActiveView('plan');
  };

  return (
    <FitnessContext.Provider
      value={{
        profile,
        workoutPlan,
        weightHistory,
        strengthHistory,
        personalRecords,
        workoutHistory,
        dailyNutrition,
        activeWorkoutDay,
        activeWorkoutSessionLogs,
        activeWorkoutElapsedSeconds,
        activeView,
        setActiveView,
        updateProfile,
        regeneratePlan,
        startLiveWorkout,
        cancelLiveWorkout,
        logLiveSet,
        finishLiveWorkout,
        addWeightRecord,
        addStrengthRecord,
        addMeal,
        removeMeal,
        addWater,
        resetWater,
        resetToDemoData,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export function useFitness() {
  const ctx = useContext(FitnessContext);
  if (!ctx) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return ctx;
}
