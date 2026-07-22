'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  FolderGit2, 
  Clock, 
  Award, 
  Sparkles, 
  Cpu, 
  ArrowUpRight, 
  Check,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

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
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FolderGit2 className="w-6 h-6 text-indigo-400" />
            <span>Recommended Project blue-prints</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Custom engineered portfolios created to shut down your structural skill gaps.
          </p>
        </div>

        {/* Top summary badge */}
        <Badge variant="glow" className="w-fit self-start sm:self-center font-bold px-3 py-1 font-mono">
          🛩 ACTIVE TARGET: {projects.length} OPTIONS LOADED
        </Badge>
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
              const diffColors = {
                Beginner: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
                Intermediate: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
                Advanced: 'bg-rose-500/10 border-rose-500/20 text-rose-300'
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
                  <Card 
                    hoverEffect={true} 
                    glowColor={project.difficulty === 'Advanced' ? '#ec4899' : '#8b5cf6'}
                    className={`bg-[#08051e]/40 h-full flex flex-col justify-between relative border ${
                      isSelected ? 'border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/5'
                    }`}
                  >
                    {/* Glow tag for active target */}
                    {isSelected && (
                      <div className="absolute top-0 right-8 -translate-y-1/2">
                        <Badge variant="glow">Active Target</Badge>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Badge Header Row */}
                      <div className="flex items-center justify-between">
                        <Badge variant="glow" className={diffColors[project.difficulty]}>
                          {project.difficulty}
                        </Badge>
                        <div className="flex items-center text-slate-400 space-x-1 font-mono text-[10px] font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{project.duration}</span>
                        </div>
                      </div>

                      {/* Project Titles */}
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono uppercase tracking-widest mt-1 block">
                          {project.category}
                        </p>
                      </div>

                      {/* Recruiter impact indicators */}
                      <div className="flex items-center space-x-2.5 p-2 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs">
                        <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                        <span className="font-semibold text-indigo-300">★ Resume Score Boost: +{project.resumeValue}%</span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>

                      {/* Micro list of skills gained */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Skills Gained</span>
                        <div className="flex flex-wrap gap-1.5">
                          {project.skillsGained.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-2 py-0.5 bg-white/2 border border-white/5 text-[9px] font-semibold rounded text-slate-300">
                              {skill}
                            </span>
                          ))}
                          {project.skillsGained.length > 3 && (
                            <span className="text-[9px] text-slate-500 font-semibold self-center">+{project.skillsGained.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <CardFooter className="pt-2 border-t mt-6" style={{ borderColor: 'var(--border-subtle)' }}>
                      <Button
                        variant={isSelected ? 'glow' : 'outline'}
                        className="w-full text-xs h-11"
                        onClick={() => handleBuildProject(project.id, project.title)}
                        rightIcon={isSelected ? <Check className="w-4 h-4 text-indigo-400" /> : <ArrowUpRight className="w-4 h-4" />}
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
