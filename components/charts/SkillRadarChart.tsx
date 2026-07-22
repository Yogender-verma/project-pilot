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
    <div className="w-full h-full outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none [&_svg]:outline-none select-none">
      <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data} style={{ outline: 'none' }}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
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
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;
