import  nutritionImage from '../assets/images/nutrition_meal_showcase_1792351383784.jpg';
import React, { useState } from 'react';
import {
  Droplet,
  Flame,
  Plus,
  Trash2,
  Utensils,
  X,
  Sparkles,
  PieChart,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { MealItem } from '../types/fitness';

interface NutritionDashboardViewProps {
  onOpenAICoach: () => void;
}

// Preset healthy meals for rapid logging
const PRESET_FOODS: Omit<MealItem, 'id' | 'time'>[] = [
  {
    name: 'Whey Protein Isolate Shake (with Water)',
    mealType: 'snack',
    calories: 140,
    proteinG: 28,
    carbsG: 2,
    fatG: 1,
    serving: '1 scoop (35g)',
  },
  {
    name: 'Grilled Atlantic Salmon & Sweet Potato',
    mealType: 'dinner',
    calories: 620,
    proteinG: 48,
    carbsG: 52,
    fatG: 22,
    serving: '200g salmon fillet + 250g baked potato',
  },
  {
    name: 'Egg White Omelet with Avocado & Spinach',
    mealType: 'breakfast',
    calories: 380,
    proteinG: 36,
    carbsG: 8,
    fatG: 20,
    serving: '5 egg whites, 1 whole egg, 1/2 avocado',
  },
  {
    name: 'Grass-Fed Sirloin Steak & Jasmine Rice',
    mealType: 'dinner',
    calories: 740,
    proteinG: 56,
    carbsG: 68,
    fatG: 24,
    serving: '220g steak + 220g cooked rice',
  },
  {
    name: 'Low-Fat Cottage Cheese with Blueberries',
    mealType: 'snack',
    calories: 210,
    proteinG: 26,
    carbsG: 18,
    fatG: 3,
    serving: '200g cottage cheese + 80g berries',
  },
  {
    name: 'Tuna Salad on Whole Grain Sourdough',
    mealType: 'lunch',
    calories: 480,
    proteinG: 42,
    carbsG: 45,
    fatG: 12,
    serving: '1 can tuna in brine + 2 slices sourdough',
  },
];

export const NutritionDashboardView: React.FC<NutritionDashboardViewProps> = ({ onOpenAICoach }) => {
  const { profile, dailyNutrition, addMeal, removeMeal, addWater, resetWater } = useFitness();

  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState<boolean>(false);

  // Form states
  const [mealName, setMealName] = useState<string>('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [calories, setCalories] = useState<string>('450');
  const [proteinG, setProteinG] = useState<string>('35');
  const [carbsG, setCarbsG] = useState<string>('45');
  const [fatG, setFatG] = useState<string>('12');
  const [serving, setServing] = useState<string>('1 standard portion');

  

  // Calculate totals from today's meals
  const totals = dailyNutrition.meals.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.proteinG;
      acc.carbs += m.carbsG;
      acc.fat += m.fatG;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriesRemaining = profile.targetCalories - totals.calories;
  const calPct = Math.min(100, Math.round((totals.calories / profile.targetCalories) * 100));
  const proteinPct = Math.min(100, Math.round((totals.protein / profile.targetProteinG) * 100));
  const carbsPct = Math.min(100, Math.round((totals.carbs / profile.targetCarbsG) * 100));
  const fatPct = Math.min(100, Math.round((totals.fat / profile.targetFatG) * 100));

  const waterTarget = profile.waterTargetMl;
  const waterPct = Math.min(100, Math.round((dailyNutrition.waterLoggedMl / waterTarget) * 100));

  const handleAddPreset = (preset: Omit<MealItem, 'id' | 'time'>) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addMeal({
      ...preset,
      time,
    });
    setIsAddMealModalOpen(false);
  };

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addMeal({
      name: mealName.trim(),
      mealType,
      calories: parseInt(calories) || 0,
      proteinG: parseInt(proteinG) || 0,
      carbsG: parseInt(carbsG) || 0,
      fatG: parseInt(fatG) || 0,
      serving: serving.trim() || '1 serving',
      time,
    });

    setMealName('');
    setIsAddMealModalOpen(false);
  };

  const mealsByType: Record<string, MealItem[]> = {
    breakfast: dailyNutrition.meals.filter(m => m.mealType === 'breakfast'),
    lunch: dailyNutrition.meals.filter(m => m.mealType === 'lunch'),
    dinner: dailyNutrition.meals.filter(m => m.mealType === 'dinner'),
    snack: dailyNutrition.meals.filter(m => m.mealType === 'snack'),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Split with Nutrition Banner */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-2">
                <span>Personalized Nutrition Architecture</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{profile.dietaryPreference.replace('_', ' ')}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{profile.primaryGoal.replace('_', ' ')}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Daily Macro & Metabolic Dashboard
              </h1>

              <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-xl">
                Precision caloric balance and amino acid threshold management calibrated for lean muscle recovery, glycogen replenishment, and hydration.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAddMealModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Log Meal or Food</span>
              </button>

              <button
                onClick={onOpenAICoach}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Generate Macro Recipe</span>
              </button>

              <div className="text-xs text-slate-400 ml-auto font-mono">
                BMR: <span className="text-slate-200">{profile.bmr}</span> kcal · TDEE: <span className="text-slate-200">{profile.tdee}</span> kcal
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 relative min-h-[180px] lg:min-h-full">
            <img
              src={nutritionImage}
              alt="Nutrient dense athletic meal"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
          </div>
        </div>
      </div>

      {/* Primary Nutrition Gauges: Calories + 3 Macros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Calories</span>
            </span>
            <span className="font-mono">{calPct}%</span>
          </div>

          <div className="text-2xl font-bold font-mono text-white">
            {totals.calories} <span className="text-xs font-normal text-slate-400">/ {profile.targetCalories} kcal</span>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${caloriesRemaining >= 0 ? 'bg-amber-400' : 'bg-rose-500'}`}
              style={{ width: `${calPct}%` }}
            />
          </div>

          <div className="text-xs text-slate-400 mt-2 font-mono">
            {caloriesRemaining >= 0
              ? `${caloriesRemaining} kcal remaining`
              : `${Math.abs(caloriesRemaining)} kcal over target`}
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Protein</span>
            <span className="font-mono text-blue-400">{proteinPct}%</span>
          </div>

          <div className="text-2xl font-bold font-mono text-blue-400">
            {totals.protein}g <span className="text-xs font-normal text-slate-400">/ {profile.targetProteinG}g</span>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
            <div
              className="h-full bg-blue-400 transition-all duration-300"
              style={{ width: `${proteinPct}%` }}
            />
          </div>

          <div className="text-xs text-slate-400 mt-2 font-mono">
            {Math.max(0, profile.targetProteinG - totals.protein)}g remaining (Muscle Repair)
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Carbohydrates</span>
            <span className="font-mono text-cyan-400">{carbsPct}%</span>
          </div>

          <div className="text-2xl font-bold font-mono text-cyan-400">
            {totals.carbs}g <span className="text-xs font-normal text-slate-400">/ {profile.targetCarbsG}g</span>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${carbsPct}%` }}
            />
          </div>

          <div className="text-xs text-slate-400 mt-2 font-mono">
            {Math.max(0, profile.targetCarbsG - totals.carbs)}g remaining (Glycogen)
          </div>
        </div>

        {/* Dietary Fat Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Healthy Fats</span>
            <span className="font-mono text-indigo-400">{fatPct}%</span>
          </div>

          <div className="text-2xl font-bold font-mono text-indigo-400">
            {totals.fat}g <span className="text-xs font-normal text-slate-400">/ {profile.targetFatG}g</span>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
            <div
              className="h-full bg-indigo-400 transition-all duration-300"
              style={{ width: `${fatPct}%` }}
            />
          </div>

          <div className="text-xs text-slate-400 mt-2 font-mono">
            {Math.max(0, profile.targetFatG - totals.fat)}g remaining (Hormones)
          </div>
        </div>
      </div>

      {/* 2-Column Split: Meals Log + Hydration & Health Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Meal Log Timeline */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-semibold text-white">Daily Meals Log</h2>
            </div>
            <button
              onClick={() => setIsAddMealModalOpen(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              + Log Food
            </button>
          </div>

          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => {
            const meals = mealsByType[type];
            const typeCalories = meals.reduce((sum, m) => sum + m.calories, 0);
            const typeProtein = meals.reduce((sum, m) => sum + m.proteinG, 0);

            return (
              <div key={type} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 capitalize">
                      {type}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      ({meals.length} {meals.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    <span className="text-slate-200 font-semibold">{typeCalories}</span> kcal · <span className="text-blue-400">{typeProtein}g</span> protein
                  </div>
                </div>

                {meals.length > 0 ? (
                  <div className="divide-y divide-slate-800/50">
                    {meals.map(meal => (
                      <div
                        key={meal.id}
                        className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-semibold text-white">{meal.name}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span>{meal.serving}</span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {meal.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right text-xs font-mono">
                            <div className="font-semibold text-slate-200">{meal.calories} kcal</div>
                            <div className="text-[11px] text-slate-500">
                              P: <span className="text-blue-400">{meal.proteinG}g</span> · C: {meal.carbsG}g · F: {meal.fatG}g
                            </div>
                          </div>

                          <button
                            onClick={() => removeMeal(meal.id)}
                            className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                            title="Remove meal entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 px-5 text-xs text-slate-500 italic">
                    No items logged for {type} yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Hydration Tracker & Health Guidance */}
        <div className="lg:col-span-4 space-y-6">
          {/* Hydration Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">Hydration Tracker</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">{waterPct}%</span>
            </div>

            <div className="text-center py-2">
              <div className="text-4xl font-bold font-mono text-cyan-400">
                {(dailyNutrition.waterLoggedMl / 1000).toFixed(2)}L
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Target: {(waterTarget / 1000).toFixed(1)}L / day ({waterTarget} ml)
              </div>
            </div>

            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${waterPct}%` }}
              />
            </div>

            {/* Quick Log Water Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => addWater(250)}
                className="py-1.5 px-2 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-300 rounded transition-colors"
              >
                +250 ml
              </button>
              <button
                onClick={() => addWater(500)}
                className="py-1.5 px-2 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-300 rounded transition-colors"
              >
                +500 ml
              </button>
              <button
                onClick={() => addWater(750)}
                className="py-1.5 px-2 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-300 rounded transition-colors"
              >
                +750 ml
              </button>
            </div>

            <button
              onClick={resetWater}
              className="flex items-center justify-center gap-1 text-[11px] text-slate-500 hover:text-slate-400 w-full pt-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Daily Water</span>
            </button>
          </div>

          {/* Macro Ratio Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Macro Calorie Ratio</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  Protein
                </span>
                <span className="font-mono text-slate-200">
                  {totals.calories > 0 ? Math.round(((totals.protein * 4) / totals.calories) * 100) : 30}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  Carbohydrates
                </span>
                <span className="font-mono text-slate-200">
                  {totals.calories > 0 ? Math.round(((totals.carbs * 4) / totals.calories) * 100) : 45}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  Fats
                </span>
                <span className="font-mono text-slate-200">
                  {totals.calories > 0 ? Math.round(((totals.fat * 9) / totals.calories) * 100) : 25}%
                </span>
              </div>
            </div>
          </div>

          {/* Health & Nutrient Timing Tip */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-2">
            <h4 className="text-xs font-semibold text-blue-400">Nutrient Timing Principle</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              For peak muscle protein synthesis (MPS), distribute protein into 35-45g boluses every 3-4 hours. Ingest 40g easily digestible carbs 60-90 minutes prior to training for maximal muscular glycogen storage.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Add Food / Meal */}
      {isAddMealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Log Food or Meal</h3>
              <button
                onClick={() => setIsAddMealModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets Section */}
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
                Quick Fitness Presets
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_FOODS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="p-2.5 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded text-left transition-all group"
                  >
                    <div className="text-xs font-medium text-slate-200 group-hover:text-blue-400 truncate">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {preset.calories} kcal · {preset.proteinG}g P · {preset.carbsG}g C
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-3">
                Custom Entry
              </div>

              <form onSubmit={handleAddCustomMeal} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Food Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Grilled Chicken, Brown Rice & Guacamole"
                    value={mealName}
                    onChange={e => setMealName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Meal Type
                    </label>
                    <select
                      value={mealType}
                      onChange={e => setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack / Pre-Workout</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Serving Size
                    </label>
                    <input
                      type="text"
                      placeholder="E.g. 1 bowl (300g)"
                      value={serving}
                      onChange={e => setServing(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      value={calories}
                      onChange={e => setCalories(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={proteinG}
                      onChange={e => setProteinG(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={carbsG}
                      onChange={e => setCarbsG(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-cyan-400 font-mono focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      value={fatG}
                      onChange={e => setFatG(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-indigo-400 font-mono focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddMealModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 rounded transition-colors"
                  >
                    Add to Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
