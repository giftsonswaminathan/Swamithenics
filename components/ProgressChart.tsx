
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Assessment } from '../types';

interface Props {
  assessment: Assessment;
}

const ProgressChart: React.FC<Props> = ({ assessment }) => {
  const chartData = Object.entries(assessment.movementScores).map(([name, score]) => ({
    subject: name.charAt(0).toUpperCase() + name.slice(1),
    score: score,
    fullMark: 100,
  }));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#4B5563" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'none' }} axisLine={{ stroke: 'none' }}/>
          <Radar name="Strength Score" dataKey="score" stroke="#0D9488" fill="#0D9488" fillOpacity={0.6} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
          <Legend wrapperStyle={{fontSize: "14px"}}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
