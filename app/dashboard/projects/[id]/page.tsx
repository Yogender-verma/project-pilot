'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckSquare, 
  Terminal as TermIcon, 
  Link2, 
  Settings as ToolIcon, 
  TrendingUp, 
  Compass, 
  Clock, 
  BookOpen, 
  Cpu,
  Bookmark,
  Share2,
  Copy,
  CheckCircle,
  FileText,
  Activity
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { ProjectExportMenu } from '@/components/projects/ProjectExportMenu';
import { ActivityTimeline } from '@/components/projects/ActivityTimeline';
import { ShareToXModal } from '@/components/projects/ShareToXModal';
import { Share2 } from 'lucide-react';
export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { projects, roadmaps, activities, toggleStepCompletion, selectProject } = useAppStore();
  
  // Local states
const [activeTab, setActiveTab] = useState<'Overview' | 'Timeline' | 'Activity' | 'Sandbox' | 'Keywords'>('Overview');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);  const [copiedKeywordIdx, setCopiedKeywordIdx] = useState<number | null>(null);
  
  // Find project based on slug params or active Zustand ID
  const projectId = params.id as string;
  const project = projects.find(p => p.id === projectId);
  
  // Connect related roadmap only when the requested project exists.
  const activeRoadmap = project ? roadmaps[project.id] : undefined;

  // Set this project as active on mount just in case
  useEffect(() => {
    if (project) selectProject(project.id);
  }, [project, selectProject]);

  if (!project) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <FileText className="h-7 w-7 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Project unavailable</h2>
        <p className="mt-2 text-sm text-slate-400">
          This project does not exist or is no longer available in your recommendations.
        </p>
        <Button className="mt-6" onClick={() => router.push('/dashboard/projects')}>
          Return to projects
        </Button>
      </div>
    );
  }

  // Calculate checklists completion rate
  const completedSteps = activeRoadmap ? activeRoadmap.steps.filter(s => s.completed).length : 0;
  const totalSteps = activeRoadmap ? activeRoadmap.steps.length : 1;
  const roadmapProgress = Math.round((completedSteps / totalSteps) * 100);

  // Copy helper
  const handleCopyKeyword = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeywordIdx(idx);
    setTimeout(() => setCopiedKeywordIdx(null), 1500);
  };

  const tabs = [
    { id: 'Overview', label: 'Specifications', icon: BookOpen },
    { id: 'Timeline', label: 'Milestones & Timeline', icon: Clock },
    { id: 'Activity', label: 'Project Activity', icon: Activity },
    { id: 'Sandbox', label: 'Developer Sandbox Specs', icon: TermIcon },
    { id: 'Keywords', label: 'Recruiter Handshakes', icon: TrendingUp }
  ] as const;

  return (
    <div className="space-y-8 pb-12">
      {/* Back to catalog button */}
      <button 
        onClick={() => router.push('/dashboard/projects')}
        className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Project Recommendations</span>
      </button>

      {/* Main detail banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c092c]/75 via-[#08051e]/80 to-transparent border-indigo-500/25 flex flex-col md:flex-row justify-between items-start gap-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="space-y-3.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="glow" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 uppercase tracking-widest text-[9px] font-bold">
              {project.category}
            </Badge>
            <Badge variant="glow" className="text-[10px] font-bold">
              Resume boost: +{project.resumeValue}%
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight truncate">
            {project.title}
          </h2>
          
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            {project.tagline}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.technologies.map(t => (
              <span key={t} className="px-2.5 py-0.5 bg-white/2 border border-white/5 text-xs rounded-md text-slate-300 font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-col items-stretch gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
          <ProjectExportMenu project={project} roadmap={activeRoadmap} />
          <Link href="/dashboard/mentor" className="w-full">
            <Button variant="glow" className="w-full text-xs h-11" leftIcon={<Sparkles className="w-4 h-4 animate-bounce" />}>
              Discuss with AI Mentor
            </Button>
          </Link>
{project.status === 'Completed' && (
            <Button
              variant="outline"
              className="w-full text-xs h-11 border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300 hover:text-white"
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={() => setIsShareModalOpen(true)}
            >
              Share to X
            </Button>
          )}

          <button className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer">
            <Bookmark className="w-4.5 h-4.5" />
          </button>
        </div>      </div>

      {/* Tabs navigation panel */}
      <div className="border-b border-white/5 flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3.5 border-b-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive 
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/2'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels content */}
      <div className="min-h-96">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Description & Checklists */}
              <div className="lg:col-span-2 space-y-6">
                <Card hoverEffect={false}>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Project Blueprint Specs</CardTitle>
                    <CardDescription className="text-xs">Comprehensive details of the application architecture.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <p>{project.description}</p>
                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start space-x-3">
                      <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-white mb-1">AI Match Recommendation Reason</h4>
                        <p className="text-xs text-slate-400">{project.recommendationReason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Features checklists */}
                <Card hoverEffect={false}>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Key Application Features to Build</CardTitle>
                    <CardDescription className="text-xs">Follow this checklist to build a complete production portfolio.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5 pt-1">
                    {project.features.map((feature, idx) => (
                      <div key={idx} className="p-3 bg-white/2 rounded-xl border border-white/5 flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                        <CheckSquare className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Spec metadata card widgets */}
              <div className="space-y-6">
                <Card hoverEffect={false}>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Target Match stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs font-semibold text-slate-300">
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                      <span>Difficulty Level</span>
                      <Badge variant="glow">{project.difficulty}</Badge>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                      <span>Completion Time</span>
                      <span className="text-white font-bold">{project.completionTime}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                      <span>Weekly Schedule</span>
                      <span className="text-white">{project.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Resume booster index</span>
                      <span className="text-emerald-400 font-extrabold flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{project.resumeValue}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Career readiness impact */}
                <Card hoverEffect={false}>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Recruiter career value</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-400 leading-relaxed space-y-3 pt-1">
                    <p>{project.careerImpact}</p>
                    <div className="h-px bg-white/5 my-2" />
                    <p className="font-mono text-[10px] text-indigo-300">
                      🎯 Portfolio Value: {project.githubPortfolioValue}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ROADMAP TIMELINE */}
          {activeTab === 'Timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Progress Summary header */}
              <Card hoverEffect={false} className="bg-[#08051e]/40 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-slate-400 uppercase tracking-widest">Active Roadmap Progress</span>
                    <h3 className="text-lg font-bold text-indigo-300">
                      {completedSteps} of {totalSteps} Milestones Complete ({roadmapProgress}%)
                    </h3>
                  </div>
                  <Progress value={roadmapProgress} className="h-2.5 w-full sm:w-64" />
                </div>
              </Card>

              {/* Day-by-Day timeline block tracker */}
              <div className="space-y-6 relative pl-6 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5">
                {activeRoadmap?.steps.map((step, idx) => (
                  <div key={step.id} className="relative">
                    
                    {/* Circle timeline dot indicator */}
                    <button
                      onClick={() => toggleStepCompletion(project.id, step.id)}
                      className={`absolute -left-[24px] top-1.5 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                        step.completed 
                          ? 'bg-emerald-500 border-emerald-400 text-[#030014] shadow-[0_0_8px_rgba(52,211,153,0.3)]' 
                          : 'bg-[#080521] border-white/10 hover:border-indigo-500/55 text-transparent'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    </button>

                    <Card 
                      hoverEffect={true} 
                      className={`bg-[#08051e]/20 transition-all ${
                        step.completed ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-white/5'
                      }`}
                    >
                      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="glow" className="bg-indigo-600/10 text-indigo-300 border-indigo-600/20 text-[9px] font-mono tracking-wider">
                              {step.duration}
                            </Badge>
                            <Badge variant="default" className="text-[9px] uppercase tracking-widest font-bold">
                              {step.type}
                            </Badge>
                          </div>
                          <CardTitle className="text-base font-bold">{step.title}</CardTitle>
                        </div>
                        
                        <Button 
                          variant={step.completed ? 'outline' : 'glow'}
                          size="sm"
                          onClick={() => toggleStepCompletion(project.id, step.id)}
                          className="self-start sm:self-center h-9 text-xs"
                        >
                          {step.completed ? 'Mark Incomplete' : 'Complete Milestone'}
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-2 space-y-4">
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.description}</p>
                        
                        <div className="space-y-2">
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Day-by-Day Task Checklist</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {step.tasks.map((task, tidx) => (
                              <div key={tidx} className="p-2.5 bg-white/2 rounded-lg border border-white/5 flex items-center space-x-2 text-xs text-slate-300">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${step.completed ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                                <span className="truncate">{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PROJECT-SPECIFIC ACTIVITY FEED */}
          {activeTab === 'Activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card hoverEffect={false} className="bg-[#08051e]/40">
                <CardContent className="pt-6">
                  <ActivityTimeline
                    activities={activities.filter((activity) => activity.projectId === project.id)}
                    title={`${project.title} activity`}
                    description="Milestones and important changes recorded for this project."
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* TAB 3: DEVELOPER SANDBOX SPECS */}
          {activeTab === 'Sandbox' && (
            <motion.div
              key="sandbox"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Required APIs and Sandbox specifications */}
              <div className="lg:col-span-2 space-y-6">
                <Card hoverEffect={false}>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Recommended Endpoint APIs</CardTitle>
                    <CardDescription className="text-xs">Integrate these APIs inside your custom pipelines.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3.5 pt-1">
                    {project.recommendedApis.map((api, idx) => (
                      <div key={idx} className="p-3 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between text-xs sm:text-sm text-slate-300">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Link2 className="w-4 h-4 shrink-0" />
                          </div>
                          <span className="font-bold text-slate-200">{api}</span>
                        </div>
                        <Badge variant="glow">Production Grade</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Docker sandbox script mockup */}
                <Card hoverEffect={false}>
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Docker Compose Sandbox Blueprint</CardTitle>
                    <CardDescription className="text-xs">Deploy the local services sandbox inside your workspace.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <pre className="font-mono text-xs text-indigo-300 overflow-x-auto p-4 rounded-xl leading-relaxed">
{`version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://pilot:pilot@postgres:5432/pilotdb
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=pilot
      - POSTGRES_PASSWORD=pilot
      - POSTGRES_DB=pilotdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:`}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Spec tools metadata */}
              <Card hoverEffect={false} className="h-fit">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Developer Tool belt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 pt-1">
                  {project.toolsRequired.map((tool, idx) => (
                    <div key={idx} className="p-3 bg-[#0a071a]/50 rounded-xl border border-white/5 flex items-center space-x-3 text-xs sm:text-sm text-slate-300">
                      <ToolIcon className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* TAB 4: RECRUITER KEYWORD TEMPLATES */}
          {activeTab === 'Keywords' && (
            <motion.div
              key="keywords"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card hoverEffect={false}>
                <CardHeader>
                  <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                    <TrendingUp className="w-4 h-4 shrink-0 animate-bounce" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Recruiter handshake builders</span>
                  </div>
                  <CardTitle className="text-base font-bold">Copy-Paste Resume Bullet Points</CardTitle>
                  <CardDescription className="text-xs">Inject these metric-driven technical sentences into your resume experience sections.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  {[
                    `Architected an enterprise-level ${project.title} coordinating concurrent processes across ${project.technologies.slice(0, 3).join(', ')} frameworks.`,
                    `Implemented high-performance pipelines achieving a 35% reduction in latency and syncing structured logs via Docker microservices networks.`,
                    `Constructed modular state-synchronized whiteboard interfaces backed by real-time presence indicators and secure webhook configurations.`
                  ].map((sentence, idx) => {
                    const isCopied = copiedKeywordIdx === idx;
                    return (
                      <div 
                        key={idx} 
                        className="p-4 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between text-xs sm:text-sm text-slate-300 gap-4"
                      >
                        <span className="leading-relaxed">{sentence}</span>
                        <Button 
                          variant="glass" 
                          size="sm" 
                          onClick={() => handleCopyKeyword(sentence, idx)}
                          className="shrink-0 h-9"
                          leftIcon={isCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        >
                          {isCopied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recruiter impact insights */}
              <Card hoverEffect={false}>
                <CardHeader>
                  <CardTitle className="text-base font-bold">Why Recruiters Love This Project</CardTitle>
                  <CardDescription className="text-xs">AI Recruiter feedback highlighting critical engineering traits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                  <p>Most beginners build generic static websites that don&apos;t showcase microservices concurrency or high-throughput indexing logic. This project highlights advanced traits: **handling data persistence, configuring container micro-networks, writing clean REST models, securing keys, and structuring socket connections**.</p>
                  
                  <p className="font-semibold text-indigo-300">💡 Tip: Make sure your public repository README.md links directly to your deployed dashboard, with a diagram detailing your microservices topology and Docker configurations. That represents elite professional polish.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
</div>

      {isShareModalOpen && (
        <ShareToXModal
          project={{
            title: project.title,
            description: project.description,
            technologies: project.technologies,
          }}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}