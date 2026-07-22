'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Clock, FolderGit2, TrendingUp, Plus, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TiltWrapper } from '@/components/ui/TiltWrapper';
import {
  ProjectControls,
  type ProjectSort,
  type ProjectStatusFilter,
  type ProjectView,
} from '@/components/projects/ProjectControls';
import type { Project } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

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
  
  // Local filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [sortBy, setSortBy] = useState<'resumeValue' | 'duration'>('resumeValue');

  // Trigger project selection & auto-generate roadmap if not already present
  const handleBuildProject = (projectId: string, title: string) => {
    selectProject(projectId);
    initializeRoadmap(projectId, title);
    router.push(`/dashboard/projects/${projectId}`);
  };

  // Filter logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesTab = activeTab === 'All' || project.difficulty === activeTab;
    
    return matchesSearch && matchesTab;
  }).sort((a, b) => {
    if (sortBy === 'resumeValue') {
      return b.resumeValue - a.resumeValue;
    }
    // Simple mock comparison for duration sorting
    return b.duration.localeCompare(a.duration);
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FolderGit2 className="w-6 h-6 text-indigo-400" />
            <span>Recommended Project blue-prints</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Custom engineered portfolios created to shut down your structural skill gaps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
          <Link href="/dashboard/projects/create">
            <Button
              variant="premium"
              size="sm"
              className="h-10 px-4 text-xs font-bold shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Project
            </Button>
          </Link>

          <Badge variant="glow" className="w-fit px-3 py-1 font-mono font-bold">
            🛩 ACTIVE TARGET: {projects.length} OPTIONS LOADED
          </Badge>
        </div>
      </div>

      {/* Filter and Search Action Box */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 bg-[#08051e]/40">
        
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects or technologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a071a]/50 text-xs rounded-xl border border-white/5 px-4 py-3 pl-11 focus:outline-none focus:border-indigo-500/55 text-slate-200 placeholder-slate-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.05)]' 
                  : 'bg-transparent border-white/5 text-slate-400 hover:text-white hover:bg-white/2'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sort Trigger */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0 justify-between">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider shrink-0">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold rounded-xl border px-3 py-2.5 focus:outline-none focus:border-indigo-500/55 cursor-pointer"
            style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <option value="resumeValue">Resume Value Rank</option>
            <option value="duration">Completion Duration</option>
          </select>
        </div>

      </div>

      {/* Projects Grid */}
      <AnimatePresence mode="popLayout">
        {projects.length === 0 ? (
          <EmptyState
            title="No Projects Yet"
            description="You don't have any project recommendations yet. Complete your onboarding to receive personalized AI-powered project suggestions."
            icon={<FolderGit2 className="h-10 w-10 sm:h-12 sm:w-12" />}
            ctaLabel="Complete Onboarding"
            ctaHref="/dashboard/settings"
            secondaryLabel="Ask AI Mentor"
            secondaryHref="/dashboard/mentor"
          />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="No Matching Projects"
            description="No projects match your current search and difficulty filters. Clear the filters to view all available recommendations."
            icon={<Search className="h-10 w-10 sm:h-12 sm:w-12" />}
            ctaLabel="Clear Filters"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
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
                  layoutId={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
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
