'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export interface CommitItem {
  day: string;
  commits: number;
}

interface CommitBarChartProps {
  data: CommitItem[];
}

export const CommitBarChart: React.FC<CommitBarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none [&_svg]:outline-none select-none">
      <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
        <BarChart data={data} style={{ outline: 'none' }}>
          <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#060417', borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12 }}
            labelStyle={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}
          />
          <Bar
            dataKey="commits"
            fill="url(#barGradient)"
            radius={[6, 6, 0, 0]}
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommitBarChart;
