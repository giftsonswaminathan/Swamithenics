
import React, { useState, useEffect } from 'react';
import type { WorkoutDay, WorkoutLog, Exercise } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';

interface Props {
  workoutDay: WorkoutDay;
  weekNumber: number;
  onComplete: (log: WorkoutLog) => void;
  onBack: () => void;
}

const WorkoutPlayer: React.FC<Props> = ({ workoutDay, weekNumber, onComplete, onBack }) => {
  const allExercises = [...workoutDay.warmup, ...workoutDay.exercises, ...workoutDay.cooldown];
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [completedLog, setCompletedLog] = useState<WorkoutLog['completedExercises']>([]);

  const currentExercise = allExercises[currentExerciseIndex];
  
  useEffect(() => {
    let timer: number;
    if (isResting && restTime > 0) {
      timer = window.setInterval(() => {
        setRestTime(t => t - 1);
      }, 1000);
    } else if (isResting && restTime === 0) {
      setIsResting(false);
      if (currentSet < currentExercise.sets) {
        setCurrentSet(s => s + 1);
      } else {
        handleNextExercise();
      }
    }
    return () => clearInterval(timer);
  }, [isResting, restTime, currentSet, currentExercise]);

  const handleNextExercise = () => {
    if(currentExerciseIndex < allExercises.length - 1) {
        setCurrentExerciseIndex(i => i + 1);
        setCurrentSet(1);
        setIsResting(false);
    } else {
        // Workout complete
        const finalLog: WorkoutLog = {
            date: new Date().toISOString(),
            week: weekNumber,
            day: workoutDay.day,
            completedExercises: completedLog
        };
        onComplete(finalLog);
    }
  };
  
  const handleSetComplete = (reps: number, rpe: number, difficulty: 'easy' | 'just_right' | 'hard') => {
      // For simplicity, we'll log the whole exercise at once.
      // A more complex app would log each set.
      const exerciseLog = {
          exerciseName: currentExercise.name,
          sets: Array(currentExercise.sets).fill({ reps: reps }), // simplified
          rpe,
          difficulty
      };
      setCompletedLog(prev => [...prev, exerciseLog]);
      
      setRestTime(currentExercise.rest);
      setIsResting(true);
  };
  
  // A simple placeholder for logging UI
  const [tempReps, setTempReps] = useState(8);
  const [tempRpe, setTempRpe] = useState(7);
  
  const getExerciseType = (index: number) => {
      if (index < workoutDay.warmup.length) return "Warm-up";
      if (index < workoutDay.warmup.length + workoutDay.exercises.length) return "Workout";
      return "Cooldown";
  }

  if (!currentExercise) return null;

  return (
    <div>
        <Button onClick={onBack} variant="secondary" className="mb-4">Back to Dashboard</Button>
      <Card>
        {isResting ? (
          <div className="flex flex-col items-center justify-center h-96">
            <p className="text-2xl text-on-surface-secondary">REST</p>
            <p className="text-8xl font-bold text-secondary">{restTime}</p>
            <p className="text-on-surface-secondary mt-4">Next: {allExercises[currentExerciseIndex + 1]?.name}</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm uppercase tracking-wider bg-primary/20 text-primary px-2 py-1 rounded">{getExerciseType(currentExerciseIndex)}</span>
                <span className="text-on-surface-secondary">{currentExerciseIndex + 1} / {allExercises.length}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">{currentExercise.name}</h2>
            <p className="text-lg text-primary mb-4">{currentExercise.progression}</p>
            
            <div className="grid grid-cols-3 gap-4 text-center my-6">
                <div>
                    <p className="text-3xl font-bold">{currentSet} / {currentExercise.sets}</p>
                    <p className="text-on-surface-secondary">Sets</p>
                </div>
                <div>
                    <p className="text-3xl font-bold">{currentExercise.reps}</p>
                    <p className="text-on-surface-secondary">Reps</p>
                </div>
                <div>
                    <p className="text-3xl font-bold">{currentExercise.rest}s</p>
                    <p className="text-on-surface-secondary">Rest</p>
                </div>
            </div>

            <div className="mt-6 p-4 bg-surface rounded-lg space-y-3">
                <p><strong className="text-primary">Description:</strong> {currentExercise.description}</p>
                <p><strong className="text-primary">Benefits:</strong> {currentExercise.benefits}</p>
                <p><strong className="text-primary">Common Mistakes:</strong> {currentExercise.commonMistakes}</p>
            </div>
            
            <div className="mt-6 p-4 border border-gray-700 rounded-lg">
                <h4 className="font-bold mb-2">Log Your Set</h4>
                 <div className="flex items-center space-x-4">
                    <div>
                        <label className="text-sm">Reps Completed</label>
                        <input type="number" value={tempReps} onChange={(e) => setTempReps(parseInt(e.target.value))} className="w-24 bg-background border border-gray-600 rounded-md p-2" />
                    </div>
                     <div>
                        <label className="text-sm">RPE (1-10)</label>
                        <input type="number" value={tempRpe} min="1" max="10" onChange={(e) => setTempRpe(parseInt(e.target.value))} className="w-24 bg-background border border-gray-600 rounded-md p-2" />
                    </div>
                 </div>
                 <Button onClick={() => handleSetComplete(tempReps, tempRpe, 'just_right')} className="mt-4 w-full">
                    {currentSet < currentExercise.sets ? 'Complete Set & Rest' : 'Complete Exercise'}
                </Button>
            </div>

          </div>
        )}
      </Card>
    </div>
  );
};

export default WorkoutPlayer;
