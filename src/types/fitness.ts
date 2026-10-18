export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export type PrimaryGoal = 'hypertrophy' | 'fat_loss' | 'strength' | 'endurance' | 'mobility';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';

export type EquipmentAvailability = 'gym' | 'home_dumbbells' | 'bodyweight' | 'resistance_bands';

export type DietaryPreference = 'balanced' | 'high_protein' | 'keto' | 'vegetarian' | 'vegan' | 'mediterranean';

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weightKg: number;
  targetWeightKg: number;
  heightCm: number;
  fitnessLevel: FitnessLevel;
  primaryGoal: PrimaryGoal;
  activityLevel: ActivityLevel;
  availableEquipment: EquipmentAvailability;
  trainingDaysPerWeek: 3 | 4 | 5 | 6;
  dietaryPreference: DietaryPreference;
  unitSystem: 'metric' | 'imperial';
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  waterTargetMl: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  sets: number;
  reps: string;
  targetRpe?: number;
  restSeconds: number;
  formCue: string;
  targetMuscles: string[];
  equipment: EquipmentAvailability;
}

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  dayName: string;
  focus: string;
  description: string;
  estimatedDurationMin: number;
  estimatedCaloriesBurned: number;
  exercises: Exercise[];
  warmup: string[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  splitType: string;
  fitnessLevel: FitnessLevel;
  goal: PrimaryGoal;
  equipment: EquipmentAvailability;
  days: WorkoutDay[];
}

export interface SetLog {
  setNumber: number;
  targetReps: string;
  actualWeightKg: number;
  actualReps: number;
  completed: boolean;
}

export interface ExerciseSessionLog {
  exerciseId: string;
  exerciseName: string;
  category: MuscleGroup;
  sets: SetLog[];
}

export interface WorkoutHistoryLog {
  id: string;
  date: string;
  dayTitle: string;
  durationMin: number;
  totalVolumeKg: number;
  caloriesBurned: number;
  exercises: ExerciseSessionLog[];
  feelingRating: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

export interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  note?: string;
}

export interface StrengthRecord {
  id: string;
  date: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimatedOneRepMax: number;
}

export interface PersonalRecord {
  exerciseName: string;
  weightKg: number;
  reps: number;
  date: string;
  previousWeightKg: number;
}

export interface MealItem {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  serving: string;
  time: string;
}

export interface DayNutritionLog {
  date: string;
  waterLoggedMl: number;
  meals: MealItem[];
}
