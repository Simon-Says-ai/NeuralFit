import React, { useState } from 'react';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { TopNav } from './components/TopNav';
import { WorkoutPlanView } from './components/WorkoutPlanView';
import { LiveWorkoutRunner } from './components/LiveWorkoutRunner';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';
import { NutritionDashboardView } from './components/NutritionDashboardView';
import { ProfileView } from './components/ProfileView';
import { AICoachModal } from './components/AICoachModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { Rocket } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView } = useFitness();
  const [isAICoachOpen, setIsAICoachOpen] = useState<boolean>(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <TopNav
        onOpenAICoach={() => setIsAICoachOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
      />

      <main className="flex-1 pb-16">
        {activeView === 'plan' && (
          <WorkoutPlanView onOpenAICoach={() => setIsAICoachOpen(true)} />
        )}
        {activeView === 'live' && <LiveWorkoutRunner />}
        {activeView === 'progress' && <ProgressAnalyticsView />}
        {activeView === 'nutrition' && (
          <NutritionDashboardView onOpenAICoach={() => setIsAICoachOpen(true)} />
        )}
        {activeView === 'profile' && <ProfileView />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 font-mono text-[11px] flex items-center justify-center sm:justify-start gap-2">
            <span>NEURALFIT · Adaptive Intelligence for Strength & Nutrition Science</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500">
            <button
              onClick={() => setIsDeployGuideOpen(true)}
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Local Run & Next.js Guide</span>
            </button>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span>Periodization v3.8</span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span>Mifflin-St Jeor TDEE Engine</span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span>Local Storage Active</span>
          </div>
        </div>
      </footer>

      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
      />

      <DeploymentGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FitnessProvider>
      <AppContent />
    </FitnessProvider>
  );
}
