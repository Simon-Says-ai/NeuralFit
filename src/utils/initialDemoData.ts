import {
  DayNutritionLog,
  PersonalRecord,
  StrengthRecord,
  UserProfile,
  WeightRecord,
  WorkoutHistoryLog,
} from '../types/fitness';
import { calculateFullProfileMetrics } from './fitnessCalculations';
import { generateWorkoutPlan } from './regimenGenerator';

export function createInitialProfile(): UserProfile {
  return calculateFullProfileMetrics({
    name: 'Alex Rivera',
    age: 28,
    gender: 'male',
    weightKg: 78.4,
    targetWeightKg: 82.0,
    heightCm: 180,
    fitnessLevel: 'intermediate',
    primaryGoal: 'hypertrophy',
    activityLevel: 'moderate',
    availableEquipment: 'gym',
    trainingDaysPerWeek: 4,
    dietaryPreference: 'high_protein',
    unitSystem: 'metric',
  });
}

export function generateInitialWeightHistory(): WeightRecord[] {
  const records: WeightRecord[] = [];
  const startWeight = 76.8;
  const targetEnd = 78.4;
  const totalDays = 30;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - i));
    const dateStr = d.toISOString().split('T')[0];

    // Slight realistic fluctuation with upward trend
    const progressFactor = i / totalDays;
    const base = startWeight + (targetEnd - startWeight) * progressFactor;
    const fluctuation = (Math.sin(i * 1.5) * 0.35) + ((i % 5 === 0) ? -0.2 : 0.15);
    const weight = Math.round((base + fluctuation) * 10) / 10;
    const bodyFat = Math.round((15.4 - progressFactor * 0.6 + Math.sin(i) * 0.15) * 10) / 10;

    records.push({
      id: `w-${i}`,
      date: dateStr,
      weightKg: weight,
      bodyFatPct: bodyFat,
      note: i === 0 ? 'Cycle starting baseline' : i === 20 ? 'Post deload check-in' : undefined,
    });
  }
  return records;
}

export function generateInitialStrengthHistory(): StrengthRecord[] {
  const records: StrengthRecord[] = [];
  const exercises = [
    { name: 'Barbell Bench Press', start: 80, end: 92.5, reps: 6 },
    { name: 'Barbell Back Squat', start: 105, end: 122.5, reps: 5 },
    { name: 'Conventional Barbell Deadlift', start: 130, end: 150, reps: 5 },
    { name: 'Overhead Barbell Military Press', start: 50, end: 57.5, reps: 6 },
  ];

  exercises.forEach(ex => {
    for (let w = 0; w < 6; w++) {
      const d = new Date();
      d.setDate(d.getDate() - (5 - w) * 7);
      const dateStr = d.toISOString().split('T')[0];
      const weight = Math.round((ex.start + (ex.end - ex.start) * (w / 5)) * 10) / 10;
      const oneRepMax = Math.round(weight * (1 + ex.reps / 30));

      records.push({
        id: `str-${ex.name.substring(0, 3)}-${w}`,
        date: dateStr,
        exerciseName: ex.name,
        weightKg: weight,
        reps: ex.reps,
        estimatedOneRepMax: oneRepMax,
      });
    }
  });

  return records;
}

export function generateInitialPersonalRecords(): PersonalRecord[] {
  return [
    {
      exerciseName: 'Barbell Bench Press',
      weightKg: 95,
      reps: 5,
      date: '2026-10-12',
      previousWeightKg: 90,
    },
    {
      exerciseName: 'Barbell Back Squat',
      weightKg: 125,
      reps: 5,
      date: '2026-10-14',
      previousWeightKg: 115,
    },
    {
      exerciseName: 'Conventional Barbell Deadlift',
      weightKg: 155,
      reps: 4,
      date: '2026-10-09',
      previousWeightKg: 145,
    },
    {
      exerciseName: 'Overhead Barbell Military Press',
      weightKg: 60,
      reps: 5,
      date: '2026-10-16',
      previousWeightKg: 55,
    },
  ];
}

export function generateInitialWorkoutLogs(): WorkoutHistoryLog[] {
  const logs: WorkoutHistoryLog[] = [];
  const daysAgo = [14, 12, 10, 8, 5, 3, 1];

  daysAgo.forEach((ago, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - ago);
    const dateStr = d.toISOString().split('T')[0];
    const isUpper = idx % 2 === 0;

    logs.push({
      id: `log-${idx}`,
      date: dateStr,
      dayTitle: isUpper ? 'Upper Body A: Strength & Density' : 'Lower Body A: Quad Dominant & Core',
      durationMin: isUpper ? 58 : 52,
      totalVolumeKg: isUpper ? 6840 : 8420,
      caloriesBurned: isUpper ? 440 : 490,
      feelingRating: 4,
      notes: isUpper ? 'Felt crisp on barbell bench press, locked out solid reps.' : 'Strong depth on squats, good hamstring activation.',
      exercises: [
        {
          exerciseId: isUpper ? 'gym-barbell-bench-press' : 'gym-barbell-back-squat',
          exerciseName: isUpper ? 'Barbell Bench Press' : 'Barbell Back Squat',
          category: isUpper ? 'chest' : 'legs',
          sets: [
            { setNumber: 1, targetReps: '6-8', actualWeightKg: isUpper ? 85 : 110, actualReps: 8, completed: true },
            { setNumber: 2, targetReps: '6-8', actualWeightKg: isUpper ? 90 : 115, actualReps: 6, completed: true },
            { setNumber: 3, targetReps: '6-8', actualWeightKg: isUpper ? 90 : 120, actualReps: 6, completed: true },
          ],
        },
        {
          exerciseId: isUpper ? 'gym-lat-pulldown' : 'gym-romanian-deadlift',
          exerciseName: isUpper ? 'Wide-Grip Lat Pulldown' : 'Barbell Romanian Deadlift (RDL)',
          category: isUpper ? 'back' : 'legs',
          sets: [
            { setNumber: 1, targetReps: '10-12', actualWeightKg: isUpper ? 65 : 85, actualReps: 12, completed: true },
            { setNumber: 2, targetReps: '10-12', actualWeightKg: isUpper ? 70 : 90, actualReps: 10, completed: true },
            { setNumber: 3, targetReps: '10-12', actualWeightKg: isUpper ? 70 : 90, actualReps: 10, completed: true },
          ],
        },
      ],
    });
  });

  return logs;
}

export function generateInitialNutrition(): DayNutritionLog {
  const todayStr = new Date().toISOString().split('T')[0];

  return {
    date: todayStr,
    waterLoggedMl: 2250,
    meals: [
      {
        id: 'meal-1',
        name: 'Steel-Cut Oats with Whey Isolate & Blueberries',
        mealType: 'breakfast',
        calories: 520,
        proteinG: 44,
        carbsG: 62,
        fatG: 11,
        serving: '1 bowl (80g oats, 35g whey, 75g berries)',
        time: '08:15 AM',
      },
      {
        id: 'meal-2',
        name: 'Grilled Herb Chicken Breast with Jasmine Rice & Broccoli',
        mealType: 'lunch',
        calories: 680,
        proteinG: 58,
        carbsG: 74,
        fatG: 14,
        serving: '220g chicken, 200g cooked rice, 120g broccoli',
        time: '12:45 PM',
      },
      {
        id: 'meal-3',
        name: 'Greek Yogurt (0%) with Almond Butter & Sliced Banana',
        mealType: 'snack',
        calories: 360,
        proteinG: 28,
        carbsG: 34,
        fatG: 12,
        serving: '200g yogurt, 20g almond butter, 1 banana',
        time: '04:30 PM',
      },
    ],
  };
}
