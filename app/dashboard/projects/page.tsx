'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Clock, FolderGit2, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardFooter } from '@/components/ui/Card';
import {
  ProjectControls,
  type ProjectSort,
  type ProjectStatusFilter,
  type ProjectView,
} from '@/components/projects/ProjectControls';
import type { Project } from '@/types';

const DEFAULT_STATUS: ProjectStatusFilter = 'All';
const DEFAULT_SORT: ProjectSort = 'recent';
const DEFAULT_VIEW: ProjectView = 'grid';
const VIEW_STORAGE_KEY = 'project-pilot-project-view';

function getProjectStatus(project: Project): Exclude<ProjectStatusFilter, 'All'> {
  if (project.status === 'Archived') return 'Archived';
  if (project.status === 'Completed' || (project.progress ?? 0) >= 100) return 'Completed';
  if (project.status === 'In Progress' || (project.progress ?? 0) > 0) return 'In Progress';
  return 'Planned';
}

function getUpdatedTimestamp(project: Project, fallbackIndex: number) {
  const parsed = project.updatedAt ? new Date(project.updatedAt).getTime() : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallbackIndex;
}

function setUrlFilters(searchQuery: string, status: ProjectStatusFilter, sortBy: ProjectSort) {
  const params = new URLSearchParams(window.location.search);

  if (searchQuery.trim()) params.set('q', searchQuery.trim());
  else params.delete('q');

  if (status !== DEFAULT_STATUS) params.set('status', status);
  else params.delete('status');

  if (sortBy !== DEFAULT_SORT) params.set('sort', sortBy);
  else params.delete('sort');

  const query = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
}

export default function RecommendedProjectsPage() {
  const router = useRouter();
  const { projects, selectedProjectId, selectProject, initializeRoadmap } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<ProjectStatusFilter>(DEFAULT_STATUS);
  const [sortBy, setSortBy] = useState<ProjectSort>(DEFAULT_SORT);
  const [view, setView] = useState<ProjectView>(DEFAULT_VIEW);
  const [filtersReady, setFiltersReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStatus = params.get('status') as ProjectStatusFilter | null;
    const urlSort = params.get('sort') as ProjectSort | null;
    const storedView = window.localStorage.getItem(VIEW_STORAGE_KEY) as ProjectView | null;

    setSearchQuery(params.get('q') ?? '');
    if (['All', 'Planned', 'In Progress', 'Completed', 'Archived'].includes(urlStatus ?? '')) {
      setStatus(urlStatus as ProjectStatusFilter);
    }
    if (['recent', 'oldest', 'name-asc', 'name-desc', 'progress'].includes(urlSort ?? '')) {
      setSortBy(urlSort as ProjectSort);
    }
    if (storedView === 'grid' || storedView === 'list') setView(storedView);
    setFiltersReady(true);
  }, []);

  useEffect(() => {
    if (!filtersReady) return;
    setUrlFilters(searchQuery, status, sortBy);
  }, [filtersReady, searchQuery, sortBy, status]);

  const handleViewChange = (nextView: ProjectView) => {
    setView(nextView);
    window.localStorage.setItem(VIEW_STORAGE_KEY, nextView);
  };

  const handleBuildProject = (projectId: string, title: string) => {
    selectProject(projectId);
    initializeRoadmap(projectId, title);
    router.push(`/dashboard/projects/${projectId}`);
  };

  const displayedProjects = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return projects
      .map((project, originalIndex) => ({ project, originalIndex }))
      .filter(({ project }) => {
        const matchesSearch =
          !normalizedSearch ||
          project.title.toLowerCase().includes(normalizedSearch) ||
          project.description.toLowerCase().includes(normalizedSearch) ||
          project.technologies.some((technology) => technology.toLowerCase().includes(normalizedSearch)) ||
          project.category.toLowerCase().includes(normalizedSearch);
        const matchesStatus = status === 'All' || getProjectStatus(project) === status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return getUpdatedTimestamp(a.project, a.originalIndex) - getUpdatedTimestamp(b.project, b.originalIndex);
          case 'name-asc':
            return a.project.title.localeCompare(b.project.title);
          case 'name-desc':
            return b.project.title.localeCompare(a.project.title);
          case 'progress':
            return (b.project.progress ?? 0) - (a.project.progress ?? 0);
          case 'recent':
          default:
            return getUpdatedTimestamp(b.project, b.originalIndex) - getUpdatedTimestamp(a.project, a.originalIndex);
        }
      })
      .map(({ project }) => project);
  }, [projects, searchQuery, sortBy, status]);

  const hasActiveFilters = searchQuery.trim() !== '' || status !== DEFAULT_STATUS || sortBy !== DEFAULT_SORT;

  const clearFilters = () => {
    setSearchQuery('');
    setStatus(DEFAULT_STATUS);
    setSortBy(DEFAULT_SORT);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center space-x-2 text-2xl font-bold text-white">
            <FolderGit2 className="h-6 w-6 text-indigo-400" />
            <span>Recommended Project blue-prints</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Custom engineered portfolios created to shut down your structural skill gaps.
          </p>
        </div>
        <Badge variant="glow" className="w-fit self-start px-3 py-1 font-mono font-bold sm:self-center">
          🛩 ACTIVE TARGET: {projects.length} OPTIONS LOADED
        </Badge>
      </div>

      <ProjectControls
        searchQuery={searchQuery}
        status={status}
        sortBy={sortBy}
        view={view}
        matchingCount={displayedProjects.length}
        totalCount={projects.length}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatus}
        onSortChange={setSortBy}
        onViewChange={handleViewChange}
        onClear={clearFilters}
      />

      <AnimatePresence mode="popLayout">
        {displayedProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="glass-panel rounded-3xl p-12 text-center"
          >
            <FolderGit2 className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <h3 className="mb-1 text-base font-bold text-white">No projects match these filters</h3>
            <p className="mx-auto max-w-md text-xs text-slate-400">
              Try a different status, change the search phrase, or clear all filters to restore the complete project list.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-5" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </motion.div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {displayedProjects.map((project) => {
              const isSelected = selectedProjectId === project.id;
              const projectStatus = getProjectStatus(project);
              const progress = project.progress ?? 0;
              const diffColors = {
                Beginner: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
                Intermediate: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
                Advanced: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
              };

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card
                    hoverEffect
                    glowColor={project.difficulty === 'Advanced' ? '#ec4899' : '#8b5cf6'}
                    className={`relative border bg-[#08051e]/40 ${
                      view === 'grid' ? 'flex h-full flex-col justify-between' : 'lg:flex lg:items-center lg:gap-6'
                    } ${
                      isSelected
                        ? 'border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                        : 'border-white/5'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute right-8 top-0 -translate-y-1/2">
                        <Badge variant="glow">Active Target</Badge>
                      </div>
                    )}

                    <div className={`space-y-4 ${view === 'list' ? 'min-w-0 flex-1' : ''}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="glow" className={diffColors[project.difficulty]}>
                            {project.difficulty}
                          </Badge>
                          <Badge variant="default">{projectStatus}</Badge>
                        </div>
                        <div className="flex items-center space-x-1 font-mono text-[10px] font-bold text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{project.duration}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white">{project.title}</h3>
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                          {project.category}
                        </p>
                      </div>

                      <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-2.5">
                        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold">
                          <span className="text-indigo-300">Project progress</span>
                          <span className="text-white">{progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-2 text-xs">
                        <TrendingUp className="h-4 w-4 shrink-0 text-indigo-400" />
                        <span className="font-semibold text-indigo-300">★ Resume Score Boost: +{project.resumeValue}%</span>
                      </div>

                      <p className={`text-xs leading-relaxed text-slate-400 ${view === 'grid' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {project.skillsGained.slice(0, view === 'grid' ? 3 : 5).map((skill) => (
                          <span key={skill} className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[9px] font-semibold text-slate-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <CardFooter
                      className={`${view === 'grid' ? 'mt-6 border-t pt-2' : 'mt-5 shrink-0 border-t pt-4 lg:mt-0 lg:w-64 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0'}`}
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <Button
                        variant={isSelected ? 'glow' : 'outline'}
                        className="h-11 w-full text-xs"
                        onClick={() => handleBuildProject(project.id, project.title)}
                        rightIcon={
                          isSelected ? <Check className="h-4 w-4 text-indigo-400" /> : <ArrowUpRight className="h-4 w-4" />
                        }
                      >
                        {isSelected ? 'Configure Sandbox & Steps' : 'Build Custom Blueprint'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
