'use client';

import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export interface SkillRadarItem {
  subject: string;
  A: number;
  fullMark: number;
}

interface SkillRadarChartProps {
  data: SkillRadarItem[];
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
        <PolarAngleAxis
          dataKey="subject"
          stroke="#94a3b8"
          fontSize={11}
          tick={{ fill: '#cbd5e1', fontSize: 11 }}
        />
        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.1)" />
        <Radar
          name="Skill Match"
          dataKey="A"
          stroke="#8b5cf6"
          fill="#6366f1"
          fillOpacity={0.45}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillRadarChart;
