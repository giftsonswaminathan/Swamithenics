import { GoogleGenAI, Type } from '@google/genai';
import type { UserProfile, Assessment, WorkoutPlan, WorkoutLog } from '../types';

// FIX: Per coding guidelines, the API key must be obtained from environment variables and its presence should be assumed. The application must not prompt the user for it.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const assessmentSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Overall athlete score from 0-100" },
    movementScores: {
      type: Type.OBJECT,
      properties: {
        pushups: { type: Type.NUMBER },
        pullups: { type: Type.NUMBER },
        squats: { type: Type.NUMBER },
        dips: { type: Type.NUMBER },
        plank: { type: Type.NUMBER },
        bridges: { type: Type.NUMBER },
        handstand: { type: Type.NUMBER },
      },
      required: ['pushups', 'pullups', 'squats', 'dips', 'plank', 'bridges', 'handstand'],
    },
    analysis: { type: Type.STRING, description: "A 2-3 sentence analysis of the user's current fitness level." },
    priorities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 2-3 top priority areas for improvement."
    },
  },
  required: ['overallScore', 'movementScores', 'analysis', 'priorities'],
};


const workoutPlanSchema = {
  type: Type.OBJECT,
  properties: {
    planTitle: { type: Type.STRING, description: "A catchy title for the workout plan, e.g., 'Calisthenics Foundation Phase'."},
    weeks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.NUMBER },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                focus: { type: Type.STRING, description: "e.g., 'Full Body Strength', 'Push Day & Skills', 'Active Recovery'" },
                warmup: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            progression: {type: Type.STRING, description: "The specific variation of the exercise."},
                            sets: { type: Type.NUMBER },
                            reps: { type: Type.STRING },
                            rest: { type: Type.NUMBER },
                            description: { type: Type.STRING },
                            benefits: { type: Type.STRING },
                            commonMistakes: { type: Type.STRING },
                        }
                    }
                },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      progression: { type: Type.STRING, description: "e.g., 'Incline Push-ups', 'Tuck Front Lever Hold'" },
                      sets: { type: Type.NUMBER },
                      reps: { type: Type.STRING, description: "e.g., '8-12', '30s', 'AMRAP'" },
                      rest: { type: Type.NUMBER, description: "in seconds" },
                      description: { type: Type.STRING },
                      benefits: { type: Type.STRING },
                      commonMistakes: { type: Type.STRING },
                      tempo: { type: Type.STRING, description: "e.g., '3-1-X-1'" },
                    },
                    required: ['name', 'progression', 'sets', 'reps', 'rest', 'description', 'benefits', 'commonMistakes']
                  }
                },
                cooldown: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            progression: {type: Type.STRING, description: "The specific variation of the exercise."},
                            sets: { type: Type.NUMBER },
                            reps: { type: Type.STRING },
                            rest: { type: Type.NUMBER },
                            description: { type: Type.STRING },
                            benefits: { type: Type.STRING },
                            commonMistakes: { type: Type.STRING },
                        }
                    }
                }
              },
              required: ['day', 'focus', 'warmup', 'exercises', 'cooldown']
            }
          }
        },
        required: ['week', 'days']
      }
    }
  },
  required: ['planTitle', 'weeks']
};


export const generateAssessment = async (profile: UserProfile): Promise<Assessment> => {
  const prompt = `
    You are an expert exercise scientist and calisthenics coach. Based on the following user data, provide a detailed strength and skill analysis.
    Convert their max reps/times into standardized strength & skill scores per movement from 0-100, where 100 is an elite athlete.
    Also calculate an overall athlete score. Identify 2-3 priority areas for improvement.
    
    User Data:
    - Age: ${profile.age}
    - Sex: ${profile.sex}
    - Weight: ${profile.weight} kg
    - Experience: ${profile.experience}
    - Max Reps/Time: ${JSON.stringify(profile.assessmentReps)}

    Provide a concise analysis and clear priorities.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: assessmentSchema,
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as Assessment;
};

export const generateWorkoutPlan = async (profile: UserProfile, assessment: Assessment, logs: WorkoutLog[]): Promise<WorkoutPlan> => {
  const logSummary = logs.length > 0
    ? `
      Here is the user's performance history from their last cycle. Use this to adapt the new plan. If they consistently hit targets with low RPE, progress them. If they struggled with high RPE, regress or maintain the exercise.
      Performance Logs:
      ${JSON.stringify(logs, null, 2)}
    `
    : "This is the user's first plan. Start them with appropriate beginner progressions based on their assessment.";

  const prompt = `
    You are an expert calisthenics coach designing a 4-week (mesocycle) progressive program.

    User Profile:
    - Age: ${profile.age}, Sex: ${profile.sex}, Weight: ${profile.weight}kg
    - Goal: ${profile.goal}
    - Experience: ${profile.experience}
    - Training days per week: ${profile.daysPerWeek}
    - Available Equipment: ${profile.equipment.join(', ') || 'None'}

    User Assessment:
    - Overall Score: ${assessment.overallScore}/100
    - Priorities: ${assessment.priorities.join(', ')}
    - Full Assessment: ${JSON.stringify(assessment.movementScores)}

    ${logSummary}

    Task:
    1. Generate a 4-week workout plan with ${profile.daysPerWeek} training sessions per week.
    2. The plan must be progressive. Week 1 should be introductory, and difficulty should increase each week, culminating in a deload or test in week 4.
    3. Start from day-zero beginner progressions (e.g., incline push-ups) and create a path towards advanced variations.
    4. For each exercise, provide the specific progression (e.g., 'Knee Push-ups', not just 'Push-ups').
    5. Include a brief description, benefits, and common mistakes for each exercise.
    6. Structure the response according to the provided JSON schema. Ensure warm-ups and cool-downs with 2-3 exercises each are included.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: workoutPlanSchema,
    }
  });
  
  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as WorkoutPlan;
};
