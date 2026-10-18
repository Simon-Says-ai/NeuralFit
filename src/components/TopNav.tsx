import React from 'react';
import { Dumbbell, Activity, Flame, Bot } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

interface TopNavProps {
  onOpenAICoach: () => void;
}

interface NavLinkItem {
  id: 'plan' | 'live' | 'progress' | 'nutrition' | 'profile';
  label: string;
  badge?: string;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenAICoach }) => {
  const { activeView, setActiveView, activeWorkoutDay, workoutPlan, startLiveWorkout } = useFitness();

  const navLinks: NavLinkItem[] = [
    { id: 'plan', label: 'Workout Plan' },
    { id: 'live', label: 'Live Workout', badge: activeWorkoutDay ? 'Active' : undefined },
    { id: 'progress', label: 'Progress & Charts' },
    { id: 'nutrition', label: 'Nutrition Hub' },
    { id: 'profile', label: 'Fitness Profile' },
  ];

  const handlePrimaryAction = () => {
    if (activeWorkoutDay) {
      setActiveView('live');
    } else if (workoutPlan.days.length > 0) {
      startLiveWorkout(workoutPlan.days[0]);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveView('plan')}>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            NEURALFIT
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map(link => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveView(link.id)}
                className={`transition-colors whitespace-nowrap relative py-1 text-sm ${
                  isActive
                    ? 'text-blue-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-1.5 text-xs text-blue-400 font-mono">
                    [{link.badge}]
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (AI Coach + Primary CTA) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAICoach}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-md hover:border-slate-600 transition-colors whitespace-nowrap"
            title="Consult AI Strength & Nutrition Coach"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">AI Coach</span>
          </button>

          <button
            onClick={handlePrimaryAction}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm transition-all whitespace-nowrap shadow-blue-600/20"
          >
            {activeWorkoutDay ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-pulse text-white" />
                <span>Resume Session</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 text-white" />
                <span>Start Workout</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav bar strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950 px-2 py-2 overflow-x-auto text-xs">
        {navLinks.map(link => {
          const isActive = activeView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveView(link.id)}
              className={`px-2.5 py-1.5 whitespace-nowrap rounded ${
                isActive ? 'text-blue-400 font-semibold bg-blue-950/40' : 'text-slate-400'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
