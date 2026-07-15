'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Terminal,
  Cpu,
  GitBranch,
  Sparkles,
  Check,
  ChevronDown,
  Layers,
  Activity,
  TrendingUp,
  ChevronRight,
  GraduationCap,
  X,
  Compass
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function MarketingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const workflowSteps = [
    {
      num: '01',
      title: 'Analyze Your Profile',
      desc: 'Connect your GitHub and upload your resume. Our AI scans your repositories, code quality, and active stack to map your unique blueprint.'
    },
    {
      num: '02',
      title: 'Find Your Gaps',
      desc: 'Select your dream career role. We automatically cross-reference your skills against actual real-world recruiter demands to detect missing links.'
    },
    {
      num: '03',
      title: 'Deploy Custom Projects',
      desc: 'Receive curated full-stack project blueprints tailored perfectly to your skills, with interactive roadmaps, API suggestions, and complete mentor guidance.'
    },
    {
      num: '04',
      title: 'Ace The Interview',
      desc: 'Track commit activities, display verified recruiters automated metrics, and leverage AI insights to answer technical interviews like a pro.'
    }
  ];

  const features = [
    {
      icon: Cpu,
      title: 'AI Resume Engine',
      desc: 'Upload your resume and get immediate granular scores with exact missing keyword alerts tailored to modern startup recruiter bots.'
    },
    {
      icon: GitBranch,
      title: 'GitHub Scanner',
      desc: 'Seamlessly crawl your repositories. Analyze language distributions, commit frequencies, consistency metrics, and clean code guidelines.'
    },
    {
      icon: Sparkles,
      title: 'AI Mentor Chatbot',
      desc: 'Stuck on a webpack configuration or database schema? Chat with your dedicated 24/7 technical mentor trained in all system architectures.'
    },
    {
      icon: Layers,
      title: 'Interactive Day-by-Day Timelines',
      desc: 'Break large projects into digestible, day-by-day tasks. Stay disciplined with completion trackers, tools, and recommended APIs.'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Career Score',
      desc: 'Visualize your frontend, backend, and DevOps readiness indicators grow as you check milestones and complete projects.'
    },
    {
      icon: Terminal,
      title: 'API & Sandbox Specs',
      desc: 'Stop guessing which APIs to call. Receive curated sandbox configurations, docker-compose models, and detailed code snippets.'
    }
  ];

  const faqs = [
    {
      q: 'How does ProjectPilot AI analyze my skills?',
      a: 'We leverage semantic AI parsers to analyze the text and projects in your resume, combined with an automated API scanner that parses your connected GitHub repositories. We analyze your languages, code quality, commit consistency, and architectural complexity to build a complete profile.'
    },
    {
      q: 'Can I use this if I am an absolute beginner?',
      a: 'Absolutely! Our platform caters to all skill levels. When you onboard, we ask for your experience level and group our recommended projects into Beginner, Intermediate, and Advanced categories, complete with step-by-step guidance.'
    },
    {
      q: 'How do the recommended projects help my resume?',
      a: 'Rather than building generic tutorials like todo lists, our AI recommends unique, enterprise-grade, microservice-based SaaS applications (e.g. Distributed Log Processors, Agentic Canvas Cockpits). We provide bullet-point templates highlighting key tech stack keywords and metrics that recruiters love.'
    },
    {
      q: 'Is the AI Mentor Chatbot available 24/7?',
      a: 'Yes, the AI Mentor is always online inside your dashboard workspace. It is fully integrated with your active project and roadmap step, meaning it has instant context on your code, database, tools, and questions without you needing to explain.'
    }
  ];

  return (
    /*
     * Root wrapper — uses CSS custom property vars so the entire page flips
     * correctly in both dark and light themes. No hardcoded hex colours.
     */
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Background ambient glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[-5%] right-[20%] w-[35%] h-[35%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative pt-20 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            {/* Announcement badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-xs font-semibold text-indigo-400 tracking-wide uppercase">
                Now Live: Next.js 15 &amp; AI-Orchestrator v2
              </span>
            </motion.div>

            {/* Headline — inherits body colour which flips via var(--foreground) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Stop Guessing What To <br />
              <span className="text-gradient">Build Next.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              ProjectPilot AI analyzes your skills, scans your GitHub, and builds
              complete, premium, customized project roadmaps to land your dream
              developer career.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20"
            >
              <Link href="/signup">
                <Button variant="premium" size="lg" className="w-full sm:w-auto h-14 px-8 text-base" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Sign Up (Free)
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="glass" size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Hero preview mockup widget */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-w-5xl mx-auto glass-panel p-2.5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative group"
              style={{ borderColor: 'var(--border-medium)' }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />

              {/* Mock dashboard */}
              <div
                className="relative rounded-[22px] overflow-hidden border aspect-video md:aspect-[21/9] flex flex-col md:flex-row"
                style={{
                  backgroundColor: 'var(--surface-primary)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                {/* Left panel: mock onboarding */}
                <div
                  className="w-full md:w-[45%] border-b md:border-b-0 md:border-r p-6 flex flex-col justify-between text-left"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: 'var(--surface-secondary)',
                  }}
                >
                  <div>
                    <div className="flex items-center space-x-2 text-indigo-400 mb-4">
                      <GraduationCap className="w-5 h-5 animate-pulse" />
                      <span className="text-xs font-bold tracking-wider uppercase">Career Blueprint Scans</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Analyzing Resume &amp; GitHub...
                    </h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                      Let our AI dissect your tech stacks to create custom pathways.
                    </p>

                    <div className="space-y-2.5">
                      {[
                        { label: 'TypeScript & React', badge: <Badge variant="success">88% Match</Badge> },
                        { label: 'Database Design (SQL/Vector)', badge: <Badge variant="warning">Missing Gap</Badge> },
                        { label: 'Docker Containerization', badge: <Badge variant="danger">High Priority</Badge> },
                      ].map(({ label, badge }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between p-2.5 rounded-xl border text-xs"
                          style={{
                            backgroundColor: 'var(--hover-bg)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span>{label}</span>
                          {badge}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    <span>PilotCore Engine v1.02</span>
                    <span>Ready for Generation</span>
                  </div>
                </div>

                {/* Right panel: recommended project */}
                <div
                  className="flex-1 p-6 text-left flex flex-col justify-between"
                  style={{ backgroundColor: 'var(--surface-card)' }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="glow">AI Match Recommendation</Badge>
                      <span className="text-xs text-indigo-400 font-semibold">★ Resume Impact: +45%</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      OmniAI Agentic Dashboard
                    </h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                      Build a real-time web socket dashboard coordinating multiple LLM agents,
                      vector lookups, and sandboxed Docker processes.
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {['Next.js 15', 'TypeScript', 'LangChain', 'FastAPI', 'Pinecone', 'Docker'].map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 border text-[10px] font-semibold text-indigo-400 rounded-md"
                          style={{
                            backgroundColor: 'rgba(99,102,241,0.1)',
                            borderColor: 'rgba(99,102,241,0.25)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between p-3 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--hover-bg)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Generates 20 Recruiter Keywords
                      </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-400 flex items-center">
                      Generate Roadmap <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── WORKFLOW ──────────────────────────────────────────────── */}
        <section
          id="workflow"
          className="py-24 border-t dot-bg"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--surface-secondary)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="primary" className="mb-4">App Flow</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>
                The Four-Step Career Pilot
              </h2>
              <p className="max-w-2xl mx-auto text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                How we analyze, configure, and elevate your technical skills to grab recruiters attention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {workflowSteps.map((step, idx) => (
                <Card key={idx} hoverEffect={true} glowColor="#6366f1">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <span className="text-4xl font-black text-indigo-500/30 select-none font-mono">
                      {step.num}
                    </span>
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                      <Check className="w-4 h-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 text-left">
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────────── */}
        <section
          id="features"
          className="py-24 border-t relative"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge variant="primary" className="mb-4">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>
                Everything You Need To Stand Out
              </h2>
              <p className="max-w-2xl mx-auto text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                Stop building generic, boring tutorials. Access premium, realistic blueprints to demonstrate
                actual production-level readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card key={idx} hoverEffect={true} glowColor="#a855f7">
                    <CardHeader className="flex flex-row items-center space-x-3.5 pb-2">
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-base font-bold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 text-left">
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────── */}
        <section
          id="pricing"
          className="py-24 border-t dot-bg"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'var(--surface-secondary)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="primary" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>
                Simple, Honest Pricing
              </h2>
              <p className="max-w-2xl mx-auto text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                Start building for free or upgrade to premium for unlimited AI mentoring and custom vector repositories.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

              {/* Free Plan */}
              <Card hoverEffect={true} className="text-left flex flex-col justify-between">
                <CardHeader>
                  <Badge variant="default" className="w-fit mb-3">Free Pilot</Badge>
                  <CardTitle className="text-3xl font-extrabold">$0</CardTitle>
                  <CardDescription className="mt-1">Perfect for getting started and exploring project options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-px my-2" style={{ backgroundColor: 'var(--border-subtle)' }} />
                  <ul className="space-y-3 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      <span>3 Recommended Projects</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      <span>Resume Analysis &amp; Scoring</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      <span>GitHub Repository Connection</span>
                    </li>
                    <li className="flex items-center space-x-2.5 opacity-40 line-through">
                      <X className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                      <span>Unlimited Day-by-Day Roadmaps</span>
                    </li>
                    <li className="flex items-center space-x-2.5 opacity-40 line-through">
                      <X className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                      <span>AI Technical Mentor Chat (24/7 Context)</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href="/onboarding" className="w-full">
                    <Button variant="outline" className="w-full">Start Free Path</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card
                hoverEffect={true}
                glowColor="#8b5cf6"
                className="text-left flex flex-col justify-between relative"
                style={{ borderColor: 'rgba(99,102,241,0.35)' }}
              >
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <Badge variant="glow">Best Career Acceleration</Badge>
                </div>
                <CardHeader>
                  <Badge variant="primary" className="w-fit mb-3">Professional Guide</Badge>
                  <CardTitle className="text-3xl font-extrabold">
                    $19{' '}
                    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                      / month
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-1 font-semibold">
                    Everything you need to accelerate your career landing rate.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-px my-2" style={{ backgroundColor: 'rgba(99,102,241,0.15)' }} />
                  <ul className="space-y-3 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4.5 h-4.5 text-indigo-400 shrink-0 animate-bounce" />
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Unlimited Project Recommendations
                      </span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                      <span>Full Custom Day-by-Day Roadmaps</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        24/7 AI Mentor Chat with sandbox context
                      </span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                      <span>Recruiter Keyword Booster Sheets</span>
                    </li>
                    <li className="flex items-center space-x-2.5">
                      <Check className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                      <span>Docker &amp; Sandbox container templates</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href="/onboarding" className="w-full">
                    <Button variant="premium" className="w-full">Get Premium Access</Button>
                  </Link>
                </CardFooter>
              </Card>

            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section
          id="faq"
          className="py-24 border-t relative"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="primary" className="mb-4">Support</Badge>
              <h2 className="text-3xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                Find answers to common questions about ProjectPilot AI.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="glass-panel rounded-2xl overflow-hidden transition-all duration-300"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold transition-colors cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span className="text-sm sm:text-base">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: isOpen ? '#6366f1' : 'var(--text-muted)' }}
                      />
                    </button>

                    {isOpen && (
                      <div
                        className="px-6 pb-6 text-xs sm:text-sm leading-relaxed pt-4"
                        style={{
                          color: 'var(--text-secondary)',
                          borderTop: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--hover-bg)',
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer
        className="border-t relative z-10 py-12"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--surface-primary)',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {/* Brand */}
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div
              className="p-1.5 rounded-lg border text-indigo-400"
              style={{
                backgroundColor: 'var(--hover-bg)',
                borderColor: 'var(--border-medium)',
              }}
            >
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>ProjectPilot AI</span>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6 md:mb-0">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-indigo-400 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a>
            <a href="/login" className="hover:text-indigo-400 transition-colors">Dashboard Portal</a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right font-mono">
            &copy; {new Date().getFullYear()} ProjectPilot AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
