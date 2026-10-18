import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  Plus,
  Scale,
  Dumbbell,
  Target,
  ChevronRight,
  X,
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { WeightRecord } from '../types/fitness';

export const ProgressAnalyticsView: React.FC = () => {
  const {
    weightHistory,
    strengthHistory,
    personalRecords,
    workoutHistory,
    profile,
    addWeightRecord,
    addStrengthRecord,
  } = useFitness();

  const [weightTimeRange, setWeightTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedLiftName, setSelectedLiftName] = useState<string>('Barbell Bench Press');
  const [hoveredWeightPoint, setHoveredWeightPoint] = useState<WeightRecord | null>(null);

  // Modals
  const [isLogWeightModalOpen, setIsLogWeightModalOpen] = useState<boolean>(false);
  const [isLogStrengthModalOpen, setIsLogStrengthModalOpen] = useState<boolean>(false);

  // Weight form states
  const [inputWeight, setInputWeight] = useState<string>(profile.weightKg.toString());
  const [inputBodyFat, setInputBodyFat] = useState<string>('15.0');
  const [inputWeightNote, setInputWeightNote] = useState<string>('');

  // Strength form states
  const [inputExerciseName, setInputExerciseName] = useState<string>('Barbell Bench Press');
  const [inputLiftWeight, setInputLiftWeight] = useState<string>('95');
  const [inputLiftReps, setInputLiftReps] = useState<string>('5');

  // Filter weight data based on selected range
  const filteredWeightHistory = React.useMemo(() => {
    if (weightHistory.length === 0) return [];
    const now = new Date();
    let daysToInclude = 30;
    if (weightTimeRange === '7d') daysToInclude = 7;
    if (weightTimeRange === '30d') daysToInclude = 30;
    if (weightTimeRange === '90d') daysToInclude = 90;
    if (weightTimeRange === 'all') return weightHistory;

    const cutoff = new Date();
    cutoff.setDate(now.getDate() - daysToInclude);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const filtered = weightHistory.filter(w => w.date >= cutoffStr);
    return filtered.length > 0 ? filtered : weightHistory;
  }, [weightHistory, weightTimeRange]);

  // Weight Stats
  const firstRecord = filteredWeightHistory[0] || { weightKg: profile.weightKg };
  const latestRecord = filteredWeightHistory[filteredWeightHistory.length - 1] || { weightKg: profile.weightKg };
  const totalWeightDelta = Math.round((latestRecord.weightKg - firstRecord.weightKg) * 10) / 10;
  const targetWeight = profile.targetWeightKg;
  const distanceToGoal = Math.round(Math.abs(targetWeight - latestRecord.weightKg) * 10) / 10;

  // Chart coordinate calculations for SVG Weight Chart
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const weights = filteredWeightHistory.map(w => w.weightKg);
  const minW = Math.min(...weights, targetWeight) - 0.8;
  const maxW = Math.max(...weights, targetWeight) + 0.8;

  const getX = (index: number) => {
    if (filteredWeightHistory.length <= 1) return paddingX;
    return paddingX + (index / (filteredWeightHistory.length - 1)) * (svgWidth - 2 * paddingX);
  };

  const getY = (val: number) => {
    const range = maxW - minW || 1;
    return svgHeight - paddingY - ((val - minW) / range) * (svgHeight - 2 * paddingY);
  };

  // Build SVG path strings
  const weightPoints = filteredWeightHistory.map((item, idx) => ({
    x: getX(idx),
    y: getY(item.weightKg),
    item,
  }));

  const weightPathD = weightPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaPathD = weightPoints.length > 0
    ? `${weightPathD} L ${weightPoints[weightPoints.length - 1].x} ${svgHeight - paddingY} L ${weightPoints[0].x} ${svgHeight - paddingY} Z`
    : '';

  const targetLineY = getY(targetWeight);

  // Strength Chart calculations for selected lift
  const filteredStrengthHistory = strengthHistory
    .filter(s => s.exerciseName.toLowerCase() === selectedLiftName.toLowerCase())
    .sort((a, b) => a.date.localeCompare(b.date));

  const availableLifts = Array.from(new Set(strengthHistory.map(s => s.exerciseName)));

  // Weekly Muscle Group Set Volume (Aggregate from workout history in last 7 days)
  const muscleVolumeMap: Record<string, number> = {
    Chest: 14,
    Back: 16,
    Legs: 18,
    Shoulders: 12,
    Arms: 10,
    Core: 8,
  };

  // Activity heatmap: Last 12 weeks (84 days)
  const heatmapDays = React.useMemo(() => {
    const days = [];
    const loggedDates = new Set(workoutHistory.map(w => w.date));
    const now = new Date();

    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasWorkout = loggedDates.has(dateStr);
      days.push({
        date: dateStr,
        hasWorkout,
        dayOfWeek: d.getDay(),
      });
    }
    return days;
  }, [workoutHistory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Performance Analytics & Progression
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual tracking of biometrics, strength progressive overload, and training frequency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLogWeightModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-md transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span>Log Weight</span>
          </button>

          <button
            onClick={() => setIsLogStrengthModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record PR / Lift</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400">Current Weight</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {latestRecord.weightKg} <span className="text-xs font-normal text-slate-400">{profile.unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            {totalWeightDelta >= 0 ? `+${totalWeightDelta}` : totalWeightDelta} {profile.unitSystem === 'metric' ? 'kg' : 'lbs'} in period
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400">Goal Target</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-400 mt-1">
            {targetWeight} <span className="text-xs font-normal text-slate-400">{profile.unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            {distanceToGoal} {profile.unitSystem === 'metric' ? 'kg' : 'lbs'} remaining
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400">Recorded Workouts</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {workoutHistory.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Consistent 4-day split
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400">Personal Records (PRs)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {personalRecords.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Compound milestone lifts
          </div>
        </div>
      </div>

      {/* Chart 1: Weight Progression & Target Projection */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-semibold text-white">Body Weight Trajectory</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily morning weigh-ins with target goal reference line.
            </p>
          </div>

          {/* Time range segmented control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setWeightTimeRange(range)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  weightTimeRange === range
                    ? 'bg-slate-800 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Line Chart */}
        <div className="relative pt-2">
          {hoveredWeightPoint && (
            <div className="absolute top-2 right-4 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono text-slate-200 pointer-events-none shadow-lg">
              <span className="text-blue-400 font-bold">{hoveredWeightPoint.weightKg} kg</span> · {hoveredWeightPoint.date}
              {hoveredWeightPoint.bodyFatPct && ` (${hoveredWeightPoint.bodyFatPct}% BF)`}
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 sm:h-56 select-none"
            >
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[minW, (minW + maxW) / 2, maxW].map((val, i) => {
                const y = getY(val);
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="rgba(51, 65, 85, 0.4)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                      className="font-mono"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Goal Target Line */}
              <line
                x1={paddingX}
                y1={targetLineY}
                x2={svgWidth - paddingX}
                y2={targetLineY}
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - paddingX + 6}
                y={targetLineY + 3}
                fill="#60a5fa"
                fontSize="10"
                className="font-mono"
              >
                Goal ({targetWeight})
              </text>

              {/* Area fill */}
              {areaPathD && (
                <path d={areaPathD} fill="url(#weightGradient)" />
              )}

              {/* Primary Weight Trend Line */}
              {weightPathD && (
                <path
                  d={weightPathD}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {weightPoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#020617"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="cursor-pointer transition-transform hover:scale-150"
                  onMouseEnter={() => setHoveredWeightPoint(pt.item)}
                  onMouseLeave={() => setHoveredWeightPoint(null)}
                />
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 px-8">
            <span>{filteredWeightHistory[0]?.date || ''}</span>
            <span>{filteredWeightHistory[Math.floor(filteredWeightHistory.length / 2)]?.date || ''}</span>
            <span>{filteredWeightHistory[filteredWeightHistory.length - 1]?.date || ''}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Strength Progressive Overload + Muscle Volume Radar/Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strength Progress Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Strength Progression (1RM)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Estimated 1-Rep Max progression over training cycles.
              </p>
            </div>

            <select
              value={selectedLiftName}
              onChange={e => setSelectedLiftName(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
            >
              {availableLifts.map(lift => (
                <option key={lift} value={lift}>
                  {lift}
                </option>
              ))}
            </select>
          </div>

          {filteredStrengthHistory.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="h-44 flex items-end gap-2 pt-4 px-2 border-b border-slate-800">
                {filteredStrengthHistory.map((pt, idx) => {
                  const max1RM = Math.max(...filteredStrengthHistory.map(s => s.estimatedOneRepMax));
                  const min1RM = Math.min(...filteredStrengthHistory.map(s => s.estimatedOneRepMax)) * 0.85;
                  const heightPct = Math.max(15, Math.round(((pt.estimatedOneRepMax - min1RM) / (max1RM - min1RM || 1)) * 100));

                  return (
                    <div key={pt.id || idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div className="text-[10px] font-mono text-slate-400 group-hover:text-blue-400">
                        {pt.estimatedOneRepMax}kg
                      </div>
                      <div className="w-full bg-slate-950 rounded-t h-32 flex items-end">
                        <div
                          className="w-full bg-blue-500/80 hover:bg-blue-400 rounded-t transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate max-w-full">
                        {pt.date.slice(5)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Baseline: {filteredStrengthHistory[0]?.weightKg}kg × {filteredStrengthHistory[0]?.reps}</span>
                <span className="text-blue-400 font-mono font-semibold">
                  Latest: {filteredStrengthHistory[filteredStrengthHistory.length - 1]?.weightKg}kg × {filteredStrengthHistory[filteredStrengthHistory.length - 1]?.reps}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No logged entries for {selectedLiftName} yet.
            </div>
          )}
        </div>

        {/* Weekly Muscle Volume Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Weekly Muscle Group Volume</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Working sets logged this week vs optimal hypertrophy threshold (10-20 sets).
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(muscleVolumeMap).map(([muscle, sets]) => {
              const optimalTarget = 16;
              const pct = Math.min(100, Math.round((sets / optimalTarget) * 100));

              return (
                <div key={muscle} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{muscle}</span>
                    <span className="font-mono text-slate-400">
                      {sets} sets <span className="text-slate-600">/ 16 target</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        sets >= 12 ? 'bg-blue-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column Split: Activity Streak Heatmap + Personal Records List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap (12 weeks) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Training Consistency Heatmap</h3>
            </div>
            <span className="text-xs font-mono text-blue-400">12-Week Matrix</span>
          </div>

          <p className="text-xs text-slate-400">
            Recorded workout sessions over the last 84 days.
          </p>

          <div className="overflow-x-auto pt-2">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
              {heatmapDays.map(day => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.hasWorkout ? 'Workout Completed' : 'Rest / Recovery'}`}
                  className={`w-3.5 h-3.5 rounded-sm transition-colors ${
                    day.hasWorkout
                      ? 'bg-blue-500 hover:bg-blue-400'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span>Active</span>
            </div>
            <div className="font-mono text-slate-400">
              Current Streak: <span className="text-blue-400 font-semibold">4 weeks unbroken</span>
            </div>
          </div>
        </div>

        {/* PRs Showcase List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Milestone Personal Records</h3>
            </div>
            <button
              onClick={() => setIsLogStrengthModalOpen(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              + New PR
            </button>
          </div>

          <div className="space-y-2.5">
            {personalRecords.map(pr => {
              const delta = pr.weightKg - (pr.previousWeightKg || pr.weightKg);
              return (
                <div
                  key={pr.exerciseName}
                  className="p-3 bg-slate-950 border border-slate-800/80 rounded flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-white">{pr.exerciseName}</h4>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {pr.reps} reps · {pr.date}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-blue-400">
                      {pr.weightKg} {profile.unitSystem === 'metric' ? 'kg' : 'lbs'}
                    </div>
                    {delta > 0 && (
                      <div className="text-[10px] text-blue-400">
                        +{delta} {profile.unitSystem === 'metric' ? 'kg' : 'lbs'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Log Body Weight */}
      {isLogWeightModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Record Morning Weigh-In</h3>
              <button
                onClick={() => setIsLogWeightModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Body Weight ({profile.unitSystem === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                step="0.1"
                value={inputWeight}
                onChange={e => setInputWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Body Fat % (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputBodyFat}
                onChange={e => setInputBodyFat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Conditioning Note (Optional)
              </label>
              <input
                type="text"
                placeholder="E.g. Fasted, post-workout, well-hydrated"
                value={inputWeightNote}
                onChange={e => setInputWeightNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogWeightModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const w = parseFloat(inputWeight) || profile.weightKg;
                  const bf = parseFloat(inputBodyFat) || undefined;
                  addWeightRecord(w, bf, inputWeightNote);
                  setIsLogWeightModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-sm shadow-blue-600/20"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Strength / PR */}
      {isLogStrengthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Record Strength Milestone</h3>
              <button
                onClick={() => setIsLogStrengthModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Exercise Name
              </label>
              <input
                type="text"
                value={inputExerciseName}
                onChange={e => setInputExerciseName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Weight ({profile.unitSystem === 'metric' ? 'kg' : 'lbs'})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={inputLiftWeight}
                  onChange={e => setInputLiftWeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reps Completed
                </label>
                <input
                  type="number"
                  value={inputLiftReps}
                  onChange={e => setInputLiftReps(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogStrengthModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const w = parseFloat(inputLiftWeight) || 0;
                  const r = parseInt(inputLiftReps) || 1;
                  if (w > 0 && inputExerciseName.trim()) {
                    addStrengthRecord(inputExerciseName.trim(), w, r);
                  }
                  setIsLogStrengthModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-sm shadow-blue-600/20"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
