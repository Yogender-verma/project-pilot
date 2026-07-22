'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Plus,
  Loader2,
  Check,
  FolderPlus,
  Wand2,
  Layers,
  Code2,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { suggestProjectNames } from '@/app/actions/suggestProjectNames';
import { Project } from '@/types';
import Link from 'next/link';

export default function CreateProjectPage() {
  const router = useRouter();
  const { addCustomProject, selectProject, initializeRoadmap } = useAppStore();

  // Main Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [category, setCategory] = useState('AI & Web Applications');
  const [techInput, setTechInput] = useState('React, Next.js, TypeScript, Tailwind');

  // AI Name Generator States
  const [keywords, setKeywords] = useState('');
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [selectedPill, setSelectedPill] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [highlightTitle, setHighlightTitle] = useState(false);

  // Form Validation & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');

  // Handle AI Name Generation
  const handleGenerateNames = async () => {
    if (!keywords.trim()) {
      setAiNotice('Please enter 3–4 keywords first (e.g., chat, real-time, websocket).');
      return;
    }

    setIsGeneratingNames(true);
    setAiNotice(null);

    try {
      const result = await suggestProjectNames(keywords);
      if (result.success && result.names && result.names.length > 0) {
        setSuggestedNames(result.names);
        if (result.isFallback) {
          setAiNotice('Generated smart fallback project names.');
        } else {
          setAiNotice(null);
        }
      } else {
        setAiNotice(result.error || 'Failed to generate names. Please try again.');
      }
    } catch (err) {
      console.error('Error in handleGenerateNames:', err);
      setAiNotice('An error occurred while calling the AI suggester.');
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const handlePillClick = (name: string) => {
    setTitle(name);
    setSelectedPill(name);
    setTitleError('');
    setHighlightTitle(true);
    setTimeout(() => setHighlightTitle(false), 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Project Title is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newId = `custom-project-${Date.now()}`;
      const technologies = techInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const newProject: Project = {
        id: newId,
        title: title.trim(),
        tagline: description.trim() || `${title.trim()} custom application`,
        description: description.trim() || 'Custom user created portfolio target project.',
        difficulty,
        duration: '14 Days',
        resumeValue: 90,
        careerImpact: 'Custom Portfolio Upgrade',
        skillsGained: technologies,
        technologies: technologies.length > 0 ? technologies : ['TypeScript', 'Next.js', 'React'],
        recommendationReason: 'Created directly via Pilot AI project wizard.',
        features: [
          'AI-assisted project architecture setup',
          'Modular component architecture',
          'Responsive glassmorphic dashboard interface',
        ],
        recommendedApis: ['Vercel AI SDK', 'PostgreSQL / Prisma API'],
        toolsRequired: ['Git', 'VS Code', 'Node.js'],
        completionTime: '15 hours',
        githubPortfolioValue: 'High',
        category,
        status: 'Planned',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addCustomProject(newProject);
      selectProject(newId);
      initializeRoadmap(newId, newProject.title);

      router.push(`/dashboard/projects`);
    } catch (err) {
      console.error('Failed to create custom project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <Link href="/dashboard/projects" className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-indigo-500/30 bg-[#0b081e]/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/15 rounded-2xl text-indigo-400 border border-indigo-500/20">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Create New Project</h3>
              <p className="text-sm text-slate-400 mt-1">Build custom portfolios or choose AI-suggested names.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AI NAME GENERATOR SECTION */}
          <div className="rounded-2xl border border-indigo-500/25 bg-indigo-950/30 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span>Need a name?</span>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400/80 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                AI Suggester
              </span>
            </div>

            <p className="text-sm text-slate-300">
              Type 3–4 keywords describing your app (e.g. <code className="text-indigo-300 font-mono bg-indigo-500/15 px-1.5 py-0.5 rounded">chat, real-time, websocket</code>) to get catchy, AI-generated project names.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g., chat, real-time, websocket"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerateNames();
                  }
                }}
                className="flex-1 bg-[#070517] text-sm text-white placeholder-slate-500 px-4 py-3 rounded-xl border border-indigo-500/30 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
              />
              <Button
                type="button"
                onClick={handleGenerateNames}
                disabled={isGeneratingNames}
                variant="premium"
                className="h-12 px-6 font-semibold"
              >
                {isGeneratingNames ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Suggest Names</>
                )}
              </Button>
            </div>

            {aiNotice && (
              <p className="text-xs font-medium text-indigo-300/90 pt-1 flex items-center gap-1.5">
                <span>ℹ️</span> {aiNotice}
              </p>
            )}

            {suggestedNames.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-indigo-500/20 mt-2">
                <p className="text-xs font-semibold text-slate-400">Click a name to auto-fill the Project Title field:</p>
                <div className="flex flex-wrap gap-2.5">
                  {suggestedNames.map((name, idx) => {
                    const isSelected = selectedPill === name;
                    return (
                      <button
                        key={`${name}-${idx}`}
                        type="button"
                        onClick={() => handlePillClick(name)}
                        className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all transform active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400 border border-indigo-300'
                            : 'bg-[#0f0b29] text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? <Check className="w-4 h-4 text-white" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="project-title-input" className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Project Title *</span>
              {selectedPill && <span className="text-indigo-400 text-[11px] font-normal normal-case flex items-center gap-1"><Check className="w-3 h-3" /> Auto-filled from AI</span>}
            </label>
            <input
              id="project-title-input"
              type="text"
              placeholder="e.g., OmniChat Agentic Workspace"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
              }}
              className={`w-full bg-[#08051a] text-base text-white placeholder-slate-500 px-5 py-4 rounded-xl border transition ${
                highlightTitle
                  ? 'border-indigo-400 ring-2 ring-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                  : titleError
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
            {titleError && <p className="text-sm text-rose-400 font-medium mt-1">{titleError}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-300">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Briefly describe what this project will build..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#08051a] text-sm text-white placeholder-slate-500 px-5 py-4 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#08051a] text-sm text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Category
              </label>
              <input
                type="text"
                placeholder="e.g., Full Stack, AI/ML, DevOps"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#08051a] text-sm text-white placeholder-slate-500 px-4 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" /> Technologies (Comma separated)
            </label>
            <input
              type="text"
              placeholder="React, Next.js, TypeScript, Tailwind CSS"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              className="w-full bg-[#08051a] text-sm text-white placeholder-slate-500 px-5 py-4 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-8 border-t border-white/10">
            <Link href="/dashboard/projects">
              <Button type="button" variant="ghost" disabled={isSubmitting} className="px-6 h-12 text-sm text-slate-400 hover:text-white">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="premium" disabled={isSubmitting} className="px-8 h-12 text-sm font-bold">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating Project...</>
              ) : (
                <><Plus className="w-5 h-5 mr-2" /> Create Project</>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
