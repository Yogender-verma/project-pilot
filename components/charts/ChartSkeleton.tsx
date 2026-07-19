'use client';

import React from 'react';

export const RadarChartSkeleton: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[220px] flex items-center justify-center relative animate-pulse rounded-2xl p-4 overflow-hidden"
      style={{ backgroundColor: 'var(--hover-bg)' }}
      aria-label="Loading Radar Chart"
    >
      <div className="w-44 h-44 rounded-full border-2 border-dashed border-indigo-500/20 flex items-center justify-center relative">
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-indigo-500/15 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-500/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-indigo-500/20" />
          </div>
        </div>
        {/* Radial Spokes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-indigo-500/15" />
          <div className="h-full w-[1px] bg-indigo-500/15 absolute" />
          <div className="w-full h-[1px] bg-indigo-500/15 rotate-45 absolute" />
          <div className="w-full h-[1px] bg-indigo-500/15 -rotate-45 absolute" />
        </div>
      </div>
      <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400">
        Loading Radar Analytics...
      </div>
    </div>
  );
};

export const BarChartSkeleton: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[180px] flex flex-col justify-end p-4 gap-3 animate-pulse rounded-2xl relative overflow-hidden"
      style={{ backgroundColor: 'var(--hover-bg)' }}
      aria-label="Loading Bar Chart"
    >
      <div className="flex items-end justify-between gap-2 h-32 px-2">
        <div className="w-full h-[35%] bg-indigo-500/20 rounded-t-lg" />
        <div className="w-full h-[65%] bg-indigo-500/25 rounded-t-lg" />
        <div className="w-full h-[45%] bg-indigo-500/20 rounded-t-lg" />
        <div className="w-full h-[85%] bg-indigo-500/30 rounded-t-lg" />
        <div className="w-full h-[55%] bg-indigo-500/25 rounded-t-lg" />
        <div className="w-full h-[95%] bg-indigo-500/35 rounded-t-lg" />
        <div className="w-full h-[40%] bg-indigo-500/20 rounded-t-lg" />
      </div>
      <div className="h-[1px] w-full bg-white/10" />
      <div className="flex justify-between px-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="w-6 h-3 bg-white/10 rounded" />
        ))}
      </div>
    </div>
  );
};

export const PieChartSkeleton: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-4 gap-4 animate-pulse rounded-2xl relative overflow-hidden"
      style={{ backgroundColor: 'var(--hover-bg)' }}
      aria-label="Loading Pie Chart"
    >
      <div className="w-36 h-36 rounded-full border-8 border-indigo-500/20 border-t-indigo-500/40 border-r-purple-500/30 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/10" />
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/40" />
          <div className="w-12 h-3 bg-white/10 rounded" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500/40" />
          <div className="w-12 h-3 bg-white/10 rounded" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500/40" />
          <div className="w-12 h-3 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[200px] flex items-center justify-center p-4 animate-pulse rounded-2xl relative overflow-hidden"
      style={{ backgroundColor: 'var(--hover-bg)' }}
      aria-label="Loading Chart"
    >
      <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
        Loading Chart Analytics...
      </div>
    </div>
  );
};
