import { ActivityLevel, DietaryPreference, FitnessLevel, PrimaryGoal, UserProfile } from '../types/fitness';

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female' | 'other'): number {
  // Mifflin-St Jeor Equation
  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  // male or other default
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  switch (activityLevel) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'very_active':
      return 1.725;
    case 'athlete':
      return 1.9;
    default:
      return 1.55;
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * getActivityMultiplier(activityLevel));
}

export function calculateTargetCalories(tdee: number, goal: PrimaryGoal): number {
  switch (goal) {
    case 'fat_loss':
      return Math.max(1200, Math.round(tdee - 500)); // ~0.5kg/week safe deficit
    case 'hypertrophy':
      return Math.round(tdee + 300); // lean muscle surplus
    case 'strength':
      return Math.round(tdee + 200);
    case 'endurance':
      return Math.round(tdee + 150);
    case 'mobility':
      return Math.round(tdee);
    default:
      return tdee;
  }
}

export function calculateTargetMacros(
  calories: number,
  weightKg: number,
  goal: PrimaryGoal,
  preference: DietaryPreference
): { proteinG: number; carbsG: number; fatG: number } {
  // Protein: High protein prioritizes muscle retention and hypertrophy
  let proteinPerKg = 2.0;
  if (goal === 'hypertrophy' || goal === 'strength') proteinPerKg = 2.2;
  if (goal === 'fat_loss') proteinPerKg = 2.3; // preserve lean mass
  if (preference === 'vegan' || preference === 'vegetarian') proteinPerKg = 2.0;

  let proteinG = Math.round(weightKg * proteinPerKg);
  // Cap protein kcal to max 40% of total calories
  if (proteinG * 4 > calories * 0.4) {
    proteinG = Math.round((calories * 0.35) / 4);
  }

  const proteinKcal = proteinG * 4;

  if (preference === 'keto') {
    const carbsG = 30; // strict ketogenic target
    const carbsKcal = carbsG * 4;
    const remainingKcal = Math.max(0, calories - proteinKcal - carbsKcal);
    const fatG = Math.round(remainingKcal / 9);
    return { proteinG, carbsG, fatG };
  }

  // Fat target: ~25-30% of total calories
  let fatPct = 0.25;
  if (goal === 'strength') fatPct = 0.28;
  if (preference === 'mediterranean') fatPct = 0.32;

  let fatG = Math.round((calories * fatPct) / 9);
  const fatKcal = fatG * 9;

  const remainingKcal = Math.max(0, calories - proteinKcal - fatKcal);
  const carbsG = Math.round(remainingKcal / 4);

  return { proteinG, carbsG, fatG };
}

export function calculateWaterTarget(weightKg: number, activityLevel: ActivityLevel): number {
  // Base: 35ml per kg body weight + activity modifier
  const baseMl = weightKg * 35;
  let bonus = 500;
  if (activityLevel === 'very_active' || activityLevel === 'athlete') bonus = 1000;
  return Math.round((baseMl + bonus) / 100) * 100;
}

export function calculateFullProfileMetrics(
  profile: Omit<UserProfile, 'bmr' | 'tdee' | 'targetCalories' | 'targetProteinG' | 'targetCarbsG' | 'targetFatG' | 'waterTargetMl'>
): UserProfile {
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targetCalories = calculateTargetCalories(tdee, profile.primaryGoal);
  const { proteinG, carbsG, fatG } = calculateTargetMacros(
    targetCalories,
    profile.weightKg,
    profile.primaryGoal,
    profile.dietaryPreference
  );
  const waterTargetMl = calculateWaterTarget(profile.weightKg, profile.activityLevel);

  return {
    ...profile,
    bmr,
    tdee,
    targetCalories,
    targetProteinG: proteinG,
    targetCarbsG: carbsG,
    targetFatG: fatG,
    waterTargetMl,
  };
}

export function calculateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weightKg;
  // Epley formula
  return Math.round(weightKg * (1 + reps / 30));
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}
