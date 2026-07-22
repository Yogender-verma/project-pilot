'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Clock, FolderGit2, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardFooter } from '@/components/ui/Card';
import { TiltWrapper } from '@/components/ui/TiltWrapper';
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
              const difficultyThemeColors = {
                Beginner: '#10b981', // Emerald
                Intermediate: '#8b5cf6', // Indigo/Violet
                Advanced: '#ec4899', // Pink/Rose
              };

              const diffColors: Record<string, 'success' | 'warning' | 'danger'> = {
                Beginner: 'success',
                Intermediate: 'warning',
                Advanced: 'danger',
              };

              const themeColor = difficultyThemeColors[project.difficulty] || '#8b5cf6';

              const borderStyles = {
                Beginner: 'border-emerald-500/20 hover:border-emerald-500/40',
                Intermediate: 'border-indigo-500/20 hover:border-indigo-500/40',
                Advanced: 'border-pink-500/20 hover:border-pink-500/40',
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
                  <TiltWrapper className="h-full">
                    <Card
                      hoverEffect={false}
                      className={`relative border bg-[#070519]/95 rounded-2xl h-full transition-all duration-300 ${
                        borderStyles[project.difficulty] || 'border-white/5'
                      } ${
                        view === 'grid' ? 'flex h-full flex-col justify-between' : 'lg:flex lg:items-center lg:gap-6'
                      }`}
                      style={{
                        backgroundImage: `
                          radial-gradient(at 0% 64%, ${themeColor}12 0px, transparent 80%),
                          radial-gradient(at 100% 99%, ${themeColor}08 0px, transparent 80%)
                        `,
                        boxShadow: isSelected
                          ? `0 0 25px ${themeColor}20, inset 0 -12px 24px rgba(255, 255, 255, 0.05)`
                          : 'inset 0 -12px 24px rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      {isSelected && (
                        <div className="absolute right-8 top-0 -translate-y-1/2 z-20">
                          <Badge variant="glow">Active Target</Badge>
                        </div>
                      )}

                      <div className={`space-y-4 w-full ${view === 'list' ? 'min-w-0 flex-1' : ''}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={diffColors[project.difficulty] || 'default'}>
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

                        <div className="rounded-xl border border-white/5 bg-white/2 p-2.5">
                          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold">
                            <span className="text-indigo-300">Project progress</span>
                            <span className="text-white">{progress}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${progress}%`,
                                backgroundImage: `linear-gradient(90deg, ${themeColor}, ${themeColor}dd)`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2.5 rounded-xl border border-white/5 bg-white/2 p-2.5 text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                          <TrendingUp className="h-4 w-4 shrink-0 text-indigo-400" />
                          <span className="font-semibold text-slate-300">
                            ★ Resume Score Boost: <span className="font-extrabold" style={{ color: themeColor }}>+{project.resumeValue}%</span>
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed text-slate-400 ${view === 'grid' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                          {project.description}
                        </p>

                        {/* Dynamic checklist for project skills */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Keys to Blueprint</span>
                          <ul className="space-y-2">
                            {project.skillsGained.slice(0, 3).map((skill) => (
                              <li key={skill} className="flex items-center space-x-2 text-xs">
                                <span
                                  className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                                  style={{ backgroundColor: themeColor, color: '#070519' }}
                                >
                                  ✓
                                </span>
                                <span className="text-slate-200 font-medium">{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <CardFooter
                        className={`${view === 'grid' ? 'mt-6 border-t pt-2 w-full' : 'mt-5 shrink-0 border-t pt-4 lg:mt-0 lg:w-64 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 w-full'}`}
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <Button
                          variant={isSelected ? 'glow' : 'outline'}
                          style={
                            isSelected
                              ? {
                                  backgroundImage: `linear-gradient(0deg, ${themeColor}, ${themeColor}dd)`,
                                  color: '#ffffff',
                                  boxShadow: `0 0 15px ${themeColor}40`,
                                  border: 'none',
                                }
                              : {
                                  borderColor: `${themeColor}40`,
                                  color: '#ffffff',
                                }
                          }
                          className="h-11 w-full text-xs transition-all hover:scale-[1.02] cursor-pointer font-bold rounded-xl"
                          onClick={() => handleBuildProject(project.id, project.title)}
                          rightIcon={
                            isSelected ? <Check className="h-4 w-4 text-white" /> : <ArrowUpRight className="h-4 w-4" />
                          }
                        >
                          {isSelected ? 'Configure Sandbox & Steps' : 'Build Custom Blueprint'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </TiltWrapper>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
