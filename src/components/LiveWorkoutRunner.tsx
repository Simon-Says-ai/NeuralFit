import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Plus,
  Play,
  RotateCcw,
  SkipForward,
  Trophy,
  X,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  HelpCircle,
  Volume1,
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { playSetCompleteSound, playTimerDone, playTimerTick } from '../utils/soundEffects';
import { Exercise, WorkoutDay } from '../types/fitness';
import { EXERCISE_DATABASE } from '../utils/regimenGenerator';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  parseVoiceWorkoutCommand,
  speakText,
  stopSpeaking,
} from '../services/voiceService';

export const LiveWorkoutRunner: React.FC = () => {
  const {
    activeWorkoutDay,
    activeWorkoutSessionLogs,
    activeWorkoutElapsedSeconds,
    cancelLiveWorkout,
    logLiveSet,
    finishLiveWorkout,
    workoutPlan,
    startLiveWorkout,
    profile,
  } = useFitness();

  // Rest timer states
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [restInitialSeconds, setRestInitialSeconds] = useState<number>(90);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [spokenCoachEnabled, setSpokenCoachEnabled] = useState<boolean>(true);

  // Voice AI Recognition states
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [isVoiceHelpOpen, setIsVoiceHelpOpen] = useState<boolean>(false);
  const recognizerRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  // Finish modal
  const [isFinishModalOpen, setIsFinishModalOpen] = useState<boolean>(false);
  const [workoutRating, setWorkoutRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [workoutNotes, setWorkoutNotes] = useState<string>('');

  // Add exercise modal
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState<boolean>(false);

  // Active exercise selection
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  // Initialize selected exercise when active workout starts
  useEffect(() => {
    if (activeWorkoutDay && activeWorkoutDay.exercises.length > 0 && !selectedExerciseId) {
      setSelectedExerciseId(activeWorkoutDay.exercises[0].id);
    }
  }, [activeWorkoutDay, selectedExerciseId]);

  // Rest Timer Interval with Spoken Countdown
  useEffect(() => {
    if (!isRestTimerActive || restTimerSeconds <= 0) return;

    const interval = setInterval(() => {
      setRestTimerSeconds(prev => {
        if (prev <= 1) {
          setIsRestTimerActive(false);
          if (soundEnabled) playTimerDone();
          if (spokenCoachEnabled) {
            const currentEx = activeWorkoutDay?.exercises.find(e => e.id === selectedExerciseId);
            speakText(`Rest complete! Prepare for ${currentEx?.name || 'your next set'}.`);
          }
          return 0;
        }

        // Spoken countdown at 3, 2, 1
        if (spokenCoachEnabled && (prev === 4 || prev === 3 || prev === 2)) {
          speakText(`${prev - 1}`);
        } else if (soundEnabled && prev <= 4 && prev > 1) {
          playTimerTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRestTimerActive, restTimerSeconds, soundEnabled, spokenCoachEnabled, activeWorkoutDay, selectedExerciseId]);

  // Voice Assistant: Handler for incoming speech commands
  const handleVoiceCommand = (transcript: string) => {
    setVoiceTranscript(transcript);
    const parsed = parseVoiceWorkoutCommand(transcript);

    const currentEx = activeWorkoutDay?.exercises.find(e => e.id === selectedExerciseId) || activeWorkoutDay?.exercises[0];
    if (!currentEx) return;

    const exerciseLog = activeWorkoutSessionLogs.find(e => e.exerciseId === currentEx.id);

    if (parsed.type === 'log_set') {
      // Find target set or next incomplete set
      let targetSetNumber = parsed.setNumber;
      if (!targetSetNumber && exerciseLog) {
        const nextIncomplete = exerciseLog.sets.find(s => !s.completed);
        targetSetNumber = nextIncomplete ? nextIncomplete.setNumber : 1;
      }

      if (targetSetNumber && exerciseLog) {
        const existingSet = exerciseLog.sets.find(s => s.setNumber === targetSetNumber);
        const weight = parsed.weight ?? existingSet?.actualWeightKg ?? 0;
        const reps = parsed.reps ?? existingSet?.actualReps ?? 10;

        logLiveSet(currentEx.id, targetSetNumber, weight, reps, true);
        if (soundEnabled) playSetCompleteSound();
        triggerRestTimer(currentEx.restSeconds || 90);

        const feedbackMsg = `Logged Set ${targetSetNumber}: ${weight}${profile.unitSystem === 'metric' ? 'kg' : 'lbs'} for ${reps} reps.`;
        setVoiceFeedback(feedbackMsg);
        if (spokenCoachEnabled) speakText(`${feedbackMsg} Starting ${currentEx.restSeconds || 90} seconds rest.`);
      }
    } else if (parsed.type === 'complete_current_set') {
      if (exerciseLog) {
        const nextIncomplete = exerciseLog.sets.find(s => !s.completed);
        if (nextIncomplete) {
          logLiveSet(currentEx.id, nextIncomplete.setNumber, nextIncomplete.actualWeightKg, nextIncomplete.actualReps, true);
          if (soundEnabled) playSetCompleteSound();
          triggerRestTimer(currentEx.restSeconds || 90);
          const feedbackMsg = `Set ${nextIncomplete.setNumber} completed!`;
          setVoiceFeedback(feedbackMsg);
          if (spokenCoachEnabled) speakText(feedbackMsg);
        }
      }
    } else if (parsed.type === 'start_rest') {
      const rest = parsed.restSeconds || currentEx.restSeconds || 90;
      triggerRestTimer(rest);
      const feedbackMsg = `Rest timer started for ${rest} seconds.`;
      setVoiceFeedback(feedbackMsg);
      if (spokenCoachEnabled) speakText(feedbackMsg);
    } else if (parsed.type === 'adjust_rest') {
      const adjust = parsed.adjustSeconds || 30;
      adjustRestTime(adjust);
      setVoiceFeedback(`${adjust > 0 ? '+' : ''}${adjust}s added to rest.`);
    } else if (parsed.type === 'skip_rest') {
      setIsRestTimerActive(false);
      setRestTimerSeconds(0);
      setVoiceFeedback('Rest skipped.');
      if (spokenCoachEnabled) speakText('Rest skipped. Ready to lift.');
    } else if (parsed.type === 'next_exercise') {
      const currentIndex = activeWorkoutDay?.exercises.findIndex(e => e.id === selectedExerciseId) ?? -1;
      if (activeWorkoutDay && currentIndex < activeWorkoutDay.exercises.length - 1) {
        const nextEx = activeWorkoutDay.exercises[currentIndex + 1];
        setSelectedExerciseId(nextEx.id);
        const feedbackMsg = `Switched to ${nextEx.name}`;
        setVoiceFeedback(feedbackMsg);
        if (spokenCoachEnabled) speakText(feedbackMsg);
      }
    } else if (parsed.type === 'prev_exercise') {
      const currentIndex = activeWorkoutDay?.exercises.findIndex(e => e.id === selectedExerciseId) ?? -1;
      if (activeWorkoutDay && currentIndex > 0) {
        const prevEx = activeWorkoutDay.exercises[currentIndex - 1];
        setSelectedExerciseId(prevEx.id);
        const feedbackMsg = `Switched to ${prevEx.name}`;
        setVoiceFeedback(feedbackMsg);
        if (spokenCoachEnabled) speakText(feedbackMsg);
      }
    } else if (parsed.type === 'read_cues') {
      readCurrentFormCues();
    }
  };

  // Toggle voice listening
  const toggleVoiceControl = () => {
    if (isVoiceListening) {
      recognizerRef.current?.stop();
      setIsVoiceListening(false);
      setVoiceFeedback('Voice control paused.');
    } else {
      if (!isSpeechRecognitionSupported()) {
        alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      recognizerRef.current = createSpeechRecognizer(
        (text, isFinal) => {
          if (isFinal) {
            handleVoiceCommand(text);
          } else {
            setVoiceTranscript(text);
          }
        },
        () => {
          // If stopped unexpectedly while still marked listening, restart
          if (isVoiceListening) {
            try { recognizerRef.current?.start(); } catch {}
          }
        },
        (err) => {
          console.warn('Speech error:', err);
        }
      );

      recognizerRef.current?.start();
      setIsVoiceListening(true);
      setVoiceFeedback('Listening for hands-free workout commands...');
      if (spokenCoachEnabled) speakText('Voice AI active. Speak commands like: 80 kilos for 8 reps, or complete set.');
    }
  };

  const readCurrentFormCues = () => {
    const currentEx = activeWorkoutDay?.exercises.find(e => e.id === selectedExerciseId) || activeWorkoutDay?.exercises[0];
    if (currentEx) {
      speakText(`Form cues for ${currentEx.name}. ${currentEx.formCue}. Targeted muscles are ${currentEx.targetMuscles.join(', ')}.`);
    }
  };

  const triggerRestTimer = (seconds: number) => {
    setRestInitialSeconds(seconds);
    setRestTimerSeconds(seconds);
    setIsRestTimerActive(true);
  };

  const adjustRestTime = (delta: number) => {
    setRestTimerSeconds(prev => Math.max(0, prev + delta));
  };

  const handleToggleSet = (
    exerciseId: string,
    setNumber: number,
    weightKg: number,
    reps: number,
    currentCompleted: boolean,
    restSeconds: number
  ) => {
    const nextCompleted = !currentCompleted;
    logLiveSet(exerciseId, setNumber, weightKg, reps, nextCompleted);

    if (nextCompleted) {
      if (soundEnabled) playSetCompleteSound();
      triggerRestTimer(restSeconds || 90);
      if (spokenCoachEnabled) {
        speakText(`Set ${setNumber} completed. Starting ${restSeconds || 90} seconds rest.`);
      }
    }
  };


  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If no workout is in progress, show quick launch selector
  if (!activeWorkoutDay) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
          <div className="w-14 h-14 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Play className="w-7 h-7 ml-1" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Workout Session</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Select a workout from your tailored <span className="text-slate-200 font-medium">{workoutPlan.title}</span> routine to start logging sets, tracking rest intervals, and recording personal bests.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
            {workoutPlan.days.map((day: WorkoutDay) => (
              <button
                key={day.id}
                onClick={() => startLiveWorkout(day)}
                className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-lg text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs text-slate-400 font-mono mb-1">Day {day.dayNumber}</div>
                  <div className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {day.dayName}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">{day.focus}</div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">{day.exercises.length} exercises</span>
                  <span className="text-blue-400 font-medium">Start →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate live volume & completed sets
  let liveTotalVolume = 0;
  let totalSetsCount = 0;
  let completedSetsCount = 0;

  activeWorkoutSessionLogs.forEach(ex => {
    ex.sets.forEach(s => {
      totalSetsCount++;
      if (s.completed) {
        completedSetsCount++;
        liveTotalVolume += (s.actualWeightKg || 0) * (s.actualReps || 0);
      }
    });
  });

  const completionPct = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;
  const currentExercise = activeWorkoutDay.exercises.find(e => e.id === selectedExerciseId) || activeWorkoutDay.exercises[0];
  const currentExerciseLog = activeWorkoutSessionLogs.find(e => e.exerciseId === currentExercise?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Session Monitor */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
              <span>Day {activeWorkoutDay.dayNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{activeWorkoutDay.focus}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activeWorkoutDay.dayName}
            </h1>
          </div>

          {/* Live Metrics Grid */}
          <div className="flex items-center flex-wrap gap-4 sm:gap-6 bg-slate-950/80 px-4 py-3 rounded-lg border border-slate-800/80">
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Elapsed</span>
              </div>
              <div className="text-base font-bold font-mono tabular-nums text-blue-400">
                {formatTime(activeWorkoutElapsedSeconds)}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Volume Lifted</span>
              </div>
              <div className="text-base font-bold font-mono tabular-nums text-white">
                {liveTotalVolume.toLocaleString()} {profile.unitSystem === 'metric' ? 'kg' : 'lbs'}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <div className="text-xs text-slate-400">Sets Completed</div>
              <div className="text-base font-bold font-mono tabular-nums text-slate-200">
                {completedSetsCount} / {totalSetsCount} ({completionPct}%)
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Hands-Free Voice AI Button */}
              <button
                onClick={toggleVoiceControl}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  isVoiceListening
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                }`}
                title={isVoiceListening ? 'Stop hands-free voice control' : 'Start hands-free voice control'}
              >
                {isVoiceListening ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isVoiceListening ? 'Voice Active' : 'Hands-Free Voice'}</span>
              </button>

              {/* Spoken Coach Toggle */}
              <button
                onClick={() => {
                  setSpokenCoachEnabled(!spokenCoachEnabled);
                  if (spokenCoachEnabled) stopSpeaking();
                }}
                className={`p-2 rounded transition-colors ${
                  spokenCoachEnabled
                    ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800'
                }`}
                title={spokenCoachEnabled ? 'Spoken Voice Coaching: ON' : 'Spoken Voice Coaching: OFF'}
              >
                {spokenCoachEnabled ? <Volume1 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Voice Help button */}
              <button
                onClick={() => setIsVoiceHelpOpen(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Voice Commands Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title={soundEnabled ? 'Timer chimes: ON' : 'Timer chimes: OFF'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              <button
                onClick={() => setIsFinishModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-blue-600/20"
              >
                Finish Workout
              </button>
            </div>
          </div>
        </div>

        {/* Live Voice Status Ribbon */}
        {isVoiceListening && (
          <div className="mt-4 p-3 bg-slate-950 border border-blue-500/40 rounded-lg flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span className="font-semibold text-blue-400 shrink-0">Voice Listener:</span>
              <span className="text-slate-300 italic truncate">
                {voiceTranscript ? `"${voiceTranscript}"` : 'Listening... Say "85 kg for 6 reps" or "Complete set"'}
              </span>
            </div>

            {voiceFeedback && (
              <span className="text-blue-300 font-mono text-[11px] shrink-0 bg-blue-950/60 px-2.5 py-1 rounded border border-blue-800/80">
                {voiceFeedback}
              </span>
            )}
          </div>
        )}

        {/* Progress line */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>


      {/* Main Grid: Left Exercise Column + Right Interactive Rest Timer & Form Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Exercises & Set Logger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Session Exercises</h2>
            <button
              onClick={() => setIsAddExerciseModalOpen(true)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Lift</span>
            </button>
          </div>

          {activeWorkoutDay.exercises.map((exercise: Exercise, exIndex: number) => {
            const exerciseLog = activeWorkoutSessionLogs.find(e => e.exerciseId === exercise.id);
            const isSelected = selectedExerciseId === exercise.id;
            const completedSets = exerciseLog?.sets.filter(s => s.completed).length || 0;
            const allDone = completedSets === exercise.sets;

            return (
              <div
                key={exercise.id}
                className={`bg-slate-900 border rounded-lg transition-all ${
                  isSelected ? 'border-blue-500/60 ring-1 ring-blue-500/20' : 'border-slate-800'
                }`}
              >
                {/* Exercise Header */}
                <div
                  onClick={() => setSelectedExerciseId(exercise.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-800 text-xs font-mono text-slate-300 flex items-center justify-center">
                      {exIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        {exercise.name}
                        {allDone && (
                          <span className="text-xs font-normal text-blue-400 font-mono">[Complete]</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{exercise.sets} sets</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{exercise.reps} reps</span>
                        <span aria-hidden="true">·</span>
                        <span>{exercise.restSeconds}s rest</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    {completedSets} / {exercise.sets} sets
                  </div>
                </div>

                {/* Set Log Table (Expanded when selected) */}
                {isSelected && exerciseLog && (
                  <div className="border-t border-slate-800 px-4 py-4 bg-slate-950/40 space-y-3">
                    {/* Form reminder cue */}
                    <p className="text-xs text-slate-400 italic">
                      Cues: {exercise.formCue}
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-800 font-mono">
                            <th className="py-2 px-2">Set</th>
                            <th className="py-2 px-2">Target</th>
                            <th className="py-2 px-2">Weight ({profile.unitSystem === 'metric' ? 'kg' : 'lbs'})</th>
                            <th className="py-2 px-2">Reps Done</th>
                            <th className="py-2 px-2 text-center">Completed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {exerciseLog.sets.map((setLog) => (
                            <tr
                              key={setLog.setNumber}
                              className={`transition-colors ${setLog.completed ? 'bg-blue-950/20 text-slate-200' : 'text-slate-300'}`}
                            >
                              <td className="py-2.5 px-2 font-semibold">
                                #{setLog.setNumber}
                              </td>
                              <td className="py-2.5 px-2 text-slate-400">
                                {setLog.targetReps}
                              </td>
                              <td className="py-2.5 px-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={setLog.actualWeightKg === 0 ? '' : setLog.actualWeightKg}
                                  onChange={e => {
                                    const val = parseFloat(e.target.value) || 0;
                                    logLiveSet(
                                      exercise.id,
                                      setLog.setNumber,
                                      val,
                                      setLog.actualReps,
                                      setLog.completed
                                    );
                                  }}
                                  placeholder="0"
                                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-400 tabular-nums"
                                />
                              </td>
                              <td className="py-2.5 px-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={setLog.actualReps === 0 ? '' : setLog.actualReps}
                                  onChange={e => {
                                    const val = parseInt(e.target.value) || 0;
                                    logLiveSet(
                                      exercise.id,
                                      setLog.setNumber,
                                      setLog.actualWeightKg,
                                      val,
                                      setLog.completed
                                    );
                                  }}
                                  placeholder="0"
                                  className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-400 tabular-nums"
                                />
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleSet(
                                      exercise.id,
                                      setLog.setNumber,
                                      setLog.actualWeightKg,
                                      setLog.actualReps,
                                      setLog.completed,
                                      exercise.restSeconds
                                    )
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    setLog.completed
                                      ? 'text-blue-400 hover:text-blue-300'
                                      : 'text-slate-600 hover:text-slate-400'
                                  }`}
                                  title={setLog.completed ? 'Mark incomplete' : 'Mark completed'}
                                >
                                  {setLog.completed ? (
                                    <CheckCircle2 className="w-5 h-5 fill-blue-500/20" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={cancelLiveWorkout}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Cancel Workout Session
            </button>

            <button
              onClick={() => setIsFinishModalOpen(true)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm shadow-blue-600/20"
            >
              Complete & Save Session
            </button>
          </div>
        </div>

        {/* Right Column: Rest Timer & Form Guide */}
        <div className="space-y-6">
          {/* Rest Timer Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
              <span className="font-semibold text-slate-200">Rest Interval</span>
              <span className="font-mono">{isRestTimerActive ? 'COUNTING DOWN' : 'IDLE'}</span>
            </div>

            {/* Countdown Display */}
            <div className="py-4">
              <div className="text-5xl font-mono font-bold tabular-nums text-white mb-2">
                {formatTime(restTimerSeconds)}
              </div>
              <div className="text-xs text-slate-400">
                {isRestTimerActive
                  ? `Recovery for ${currentExercise?.name || 'next set'}`
                  : 'Start a set or trigger rest manually'}
              </div>
            </div>

            {/* Quick Adjustment Controls */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => adjustRestTime(-15)}
                disabled={!isRestTimerActive}
                className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-40"
              >
                -15s
              </button>
              <button
                onClick={() => adjustRestTime(30)}
                className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                +30s
              </button>
              <button
                onClick={() => adjustRestTime(60)}
                className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                +60s
              </button>
              {isRestTimerActive ? (
                <button
                  onClick={() => setIsRestTimerActive(false)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-mono bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Skip</span>
                </button>
              ) : (
                <button
                  onClick={() => triggerRestTimer(currentExercise?.restSeconds || 90)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-mono bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start ({currentExercise?.restSeconds || 90}s)</span>
                </button>
              )}
            </div>
          </div>

          {/* Current Lift Form & Muscle Details */}
          {currentExercise && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
              <div>
                <span className="text-xs text-blue-400 font-mono">Current Focus</span>
                <h3 className="text-base font-semibold text-white mt-1">
                  {currentExercise.name}
                </h3>
              </div>

              <div>
                <h4 className="text-xs text-slate-400 font-medium mb-1">Target Muscle Groups</h4>
                <div className="flex flex-wrap gap-1 text-xs text-slate-300">
                  {currentExercise.targetMuscles.map((m, idx) => (
                    <span key={m}>
                      {m}
                      {idx < currentExercise.targetMuscles.length - 1 && <span className="text-slate-600 mx-1">·</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs text-slate-400 font-medium">Biomechanical Cues</h4>
                  <button
                    onClick={readCurrentFormCues}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                    title="Read form cues aloud"
                  >
                    <Volume1 className="w-3.5 h-3.5" />
                    <span>Speak Cues</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800/80">
                  {currentExercise.formCue}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>RPE Target: {currentExercise.targetRpe || 8} / 10</span>
                <span>Rest: {currentExercise.restSeconds}s</span>
              </div>
            </div>
          )}

          {/* Warmup Checklist */}
          {activeWorkoutDay.warmup && activeWorkoutDay.warmup.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h4 className="text-xs font-semibold text-slate-200 mb-2">Prescribed Warm-up</h4>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                {activeWorkoutDay.warmup.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Finish Workout Modal */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Workout Summary</h3>
              </div>
              <button
                onClick={() => setIsFinishModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800 text-center font-mono">
              <div>
                <div className="text-xs text-slate-400">Duration</div>
                <div className="text-base font-bold text-blue-400 mt-0.5">
                  {Math.max(1, Math.round(activeWorkoutElapsedSeconds / 60))}m
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Volume</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {liveTotalVolume.toLocaleString()} {profile.unitSystem === 'metric' ? 'kg' : 'lbs'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Completed</div>
                <div className="text-base font-bold text-slate-200 mt-0.5">
                  {completedSetsCount}/{totalSetsCount}
                </div>
              </div>
            </div>

            {/* Feeling Rating */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Session Intensity & Feeling (1 = Exhausted, 5 = Peak Strength)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setWorkoutRating(star as 1 | 2 | 3 | 4 | 5)}
                    className={`flex-1 py-2 text-xs font-mono font-semibold rounded border transition-colors ${
                      workoutRating === star
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {star}★
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Workout Notes (Optional)
              </label>
              <textarea
                value={workoutNotes}
                onChange={e => setWorkoutNotes(e.target.value)}
                placeholder="E.g. Increased squat by 2.5kg, paused at bottom for 1 sec. Good knee stability."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFinishModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back to Session
              </button>
              <button
                type="button"
                onClick={() => {
                  const duration = Math.max(1, Math.round(activeWorkoutElapsedSeconds / 60));
                  finishLiveWorkout(duration, workoutRating, workoutNotes);
                  setIsFinishModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm shadow-blue-600/20"
              >
                Save & Update Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Exercise Modal */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Exercise to Session</h3>
              <button
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select an exercise from the library to append to today&apos;s active session.
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800 pr-1">
              {EXERCISE_DATABASE.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => {
                    // Append exercise to active workout
                    activeWorkoutDay.exercises.push(ex);
                    activeWorkoutSessionLogs.push({
                      exerciseId: ex.id,
                      exerciseName: ex.name,
                      category: ex.category,
                      sets: Array.from({ length: ex.sets }, (_, i) => ({
                        setNumber: i + 1,
                        targetReps: ex.reps,
                        actualWeightKg: 0,
                        actualReps: parseInt(ex.reps.split('-')[0]) || 10,
                        completed: false,
                      })),
                    });
                    setSelectedExerciseId(ex.id);
                    setIsAddExerciseModalOpen(false);
                  }}
                  className="py-2.5 px-2 hover:bg-slate-800 cursor-pointer rounded flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-medium text-slate-200">{ex.name}</div>
                    <div className="text-[11px] text-slate-500 capitalize">{ex.category} · {ex.reps} reps</div>
                  </div>
                  <Plus className="w-4 h-4 text-blue-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Voice Commands Guide Modal */}
      {isVoiceHelpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Hands-Free Voice AI Commands</h3>
              </div>
              <button
                onClick={() => setIsVoiceHelpOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Activate hands-free mode by clicking <span className="text-rose-400 font-semibold">Hands-Free Voice</span>. While lifting, speak natural commands without touching your device:
            </p>

            <div className="space-y-3 font-mono text-xs max-h-72 overflow-y-auto pr-1">
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-blue-400 font-semibold mb-1">&quot;80 kg for 8 reps&quot; / &quot;Set 1 100 for 5&quot;</div>
                <div className="text-slate-400 text-[11px] font-sans">
                  Logs the specified weight and reps for the current exercise, checks it off, and starts the rest interval.
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-blue-400 font-semibold mb-1">&quot;Done&quot; / &quot;Complete set&quot;</div>
                <div className="text-slate-400 text-[11px] font-sans">
                  Marks the next pending set as finished with current target numbers and triggers rest.
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-blue-400 font-semibold mb-1">&quot;Start rest&quot; / &quot;Rest 90 seconds&quot;</div>
                <div className="text-slate-400 text-[11px] font-sans">
                  Triggers recovery countdown timer with audible 3-2-1 spoken countdown.
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-blue-400 font-semibold mb-1">&quot;Add 30 seconds&quot; / &quot;Skip rest&quot;</div>
                <div className="text-slate-400 text-[11px] font-sans">
                  Extends recovery interval or instantly skips to the next working set.
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <div className="text-blue-400 font-semibold mb-1">&quot;Next exercise&quot; / &quot;Read cues&quot;</div>
                <div className="text-slate-400 text-[11px] font-sans">
                  Switches active workout movement or speaks form cues into your headphones aloud.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsVoiceHelpOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-sm shadow-blue-600/20"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

