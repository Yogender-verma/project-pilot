'use client';

import React, { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CustomCursor } from '@/components/ui/CustomCursor';import {
  User as UserIcon,
  Globe,
  Award,
  CheckCircle,
  ExternalLink,
  Lock,
  Sparkles,
  Code2,
  GitBranch,
  Star,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Calendar,
  Layers,
  ChevronRight,
  Sun,
  Moon,
  Printer
} from 'lucide-react';
import { Github, Linkedin } from '@/components/ui/BrandIcons';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/ThemeProvider';

interface PublicPortfolioProps {
  params: Promise<{ username: string }>;
}

export default function PublicPortfolioPage({ params }: PublicPortfolioProps) {
  const resolvedParams = use(params);
  const rawUsername = resolvedParams.username;

  const { user: storeUser, projects, githubAnalytics, careerScore, roadmaps } = useAppStore();
  const { theme, setTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/${encodeURIComponent(rawUsername)}`);
        if (res.ok) {
          const data = await res.json();
          setDbProfile(data);
        }
      } catch (e) {
        console.error('Error loading public portfolio:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [rawUsername]);

  // Fallback to active Zustand store user if matching handle or demo mode
  const cleanParam = rawUsername.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const storeUsername = (storeUser?.username || storeUser?.name?.toLowerCase().replace(/\s+/g, '-') || 'yogender-verma').toLowerCase();
  
  const isMatchStore = storeUser && storeUser.portfolioPublic && (cleanParam === storeUsername || rawUsername === storeUser.id);
  const effectiveUser = dbProfile || (isMatchStore ? storeUser : null);

  // If no portfolio or disabled public access
  const isPublicAllowed = dbProfile ? true : isMatchStore;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`Check out ${effectiveUser?.name || 'my'} developer portfolio on ProjectPilot! 🚀`);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  const handleShareLinkedin = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    }
  };

  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      const originalTitle = document.title;
      document.title = `${rawUsername}_projectpilot_resume`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070514] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading public portfolio...</p>
        </div>
      </div>
    );
  }

  // ─── PRIVATE OR NOT FOUND LOCK SCREEN ─────────────────────────────────
  if (!isPublicAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#070514] text-slate-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-center space-y-4 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">This Portfolio is Private</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The owner of <span className="font-mono text-indigo-300">@{rawUsername}</span> has disabled public access or this portfolio does not exist.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button variant="premium" className="w-full h-10 text-xs font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // User details
  const name = dbProfile?.fullName || storeUser?.name || 'Yogender Verma';
  const avatarUrl = dbProfile?.imageUrl || storeUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80';
  const careerGoal = dbProfile?.dreamRole || storeUser?.careerGoal || 'AI Engineer';
  const userSkills = dbProfile?.skills || storeUser?.skills || ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Python'];
  const userProjects = dbProfile?.projects || projects || [];

  return (
<div className="min-h-screen bg-[#070514] text-slate-100 selection:bg-indigo-500 selection:text-white print:bg-white print:text-slate-900">
      {/* Glowing custom cursor - desktop only, auto-disabled on touch devices */}
      <CustomCursor />

      {/* Print-specific Optimizations (@media print) */}      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          header, .no-print, button {
            display: none !important;
          }
          body, .min-h-screen {
            background-color: #ffffff !important;
            color: #1e293b !important;
          }
          section {
            break-inside: avoid;
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            color: #1e293b !important;
            margin-bottom: 1rem;
            padding: 1rem !important;
          }
          h1, h2, h3, p, span {
            color: #0f172a !important;
          }
          .text-slate-300, .text-slate-400, .text-slate-500 {
            color: #475569 !important;
          }
          .bg-white\/5, .bg-indigo-950\/40 {
            background-color: #f8fafc !important;
            border-color: #e2e8f0 !important;
          }
        }
      `}</style>

      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070514]/80 border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            P
          </div>
          <span className="font-bold text-sm tracking-wide text-white">ProjectPilot</span>
          <Badge variant="glow" className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
            Public Portfolio
          </Badge>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            variant="default"
            size="sm"
            onClick={handleExportPDF}
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Export to PDF
          </Button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition no-print"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 text-xs border-white/10 text-slate-200 hover:text-white no-print"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copiedLink ? 'Copied' : 'Share'}
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        {/* ─── HERO PROFILE SECTION ────────────────────────────────────────── */}
        <section className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent p-6 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="relative w-28 h-28 rounded-full border-2 border-indigo-500/50 shadow-xl overflow-hidden shrink-0">
              <Image
                src={avatarUrl}
                alt={name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{name}</h1>
                <Badge variant="glow" className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-mono">
                  @{rawUsername}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Target: {careerGoal}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Portfolio Verified
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Building scalable web applications, agentic AI systems, and interactive developer tools. Currently showcasing blueprints, GitHub statistics, and technical skill metrics on ProjectPilot.
              </p>

              {/* Socials & Share Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 no-print">
                {githubAnalytics?.connected && (
                  <a
                    href={`https://github.com/${githubAnalytics.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-200 hover:text-white hover:border-indigo-500/50 transition"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
                  </a>
                )}

                <button
                  onClick={handleShareLinkedin}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-200 hover:text-white hover:border-indigo-500/50 transition"
                >
                  <Linkedin className="w-4 h-4 text-sky-400" />
                  <span>Share LinkedIn</span>
                </button>

                <button
                  onClick={handleShareTwitter}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-200 hover:text-white hover:border-indigo-500/50 transition"
                >
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Share X</span>
                </button>
              </div>
            </div>

            {/* Career Score Badge Box */}
            <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-xl text-center shrink-0 w-full sm:w-44 space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">Career Score</span>
              <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
                <span>{careerScore?.overallScore || 60}%</span>
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${careerScore?.overallScore || 60}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Project & Skill Readiness</p>
            </div>
          </div>
        </section>

        {/* ─── SKILLS OVERVIEW ────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Skills & Tech Stack</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-slate-200 flex items-center gap-2 hover:border-indigo-500/40 transition"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* ─── FEATURED PROJECTS GRID ─────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Featured Projects ({userProjects.length})</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Read-Only Showcase</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userProjects.map((project: any) => (
              <Card key={project.id} hoverEffect className="border-white/10 bg-white/5 flex flex-col justify-between break-inside-avoid">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-white">{project.title}</CardTitle>
                    <Badge
                      variant={project.status === 'Completed' ? 'glow' : 'outline'}
                      className="text-[10px] shrink-0"
                    >
                      {project.status || 'In Progress'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {project.description || 'Interactive project blueprint with modern architecture and agentic capabilities.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1.5">
                    {(project.technologies || project.tags || ['React', 'Next.js', 'TypeScript']).map((tech: string, tIdx: number) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Roadmap Progress</span>
                      <span className="font-bold text-indigo-300">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── GITHUB STATS & INTELLIGENCE ────────────────────────────────── */}
        {githubAnalytics?.connected && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Github className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">GitHub Contribution Summary</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                <span className="text-xs text-slate-400">Repositories</span>
                <p className="text-2xl font-bold text-white mt-1">{githubAnalytics.totalRepos}</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                <span className="text-xs text-slate-400">Commits</span>
                <p className="text-2xl font-bold text-white mt-1">{githubAnalytics.totalCommits}</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                <span className="text-xs text-slate-400">Consistency</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{githubAnalytics.consistencyScore}%</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                <span className="text-xs text-slate-400">Readiness</span>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{githubAnalytics.aiEngineerReadiness}%</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500 no-print">
        <p>Powered by <strong className="text-slate-400">ProjectPilot</strong> — Shareable Developer Portfolios</p>
      </footer>
    </div>
  );
}
