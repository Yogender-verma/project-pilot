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
          <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-medium)', borderRadius: 12 }}
            labelStyle={{ color: 'var(--text-primary)', fontSize: 11, fontWeight: 'bold' }}
            itemStyle={{ color: 'var(--text-primary)' }}
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
