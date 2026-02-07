// ============================================
// WHAT TO EXPECT SECTION COMPONENT
// Icon grid showing fishery expectations
// ============================================
import { Target, TrendingUp, Clock, Users, Timer, Trophy } from 'lucide-react';

const expectationIcons = {
  averageCatch: Target,
  recordFish: Trophy,
  blankRate: TrendingUp,
  bestTimeOfDay: Clock,
  experienceLevel: Users,
  typicalSessionHours: Timer
};

const expectationLabels = {
  averageCatch: 'Average catch',
  recordFish: 'Record fish',
  blankRate: 'Blank rate',
  bestTimeOfDay: 'Best time',
  experienceLevel: 'Experience level',
  typicalSessionHours: 'Session length'
};

const experienceLevelLabels = {
  'beginner': 'Beginner friendly',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
  'any': 'All levels'
};

export const WhatToExpect = ({ fishery }) => {
  const expectations = [
    { key: 'averageCatch', value: fishery.expectations?.averageCatch },
    { key: 'recordFish', value: fishery.expectations?.recordFish },
    { key: 'blankRate', value: fishery.expectations?.blankRate },
    { key: 'bestTimeOfDay', value: fishery.bestTimeOfDay },
    { key: 'experienceLevel', value: experienceLevelLabels[fishery.experienceLevel] || fishery.experienceLevel },
    { key: 'typicalSessionHours', value: fishery.typicalSessionHours ? `${fishery.typicalSessionHours} hours` : null }
  ].filter(item => item.value);

  if (expectations.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">What to Expect</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {expectations.map(({ key, value }) => {
          const Icon = expectationIcons[key];
          return (
            <div key={key} className="bg-stone-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-700" />
                </div>
                <span className="text-sm text-stone-500">{expectationLabels[key]}</span>
              </div>
              <p className="font-medium text-stone-900">{value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhatToExpect;
