
export interface UserProfile {
  age: number;
  sex: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  experience: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  daysPerWeek: number;
  goal: 'strength' | 'skill' | 'hypertrophy' | 'fat_loss';
  assessmentReps: {
    [key: string]: number;
  };
}

export interface Assessment {
  overallScore: number;
  movementScores: {
    [key: string]: number;
  };
  analysis: string;
  priorities: string[];
}

export interface Exercise {
  name: string;
  progression: string;
  sets: number;
  reps: string; // e.g., "8-12" or "30s"
  rest: number; // in seconds
  description: string;
  benefits: string;
  commonMistakes: string;
  tempo?: string;
}

export interface WorkoutDay {
  day: number;
  focus: string;
  warmup: Exercise[];
  exercises: Exercise[];
  cooldown: Exercise[];
}

export interface WorkoutWeek {
  week: number;
  days: WorkoutDay[];
}

export interface WorkoutPlan {
  planTitle: string;
  weeks: WorkoutWeek[];
}

export interface WorkoutLog {
  date: string; // ISO string
  week: number;
  day: number;
  completedExercises: {
    exerciseName: string;
    sets: {
      reps: number | string; // number for reps, string for time e.g. "30s"
    }[];
    rpe: number; // 1-10
    difficulty: 'easy' | 'just_right' | 'hard';
  }[];
}
