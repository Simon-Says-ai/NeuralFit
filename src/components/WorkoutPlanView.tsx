import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Play,
  RotateCw,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { WorkoutDay } from '../types/fitness';

interface WorkoutPlanViewProps {
  onOpenAICoach: () => void;
}

export const WorkoutPlanView: React.FC<WorkoutPlanViewProps> = ({ onOpenAICoach }) => {
  const { workoutPlan, startLiveWorkout, profile, regeneratePlan, setActiveView } = useFitness();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const selectedDay: WorkoutDay = workoutPlan.days[selectedDayIndex] || workoutPlan.days[0];

  const heroImage = '/src/assets/images/hero_athlete_training_1792351355182.jpg';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header Split with Image */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Text / Info */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-2">
                <span className="capitalize">{profile.fitnessLevel}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{profile.primaryGoal.replace('_', ' ')}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.trainingDaysPerWeek} Days/Week</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {workoutPlan.title}
              </h1>

              <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-xl">
                Dynamic periodized regimen tailored to your bio-metrics, targeting progressive tension overload, optimal muscle frequency, and metabolic fatigue management.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-4">
              <button
                onClick={() => startLiveWorkout(selectedDay)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-all shadow-sm shadow-blue-600/20"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Day {selectedDay.dayNumber} Session</span>
              </button>

              <button
                onClick={onOpenAICoach}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Ask Coach to Adjust</span>
              </button>

              <button
                onClick={regeneratePlan}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                title="Regenerate Plan from Profile"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Re-roll Split</span>
              </button>

              <button
                onClick={() => setActiveView('profile')}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors ml-auto"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Parameters</span>
              </button>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src={heroImage}
              alt="Athletic training facility"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
          </div>
        </div>
      </div>

      {/* Day Selector Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Weekly Training Split ({workoutPlan.days.length} Active Days)
          </h2>
          <span className="text-xs text-slate-400">
            Equipment: <span className="text-slate-200 capitalize">{profile.availableEquipment.replace('_', ' ')}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {workoutPlan.days.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3 text-left rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500/80 text-white shadow-sm'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-mono text-slate-400">Day {day.dayNumber}</div>
                <div className="text-xs font-semibold truncate text-slate-100 mt-1">
                  {day.dayName.split(':')[0]}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {day.focus}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Routine Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-blue-400 mb-1">
              Scheduled Workout · Day {selectedDay.dayNumber}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {selectedDay.dayName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{selectedDay.description}</p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300 font-mono shrink-0">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>~{selectedDay.estimatedDurationMin} mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>~{selectedDay.estimatedCaloriesBurned} kcal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-blue-400" />
              <span>{selectedDay.exercises.length} movements</span>
            </div>
          </div>
        </div>

        {/* Warmup guidance */}
        {selectedDay.warmup && selectedDay.warmup.length > 0 && (
          <div className="p-4 bg-slate-950/60 rounded-md border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Preparation & Warm-Up Mobility Sequence</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              {selectedDay.warmup.map((w, idx) => (
                <span key={idx}>
                  {w}
                  {idx < selectedDay.warmup.length - 1 && <span className="text-slate-600 mx-2">·</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Exercises List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Prescribed Movement Sequence
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {selectedDay.exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{exercise.name}</h4>
                    <span className="text-xs text-slate-400 capitalize">
                      · {exercise.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed pl-7">
                    {exercise.formCue}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pl-7">
                    <span>Target: {exercise.targetMuscles.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono self-end md:self-center pl-7 md:pl-0">
                  <div className="text-right">
                    <div className="text-white font-semibold">{exercise.sets} sets × {exercise.reps}</div>
                    <div className="text-slate-400">{exercise.restSeconds}s rest · RPE {exercise.targetRpe || 8}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA to start */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Ready to log reps and sets?
          </div>
          <button
            onClick={() => startLiveWorkout(selectedDay)}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-all shadow-sm shadow-blue-600/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Live Tracker for Day {selectedDay.dayNumber}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
