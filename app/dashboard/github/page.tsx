'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, ShieldCheck, Sparkles, ArrowUpRight, 
  Star, GitFork, Code, Target, Zap, BrainCircuit
} from 'lucide-react';
import { Github } from '@/components/ui/BrandIcons';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';

export default function GitHubAnalyticsPage() {
  const { githubAnalytics } = useAppStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
          <Github className="w-6 h-6 text-indigo-400" />
          <span>GitHub Deep Analytics</span>
        </h2>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Automated intelligence analysis of linked profile: <span className="text-indigo-300 font-bold">{githubAnalytics.username}</span>.
        </p>
      </div>

      {/* Grid: Overview score widget */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card hoverEffect={true} glowColor="#a855f7" className="bg-[#08051e]/40 lg:col-span-3 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Activity className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Profile Activity Metrics</span>
            </div>
            <CardTitle className="text-base font-bold">Contribution & Consistency</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 flex-1">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total Repos</span>
              <h3 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{githubAnalytics.totalRepos}</h3>
              <p className="text-[10px] text-indigo-400 font-semibold">Active & Analyzed</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total Commits</span>
              <h3 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{githubAnalytics.totalCommits}</h3>
              <p className="text-[10px] text-emerald-400 font-semibold">High consistency</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Portfolio Strength</span>
              <h3 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{githubAnalytics.portfolioStrengthScore}%</h3>
              <Progress value={githubAnalytics.portfolioStrengthScore} className="h-1.5 mt-2" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>AI Readiness</span>
              <h3 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{githubAnalytics.aiEngineerReadiness}%</h3>
              <Progress value={githubAnalytics.aiEngineerReadiness} className="h-1.5 mt-2 bg-slate-800 [&>div]:bg-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card hoverEffect={true} className="bg-[#08051e]/40 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Language Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[140px] flex items-center justify-center pt-2">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={githubAnalytics.languages}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={55}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {githubAnalytics.languages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#060417', borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12 }} itemStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
          <CardFooter className="pt-1 flex flex-wrap gap-1 text-[9px] font-semibold justify-center">
            {githubAnalytics.languages.map(lang => (
              <span key={lang.name} className="px-1.5 py-0.5 rounded flex items-center space-x-1" style={{ backgroundColor: 'var(--hover-bg)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lang.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{lang.name}</span>
              </span>
            ))}
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recruiter Insights */}
        <Card hoverEffect={true} className="bg-[#08051e]/40">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center space-x-2 text-indigo-400 mb-1">
              <ShieldCheck className="w-4.5 h-4.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono">AI Recruiter Intelligence</span>
            </div>
            <CardTitle className="text-base font-bold">Automated Profile Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
              {githubAnalytics.recruiterInsights.map((insight, idx) => (
              <div key={idx} className="p-3 rounded-lg border flex items-start space-x-3 text-sm leading-relaxed" style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Skills & Growth */}
        <div className="space-y-6">
          <Card hoverEffect={true} className="bg-[#08051e]/40">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                <BrainCircuit className="w-4.5 h-4.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Inferred Capabilities</span>
              </div>
              <CardTitle className="text-base font-bold">Detected Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 pt-1">
              {githubAnalytics.skillDetection.map((skill, idx) => (
                <Badge key={idx} variant="glow" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">{skill}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card hoverEffect={true} className="bg-[#08051e]/40">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 text-amber-400 mb-1">
                <Target className="w-4.5 h-4.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Actionable Steps</span>
              </div>
              <CardTitle className="text-base font-bold">Growth Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              {githubAnalytics.growthRecommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Repository Intelligence */}
      <div>
        <h3 className="text-lg font-bold flex items-center space-x-2 mb-4" style={{ color: 'var(--text-primary)' }}>
          <Code className="w-5 h-5 text-indigo-400" />
          <span>Repository Intelligence</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {githubAnalytics.repositoryIntelligence.map((repo, idx) => (
            <Card key={idx} hoverEffect={true} className="bg-[#0a071a]/50 flex flex-col justify-between border-white/5">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold truncate pr-2 text-white">{repo.name}</CardTitle>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="flex items-center"><Star className="w-3 h-3 mr-1" /> {repo.stars}</span>
                    <span className="flex items-center"><GitFork className="w-3 h-3 mr-1" /> {repo.forks}</span>
                  </div>
                </div>
                <CardDescription className="text-xs line-clamp-2 mt-1">{repo.description}</CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-2 flex-1">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Key Analysis</p>
                    <ul className="text-[11px] space-y-1 list-disc pl-3" style={{ color: 'var(--text-secondary)' }}>
                      {repo.analysis.slice(0, 2).map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Detected Stack</p>
                    <div className="flex flex-wrap gap-1">
                      {repo.detectedSkills.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-4 pb-4 pt-2 border-t border-white/5 flex flex-col items-start gap-2">
                <p className="text-[10px] text-amber-400 font-semibold flex items-center">
                  <Zap className="w-3 h-3 mr-1" /> Next Step:
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{repo.growthRecommendation[0]}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
