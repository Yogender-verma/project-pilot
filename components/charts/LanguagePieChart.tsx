'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

export interface LanguageItem {
  name: string;
  value?: number;
  percentage?: number;
  color: string;
}

interface LanguagePieChartProps {
  data: LanguageItem[];
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#ffffff" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const LanguagePieChart: React.FC<LanguagePieChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    ...item,
    val: item.value ?? item.percentage ?? 0
  }));

  return (
    <div className="w-full h-full outline-none focus:outline-none [&_*]:outline-none [&_*]:focus:outline-none [&_svg]:outline-none select-none">
      <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
        <PieChart style={{ outline: 'none' }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={55}
            fill="#8884d8"
            dataKey="val"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-medium)', borderRadius: 12 }}
            itemStyle={{ color: 'var(--text-primary)', fontSize: 11, fontWeight: 'bold' }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguagePieChart;
