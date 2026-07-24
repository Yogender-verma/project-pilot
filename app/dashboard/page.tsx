"use client";

import {
  BarChartSkeleton,
  RadarChartSkeleton,
} from "@/components/charts/ChartSkeleton";
import { ActivityTimeline } from "@/components/projects/ActivityTimeline";
import { Badge } from "@/components/ui/Badge";
import { Github } from "@/components/ui/BrandIcons";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import Tooltip from "@/components/ui/Tooltip";
import { useAppStore } from "@/store/useAppStore";
import { TiltWrapper } from "@/components/ui/TiltWrapper";
import TypingIndicator from "@/components/ai-mentor/TypingIndicator";
import { useClerk, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Cpu,
  FileText,
  GitMerge,
  Info,
  Sparkles,
} from "lucide-react";
import { generateAdaptiveDashboard } from "@/lib/adaptiveEngine";
import dynamic from "next/dynamic";
import Link from "next/link";
import React from "react";

const SkillRadarChart = dynamic(
  () => import("@/components/charts/SkillRadarChart"),
  {
    ssr: false,
    loading: () => <RadarChartSkeleton />,
  },
);

const CommitBarChart = dynamic(
  () => import("@/components/charts/CommitBarChart"),
  {
    ssr: false,
    loading: () => <BarChartSkeleton />,
  },
);

export default function MainDashboardPage() {
  const {
    user,
    projects,
    activities,
    careerScore,
    githubAnalytics,
    selectProject,
  } = useAppStore();
  const { user: clerkUser } = useUser();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Comparison state
  const [compareUsername, setCompareUsername] = React.useState("");
  const [friendData, setFriendData] = React.useState<any | null>(null);
  const [compareError, setCompareError] = React.useState<string | null>(null);
  const [isComparing, setIsComparing] = React.useState(false);

  // Dynamic score calculator based on user stack skills
  const getDynamicScore = React.useCallback((skills: string[], type: 'ai' | 'db' | 'arch') => {
    const normSkills = (skills || []).map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (type === 'ai') {
      const matches = normSkills.filter(s => 
        s.includes('openai') || s.includes('ai') || s.includes('ml') || 
        s.includes('python') || s.includes('langchain') || s.includes('llm') || 
        s.includes('transformer') || s.includes('hugging') || s.includes('vector') ||
        s.includes('fastapi')
      ).length;
      return Math.min(95, 30 + (matches * 15));
    } else if (type === 'db') {
      const matches = normSkills.filter(s => 
        s.includes('postgres') || s.includes('mongo') || s.includes('mysql') || 
        s.includes('sql') || s.includes('prisma') || s.includes('redis') || 
        s.includes('database') || s.includes('db')
      ).length;
      return Math.min(95, 40 + (matches * 15));
    } else { // arch
      const matches = normSkills.filter(s => 
        s.includes('docker') || s.includes('aws') || s.includes('systemdesign') || 
        s.includes('architecture') || s.includes('microservice') || 
        s.includes('kubernetes') || s.includes('cicd')
      ).length;
      return Math.min(95, 45 + (matches * 15));
    }
  }, []);

  // Derive friend data if comparison active
  const friendRadarData = React.useMemo(() => {
    if (!friendData) return null;
    
    const friendUserMapped = {
      id: friendData.id,
      name: friendData.fullName || friendData.username || 'Friend',
      username: friendData.username || undefined,
      email: '',
      avatarUrl: friendData.imageUrl || undefined,
      careerGoal: friendData.dreamRole || 'Full Stack Developer',
      skills: friendData.skills || [],
    };
    
    const friendAdaptive = generateAdaptiveDashboard(friendUserMapped);
    const friendSkills = friendData.skills || [];
    
    return {
      frontendReadiness: friendAdaptive.careerScore.frontendReadiness,
      backendReadiness: friendAdaptive.careerScore.backendReadiness,
      devOpsReadiness: friendAdaptive.careerScore.devOpsReadiness,
      aiOrchestration: getDynamicScore(friendSkills, 'ai'),
      databases: getDynamicScore(friendSkills, 'db'),
      architecture: getDynamicScore(friendSkills, 'arch'),
      overallScore: friendAdaptive.careerScore.overallScore,
      fullName: friendData.fullName || friendData.username || 'Friend'
    };
  }, [friendData, getDynamicScore]);

  // Radar chart formatted data
  const radarData = React.useMemo(() => [
    { 
      subject: "Frontend", 
      A: careerScore.frontendReadiness, 
      ...(friendRadarData ? { B: friendRadarData.frontendReadiness } : {}),
      fullMark: 100 
    },
    { 
      subject: "Backend", 
      A: careerScore.backendReadiness, 
      ...(friendRadarData ? { B: friendRadarData.backendReadiness } : {}),
      fullMark: 100 
    },
    { 
      subject: "DevOps", 
      A: careerScore.devOpsReadiness, 
      ...(friendRadarData ? { B: friendRadarData.devOpsReadiness } : {}),
      fullMark: 100 
    },
    { 
      subject: "AI Orchestration", 
      A: getDynamicScore(user?.skills || [], 'ai'), 
      ...(friendRadarData ? { B: friendRadarData.aiOrchestration } : {}),
      fullMark: 100 
    },
    { 
      subject: "Databases", 
      A: getDynamicScore(user?.skills || [], 'db'), 
      ...(friendRadarData ? { B: friendRadarData.databases } : {}),
      fullMark: 100 
    },
    { 
      subject: "Architecture", 
      A: getDynamicScore(user?.skills || [], 'arch'), 
      ...(friendRadarData ? { B: friendRadarData.architecture } : {}),
      fullMark: 100 
    },
  ], [careerScore, user?.skills, friendRadarData, getDynamicScore]);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    const handle = compareUsername.trim();
    if (!handle) return;

    if (handle.toLowerCase() === (user?.username || "").toLowerCase() || 
        handle.toLowerCase() === (clerkUser?.username || "").toLowerCase()) {
      setCompareError("You cannot compare with yourself.");
      setFriendData(null);
      return;
    }

    setIsComparing(true);
    setCompareError(null);
    try {
      const res = await fetch(`/api/public/${encodeURIComponent(handle)}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setCompareError(errData.error || "Developer not found or portfolio is private.");
        setFriendData(null);
      } else {
        const data = await res.json();
        setFriendData(data);
      }
    } catch (err) {
      setCompareError("Failed to fetch developer profile.");
      setFriendData(null);
    } finally {
      setIsComparing(false);
    }
  };

  const handleClearCompare = () => {
    setCompareUsername("");
    setFriendData(null);
    setCompareError(null);
  };

  // Bar chart formatted commit activities
  const commitData = githubAnalytics.recentCommits;

  // Derive top gaps and improvements
  const highPriorityGaps = careerScore.missingSkills.filter(
    (s) => s.importance === "High",
  );
  const activeRecommendedProject = projects[0]; // OmniAI Agentic Dashboard

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border-indigo-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        style={{ backgroundColor: "var(--surface-card)" }}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sparkles
              className="w-4 h-4 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Welcome back to Pilot Terminal
            </span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            Hello, {user?.name || clerkUser?.firstName || "Pilot"}
          </h2>
          <p
            className="text-xs sm:text-sm max-w-xl leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Your career target is set to{" "}
            <span className="text-indigo-400 font-bold">
              {user?.careerGoal}
            </span>
            . Complete recommendations to close your remaining skill gaps.
          </p>
        </div>

        <Link href="/dashboard/projects" className="shrink-0 w-full md:w-auto">
          <Button variant="glow" className="w-full h-12 px-5" rightIcon={<ArrowUpRight className="w-4.5 h-4.5" />}>
            View Blueprints
          </Button>
        </Link>
      </motion.div>

      {/* Main Core Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* WIDGET 1: CAREER READINESS RADAR */}
        <Card
          hoverEffect={true}
          glowColor="#6366f1"
          className="bg-[#08051e]/40 lg:col-span-2 flex flex-col justify-between"
        >
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold">
                  Career Skill Match Blueprint
                </CardTitle>

                <Tooltip content="Shows how your skills compare across different full-stack areas like frontend, backend, DevOps, and databases.">
                  <Info
                    className="h-4 w-4 cursor-help text-slate-400 hover:text-indigo-400 transition-colors"
                    aria-label="Career Skill Match information"
                  />
                </Tooltip>
              </div>
              <CardDescription className="text-xs">
                Granular analysis across standard full-stack categories.
              </CardDescription>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="glow">Score: {careerScore.overallScore}%</Badge>
                {friendRadarData && (
                  <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    vs {friendRadarData.fullName} ({friendRadarData.overallScore}%)
                  </Badge>
                )}
              </div>
              
              {/* Compare form */}
              <div className="space-y-1 w-full md:w-auto">
                <form onSubmit={handleCompare} className="flex gap-2 w-full">
                  <input
                    type="text"
                    placeholder="Compare with developer..."
                    value={compareUsername}
                    onChange={(e) => {
                      setCompareUsername(e.target.value);
                      if (compareError) setCompareError(null);
                    }}
                    className={`h-8 text-xs rounded-xl px-3 bg-white/5 border text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all w-full md:w-40 ${
                      compareError ? 'border-rose-500/50' : 'border-white/10'
                    }`}
                    disabled={isComparing}
                  />
                  <Button
                    type="submit"
                    variant="glow"
                    size="sm"
                    className="h-8 text-xs font-semibold shrink-0 py-0 px-3"
                    isLoading={isComparing}
                    disabled={!compareUsername.trim()}
                  >
                    Compare
                  </Button>
                  {friendData && (
                    <Button
                      type="button"
                      variant="glass"
                      size="sm"
                      className="h-8 text-xs shrink-0 py-0 px-3"
                      onClick={handleClearCompare}
                    >
                      Clear
                    </Button>
                  )}
                </form>
                {compareError && (
                  <p className="text-[10px] text-rose-400 font-medium text-left md:text-right">
                    {compareError}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[280px] sm:h-[320px] flex items-center justify-center pt-4">
            <SkillRadarChart
              data={radarData}
              userName={user?.name || clerkUser?.firstName || 'You'}
              friendName={friendRadarData?.fullName}
            />
          </CardContent>
          <CardFooter className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Core Match rate: 78%</span>
            <Link
              href="/dashboard/career"
              className="text-indigo-400 font-semibold hover:underline flex items-center"
            >
              Detailed breakdown <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* WIDGET 2: CAREER READINESS SUMMARY & HIGHLIGHT METRICS */}
        <div className="flex flex-col space-y-6">
          {/* Resume Score Metric */}
          <Card hoverEffect={true} className="bg-[#08051e]/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-indigo-300">
                  <FileText className="w-4 h-4" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Resume Score
                    </span>

                    <Tooltip content="ATS score showing how well your resume matches recruiter and applicant tracking system expectations.">
                      <Info className="h-3.5 w-3.5 cursor-help text-slate-400 hover:text-indigo-400" />
                    </Tooltip>
                  </div>
                </div>
                <Badge variant="success">Good match</Badge>
              </div>
              <div className="flex items-baseline space-x-2">
                <span
                  className="text-4xl font-extrabold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {careerScore.resumeScore}%
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  ATS Rating
                </span>
              </div>
              <Progress
                value={careerScore.resumeScore}
                className="h-1.5 mt-4"
              />
              <p
                className="text-[11px] mt-3"
                style={{ color: "var(--text-muted)" }}
              >
                12 High-priority keywords detected. Missing AI/Vector
                descriptors.
              </p>
            </CardContent>
          </Card>

          {/* GitHub Sync Status Card */}
          <Card hoverEffect={true} className="bg-[#08051e]/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-purple-300">
                  <Github
                    className="w-4 h-4 animate-spin"
                    style={{ animationDuration: "6s" }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      GitHub Scanner
                    </span>

                    <Tooltip content="Calculated from repository activity, commit frequency, and contribution consistency.">
                      <Info className="h-3.5 w-3.5 cursor-help text-slate-400 hover:text-indigo-400" />
                    </Tooltip>
                  </div>
                </div>
                <Badge variant="glow">Synced</Badge>
              </div>
              <div className="flex items-baseline space-x-2">
                <span
                  className="text-4xl font-extrabold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {githubAnalytics.consistencyScore}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Consistency Score
                </span>
              </div>
              <Progress
                value={githubAnalytics.consistencyScore}
                barClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                className="h-1.5 mt-4"
              />
              <p
                className="text-[11px] mt-3"
                style={{ color: "var(--text-muted)" }}
              >
                Scanned {githubAnalytics.totalRepos} repositories.{" "}
                {githubAnalytics.totalCommits} historical commits mapped.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grid: Recommended Project, Gaps, Weekly schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Project Blueprint */}
        {(() => {
          const themeColor = activeRecommendedProject.difficulty === 'Advanced' 
            ? '#ec4899' 
            : activeRecommendedProject.difficulty === 'Intermediate' 
              ? '#8b5cf6' 
              : '#10b981';

          return (
            <TiltWrapper className="lg:col-span-2">
              <Card 
                hoverEffect={false} 
                className="relative border bg-[#070519]/95 rounded-2xl h-full flex flex-col justify-between transition-all duration-300 border-indigo-500/20 hover:border-indigo-500/40"
                style={{
                  backgroundImage: `
                    radial-gradient(at 0% 64%, ${themeColor}12 0px, transparent 80%),
                    radial-gradient(at 100% 99%, ${themeColor}08 0px, transparent 80%)
                  `,
                  boxShadow: 'inset 0 -12px 24px rgba(255, 255, 255, 0.04)',
                }}
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                      <Cpu className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Primary Match Blueprint</span>
                    </div>
                    <CardTitle className="text-lg font-bold">{activeRecommendedProject.title}</CardTitle>
                    <CardDescription className="text-xs">{activeRecommendedProject.tagline}</CardDescription>
                  </div>
                  <Badge variant="glow">★ Impact: +45% Score</Badge>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm space-y-4 pt-1 flex-1" style={{ color: 'var(--text-secondary)' }}>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{activeRecommendedProject.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRecommendedProject.technologies.slice(0, 5).map(tech => (
                      <span key={tech} className="px-2 py-0.5 rounded-md text-[10px] font-mono border border-indigo-500/10 bg-indigo-500/5 text-indigo-300 font-semibold">
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs flex items-start space-x-2" style={{ color: 'var(--text-secondary)' }}>
                    <Sparkles className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI Suggestion:</span> {activeRecommendedProject.recommendationReason}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t border-white/5">
                  <Link 
                    href={`/dashboard/projects`} 
                    onClick={() => selectProject(activeRecommendedProject.id)}
                    className="w-full"
                  >
                    <Button variant="glow" className="w-full text-xs h-11" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      Build Project Blueprint & Roadmap
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TiltWrapper>
          );
        })()}

        {/* Missing Skills Gaps Indicator list */}
        <Card
          hoverEffect={true}
          className="bg-[#08051e]/40 flex flex-col justify-between"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2 text-rose-400 mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                Detected Skill Gaps
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">
                High Priority Gaps
              </CardTitle>

              <Tooltip content="These are the most impactful skills missing from your profile based on your selected career goal.">
                <Info className="h-4 w-4 cursor-help text-slate-400 hover:text-indigo-400" />
              </Tooltip>
            </div>
            <CardDescription className="text-xs">
              Acquiring these will yield the largest salary impacts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 pt-1">
            {highPriorityGaps.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Outstanding! You have no high-priority skill gaps.
              </p>
            ) : (
              highPriorityGaps.slice(0, 3).map((gap, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white/2 hover:bg-white/4 rounded-xl border border-white/5 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <h4 className="font-bold text-slate-200 truncate">
                      {gap.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">{gap.category}</p>
                  </div>
                  <Badge
                    variant="glow"
                    className="shrink-0 bg-rose-500/10 border-rose-500/20 text-rose-300"
                  >
                    High Priority
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/dashboard/career" className="w-full">
              <Button variant="outline" className="w-full text-xs h-11">
                View All Skill Gaps
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Commit Activity and Weekly planner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GitHub Commit Graphs (Recharts) */}
        <Card
          hoverEffect={true}
          className="bg-[#08051e]/40 lg:col-span-2 flex flex-col justify-between"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-indigo-400 mb-1">
              <GitMerge className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                Active contribution index
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">
                GitHub Weekly Commit Rates
              </CardTitle>

              <Tooltip content="Displays your recent weekly commit activity to help track coding consistency.">
                <Info className="h-4 w-4 cursor-help text-slate-400 hover:text-indigo-400" />
              </Tooltip>
            </div>
            <CardDescription className="text-xs">
              Commit consistency scores measured from active repository pushes.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] pt-4">
            <CommitBarChart data={commitData} />
          </CardContent>
          <CardFooter
            className="pt-2 flex items-center justify-between text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Average: 5.7 commits / day</span>
            <Link
              href="/dashboard/github"
              className="text-indigo-400 font-semibold hover:underline flex items-center"
            >
              GitHub analytics <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Weekly study planner */}
        <Card
          hoverEffect={true}
          className="bg-[#08051e]/40 flex flex-col justify-between"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2 text-indigo-300 mb-1">
              <Calendar className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                Weekly Pilot Plan
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">
                Week 1 Ingestion Plan
              </CardTitle>

              <Tooltip content="A personalized weekly roadmap generated from your current skills and career goals.">
                <Info className="h-4 w-4 cursor-help text-slate-400 hover:text-indigo-400" />
              </Tooltip>
            </div>
            <CardDescription className="text-xs">
              Based on {user?.skills.slice(0, 3).join(", ")} skills foundation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 pt-1 text-xs">
            <div className="flex items-start space-x-3">
              <Badge
                variant="glow"
                className="shrink-0 bg-indigo-600/20 text-indigo-300 border-indigo-600/30"
              >
                D1-3
              </Badge>
              <div>
                <h4
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  System Shell Ingestion
                </h4>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Build dashboard containers, set styling custom properties,
                  initialize Git.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge
                variant="glow"
                className="shrink-0 bg-purple-600/20 text-purple-300 border-purple-600/30"
              >
                D4-5
              </Badge>
              <div>
                <h4
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Connect Orchestrator APIs
                </h4>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Configure Next.js Server Actions connecting GPT OpenAI
                  Assistant SDK hooks.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge
                variant="glow"
                className="shrink-0 bg-slate-600/20 text-slate-400 border-slate-600/30"
              >
                D6-7
              </Badge>
              <div>
                <h4
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Zod schemas & Types
                </h4>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Add strict TypeScript interfaces and validation checks to
                  coordinate state payload forms.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/dashboard/roadmaps" className="w-full">
              <Button variant="outline" className="w-full text-xs h-11">
                Open Project Roadmap
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Project Activity Timeline */}
      <Card hoverEffect={false} className="bg-[#08051e]/40">
        <CardContent className="pt-6">
          <ActivityTimeline
            activities={activities}
            limit={6}
            showProjectName
            title="Recent updates"
            description="The latest milestones and blueprint changes across your projects."
          />
        </CardContent>
      </Card>
    </div>
  );
}