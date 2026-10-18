import avatarImage from '../assets/images/avatar_fitness_user_1792351370174.jpg';
import React, { useState, useEffect } from 'react';
import {
  User,
  Activity,
  Dumbbell,
  Target,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import {
  ActivityLevel,
  DietaryPreference,
  EquipmentAvailability,
  FitnessLevel,
  PrimaryGoal,
  UserProfile,
} from '../types/fitness';
import {
  calculateFullProfileMetrics,
  cmToFtIn,
  ftInToCm,
  kgToLbs,
  lbsToKg,
} from '../utils/fitnessCalculations';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, resetToDemoData } = useFitness();

  const [name, setName] = useState(profile.name);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(profile.unitSystem);

  // String states for numeric fields so users can backspace, clear, and type digits freely
  const [ageStr, setAgeStr] = useState<string>(profile.age.toString());
  const [gender, setGender] = useState(profile.gender);

  const initialWeight = profile.unitSystem === 'metric' ? profile.weightKg : kgToLbs(profile.weightKg);
  const initialTargetWeight = profile.unitSystem === 'metric' ? profile.targetWeightKg : kgToLbs(profile.targetWeightKg);
  const initialFtIn = cmToFtIn(profile.heightCm);

  const [weightStr, setWeightStr] = useState<string>(initialWeight.toString());
  const [targetWeightStr, setTargetWeightStr] = useState<string>(initialTargetWeight.toString());
  const [heightCmStr, setHeightCmStr] = useState<string>(profile.heightCm.toString());
  const [ftStr, setFtStr] = useState<string>(initialFtIn.feet.toString());
  const [inStr, setInStr] = useState<string>(initialFtIn.inches.toString());

  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(profile.fitnessLevel);
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>(profile.primaryGoal);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentAvailability>(profile.availableEquipment);
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<3 | 4 | 5 | 6>(profile.trainingDaysPerWeek);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(profile.dietaryPreference);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  

  // Keep local inputs synchronized whenever the profile object changes in context
  useEffect(() => {
    setName(profile.name);
    setAgeStr(profile.age.toString());
    setGender(profile.gender);
    setUnitSystem(profile.unitSystem);
    const curWeight = profile.unitSystem === 'metric' ? profile.weightKg : kgToLbs(profile.weightKg);
    const curTargetWeight = profile.unitSystem === 'metric' ? profile.targetWeightKg : kgToLbs(profile.targetWeightKg);
    const curFtIn = cmToFtIn(profile.heightCm);
    setWeightStr(curWeight.toString());
    setTargetWeightStr(curTargetWeight.toString());
    setHeightCmStr(profile.heightCm.toString());
    setFtStr(curFtIn.feet.toString());
    setInStr(curFtIn.inches.toString());
    setFitnessLevel(profile.fitnessLevel);
    setPrimaryGoal(profile.primaryGoal);
    setActivityLevel(profile.activityLevel);
    setAvailableEquipment(profile.availableEquipment);
    setTrainingDaysPerWeek(profile.trainingDaysPerWeek);
    setDietaryPreference(profile.dietaryPreference);
  }, [profile]);

  // Toggle unit system and convert current string inputs
  const handleToggleUnit = (newUnit: 'metric' | 'imperial') => {
    if (newUnit === unitSystem) return;
    setUnitSystem(newUnit);

    if (newUnit === 'imperial') {
      const parsedKg = parseFloat(weightStr) || profile.weightKg;
      const parsedTargetKg = parseFloat(targetWeightStr) || profile.targetWeightKg;
      const parsedCm = parseInt(heightCmStr) || profile.heightCm;

      setWeightStr(kgToLbs(parsedKg).toString());
      setTargetWeightStr(kgToLbs(parsedTargetKg).toString());
      const ftIn = cmToFtIn(parsedCm);
      setFtStr(ftIn.feet.toString());
      setInStr(ftIn.inches.toString());
    } else {
      const parsedLbs = parseFloat(weightStr) || kgToLbs(profile.weightKg);
      const parsedTargetLbs = parseFloat(targetWeightStr) || kgToLbs(profile.targetWeightKg);
      const feet = parseInt(ftStr) || 5;
      const inches = parseInt(inStr) || 10;

      setWeightStr(lbsToKg(parsedLbs).toString());
      setTargetWeightStr(lbsToKg(parsedTargetLbs).toString());
      setHeightCmStr(ftInToCm(feet, inches).toString());
    }
  };

  // Derive active numeric metrics for calculation
  const parsedAge = parseInt(ageStr) || profile.age;
  const rawWeight = parseFloat(weightStr) || (unitSystem === 'metric' ? profile.weightKg : kgToLbs(profile.weightKg));
  const effectiveWeightKg = unitSystem === 'metric' ? rawWeight : lbsToKg(rawWeight);

  const rawTargetWeight = parseFloat(targetWeightStr) || (unitSystem === 'metric' ? profile.targetWeightKg : kgToLbs(profile.targetWeightKg));
  const effectiveTargetWeightKg = unitSystem === 'metric' ? rawTargetWeight : lbsToKg(rawTargetWeight);

  const effectiveHeightCm = unitSystem === 'metric'
    ? (parseInt(heightCmStr) || profile.heightCm)
    : ftInToCm(parseInt(ftStr) || 5, parseInt(inStr) || 10);

  // Live preview calculations
  const previewMetrics = calculateFullProfileMetrics({
    name,
    age: parsedAge,
    gender,
    weightKg: effectiveWeightKg,
    targetWeightKg: effectiveTargetWeightKg,
    heightCm: effectiveHeightCm,
    fitnessLevel,
    primaryGoal,
    activityLevel,
    availableEquipment,
    trainingDaysPerWeek,
    dietaryPreference,
    unitSystem,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAge = parseInt(ageStr) || profile.age;
    const finalWeightKg = effectiveWeightKg;
    const finalTargetWeightKg = effectiveTargetWeightKg;
    const finalHeightCm = effectiveHeightCm;

    const updated: UserProfile = {
      ...previewMetrics,
      name,
      age: finalAge,
      gender,
      weightKg: finalWeightKg,
      targetWeightKg: finalTargetWeightKg,
      heightCm: finalHeightCm,
      fitnessLevel,
      primaryGoal,
      activityLevel,
      availableEquipment,
      trainingDaysPerWeek,
      dietaryPreference,
      unitSystem,
    };

    updateProfile(updated);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  const handleResetData = () => {
    resetToDemoData();
    setName('Marcus Vance');
    setAgeStr('28');
    setWeightStr(unitSystem === 'metric' ? '82.5' : kgToLbs(82.5).toString());
    setTargetWeightStr(unitSystem === 'metric' ? '85.0' : kgToLbs(85.0).toString());
    setHeightCmStr('182');
    const resetFtIn = cmToFtIn(182);
    setFtStr(resetFtIn.feet.toString());
    setInStr(resetFtIn.inches.toString());
    setFitnessLevel('intermediate');
    setPrimaryGoal('hypertrophy');
    setActivityLevel('moderate');
    setAvailableEquipment('gym');
    setTrainingDaysPerWeek(4);
    setDietaryPreference('balanced');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500/40 shrink-0">
          <img
            src={avatarImage}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-blue-400">
            <span>ATHLETE ID · {fitnessLevel.toUpperCase()}</span>
            <span aria-hidden="true">·</span>
            <span>{trainingDaysPerWeek} DAYS/WEEK</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
          <p className="text-xs text-slate-400 max-w-lg">
            Configure your biometrics, target goals, and training constraints to continuously recalibrate your periodized workout split and macronutrient formulas.
          </p>
        </div>

        <div className="sm:ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => handleToggleUnit('metric')}
              className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors ${
                unitSystem === 'metric'
                  ? 'bg-slate-800 text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Metric (kg/cm)
            </button>
            <button
              type="button"
              onClick={() => handleToggleUnit('imperial')}
              className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors ${
                unitSystem === 'imperial'
                  ? 'bg-slate-800 text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Imperial (lbs/ft)
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Biometrics & Demographics */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-semibold text-white">1. Physical Biometrics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Athlete Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Age (years)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={ageStr}
                onChange={e => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setAgeStr(cleaned);
                }}
                onBlur={() => {
                  if (!ageStr.trim() || parseInt(ageStr) < 10) {
                    setAgeStr(profile.age.toString());
                  }
                }}
                placeholder="25"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Biological Gender (for BMR)
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as 'male' | 'female' | 'other')}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-400"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Non-binary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Height {unitSystem === 'metric' ? '(cm)' : '(ft / in)'}
              </label>
              {unitSystem === 'metric' ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={heightCmStr}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setHeightCmStr(cleaned);
                  }}
                  onBlur={() => {
                    if (!heightCmStr.trim() || parseInt(heightCmStr) < 50) {
                      setHeightCmStr(profile.heightCm.toString());
                    }
                  }}
                  placeholder="175"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                />
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ftStr}
                    onChange={e => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 1);
                      setFtStr(cleaned);
                    }}
                    onBlur={() => {
                      if (!ftStr.trim()) setFtStr('5');
                    }}
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono text-center focus:outline-none focus:border-blue-400"
                    placeholder="Ft"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inStr}
                    onChange={e => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
                      setInStr(cleaned);
                    }}
                    onBlur={() => {
                      if (!inStr.trim()) setInStr('0');
                    }}
                    className="w-1/2 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono text-center focus:outline-none focus:border-blue-400"
                    placeholder="In"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Current Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={weightStr}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setWeightStr(val);
                  }
                }}
                onBlur={() => {
                  if (!weightStr.trim() || parseFloat(weightStr) <= 0) {
                    setWeightStr(
                      (unitSystem === 'metric' ? profile.weightKg : kgToLbs(profile.weightKg)).toString()
                    );
                  }
                }}
                placeholder={unitSystem === 'metric' ? '75.0' : '165.0'}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={targetWeightStr}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setTargetWeightStr(val);
                  }
                }}
                onBlur={() => {
                  if (!targetWeightStr.trim() || parseFloat(targetWeightStr) <= 0) {
                    setTargetWeightStr(
                      (unitSystem === 'metric' ? profile.targetWeightKg : kgToLbs(profile.targetWeightKg)).toString()
                    );
                  }
                }}
                placeholder={unitSystem === 'metric' ? '78.0' : '172.0'}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fitness Level & Primary Goal */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-semibold text-white">2. Training Level & Primary Objective</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Fitness Experience Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['beginner', 'intermediate', 'advanced', 'elite'] as const).map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFitnessLevel(level)}
                    className={`p-3 text-left rounded border transition-colors ${
                      fitnessLevel === level
                        ? 'bg-slate-950 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold capitalize">{level}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {level === 'beginner' && '< 1 year training'}
                      {level === 'intermediate' && '1-3 years solid base'}
                      {level === 'advanced' && '3-5 years periodized'}
                      {level === 'elite' && '5+ years competitive'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Primary Goal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'hypertrophy', label: 'Hypertrophy', desc: 'Maximum muscle mass' },
                  { id: 'fat_loss', label: 'Fat Loss', desc: 'Lean definition & deficit' },
                  { id: 'strength', label: 'Strength', desc: 'Heavy 1RM loading' },
                  { id: 'endurance', label: 'Endurance', desc: 'Conditioning & stamina' },
                ] as const).map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setPrimaryGoal(g.id)}
                    className={`p-3 text-left rounded border transition-colors ${
                      primaryGoal === g.id
                        ? 'bg-slate-950 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{g.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Training Schedule & Equipment */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-semibold text-white">3. Equipment & Weekly Frequency</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Available Training Equipment
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'gym', label: 'Commercial Gym', desc: 'Barbells, cables & machines' },
                  { id: 'home_dumbbells', label: 'Dumbbells & Bench', desc: 'Free weights at home' },
                  { id: 'bodyweight', label: 'Bodyweight Only', desc: 'Calisthenics & pullup bar' },
                  { id: 'resistance_bands', label: 'Resistance Bands', desc: 'Elastic loops & anchors' },
                ] as const).map(eq => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => setAvailableEquipment(eq.id)}
                    className={`p-3 text-left rounded border transition-colors ${
                      availableEquipment === eq.id
                        ? 'bg-slate-950 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{eq.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{eq.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Training Days Per Week
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([3, 4, 5, 6] as const).map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setTrainingDaysPerWeek(days)}
                    className={`p-3 text-center rounded border transition-colors ${
                      trainingDaysPerWeek === days
                        ? 'bg-slate-950 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-base font-bold font-mono">{days}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Days/wk</div>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Daily Activity Factor (Non-Exercise)
                </label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="sedentary">Sedentary (Desk job, minimal daily steps)</option>
                  <option value="light">Lightly Active (Light walking, 5k-7k steps)</option>
                  <option value="moderate">Moderately Active (Active work, 8k-10k steps)</option>
                  <option value="very_active">Very Active (Labor intensive work, 12k+ steps)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Nutrition Preferences & Recalibration Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-semibold text-white">4. Dietary Framework & Real-Time Recalibration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Nutritional Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'balanced', label: 'Balanced Athletic', desc: 'Omnivore athletic macro split' },
                  { id: 'high_protein', label: 'High Protein Athlete', desc: '2.2g+ protein per kg' },
                  { id: 'vegan', label: 'Plant-Based / Vegan', desc: 'Plant protein optimization' },
                  { id: 'keto', label: 'Low Carb / Ketogenic', desc: 'Fat-adapted fuel system' },
                ] as const).map(diet => (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() => setDietaryPreference(diet.id)}
                    className={`p-3 text-left rounded border transition-colors ${
                      dietaryPreference === diet.id
                        ? 'bg-slate-950 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{diet.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{diet.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Output Preview Card */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Computed Physiological Targets</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Basal BMR:</span>{' '}
                  <span className="text-slate-200">{previewMetrics.bmr} kcal</span>
                </div>
                <div>
                  <span className="text-slate-500">TDEE:</span>{' '}
                  <span className="text-slate-200">{previewMetrics.tdee} kcal</span>
                </div>
                <div>
                  <span className="text-slate-500">Target Calories:</span>{' '}
                  <span className="text-white font-bold">{previewMetrics.targetCalories} kcal</span>
                </div>
                <div>
                  <span className="text-slate-500">Hydration Target:</span>{' '}
                  <span className="text-sky-400 font-bold">{previewMetrics.waterTargetMl} ml</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs font-mono text-center">
                <div>
                  <span className="text-slate-500">Protein:</span>{' '}
                  <span className="text-blue-400 font-bold">{previewMetrics.targetProteinG}g</span>
                </div>
                <div>
                  <span className="text-slate-500">Carbs:</span>{' '}
                  <span className="text-cyan-400 font-bold">{previewMetrics.targetCarbsG}g</span>
                </div>
                <div>
                  <span className="text-slate-500">Fat:</span>{' '}
                  <span className="text-indigo-400 font-bold">{previewMetrics.targetFatG}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit & Reset Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <div className="flex items-center gap-3">
            {isSavedFeedback && (
              <span className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                <Check className="w-4 h-4" />
                <span>Profile & Regimen Updated</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 rounded-md transition-colors"
            >
              Save & Recalibrate Regimen
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};