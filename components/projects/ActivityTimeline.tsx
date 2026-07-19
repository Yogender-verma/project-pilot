'use client';

import React from 'react';
import {
  Activity,
  Archive,
  CheckCircle2,
  CircleDot,
  FolderPlus,
  Pencil,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import type { ProjectActivity } from '@/types';

interface ActivityTimelineProps {
  activities: ProjectActivity[];
  loading?: boolean;
  limit?: number;
  showProjectName?: boolean;
  title?: string;
  description?: string;
}

const FILTERS = [
  { value: 'all', label: 'All activity' },
  { value: 'project', label: 'Project changes' },
  { value: 'progress', label: 'Progress' },
  { value: 'milestone', label: 'Milestones' },
  { value: 'archive', label: 'Archive' },
] as const;

function filterCategory(type: string) {
  if (type === 'milestone') return 'milestone';
  if (type === 'progress_updated' || type === 'status_changed') return 'progress';
  if (type === 'archived' || type === 'restored') return 'archive';
  return 'project';
}

function activityIcon(type: string) {
  if (type === 'milestone') return CheckCircle2;
  if (type === 'progress_updated' || type === 'status_changed') return TrendingUp;
  if (type === 'project_created' || type === 'project_start') return FolderPlus;
  if (type === 'project_updated') return Pencil;
  if (type === 'archived') return Archive;
  if (type === 'restored') return RotateCcw;
  return CircleDot;
}

function relativeTime(value: string, now: number) {
  const date = new Date(value);
  const difference = Math.max(0, now - date.getTime());
  const minutes = Math.floor(difference / 60_000);
  const hours = Math.floor(difference / 3_600_000);
  const days = Math.floor(difference / 86_400_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date(now).getFullYear() ? 'numeric' : undefined });
}

function dateGroup(value: string, now: number) {
  const date = new Date(value);
  const today = new Date(now);
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const difference = Math.round((startToday - startDate) / 86_400_000);

  if (difference === 0) return 'Today';
  if (difference === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
}

export function ActivityTimeline({
  activities,
  loading = false,
  limit,
  showProjectName = false,
  title = 'Recent project activity',
  description = 'A chronological record of meaningful project changes.',
}: ActivityTimelineProps) {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]['value']>('all');
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = React.useMemo(() => {
    const sorted = [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const matching = filter === 'all' ? sorted : sorted.filter((item) => filterCategory(item.type) === filter);
    return typeof limit === 'number' ? matching.slice(0, limit) : matching;
  }, [activities, filter, limit]);

  const grouped = React.useMemo(() => filtered.reduce<Record<string, ProjectActivity[]>>((groups, item) => {
    const key = dateGroup(item.createdAt, now);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {}), [filtered, now]);

  return (
    <section aria-labelledby="activity-timeline-title" className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-indigo-400">
            <Activity className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Activity feed</span>
          </div>
          <h2 id="activity-timeline-title" className="text-base font-bold text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <label className="flex min-w-44 flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Filter event type
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            className="h-10 rounded-xl border border-white/10 bg-[#08051e] px-3 text-xs font-semibold normal-case tracking-normal text-slate-200 outline-none transition focus:border-indigo-400/50"
          >
            {FILTERS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="space-y-3" aria-label="Loading project activity">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex animate-pulse gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="h-10 w-10 rounded-xl bg-white/10" />
              <div className="flex-1 space-y-2"><div className="h-3 w-2/3 rounded bg-white/10" /><div className="h-2.5 w-1/3 rounded bg-white/5" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300"><Activity className="h-6 w-6" /></div>
          <p className="font-semibold text-white">No activity available</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-400">Complete a milestone or initialize a project blueprint to create the first timeline entry.</p>
        </div>
      ) : (
        <div className="space-y-6" aria-live="polite">
          {Object.entries(grouped).map(([group, entries]) => (
            <div key={group}>
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{group}</h3>
              <ol className="relative space-y-3 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-white/10">
                {entries.map((item) => {
                  const Icon = activityIcon(item.type);
                  return (
                    <li key={item.id} className="relative flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition hover:border-indigo-400/20 hover:bg-indigo-500/[0.03]">
                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-[#0e0a2a] text-indigo-300"><Icon className="h-4 w-4" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-relaxed text-slate-200">{item.description}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                          {showProjectName && item.projectTitle ? <span className="truncate font-semibold text-indigo-300">{item.projectTitle}</span> : null}
                          {showProjectName && item.projectTitle ? <span aria-hidden="true">•</span> : null}
                          <time dateTime={item.createdAt}>{relativeTime(item.createdAt, now)}</time>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
