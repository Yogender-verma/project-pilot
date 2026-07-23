'use client';

import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

export interface SkillRadarItem {
  subject: string;
  A: number;
  B?: number;
  fullMark: number;
}

interface SkillRadarChartProps {
  data: SkillRadarItem[];
  userName?: string;
  friendName?: string;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  data,
  userName = 'You',
  friendName
}) => {
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
            name={userName}
            dataKey="A"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.25}
          />
          {friendName && (
            <Radar
              name={friendName}
              dataKey="B"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.35}
            />
          )}
          {friendName && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: '11px',
                paddingTop: '10px',
                color: 'var(--text-muted)'
              }}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;
