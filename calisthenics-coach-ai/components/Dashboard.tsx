
import React, { useState } from 'react';
import type { UserProfile, Assessment, WorkoutPlan, WorkoutLog, WorkoutDay } from '../types';
import WorkoutPlayer from './WorkoutPlayer';
import ProgressChart from './ProgressChart';
import Card from './ui/Card';
import Button from './ui/Button';

interface Props {
  userProfile: UserProfile;
  assessment: Assessment;
  workoutPlan: WorkoutPlan;
  workoutLogs: WorkoutLog[];
  onWorkoutComplete: (log: WorkoutLog) => void;
  onRegeneratePlan: () => void;
}

const Dashboard: React.FC<Props> = ({ userProfile, assessment, workoutPlan, workoutLogs, onWorkoutComplete, onRegeneratePlan }) => {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutDay | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(0);

  if (activeWorkout) {
    return <WorkoutPlayer 
             workoutDay={activeWorkout} 
             weekNumber={selectedWeek + 1}
             onComplete={(log) => {
               onWorkoutComplete(log);
               setActiveWorkout(null);
             }}
             onBack={() => setActiveWorkout(null)}
           />;
  }

  const currentWeek = workoutPlan.weeks[selectedWeek];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
        <p className="text-on-surface-secondary">{workoutPlan.planTitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-bold mb-4">Your Plan for Week {selectedWeek + 1}</h3>
          <div className="flex items-center justify-between mb-4">
              <p className="text-on-surface-secondary">Select a week to view:</p>
              <select 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                className="bg-surface border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary"
              >
                  {workoutPlan.weeks.map((week, index) => (
                      <option key={week.week} value={index}>Week {week.week}</option>
                  ))}
              </select>
          </div>
          <div className="space-y-4">
            {currentWeek.days.map(day => (
              <div key={day.day} className="p-4 bg-background rounded-lg border border-gray-700 flex justify-between items-center">
                <div>
                  <p className="font-bold text-on-surface">Day {day.day}</p>
                  <p className="text-primary">{day.focus}</p>
                </div>
                <Button onClick={() => setActiveWorkout(day)}>Start Workout</Button>
              </div>
            ))}
          </div>
        </Card>
        
        <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold mb-4">Assessment</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-secondary">Overall Score:</span>
                  <span className="font-bold text-secondary">{assessment.overallScore}/100</span>
                </div>
                <h4 className="font-bold pt-2">Priorities:</h4>
                <ul className="list-disc list-inside text-on-surface-secondary">
                  {assessment.priorities.map(p => <li key={p}>{p}</li>)}
                </ul>
              </div>
            </Card>

             <Card>
              <h3 className="text-xl font-bold mb-4">Progress</h3>
              <ProgressChart assessment={assessment} />
            </Card>

            <Card>
              <h3 className="text-xl font-bold mb-2">Adapt Your Plan</h3>
              <p className="text-on-surface-secondary text-sm mb-4">Finished your cycle or finding it too easy/hard? Generate a new plan based on your progress.</p>
              <Button onClick={onRegeneratePlan} className="w-full">
                Generate Next Cycle
              </Button>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
