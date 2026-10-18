import { EquipmentAvailability, Exercise, FitnessLevel, MuscleGroup, PrimaryGoal, WorkoutDay, WorkoutPlan } from '../types/fitness';

// Comprehensive exercise library organized by equipment and muscle group
export const EXERCISE_DATABASE: Exercise[] = [
  // CHEST - Gym
  {
    id: 'gym-barbell-bench-press',
    name: 'Barbell Bench Press',
    category: 'chest',
    sets: 4,
    reps: '6-8',
    targetRpe: 8,
    restSeconds: 120,
    formCue: 'Retract scapulae, plant feet firmly, lower bar to mid-sternum, drive bar upward.',
    targetMuscles: ['Pectoralis Major', 'Anterior Deltoid', 'Triceps'],
    equipment: 'gym',
  },
  {
    id: 'gym-incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'chest',
    sets: 3,
    reps: '8-10',
    targetRpe: 8,
    restSeconds: 90,
    formCue: 'Set bench to 30 degrees, flare elbows 45 degrees, stretch deep at bottom.',
    targetMuscles: ['Clavicular Pectoralis', 'Anterior Deltoid', 'Triceps'],
    equipment: 'gym',
  },
  {
    id: 'gym-cable-chest-flye',
    name: 'Cable Standing Flye',
    category: 'chest',
    sets: 3,
    reps: '12-15',
    targetRpe: 9,
    restSeconds: 60,
    formCue: 'Keep soft elbow bend, squeeze hands together across chest midline with 1s pause.',
    targetMuscles: ['Sternal Pectoralis', 'Serratus Anterior'],
    equipment: 'gym',
  },
  // CHEST - Dumbbells
  {
    id: 'db-floor-press',
    name: 'Dumbbell Floor Press',
    category: 'chest',
    sets: 4,
    reps: '8-10',
    targetRpe: 8,
    restSeconds: 90,
    formCue: 'Lie flat, touch triceps gently to floor, explode upward into lockout.',
    targetMuscles: ['Pectoralis Major', 'Triceps'],
    equipment: 'home_dumbbells',
  },
  {
    id: 'db-flat-bench-press',
    name: 'Dumbbell Flat Press',
    category: 'chest',
    sets: 4,
    reps: '8-12',
    targetRpe: 8,
    restSeconds: 90,
    formCue: 'Control descent for 3 seconds, drive weights up meeting slightly at peak.',
    targetMuscles: ['Pectoralis Major', 'Triceps'],
    equipment: 'home_dumbbells',
  },
  // CHEST - Bodyweight
  {
    id: 'bw-standard-pushup',
    name: 'Strict Tempo Push-Up',
    category: 'chest',
    sets: 4,
    reps: '15-20',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Maintain hollow body plank, lead with sternum to floor, lockout fully.',
    targetMuscles: ['Pectoralis Major', 'Core', 'Triceps'],
    equipment: 'bodyweight',
  },
  {
    id: 'bw-decline-pushup',
    name: 'Feet-Elevated Decline Push-Up',
    category: 'chest',
    sets: 3,
    reps: '12-15',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Place feet on chair/couch, brace core, press with upper pectoral focus.',
    targetMuscles: ['Upper Chest', 'Deltoids'],
    equipment: 'bodyweight',
  },

  // BACK - Gym
  {
    id: 'gym-barbell-deadlift',
    name: 'Conventional Barbell Deadlift',
    category: 'back',
    sets: 4,
    reps: '5',
    targetRpe: 8.5,
    restSeconds: 150,
    formCue: 'Bar over midfoot, engage lats, push floor away through heels, lock hips.',
    targetMuscles: ['Erector Spinae', 'Latissimus Dorsi', 'Hamstrings', 'Glutes'],
    equipment: 'gym',
  },
  {
    id: 'gym-lat-pulldown',
    name: 'Wide-Grip Lat Pulldown',
    category: 'back',
    sets: 4,
    reps: '10-12',
    targetRpe: 8,
    restSeconds: 75,
    formCue: 'Drive elbows down towards hips, keep chest proud, avoid excessive sway.',
    targetMuscles: ['Latissimus Dorsi', 'Teres Major', 'Biceps'],
    equipment: 'gym',
  },
  {
    id: 'gym-barbell-bent-row',
    name: 'Barbell Bent-Over Row',
    category: 'back',
    sets: 4,
    reps: '8-10',
    targetRpe: 8,
    restSeconds: 90,
    formCue: 'Hinge at 45 degrees, pull barbell to lower ribcage, squeeze shoulder blades.',
    targetMuscles: ['Rhomboids', 'Mid Trapezius', 'Lats'],
    equipment: 'gym',
  },
  {
    id: 'gym-seated-cable-row',
    name: 'Seated Close-Grip Cable Row',
    category: 'back',
    sets: 3,
    reps: '10-12',
    targetRpe: 8,
    restSeconds: 75,
    formCue: 'Full stretch at extension, pull handle to belly button, hold contraction.',
    targetMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Rear Delts'],
    equipment: 'gym',
  },
  // BACK - Dumbbells
  {
    id: 'db-single-arm-row',
    name: 'Single-Arm Dumbbell Row',
    category: 'back',
    sets: 4,
    reps: '10-12',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'One knee on bench/chair, pull elbow back towards pocket, avoid twisting torso.',
    targetMuscles: ['Latissimus Dorsi', 'Rhomboids'],
    equipment: 'home_dumbbells',
  },
  // BACK - Bodyweight
  {
    id: 'bw-pullup',
    name: 'Overhand Pull-Up',
    category: 'back',
    sets: 4,
    reps: '6-10',
    targetRpe: 9,
    restSeconds: 90,
    formCue: 'Full dead-hang at bottom, pull chin cleanly over bar without kipping.',
    targetMuscles: ['Latissimus Dorsi', 'Brachialis', 'Lower Traps'],
    equipment: 'bodyweight',
  },
  {
    id: 'bw-inverted-row',
    name: 'Inverted Australian Row',
    category: 'back',
    sets: 4,
    reps: '10-12',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Hang under sturdy table or bar, pull chest to underside with rigid core.',
    targetMuscles: ['Upper Back', 'Rhomboids', 'Biceps'],
    equipment: 'bodyweight',
  },

  // LEGS - Gym
  {
    id: 'gym-barbell-back-squat',
    name: 'Barbell Back Squat',
    category: 'legs',
    sets: 4,
    reps: '6-8',
    targetRpe: 8.5,
    restSeconds: 150,
    formCue: 'Brace abdominal wall, break at hips & knees together, reach parallel depth.',
    targetMuscles: ['Quadriceps', 'Gluteus Maximus', 'Adductors'],
    equipment: 'gym',
  },
  {
    id: 'gym-romanian-deadlift',
    name: 'Barbell Romanian Deadlift (RDL)',
    category: 'legs',
    sets: 4,
    reps: '8-10',
    targetRpe: 8,
    restSeconds: 90,
    formCue: 'Push hips straight back, slight knee bend, feel deep hamstring stretch.',
    targetMuscles: ['Hamstrings', 'Glutes', 'Erectors'],
    equipment: 'gym',
  },
  {
    id: 'gym-leg-press',
    name: '45-Degree Leg Press',
    category: 'legs',
    sets: 3,
    reps: '10-12',
    targetRpe: 8,
    restSeconds: 90,
    formCue: 'Feet hip-width on sled, lower smoothly without pelvis tucking under.',
    targetMuscles: ['Quadriceps', 'Glutes'],
    equipment: 'gym',
  },
  {
    id: 'gym-seated-leg-curl',
    name: 'Seated Leg Curl',
    category: 'legs',
    sets: 3,
    reps: '12-15',
    targetRpe: 9,
    restSeconds: 60,
    formCue: 'Lock thighs down, curl heels back forcefully, slow eccentric.',
    targetMuscles: ['Hamstrings'],
    equipment: 'gym',
  },
  {
    id: 'gym-standing-calf-raise',
    name: 'Standing Calf Raise',
    category: 'legs',
    sets: 4,
    reps: '12-15',
    targetRpe: 9,
    restSeconds: 60,
    formCue: 'Deep heel drop at bottom for stretch, pause 2s at peak elevation.',
    targetMuscles: ['Gastrocnemius', 'Soleus'],
    equipment: 'gym',
  },
  // LEGS - Dumbbells
  {
    id: 'db-goblet-squat',
    name: 'Dumbbell Goblet Squat',
    category: 'legs',
    sets: 4,
    reps: '10-12',
    targetRpe: 8,
    restSeconds: 75,
    formCue: 'Hold dumbbell vertically against chest, elbows tracking inside knees.',
    targetMuscles: ['Quadriceps', 'Glutes', 'Core'],
    equipment: 'home_dumbbells',
  },
  {
    id: 'db-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    category: 'legs',
    sets: 3,
    reps: '8-10 / leg',
    targetRpe: 8.5,
    restSeconds: 75,
    formCue: 'Back foot rested on bench, lower front hip down and slightly forward.',
    targetMuscles: ['Quadriceps', 'Gluteus Medius'],
    equipment: 'home_dumbbells',
  },
  // LEGS - Bodyweight
  {
    id: 'bw-pistol-squat',
    name: 'Single-Leg Pistol Squat',
    category: 'legs',
    sets: 3,
    reps: '6-8 / leg',
    targetRpe: 8.5,
    restSeconds: 90,
    formCue: 'Extend opposite leg forward, descend slowly on standing leg with balance.',
    targetMuscles: ['Quadriceps', 'Glutes', 'Ankle Stabilizers'],
    equipment: 'bodyweight',
  },
  {
    id: 'bw-jump-lunge',
    name: 'Alternating Plyo Lunges',
    category: 'legs',
    sets: 3,
    reps: '12 / leg',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Land softly on midfoot, spring up explosively switching legs in midair.',
    targetMuscles: ['Quadriceps', 'Glutes', 'Calves'],
    equipment: 'bodyweight',
  },

  // SHOULDERS - Gym
  {
    id: 'gym-overhead-press',
    name: 'Overhead Barbell Military Press',
    category: 'shoulders',
    sets: 4,
    reps: '6-8',
    targetRpe: 8,
    restSeconds: 120,
    formCue: 'Squeeze glutes and quads, press bar vertically clearing nose, lockout overhead.',
    targetMuscles: ['Anterior Deltoid', 'Lateral Deltoid', 'Triceps'],
    equipment: 'gym',
  },
  {
    id: 'gym-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'shoulders',
    sets: 4,
    reps: '12-15',
    targetRpe: 9,
    restSeconds: 60,
    formCue: 'Lead with elbows slightly forward in the scapular plane, avoid shrugging.',
    targetMuscles: ['Lateral Deltoid'],
    equipment: 'gym',
  },
  {
    id: 'gym-face-pull',
    name: 'Cable Face Pull',
    category: 'shoulders',
    sets: 4,
    reps: '15-20',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Pull rope toward eyes while externally rotating hands back behind ears.',
    targetMuscles: ['Rear Deltoid', 'Infraspinatus', 'Lower Traps'],
    equipment: 'gym',
  },

  // ARMS - Gym & Dumbbells
  {
    id: 'gym-barbell-bicep-curl',
    name: 'EZ-Bar Bicep Curl',
    category: 'arms',
    sets: 3,
    reps: '10-12',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Pin elbows to ribs, curl bar with zero hip swing, squeeze biceps at top.',
    targetMuscles: ['Biceps Brachii', 'Brachialis'],
    equipment: 'gym',
  },
  {
    id: 'gym-triceps-rope-pushdown',
    name: 'Cable Triceps Rope Pushdown',
    category: 'arms',
    sets: 3,
    reps: '12-15',
    targetRpe: 9,
    restSeconds: 60,
    formCue: 'Spread rope handles apart at bottom, lock elbows in place.',
    targetMuscles: ['Triceps Lateral & Medial Head'],
    equipment: 'gym',
  },
  {
    id: 'db-incline-curl',
    name: 'Incline Dumbbell Curl',
    category: 'arms',
    sets: 3,
    reps: '10-12',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Lean back at 45 degrees, allow deep long-head bicep stretch, supinate on ascent.',
    targetMuscles: ['Biceps Long Head'],
    equipment: 'home_dumbbells',
  },
  {
    id: 'db-overhead-triceps-extension',
    name: 'Dumbbell Overhead Extension',
    category: 'arms',
    sets: 3,
    reps: '10-12',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Hold weight overhead with both hands, lower behind head with elbows tucked.',
    targetMuscles: ['Triceps Long Head'],
    equipment: 'home_dumbbells',
  },

  // CORE
  {
    id: 'core-hanging-leg-raise',
    name: 'Hanging Knee/Leg Raise',
    category: 'core',
    sets: 3,
    reps: '12-15',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Tilt pelvis up toward ribcage, do not rely on momentum or swinging.',
    targetMuscles: ['Rectus Abdominis', 'Hip Flexors'],
    equipment: 'gym',
  },
  {
    id: 'core-ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    category: 'core',
    sets: 3,
    reps: '10-12',
    targetRpe: 8.5,
    restSeconds: 60,
    formCue: 'Maintain posterior pelvic tilt, roll out smoothly without lower back dipping.',
    targetMuscles: ['Transverse Abdominis', 'Rectus Abdominis'],
    equipment: 'home_dumbbells',
  },
  {
    id: 'core-plank-reach',
    name: 'Front Plank with Arm Reach',
    category: 'core',
    sets: 3,
    reps: '45s',
    targetRpe: 8,
    restSeconds: 45,
    formCue: 'Antirotation focus: alternate reaching one hand forward while keeping hips level.',
    targetMuscles: ['Obliques', 'Core Stabilizers'],
    equipment: 'bodyweight',
  },

  // RESISTANCE BANDS
  {
    id: 'band-chest-press',
    name: 'Anchored Band Chest Press',
    category: 'chest',
    sets: 4,
    reps: '12-15',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Anchor band behind back at mid-chest height, press forward to peak tension.',
    targetMuscles: ['Pectoralis Major', 'Triceps'],
    equipment: 'resistance_bands',
  },
  {
    id: 'band-seated-row',
    name: 'Loop Band Seated Row',
    category: 'back',
    sets: 4,
    reps: '12-15',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Loop around feet, pull band to stomach with proud chest and 1s hold.',
    targetMuscles: ['Lats', 'Mid Traps', 'Biceps'],
    equipment: 'resistance_bands',
  },
  {
    id: 'band-squat',
    name: 'Band-Resisted Squat',
    category: 'legs',
    sets: 4,
    reps: '15-20',
    targetRpe: 8,
    restSeconds: 60,
    formCue: 'Stand on band with both feet, loop ends over shoulders, squat against tension.',
    targetMuscles: ['Quadriceps', 'Glutes'],
    equipment: 'resistance_bands',
  },
];

export function generateWorkoutPlan(
  fitnessLevel: FitnessLevel,
  goal: PrimaryGoal,
  equipment: EquipmentAvailability,
  daysPerWeek: 3 | 4 | 5 | 6
): WorkoutPlan {
  // Determine split type based on days
  if (daysPerWeek === 3) {
    return generate3DayFullBodyPlan(fitnessLevel, goal, equipment);
  } else if (daysPerWeek === 4) {
    return generate4DayUpperLowerPlan(fitnessLevel, goal, equipment);
  } else if (daysPerWeek === 5) {
    return generate5DayPPLUpperLowerPlan(fitnessLevel, goal, equipment);
  } else {
    return generate6DayPPLPlan(fitnessLevel, goal, equipment);
  }
}

function filterExercises(category: MuscleGroup, equipment: EquipmentAvailability): Exercise[] {
  const matches = EXERCISE_DATABASE.filter(e => {
    if (e.category !== category) return false;
    if (equipment === 'gym') return true; // gym users can do all
    if (equipment === 'home_dumbbells') return e.equipment === 'home_dumbbells' || e.equipment === 'bodyweight';
    if (equipment === 'resistance_bands') return e.equipment === 'resistance_bands' || e.equipment === 'bodyweight';
    return e.equipment === 'bodyweight';
  });

  return matches.length > 0 ? matches : EXERCISE_DATABASE.filter(e => e.category === category);
}

function adjustExerciseForGoal(exercise: Exercise, goal: PrimaryGoal, level: FitnessLevel): Exercise {
  let sets = exercise.sets;
  let reps = exercise.reps;
  let rest = exercise.restSeconds;

  if (goal === 'strength') {
    sets = Math.min(5, sets + 1);
    reps = '4-6';
    rest = Math.max(120, rest + 30);
  } else if (goal === 'fat_loss' || goal === 'endurance') {
    reps = '12-15';
    rest = Math.max(45, rest - 20);
  } else if (goal === 'hypertrophy') {
    reps = '8-12';
  }

  if (level === 'beginner') {
    sets = Math.max(2, sets - 1);
  } else if (level === 'advanced' || level === 'elite') {
    sets = Math.min(5, sets + 1);
  }

  return {
    ...exercise,
    sets,
    reps,
    restSeconds: rest,
  };
}

function generate3DayFullBodyPlan(level: FitnessLevel, goal: PrimaryGoal, eq: EquipmentAvailability): WorkoutPlan {
  const chest = filterExercises('chest', eq);
  const back = filterExercises('back', eq);
  const legs = filterExercises('legs', eq);
  const shoulders = filterExercises('shoulders', eq);
  const arms = filterExercises('arms', eq);
  const core = filterExercises('core', eq);

  const day1: WorkoutDay = {
    id: 'fb-day-1',
    dayNumber: 1,
    dayName: 'Full Body A: Squat & Horizontal Focus',
    focus: 'Quads, Chest, Upper Back & Core',
    description: 'Foundation day emphasizing heavy compound multi-joint movements with controlled tempos.',
    estimatedDurationMin: 55,
    estimatedCaloriesBurned: 420,
    warmup: ['5 min dynamic hip mobility', 'World greatest stretch x 5/side', 'Band pull-aparts x 15'],
    exercises: [
      adjustExerciseForGoal(legs[0] || EXERCISE_DATABASE[7], goal, level),
      adjustExerciseForGoal(chest[0] || EXERCISE_DATABASE[0], goal, level),
      adjustExerciseForGoal(back[2] || back[0] || EXERCISE_DATABASE[5], goal, level),
      adjustExerciseForGoal(shoulders[1] || EXERCISE_DATABASE[12], goal, level),
      adjustExerciseForGoal(core[0] || EXERCISE_DATABASE[16], goal, level),
    ],
  };

  const day2: WorkoutDay = {
    id: 'fb-day-2',
    dayNumber: 2,
    dayName: 'Full Body B: Hinge & Vertical Pull Focus',
    focus: 'Hamstrings, Glutes, Lats & Shoulders',
    description: 'Posterior chain loading paired with overhead vertical mechanics and unilateral leg balance.',
    estimatedDurationMin: 50,
    estimatedCaloriesBurned: 390,
    warmup: ['Thoracic spine foam rolling', 'Inchworms x 8', 'Glute bridges x 12'],
    exercises: [
      adjustExerciseForGoal(back[0] || EXERCISE_DATABASE[3], goal, level),
      adjustExerciseForGoal(shoulders[0] || EXERCISE_DATABASE[11], goal, level),
      adjustExerciseForGoal(back[1] || EXERCISE_DATABASE[4], goal, level),
      adjustExerciseForGoal(legs[1] || EXERCISE_DATABASE[8], goal, level),
      adjustExerciseForGoal(arms[0] || EXERCISE_DATABASE[13], goal, level),
    ],
  };

  const day3: WorkoutDay = {
    id: 'fb-day-3',
    dayNumber: 3,
    dayName: 'Full Body C: Unilateral & Metabolic Hypertrophy',
    focus: 'Legs, Incline Chest, Upper Back & Arms',
    description: 'High muscle recruitment session focusing on symmetry, time-under-tension, and core stability.',
    estimatedDurationMin: 55,
    estimatedCaloriesBurned: 440,
    warmup: ['Deep lunge rotations x 6/leg', 'Cat-cow 10 reps', 'Arm circles 30s'],
    exercises: [
      adjustExerciseForGoal(legs[2] || legs[0] || EXERCISE_DATABASE[9], goal, level),
      adjustExerciseForGoal(chest[1] || chest[0] || EXERCISE_DATABASE[1], goal, level),
      adjustExerciseForGoal(back[3] || back[1] || EXERCISE_DATABASE[6], goal, level),
      adjustExerciseForGoal(arms[1] || EXERCISE_DATABASE[14], goal, level),
      adjustExerciseForGoal(core[1] || core[0] || EXERCISE_DATABASE[17], goal, level),
    ],
  };

  return {
    id: 'plan-fullbody-3day',
    title: 'Precision Full-Body Triad',
    splitType: '3-Day Full Body Frequency',
    fitnessLevel: level,
    goal,
    equipment: eq,
    days: [day1, day2, day3],
  };
}

function generate4DayUpperLowerPlan(level: FitnessLevel, goal: PrimaryGoal, eq: EquipmentAvailability): WorkoutPlan {
  const chest = filterExercises('chest', eq);
  const back = filterExercises('back', eq);
  const legs = filterExercises('legs', eq);
  const shoulders = filterExercises('shoulders', eq);
  const arms = filterExercises('arms', eq);
  const core = filterExercises('core', eq);

  const day1: WorkoutDay = {
    id: 'ul-day-1',
    dayNumber: 1,
    dayName: 'Upper Body A: Strength & Density',
    focus: 'Horizontal Press & Row + Overhead Work',
    description: 'Heavy upper torso loading targeting pectorals, lats, and anterior shoulders.',
    estimatedDurationMin: 60,
    estimatedCaloriesBurned: 450,
    warmup: ['Band dislocates x 15', 'Scapular pull-ups x 8', 'Push-up plus x 10'],
    exercises: [
      adjustExerciseForGoal(chest[0] || EXERCISE_DATABASE[0], goal, level),
      adjustExerciseForGoal(back[2] || back[0] || EXERCISE_DATABASE[5], goal, level),
      adjustExerciseForGoal(shoulders[0] || EXERCISE_DATABASE[11], goal, level),
      adjustExerciseForGoal(back[1] || EXERCISE_DATABASE[4], goal, level),
      adjustExerciseForGoal(arms[0] || EXERCISE_DATABASE[13], goal, level),
    ],
  };

  const day2: WorkoutDay = {
    id: 'ul-day-2',
    dayNumber: 2,
    dayName: 'Lower Body A: Quad Dominant & Core',
    focus: 'Squats, Knee Extension & Abdominals',
    description: 'Foundational lower limb power with heavy knee flexion and deep core stabilization.',
    estimatedDurationMin: 55,
    estimatedCaloriesBurned: 480,
    warmup: ['Ankle dorsiflexion rocks', 'Bodyweight goblet squats x 12', 'Side planks 30s/side'],
    exercises: [
      adjustExerciseForGoal(legs[0] || EXERCISE_DATABASE[7], goal, level),
      adjustExerciseForGoal(legs[2] || legs[0] || EXERCISE_DATABASE[9], goal, level),
      adjustExerciseForGoal(legs[1] || EXERCISE_DATABASE[8], goal, level),
      adjustExerciseForGoal(legs[4] || EXERCISE_DATABASE[10], goal, level),
      adjustExerciseForGoal(core[0] || EXERCISE_DATABASE[16], goal, level),
    ],
  };

  const day3: WorkoutDay = {
    id: 'ul-day-3',
    dayNumber: 3,
    dayName: 'Upper Body B: Hypertrophy & Volume',
    focus: 'Incline Pectorals, Lat Width & Lateral Delts',
    description: 'Metabolic stress and peak contraction focused upper volume routine.',
    estimatedDurationMin: 55,
    estimatedCaloriesBurned: 430,
    warmup: ['Arm swings x 20', 'Face pulls light band x 15', 'Dead bugs x 10'],
    exercises: [
      adjustExerciseForGoal(chest[1] || EXERCISE_DATABASE[1], goal, level),
      adjustExerciseForGoal(back[1] || back[0] || EXERCISE_DATABASE[4], goal, level),
      adjustExerciseForGoal(shoulders[1] || EXERCISE_DATABASE[12], goal, level),
      adjustExerciseForGoal(chest[2] || chest[0] || EXERCISE_DATABASE[2], goal, level),
      adjustExerciseForGoal(arms[1] || EXERCISE_DATABASE[14], goal, level),
      adjustExerciseForGoal(shoulders[2] || EXERCISE_DATABASE[12], goal, level),
    ],
  };

  const day4: WorkoutDay = {
    id: 'ul-day-4',
    dayNumber: 4,
    dayName: 'Lower Body B: Posterior Chain & Hamstrings',
    focus: 'Deadlifts, Hamstring Curls & Unilateral Lunges',
    description: 'Hip hinge power, hamstring elasticity, and single-leg balance.',
    estimatedDurationMin: 55,
    estimatedCaloriesBurned: 470,
    warmup: ['Single leg Romanian deadlift unweighted x 8', 'Band good mornings x 15', 'Cossack squats x 6/side'],
    exercises: [
      adjustExerciseForGoal(back[0] || legs[1] || EXERCISE_DATABASE[3], goal, level),
      adjustExerciseForGoal(legs[1] || EXERCISE_DATABASE[8], goal, level),
      adjustExerciseForGoal(legs[3] || legs[0] || EXERCISE_DATABASE[10], goal, level),
      adjustExerciseForGoal(core[1] || core[0] || EXERCISE_DATABASE[17], goal, level),
      adjustExerciseForGoal(legs[4] || EXERCISE_DATABASE[10], goal, level),
    ],
  };

  return {
    id: 'plan-upperlower-4day',
    title: 'NeuralFit Upper/Lower Split',
    splitType: '4-Day Periodized Upper/Lower',
    fitnessLevel: level,
    goal,
    equipment: eq,
    days: [day1, day2, day3, day4],
  };
}

function generate5DayPPLUpperLowerPlan(level: FitnessLevel, goal: PrimaryGoal, eq: EquipmentAvailability): WorkoutPlan {
  const ul = generate4DayUpperLowerPlan(level, goal, eq);
  const core = filterExercises('core', eq);
  const shoulders = filterExercises('shoulders', eq);

  const day5: WorkoutDay = {
    id: 'ppl-day-5',
    dayNumber: 5,
    dayName: 'Conditioning, Arms & Weak-Point Specialist',
    focus: 'Deltoids, Biceps, Triceps & High-Intensity Core',
    description: 'Targeted accessory specialization day to bring up lagging muscle groups and conditioning.',
    estimatedDurationMin: 50,
    estimatedCaloriesBurned: 410,
    warmup: ['Jump rope 3 mins', 'Shoulder dislocates x 15', 'Wrist mobility rolls'],
    exercises: [
      adjustExerciseForGoal(shoulders[1] || EXERCISE_DATABASE[12], goal, level),
      adjustExerciseForGoal(EXERCISE_DATABASE[13], goal, level),
      adjustExerciseForGoal(EXERCISE_DATABASE[14], goal, level),
      adjustExerciseForGoal(core[1] || EXERCISE_DATABASE[17], goal, level),
      adjustExerciseForGoal(core[0] || EXERCISE_DATABASE[16], goal, level),
    ],
  };

  return {
    id: 'plan-ppl-5day',
    title: 'High-Volume 5-Day Hybrid',
    splitType: '5-Day Upper/Lower + Specialization',
    fitnessLevel: level,
    goal,
    equipment: eq,
    days: [...ul.days, day5],
  };
}

function generate6DayPPLPlan(level: FitnessLevel, goal: PrimaryGoal, eq: EquipmentAvailability): WorkoutPlan {
  const chest = filterExercises('chest', eq);
  const back = filterExercises('back', eq);
  const legs = filterExercises('legs', eq);
  const shoulders = filterExercises('shoulders', eq);
  const arms = filterExercises('arms', eq);
  const core = filterExercises('core', eq);

  const days: WorkoutDay[] = [
    {
      id: 'ppl-push-1',
      dayNumber: 1,
      dayName: 'Push 1: Heavy Chest & Lateral Delts',
      focus: 'Horizontal Pressing & Triceps Overload',
      description: 'Maximum mechanical tension on pectorals and shoulders.',
      estimatedDurationMin: 60,
      estimatedCaloriesBurned: 460,
      warmup: ['Rotator cuff warm-up', 'Scap pushups x 12', 'Light bench pyramid'],
      exercises: [
        adjustExerciseForGoal(chest[0] || EXERCISE_DATABASE[0], goal, level),
        adjustExerciseForGoal(chest[1] || EXERCISE_DATABASE[1], goal, level),
        adjustExerciseForGoal(shoulders[0] || EXERCISE_DATABASE[11], goal, level),
        adjustExerciseForGoal(shoulders[1] || EXERCISE_DATABASE[12], goal, level),
        adjustExerciseForGoal(arms[1] || EXERCISE_DATABASE[14], goal, level),
      ],
    },
    {
      id: 'ppl-pull-1',
      dayNumber: 2,
      dayName: 'Pull 1: Heavy Deadlift & Lat Width',
      focus: 'Deadlifts, Heavy Rows & Bicep Brachii',
      description: 'Back thickness and vertical pulling power with spinal loading.',
      estimatedDurationMin: 65,
      estimatedCaloriesBurned: 490,
      warmup: ['Hamstring sweeps', 'Lat stretches on rack', 'Light deadlift warmup'],
      exercises: [
        adjustExerciseForGoal(back[0] || EXERCISE_DATABASE[3], goal, level),
        adjustExerciseForGoal(back[1] || EXERCISE_DATABASE[4], goal, level),
        adjustExerciseForGoal(back[2] || EXERCISE_DATABASE[5], goal, level),
        adjustExerciseForGoal(arms[0] || EXERCISE_DATABASE[13], goal, level),
        adjustExerciseForGoal(shoulders[2] || EXERCISE_DATABASE[12], goal, level),
      ],
    },
    {
      id: 'ppl-legs-1',
      dayNumber: 3,
      dayName: 'Legs 1: Quad Dominant & Core Stability',
      focus: 'Back Squat, Leg Press & Calves',
      description: 'High quad recruitment and deep knee extensor power.',
      estimatedDurationMin: 60,
      estimatedCaloriesBurned: 520,
      warmup: ['Hip 90/90 flow', 'Ankle mobilization', 'Bodyweight squats'],
      exercises: [
        adjustExerciseForGoal(legs[0] || EXERCISE_DATABASE[7], goal, level),
        adjustExerciseForGoal(legs[2] || EXERCISE_DATABASE[9], goal, level),
        adjustExerciseForGoal(legs[1] || EXERCISE_DATABASE[8], goal, level),
        adjustExerciseForGoal(legs[4] || EXERCISE_DATABASE[10], goal, level),
        adjustExerciseForGoal(core[0] || EXERCISE_DATABASE[16], goal, level),
      ],
    },
    {
      id: 'ppl-push-2',
      dayNumber: 4,
      dayName: 'Push 2: Hypertrophy & Incline Pectorals',
      focus: 'Incline Pressing, Cable Flyes & Triceps Long Head',
      description: 'Upper chest clavicular focus and shoulder isolation pump.',
      estimatedDurationMin: 55,
      estimatedCaloriesBurned: 430,
      warmup: ['Shoulder circles', 'Wall slides x 12', 'Band pressdowns'],
      exercises: [
        adjustExerciseForGoal(chest[1] || EXERCISE_DATABASE[1], goal, level),
        adjustExerciseForGoal(shoulders[1] || EXERCISE_DATABASE[12], goal, level),
        adjustExerciseForGoal(chest[2] || EXERCISE_DATABASE[2], goal, level),
        adjustExerciseForGoal(arms[1] || EXERCISE_DATABASE[14], goal, level),
        adjustExerciseForGoal(shoulders[0] || EXERCISE_DATABASE[11], goal, level),
      ],
    },
    {
      id: 'ppl-pull-2',
      dayNumber: 5,
      dayName: 'Pull 2: Upper Back & Bicep Peak',
      focus: 'Cable Rows, Pull-Ups, Face Pulls & Curls',
      description: 'Scapular retraction, mid-trapezius volume and elbow flexion.',
      estimatedDurationMin: 55,
      estimatedCaloriesBurned: 440,
      warmup: ['Band rows x 20', 'Cat-cow 10 reps', 'T-spine open books'],
      exercises: [
        adjustExerciseForGoal(back[1] || EXERCISE_DATABASE[4], goal, level),
        adjustExerciseForGoal(back[3] || EXERCISE_DATABASE[6], goal, level),
        adjustExerciseForGoal(shoulders[2] || EXERCISE_DATABASE[12], goal, level),
        adjustExerciseForGoal(arms[0] || EXERCISE_DATABASE[13], goal, level),
        adjustExerciseForGoal(core[1] || EXERCISE_DATABASE[17], goal, level),
      ],
    },
    {
      id: 'ppl-legs-2',
      dayNumber: 6,
      dayName: 'Legs 2: Posterior Chain & Hamstring Stretch',
      focus: 'Romanian Deadlifts, Bulgarian Splits & Core',
      description: 'Hamstring hypertrophy, glute engagement, and functional unilateral drive.',
      estimatedDurationMin: 60,
      estimatedCaloriesBurned: 490,
      warmup: ['Hamstring active kicks', 'Glute bridges', 'Lateral band walks'],
      exercises: [
        adjustExerciseForGoal(legs[1] || EXERCISE_DATABASE[8], goal, level),
        adjustExerciseForGoal(legs[0] || EXERCISE_DATABASE[7], goal, level),
        adjustExerciseForGoal(legs[3] || EXERCISE_DATABASE[9], goal, level),
        adjustExerciseForGoal(legs[4] || EXERCISE_DATABASE[10], goal, level),
        adjustExerciseForGoal(core[2] || EXERCISE_DATABASE[18], goal, level),
      ],
    },
  ];

  return {
    id: 'plan-ppl-6day',
    title: 'NeuralFit 6-Day Push-Pull-Legs Split',
    splitType: '6-Day PPL x 2 High Frequency',
    fitnessLevel: level,
    goal,
    equipment: eq,
    days,
  };
}
