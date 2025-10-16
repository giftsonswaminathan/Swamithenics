
import React, { useState, useEffect } from 'react';
import OnboardingWizard from './components/OnboardingWizard';
import Dashboard from './components/Dashboard';
import { UserProfile, Assessment, WorkoutPlan, WorkoutLog } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateAssessment, generateWorkoutPlan } from './services/geminiService';
import Loader from './components/ui/Loader';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [assessment, setAssessment] = useLocalStorage<Assessment | null>('assessment', null);
  const [workoutPlan, setWorkoutPlan] = useLocalStorage<WorkoutPlan | null>('workoutPlan', null);
  const [workoutLogs, setWorkoutLogs] = useLocalStorage<WorkoutLog[]>('workoutLogs', []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setIsLoading(true);
    setError(null);
    try {
      setLoadingMessage('Analyzing your strength & skills...');
      const newAssessment = await generateAssessment(profile);
      setAssessment(newAssessment);
      setUserProfile(profile);

      setLoadingMessage('Generating your personalized workout plan...');
      const newPlan = await generateWorkoutPlan(profile, newAssessment, []);
      setWorkoutPlan(newPlan);
    } catch (e) {
      console.error(e);
      setError('Failed to generate your plan. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleWorkoutComplete = async (log: WorkoutLog) => {
    const updatedLogs = [...workoutLogs, log];
    setWorkoutLogs(updatedLogs);
    
    // Check if it's time to generate a new plan (e.g., after 4 weeks)
    // For this demo, we can add a button to trigger it manually.
  };

  const regeneratePlan = async () => {
     if (!userProfile || !assessment) return;
     setIsLoading(true);
     setError(null);
     try {
       setLoadingMessage('Adapting your plan based on your progress...');
       const newPlan = await generateWorkoutPlan(userProfile, assessment, workoutLogs);
       setWorkoutPlan(newPlan);
       setWorkoutLogs([]); // Reset logs after generating a new plan
     } catch(e) {
        console.error(e);
        setError('Failed to regenerate your plan. Please try again.');
     } finally {
        setIsLoading(false);
     }
  };
  
  const handleReset = () => {
    setUserProfile(null);
    setAssessment(null);
    setWorkoutPlan(null);
    setWorkoutLogs([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <Loader />
        <p className="text-on-surface-secondary mt-4 text-lg">{loadingMessage}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Calisthenics Coach AI</h1>
          {userProfile && (
             <button onClick={handleReset} className="text-sm text-on-surface-secondary hover:text-primary">Start Over</button>
          )}
        </header>

        {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {!userProfile || !assessment || !workoutPlan ? (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        ) : (
          <Dashboard 
            userProfile={userProfile}
            assessment={assessment} 
            workoutPlan={workoutPlan}
            workoutLogs={workoutLogs}
            onWorkoutComplete={handleWorkoutComplete}
            onRegeneratePlan={regeneratePlan}
          />
        )}
      </div>
    </div>
  );
};

export default App;
