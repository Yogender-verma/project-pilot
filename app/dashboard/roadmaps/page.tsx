'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Map, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Sparkles, 
  ChevronRight, 
  Terminal as TermIcon
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function VisualRoadmapsPage() {
  const { projects, selectedProjectId, roadmaps, toggleStepCompletion } = useAppStore();

  // Find active project and roadmap
  const activeProject = projects.find(p => p.id === selectedProjectId);
  const activeRoadmap = activeProject ? roadmaps[activeProject.id] : null;

  // Render empty state if no active roadmap selected
  if (!activeProject || !activeRoadmap) {
    return (
      <div className="min-h-[70vh] py-4 sm:py-8">
        <EmptyState
          title="No Roadmaps Available"
          description="Start building your learning journey by choosing a project and creating your first personalized roadmap."
          icon={<Map className="h-10 w-10 sm:h-12 sm:w-12" />}
          ctaLabel="Create Roadmap"
          ctaHref="/dashboard/projects"
          secondaryLabel="Ask AI Mentor"
          secondaryHref="/dashboard/mentor"
        />
      </div>
    );
  }

  // Calculate statistics
  const completedSteps = activeRoadmap.steps.filter(s => s.completed).length;
  const totalSteps = activeRoadmap.steps.length;
  const progressRate = Math.round((completedSteps / totalSteps) * 100);

  const typeColors = {
    fundamentals: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
    frontend: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    backend: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    integration: 'bg-pink-500/10 border-pink-500/20 text-pink-300',
    deployment: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
            <Map className="w-6 h-6 text-indigo-400 animate-pulse" />
            <span>Interactive Day-by-Day roadmaps</span>
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Day-by-Day milestone guidelines for: <span className="text-indigo-300 font-bold">{activeProject.title}</span>.
          </p>
        </div>

        <Link href="/dashboard/mentor" className="shrink-0 w-full sm:w-auto">
          <Button variant="glow" className="w-full h-11" leftIcon={<Sparkles className="w-4 h-4 animate-bounce" />}>
            Ask AI Mentor For Guidance
          </Button>
        </Link>
      </div>

      {/* Progress header widget */}
      <Card hoverEffect={false} className="bg-[#08051e]/40 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Roadmap Completion</span>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {completedSteps} / {totalSteps} Milestones Complete
            </h3>
          </div>
          
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400" style={{ color: 'var(--text-muted)' }}>PROGRESS RATING</span>
              <span className="text-indigo-300 font-bold">{progressRate}%</span>
            </div>
            <Progress value={progressRate} className="h-2.5" />
          </div>
        </div>
      </Card>

      {/* Timeline steps list */}
      <div className="space-y-8 relative pl-8 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5">
        {activeRoadmap.steps.map((step, idx) => (
          <div key={step.id} className="relative">
            
            {/* Timeline interactive bullet */}
            <button
              onClick={() => toggleStepCompletion(activeProject.id, step.id)}
              className={`absolute -left-[28px] top-1.5 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                step.completed 
                  ? 'bg-emerald-500 border-emerald-400 text-[#030014] shadow-[0_0_8px_rgba(52,211,153,0.3)]' 
                  : 'bg-[#080521] border-white/10 hover:border-indigo-500/55 text-transparent'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            </button>

            {/* Step Roadmap Card */}
            <Card 
              hoverEffect={true} 
              className={`bg-[#08051e]/20 transition-all ${
                step.completed ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-white/5'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-2">
                
                {/* Left Description details */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Badge variant="glow" className="bg-indigo-600/10 text-indigo-300 border-indigo-600/20 font-mono text-[9px] tracking-wider">
                        {step.duration}
                      </Badge>
                      <Badge variant="default" className={`text-[9px] uppercase tracking-widest font-bold ${typeColors[step.type]}`}>
                        {step.type}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {step.description}
                  </p>

                  {/* Day-by-Day Task Checklist */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>Milestone task details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.tasks.map((task, tidx) => (
                        <div key={tidx} className="p-3 rounded-xl border flex items-center space-x-2.5 text-xs" style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${step.completed ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                          <span className="truncate">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Metadata specs / Button */}
                <div className="flex flex-row md:flex-col items-center gap-3 shrink-0 self-start md:self-stretch justify-between w-full md:w-auto md:border-l border-white/5 md:pl-6 pt-4 md:pt-0">
                  <div className="hidden md:flex flex-col space-y-1 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="uppercase" style={{ color: 'var(--text-muted)' }}>ESTIMATED COMMIT</span>
                    <span className="font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                      <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                      8-10 Hours
                    </span>
                  </div>

                  <Button
                    variant={step.completed ? 'outline' : 'glow'}
                    size="sm"
                    className="h-10 text-xs w-full sm:w-auto"
                    onClick={() => toggleStepCompletion(activeProject.id, step.id)}
                  >
                    {step.completed ? 'Mark Incomplete' : 'Complete Milestone'}
                  </Button>
                </div>

              </div>
            </Card>

          </div>
        ))}
      </div>
    </div>
  );
}
