
import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { ASSESSMENT_EXERCISES, EQUIPMENT_OPTIONS, GOAL_OPTIONS } from '../constants';
import Button from './ui/Button';
import Card from './ui/Card';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingWizard: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    sex: 'male',
    experience: 'beginner',
    equipment: [],
    daysPerWeek: 3,
    goal: 'strength',
    assessmentReps: ASSESSMENT_EXERCISES.reduce((acc, ex) => ({...acc, [ex.id]: 0 }), {})
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'height' || name === 'weight' || name === 'daysPerWeek' ? parseInt(value) : value }));
  };
  
  const handleRepChange = (id: string, value: string) => {
    setProfile(prev => ({
        ...prev,
        assessmentReps: {
            ...prev.assessmentReps,
            [id]: parseInt(value) || 0
        }
    }));
  };

  const handleEquipmentChange = (item: string) => {
    setProfile(prev => {
        const equipment = prev.equipment || [];
        const newEquipment = equipment.includes(item)
            ? equipment.filter(i => i !== item)
            : [...equipment, item];
        return { ...prev, equipment: newEquipment };
    });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    onComplete(profile as UserProfile);
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Personal Info
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-on-surface">Tell us about yourself</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-secondary mb-1">Age</label>
                <input type="number" name="age" value={profile.age || ''} onChange={handleChange} className="w-full bg-surface border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-secondary mb-1">Sex</label>
                <select name="sex" value={profile.sex} onChange={handleChange} className="w-full bg-surface border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-on-surface-secondary mb-1">Height (cm)</label>
                <input type="number" name="height" value={profile.height || ''} onChange={handleChange} className="w-full bg-surface border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" />
              </div>
               <div>
                <label className="block text-sm font-medium text-on-surface-secondary mb-1">Weight (kg)</label>
                <input type="number" name="weight" value={profile.weight || ''} onChange={handleChange} className="w-full bg-surface border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" />
              </div>
            </div>
          </div>
        );
      case 2: // Experience & Goals
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Experience & Goals</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-on-surface-secondary mb-1">Fitness Level</label>
                    <select name="experience" value={profile.experience} onChange={handleChange} className="w-full bg-surface border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary">
                        <option value="beginner">Beginner (Just starting out)</option>
                        <option value="intermediate">Intermediate (Consistent for 6+ months)</option>
                        <option value="advanced">Advanced (Years of experience)</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-on-surface-secondary mb-2">Primary Goal</label>
                    <div className="space-y-2">
                        {GOAL_OPTIONS.map(goal => (
                            <label key={goal.id} className={`flex items-center p-3 rounded-md cursor-pointer border-2 ${profile.goal === goal.id ? 'border-primary bg-primary/10' : 'border-gray-600'}`}>
                                <input type="radio" name="goal" value={goal.id} checked={profile.goal === goal.id} onChange={handleChange} className="hidden" />
                                <span className="text-on-surface">{goal.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        );
    case 3: // Equipment
        return (
             <div>
                <h2 className="text-2xl font-bold mb-4">What equipment do you have?</h2>
                <p className="text-on-surface-secondary mb-4">Select all that apply. If you have none, just click Next.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {EQUIPMENT_OPTIONS.map(item => (
                        <label key={item} className={`flex items-center p-4 rounded-md cursor-pointer border-2 ${profile.equipment?.includes(item) ? 'border-primary bg-primary/10' : 'border-gray-600'}`}>
                             <input type="checkbox" checked={profile.equipment?.includes(item)} onChange={() => handleEquipmentChange(item)} className="h-5 w-5 rounded border-gray-500 text-primary focus:ring-primary-focus bg-surface" />
                             <span className="ml-3 text-on-surface">{item}</span>
                        </label>
                    ))}
                </div>
             </div>
        )
      case 4: // Assessment
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">Initial Assessment</h2>
            <p className="text-on-surface-secondary mb-6">For each movement below, enter the maximum consecutive reps (or seconds) you can perform with good form. Be honest!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ASSESSMENT_EXERCISES.map(ex => (
                <div key={ex.id}>
                  <label className="block text-sm font-medium text-on-surface-secondary mb-1">{ex.name}</label>
                  <div className="flex items-center">
                    <input
                        type="number"
                        value={profile.assessmentReps?.[ex.id] || 0}
                        onChange={(e) => handleRepChange(ex.id, e.target.value)}
                        className="w-full bg-surface border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary"
                    />
                    <span className="ml-2 text-on-surface-secondary text-sm">{ex.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const progress = (step / 4) * 100;

  return (
    <Card>
        <div className="mb-6">
            <div className="w-full bg-surface rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
      
      <div className="min-h-[350px]">
        {renderStep()}
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={prevStep} disabled={step === 1} variant="secondary">
          Back
        </Button>
        {step < 4 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Generate My Plan</Button>
        )}
      </div>
    </Card>
  );
};

export default OnboardingWizard;
