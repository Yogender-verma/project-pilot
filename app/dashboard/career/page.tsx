"use client";

import { RadarChartSkeleton } from "@/components/charts/ChartSkeleton";
import { Badge } from "@/components/ui/Badge";
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
import { useAppStore } from "@/store/useAppStore";
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useState } from "react";

const SkillRadarChart = dynamic(
  () => import("@/components/charts/SkillRadarChart"),
  {
    ssr: false,
    loading: () => <RadarChartSkeleton />,
  },
);

export default function CareerScorePage() {
  const { careerScore, recalculateCareerScore, user } = useAppStore();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Radar chart formatting
  const radarData = [
    { subject: "Frontend", A: careerScore.frontendReadiness, fullMark: 100 },
    { subject: "Backend", A: careerScore.backendReadiness, fullMark: 100 },
    { subject: "DevOps", A: careerScore.devOpsReadiness, fullMark: 100 },
    { subject: "AI Orchestration", A: 40, fullMark: 100 },
    { subject: "Databases", A: 60, fullMark: 100 },
    { subject: "Architecture", A: 70, fullMark: 100 },
  ];

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      recalculateCareerScore();
      setIsRecalculating(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Award className="w-6 h-6 text-indigo-400" />
            <span>AI Career readiness cockpit</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time scanner metrics analyzing credentials matching:{" "}
            <span className="text-indigo-300 font-bold">
              {user?.careerGoal}
            </span>
            .
          </p>
        </div>

        <Button
          variant="glow"
          className="h-11 self-start sm:self-center"
          isLoading={isRecalculating}
          onClick={handleRecalculate}
          leftIcon={
            <Sparkles
              className="w-4 h-4 animate-spin"
              style={{ animationDuration: "3s" }}
            />
          }
        >
          Recalculate Score
        </Button>
      </div>

      {/* Grid: Global overall score widget & Sub-readiness gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Readiness Card */}
        <Card
          hoverEffect={true}
          glowColor="#8b5cf6"
          className="bg-[#08051e]/40 lg:col-span-2 flex flex-col justify-between"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Activity className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                Aggregated matching rating
              </span>
            </div>
            <CardTitle className="text-base font-bold">
              Overall Career Readiness Score
            </CardTitle>
            <CardDescription className="text-xs">
              Based on connected resume keyword matching, GitHub profile crawl,
              and active roadmaps milestones checked.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 items-center flex-1">
            {/* Massive Circular score indicator */}
            <div className="sm:col-span-1 flex flex-col items-center justify-center text-center p-4 bg-white/2 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/5 blur-[20px] rounded-full" />
              <span className="text-5xl font-black text-white relative z-10">
                {careerScore.overallScore}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1 relative z-10 uppercase tracking-widest">
                Match rate
              </span>
            </div>

            {/* Radar chart */}
            <div className="sm:col-span-2 h-[200px] flex items-center justify-center pt-2">
              <SkillRadarChart data={radarData} />
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t border-white/5 text-xs text-slate-500 flex justify-between">
            <span>Current target: {user?.careerGoal}</span>
            <span>Last scanned: Live</span>
          </CardFooter>
        </Card>

        {/* Sub-readiness metric bars */}
        <Card
          hoverEffect={true}
          className="bg-[#08051e]/40 flex flex-col justify-between"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Category Readiness Gauges
            </CardTitle>
            <CardDescription className="text-xs">
              Individual matching rates across standard full-stack areas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1 flex-1 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Frontend Readiness</span>
                <span className="text-indigo-300 font-bold">
                  {careerScore.frontendReadiness}%
                </span>
              </div>
              <Progress
                value={careerScore.frontendReadiness}
                className="h-1.5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Backend Readiness</span>
                <span className="text-purple-300 font-bold">
                  {careerScore.backendReadiness}%
                </span>
              </div>
              <Progress
                value={careerScore.backendReadiness}
                barClassName="bg-gradient-to-r from-purple-500 to-indigo-500"
                className="h-1.5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">DevOps Readiness</span>
                <span className="text-pink-300 font-bold">
                  {careerScore.devOpsReadiness}%
                </span>
              </div>
              <Progress
                value={careerScore.devOpsReadiness}
                barClassName="bg-gradient-to-r from-pink-500 to-purple-500"
                className="h-1.5"
              />
            </div>

            <div className="h-px bg-white/5 my-3" />

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              <span>Resume score rating</span>
              <span>{careerScore.resumeScore}% Matches</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Skill gaps lists & Actionable improvement blueprints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detected missing skills list */}
        <Card hoverEffect={true} className="bg-[#08051e]/40 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2 text-rose-400 mb-1">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                Profile scanning discrepancies
              </span>
            </div>
            <CardTitle className="text-base font-bold">
              Detected Missing Skills & Gaps
            </CardTitle>
            <CardDescription className="text-xs">
              Based on market comparison algorithms matching: {user?.careerGoal}
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-1">
            {careerScore.missingSkills.map((gap, idx) => {
              const badgeColors = {
                High: "bg-rose-500/10 border-rose-500/20 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.15)]",
                Medium: "bg-amber-500/10 border-amber-500/20 text-amber-300",
                Low: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
              };

              return (
                <div
                  key={idx}
                  className="p-3 bg-white/2 rounded-xl border border-white/5 flex items-center justify-between text-xs sm:text-sm text-slate-300 gap-4"
                >
                  <div className="space-y-0.5 truncate">
                    <h4 className="font-bold text-slate-200 truncate">
                      {gap.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">{gap.category}</p>
                  </div>
                  <Badge variant="glow" className={badgeColors[gap.importance]}>
                    {gap.importance} Priority
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* AI Action recommendations */}
        <Card
          hoverEffect={true}
          className="bg-[#08051e]/40 flex flex-col justify-between"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                Action recommendation blueprint
              </span>
            </div>
            <CardTitle className="text-base font-bold">
              AI Improvement Pathways
            </CardTitle>
            <CardDescription className="text-xs">
              Step-by-step guidance to raise matching score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 pt-1 text-xs text-slate-400 leading-relaxed">
            {careerScore.improvements.map((imp, idx) => (
              <div key={idx} className="flex items-start space-x-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{imp}</span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/dashboard/projects" className="w-full">
              <Button
                variant="premium"
                className="w-full text-xs h-11"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Build Project Recommended Gaps
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
