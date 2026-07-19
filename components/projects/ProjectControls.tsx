'use client';

import { Grid2X2, List, RotateCcw, Search } from 'lucide-react';

export type ProjectStatusFilter = 'All' | 'Planned' | 'In Progress' | 'Completed' | 'Archived';
export type ProjectSort = 'recent' | 'oldest' | 'name-asc' | 'name-desc' | 'progress';
export type ProjectView = 'grid' | 'list';

interface ProjectControlsProps {
  searchQuery: string;
  status: ProjectStatusFilter;
  sortBy: ProjectSort;
  view: ProjectView;
  matchingCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ProjectStatusFilter) => void;
  onSortChange: (value: ProjectSort) => void;
  onViewChange: (value: ProjectView) => void;
  onClear: () => void;
}

const statusOptions: ProjectStatusFilter[] = [
  'All',
  'Planned',
  'In Progress',
  'Completed',
  'Archived',
];

export function ProjectControls({
  searchQuery,
  status,
  sortBy,
  view,
  matchingCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onViewChange,
  onClear,
}: ProjectControlsProps) {
  return (
    <section
      aria-label="Project filters and sorting"
      className="glass-panel space-y-4 rounded-2xl bg-[#08051e]/40 p-4"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative block min-w-0 flex-1" htmlFor="project-search">
          <span className="sr-only">Search projects</span>
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="project-search"
            type="search"
            placeholder="Search projects, technologies, or categories..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-white/5 bg-[#0a071a]/50 px-4 py-3 pl-11 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-indigo-500/55 focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2" htmlFor="project-sort">
            <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Sort
            </span>
            <select
              id="project-sort"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as ProjectSort)}
              className="min-w-48 cursor-pointer rounded-xl border border-white/10 bg-[#0a071a] px-3 py-2.5 text-xs font-semibold text-slate-200 outline-none focus:border-indigo-500/55 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="recent">Recently updated</option>
              <option value="oldest">Oldest updated</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="progress">Progress percentage</option>
            </select>
          </label>

          <div className="flex rounded-xl border border-white/10 bg-[#0a071a]/70 p-1" aria-label="Project view">
            <button
              type="button"
              onClick={() => onViewChange('grid')}
              aria-label="Show projects in grid view"
              aria-pressed={view === 'grid'}
              className={`rounded-lg p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                view === 'grid' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Grid2X2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange('list')}
              aria-label="Show projects in list view"
              aria-pressed={view === 'list'}
              className={`rounded-lg p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                view === 'list' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/5 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter projects by status">
          {statusOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onStatusChange(option)}
              aria-pressed={status === option}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                status === option
                  ? 'border-indigo-500/30 bg-indigo-600/15 text-indigo-300'
                  : 'border-white/5 bg-transparent text-slate-400 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-xs text-slate-400" aria-live="polite">
            Showing <span className="font-bold text-white">{matchingCount}</span> of {totalCount} projects
          </p>
          <button
            type="button"
            onClick={onClear}
            disabled={!hasActiveFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear filters
          </button>
        </div>
      </div>
    </section>
  );
}
