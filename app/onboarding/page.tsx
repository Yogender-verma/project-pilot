'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Code, 
  Target, 
  FileText, 
  Clock, 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  Cpu, 
  Sparkles, 
  Terminal, 
  CheckCircle,
  Database,
  Search,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import { Github, Linkedin } from '@/components/ui/BrandIcons';
import { useUser } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { UploadZone } from '@/components/ui/UploadZone';
import { saveOnboardingData, getCurrentUserProfile } from '@/app/actions/user';
import { extractSkillsFromResume } from '@/app/actions/extractSkills';

const PREDEFINED_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML/CSS', 
  'Node.js', 'Express', 'FastAPI', 'Python', 'Go', 
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Git', 'GraphQL', 'Tailwind CSS', 'PyTorch'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { onboardingData, onboardingStep, setOnboardingField, setOnboardingStep, syncUserProfile } = useAppStore();
  const { user: clerkUser, isLoaded } = useUser();

  // Auto-fill onboarding name and email from Clerk Google OAuth session
  useEffect(() => {
    if (isLoaded && clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const fullName = clerkUser.fullName || [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || '';

      if (email && !onboardingData.email) {
        setOnboardingField('email', email);
      }
      if (fullName && !onboardingData.fullName) {
        setOnboardingField('fullName', fullName);
      }
    }
  }, [isLoaded, clerkUser, onboardingData.email, onboardingData.fullName, setOnboardingField]);
  
  // Local state for skills search & typing new ones
  const [skillSearch, setSkillSearch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [dbSaved, setDbSaved] = useState(false);

  // Resume text skill extraction states
  const [resumeText, setResumeText] = useState('');
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);

  const handleExtractSkills = async () => {
    if (!resumeText.trim()) {
      setExtractError('Please paste some resume text first.');
      return;
    }
    setIsExtractingSkills(true);
    setExtractError(null);
    setExtractSuccess(null);

    try {
      const result = await extractSkillsFromResume(resumeText);
      if (result.success && result.skills && result.skills.length > 0) {
        const currentSkills = new Set(onboardingData.skills);
        result.skills.forEach((skill) => currentSkills.add(skill));
        setOnboardingField('skills', Array.from(currentSkills));
        setExtractSuccess(`Extracted ${result.skills.length} skills successfully!`);
        setResumeText('');
      } else {
        setExtractError(result.error || 'No tech skills could be identified in the text.');
      }
    } catch (err) {
      console.error(err);
      setExtractError('Failed to extract skills. Please try again.');
    } finally {
      setIsExtractingSkills(false);
    }
  };

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Skills Selection', icon: Code },
    { id: 3, title: 'Dream Role', icon: Target },
    { id: 4, title: 'Resume Upload', icon: FileText },
    { id: 5, title: 'GitHub Link', icon: Github },
    { id: 6, title: 'LinkedIn Link', icon: Linkedin },
    { id: 7, title: 'Weekly Time', icon: Clock },
    { id: 8, title: 'Final Review', icon: Eye }
  ];

  // AI analysis simulation step descriptions
  const analysisSteps = [
    { title: 'Analyzing resume keywords...', subtitle: 'Scanning structural elements and matching ATS patterns' },
    { title: 'Crawling GitHub profile...', subtitle: 'Fetching public repositories, active languages, and commit frequencies' },
    { title: 'Detecting skill gaps...', subtitle: 'Cross-referencing experience against enterprise market demands' },
    { title: 'Calculating career scores...', subtitle: 'Generating frontend, backend, and DevOps readiness indicators' },
    { title: 'Generating roadmap...', subtitle: 'Building structured day-by-day project and mentor blueprints' }
  ];

  // Securely trigger PostgreSQL save on step submit to prevent race conditions
  const handleOnboardingSubmit = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStage(0);
    setDbSaved(false);

    try {
      await saveOnboardingData({
        dreamRole: onboardingData.dreamRole,
        skills: onboardingData.skills,
        githubUrl: onboardingData.githubUrl || undefined,
        linkedinUrl: onboardingData.linkedinUrl || undefined,
        resumeUrl: onboardingData.resumeName || undefined,
        dailyStudyTime: onboardingData.availableHoursPerWeek
      });
      // After saving to DB, hydrate the store with the fresh profile
      // so the dashboard immediately reflects real user data.
      const freshProfile = await getCurrentUserProfile();
      if (freshProfile) {
        syncUserProfile(freshProfile);
      } else {
        // DB returned null (e.g. Clerk userId not yet propagated) —
        // fall back to onboarding form data so the user sees their own
        // data on the dashboard instead of a blank/dummy state.
        syncUserProfile({
          fullName: onboardingData.fullName,
          email: onboardingData.email,
          imageUrl: clerkUser?.imageUrl || null,
          dreamRole: onboardingData.dreamRole,
          skills: onboardingData.skills,
          githubUrl: onboardingData.githubUrl || null,
          linkedinUrl: onboardingData.linkedinUrl || null,
          resumeUrl: onboardingData.resumeName || null,
        });
      }
      setDbSaved(true);
    } catch (err) {
      console.error('Failed saving onboarding details to database:', err);
      // Gracefully continue — use onboarding form data directly so the
      // user never sees blank or dummy data on the dashboard.
      syncUserProfile({
        fullName: onboardingData.fullName,
        email: onboardingData.email,
        imageUrl: clerkUser?.imageUrl || null,
        dreamRole: onboardingData.dreamRole,
        skills: onboardingData.skills,
        githubUrl: onboardingData.githubUrl || null,
        linkedinUrl: onboardingData.linkedinUrl || null,
        resumeUrl: onboardingData.resumeName || null,
      });
      setDbSaved(true);
    }
  };

  // 1. Progress Simulation Effect (Monitors only isAnalyzing)
  useEffect(() => {
    if (!isAnalyzing) return;

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 60); // Rapid premium loading bar ~6s total

    const stageInterval = setInterval(() => {
      setAnalysisStage((prev) => {
        if (prev >= 4) {
          clearInterval(stageInterval);
          return 4;
        }
        return prev + 1;
      });
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, [isAnalyzing]);

  // 2. Safe Redirect Effect (Triggered only when simulation finishes and DB saves successfully)
  // Note: login() is intentionally NOT called here. syncUserProfile() already sets
  // isAuthenticated:true and populates the store with real data. Calling login() after
  // would overwrite the store with an empty skeleton (skills:[], careerGoal:'fullstack').
  useEffect(() => {
    if (isAnalyzing && analysisProgress === 100 && dbSaved) {
      router.push('/dashboard');
    }
  }, [isAnalyzing, analysisProgress, dbSaved, router]);

  const handleNext = () => {
    if (onboardingStep < 8) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      handleOnboardingSubmit();
    }
  };

  const handleBack = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  // Skill tagging operations
  const toggleSkill = (skill: string) => {
    const current = [...onboardingData.skills];
    if (current.includes(skill)) {
      setOnboardingField('skills', current.filter(s => s !== skill));
    } else {
      setOnboardingField('skills', [...current, skill]);
    }
  };

  const addNewSkill = () => {
    const clean = skillSearch.trim();
    if (clean && !onboardingData.skills.includes(clean)) {
      setOnboardingField('skills', [...onboardingData.skills, clean]);
      setSkillSearch('');
    }
  };

  const filteredPredefined = PREDEFINED_SKILLS.filter(
    s => s.toLowerCase().includes(skillSearch.toLowerCase()) && !onboardingData.skills.includes(s)
  );

  // Validation checks for button active states
  const isStepValid = () => {
    switch (onboardingStep) {
      case 1:
        return onboardingData.fullName.trim().length >= 2 && onboardingData.email.includes('@');
      case 2:
        return onboardingData.skills.length >= 2;
      case 3:
        return onboardingData.dreamRole.trim().length >= 3;
      case 4:
        return onboardingData.resumeName !== null; // Resume uploaded
      case 5:
        return onboardingData.githubUrl.startsWith('http');
      case 6:
        return onboardingData.linkedinUrl.startsWith('http');
      default:
        return true;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-6 text-slate-100 overflow-hidden relative">
        {/* Animated Cyber Glowing background grids */}
        <div className="absolute inset-0 grid-bg opacity-10 grid-animated pointer-events-none" />
        <div className="absolute top-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none pulse-glow" />

        <div className="w-full max-w-2xl text-center z-10 space-y-8">
          {/* Main AI Pulse Avatar */}
          <div className="flex justify-center relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-[30px] w-24 h-24 mx-auto animate-ping" style={{ animationDuration: '3s' }} />
            <div className="w-24 h-24 rounded-full bg-[#080521] border-2 border-indigo-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.25)] relative">
              <Cpu className="w-10 h-10 text-indigo-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <Badge variant="glow" className="px-3.5 py-1 uppercase tracking-widest text-[10px] font-bold">
              ProjectPilot Core AI
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Generating Your Career Orbit</h2>
            <p className="text-sm text-indigo-300 font-mono">Status: Processing Profile Scans...</p>
          </div>

          {/* Cinematic Analysis progress card */}
          <Card className="bg-[#08051e]/50 border-white/5 p-4 text-left glass-panel">
            <div className="space-y-4">
              {analysisSteps.map((step, idx) => {
                const isActive = analysisStage === idx;
                const isCompleted = analysisStage > idx;
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: isActive || isCompleted ? 1 : 0.25,
                      x: 0 
                    }}
                    className="flex items-center space-x-3.5"
                  >
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : isActive ? (
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/10 shrink-0" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>
                        {step.title}
                      </h4>
                      {isActive && (
                        <p className="text-xs text-slate-400 mt-0.5 animate-pulse">
                          {step.subtitle}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>SYSTEM COMPILATION</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2.5" />
            </div>
          </Card>
          
          <div className="text-xs text-slate-500 font-mono tracking-widest uppercase">
            ESTIMATED TIMEOUT ~ 8 SECONDS. DO NOT CLOSE COCKPIT WINDOW.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-slate-100 py-12 px-4 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Stepper Progress bar header */}
      <div className="max-w-4xl w-full mx-auto mb-8 z-10">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase tracking-widest mb-4 px-2">
          <span>Onboarding Progress</span>
          <span>Step {onboardingStep} of 8</span>
        </div>
        <Progress value={(onboardingStep / 8) * 100} className="h-1.5" />
        
        {/* Horizontal step indicator */}
        <div className="hidden sm:flex items-center justify-between mt-6">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCurrent = onboardingStep === s.id;
            const isCompleted = onboardingStep > s.id;
            
            return (
              <div 
                key={s.id} 
                className="flex flex-col items-center space-y-1.5 cursor-pointer"
                onClick={() => isCompleted && setOnboardingStep(s.id)}
              >
                <div className={`p-2.5 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-indigo-600/20 border-indigo-400 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]' 
                    : isCompleted 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-white/2 border-white/5 text-slate-500'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className={`text-[10px] font-bold ${
                  isCurrent ? 'text-indigo-300' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Form Container */}
      <main className="max-w-xl w-full mx-auto flex-1 flex items-center justify-center z-10 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="bg-[#08051e]/40 p-2 sm:p-4">
              <CardContent className="pt-6">
                
                {/* STEP 1: PERSONAL INFORMATION */}
                {onboardingStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1.5">Personal Information</h2>
                      <p className="text-xs text-slate-400">Let&apos;s start with some basic credentials for your profile.</p>
                    </div>
                    <Input
                      label="Full Name"
                      placeholder="yogender verma"
                      value={onboardingData.fullName}
                      onChange={(e) => setOnboardingField('fullName', e.target.value)}
                      leftIcon={<User className="w-4.5 h-4.5" />}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="yogendarverma0268@gmail.com"
                      value={onboardingData.email}
                      onChange={(e) => setOnboardingField('email', e.target.value)}
                      leftIcon={<User className="w-4.5 h-4.5" />}
                    />
                  </div>
                )}

                {/* STEP 2: SKILLS SELECTION */}
                {onboardingStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1.5">Select Your Active Skills</h2>
                      <p className="text-xs text-slate-400">Choose at least 2 technologies you already know. We will use these as your foundation.</p>
                    </div>

                    {/* Selected tags */}
                    <div className="flex flex-wrap gap-1.5 border border-white/5 bg-white/2 rounded-xl p-3 min-h-12">
                      {onboardingData.skills.length === 0 ? (
                        <span className="text-xs text-slate-500 italic flex items-center">No skills selected yet. Select from below...</span>
                      ) : (
                        onboardingData.skills.map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="glow"
                            className="pr-1.5 flex items-center space-x-1.5"
                          >
                            <span>{skill}</span>
                            <button onClick={() => toggleSkill(skill)} className="hover:text-rose-400 shrink-0 cursor-pointer">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>

                    {/* Search / Add box */}
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search or enter custom skill..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addNewSkill()}
                          className="w-full bg-[#0a071a]/50 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-white/10 px-4 py-3 pl-11 focus:outline-none focus:border-indigo-500/80"
                        />
                      </div>
                      <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={addNewSkill}>
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Resume skill extractor */}
                    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">⚡ AI Skill Extractor</span>
                        <span className="text-[10px] text-slate-400">Paste raw resume text</span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Paste your resume text here (e.g. Experience with React, Python, Docker, Postgres...)"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="w-full bg-[#070517] text-xs text-white placeholder-slate-500 p-3 rounded-xl border border-indigo-500/20 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          {extractError && <p className="text-[11px] text-rose-400 font-medium">{extractError}</p>}
                          {extractSuccess && <p className="text-[11px] text-emerald-400 font-medium">{extractSuccess}</p>}
                        </div>
                        <Button
                          type="button"
                          onClick={handleExtractSkills}
                          disabled={isExtractingSkills}
                          variant="premium"
                          size="sm"
                          className="h-9 px-3 text-[11px]"
                        >
                          {isExtractingSkills ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              Extracting...
                            </>
                          ) : (
                            'Extract Skills'
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Filtered suggestions list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Suggested Technologies</span>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                        {filteredPredefined.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className="px-2.5 py-1 bg-white/5 border border-white/10 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: DREAM ROLE */}
                {onboardingStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1.5">What is your Dream Career Role?</h2>
                      <p className="text-xs text-slate-400">We will matching missing skills gaps using real market demands for this role.</p>
                    </div>
                    <Input
                      label="Dream Career Role"
                      placeholder="e.g. Senior Backend Engineer, AI Engineer"
                      value={onboardingData.dreamRole}
                      onChange={(e) => setOnboardingField('dreamRole', e.target.value)}
                      leftIcon={<Target className="w-4.5 h-4.5" />}
                    />
                    
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Popular Roles</span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'AI Engineer', 
                          'Frontend Engineer', 
                          'Senior Backend Engineer', 
                          'DevOps Architect', 
                          'Full-Stack Developer'
                        ].map((role) => (
                          <button
                            key={role}
                            onClick={() => setOnboardingField('dreamRole', role)}
                            className={`px-3 py-2 text-left rounded-xl text-xs font-semibold border transition-all ${
                              onboardingData.dreamRole === role 
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                                : 'bg-white/2 border-white/5 text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: RESUME UPLOAD */}
                {onboardingStep === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1.5">Upload Your Current Resume</h2>
                      <p className="text-xs text-slate-400">Our AI will parse your current experience level, keywords, and structural formats.</p>
                    </div>
                    <UploadZone
                      initialFileName={onboardingData.resumeName}
                      onFileSelect={(name, base64) => {
                        setOnboardingField('resumeName', name);
                        setOnboardingField('resumeFile', base64);
                      }}
                      onClear={() => {
                        setOnboardingField('resumeName', null);
                        setOnboardingField('resumeFile', null);
                      }}
                    />
                  </div>
                )}

                {/* STEP 5: GITHUB LINK */}
                {onboardingStep === 5 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1.5">Add Your GitHub Profile</h2>
                      <p className="text-xs text-slate-400">Used to scan public code structures, commit activity timelines, and overall language usage.</p>
                    </div>
                    <Input
                      label="GitHub Profile URL"
                      placeholder="https://github.com/username"
                      value={onboardingData.githubUrl}
                      onChange={(e) => setOnboardingField('githubUrl', e.target.value)}
                      leftIcon={<Github className="w-4.5 h-4.5" />}
                    />
                  </div>
                )}

                {/* STEP 6: LINKEDIN LINK */}
                {onboardingStep === 6 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1.5">Add Your LinkedIn Profile</h2>
                      <p className="text-xs text-slate-400">We analyze connected endorsements and career backgrounds to augment resume scores.</p>
                    </div>
                    <Input
                      label="LinkedIn Profile URL"
                      placeholder="https://linkedin.com/in/username"
                      value={onboardingData.linkedinUrl}
                      onChange={(e) => setOnboardingField('linkedinUrl', e.target.value)}
                      leftIcon={<Linkedin className="w-4.5 h-4.5" />}
                    />
                  </div>
                )}

                {/* STEP 7: WEEKLY TIME */}
                {onboardingStep === 7 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1.5">Available Learning Commits</h2>
                      <p className="text-xs text-slate-400">How many hours can you commit to building projects weekly?</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-xs text-slate-400 uppercase tracking-widest">Time commitment</span>
                        <span className="text-lg font-bold text-indigo-400">{onboardingData.availableHoursPerWeek} Hours / Week</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-slate-500">5 hrs</span>
                        <input
                          type="range"
                          min={5}
                          max={40}
                          step={5}
                          value={onboardingData.availableHoursPerWeek}
                          onChange={(e) => setOnboardingField('availableHoursPerWeek', parseInt(e.target.value))}
                          className="flex-1 accent-indigo-500 h-2 bg-white/10 rounded-lg cursor-pointer"
                        />
                        <span className="text-xs text-slate-500">40 hrs</span>
                      </div>
                      
                      <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 text-xs text-indigo-200">
                        {onboardingData.availableHoursPerWeek <= 10 ? (
                          <p>💡 **Light Commitment**: Perfect for part-time studying while working a job. Roadmaps will extend over ~6-8 weeks.</p>
                        ) : onboardingData.availableHoursPerWeek <= 25 ? (
                          <p>⚡ **Sprint Commitment**: A highly balanced study workload. Perfect for coding bootcamps. Roadmaps complete in ~3-4 weeks.</p>
                        ) : (
                          <p>🔥 **Full-Time Cockpit**: Intensive focus. Ideal for students on summer vacations or active job hunters. Roadmaps complete in ~1.5-2 weeks.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 8: FINAL REVIEW */}
                {onboardingStep === 8 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1.5">Final Profile Review</h2>
                      <p className="text-xs text-slate-400">Verify all information before we spin up the AI analyzer engine.</p>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto p-1 font-sans text-xs sm:text-sm text-slate-300">
                      <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Name</span>
                        <span className="col-span-2 text-white font-bold">{onboardingData.fullName}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Email</span>
                        <span className="col-span-2 text-white">{onboardingData.email}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Dream Role</span>
                        <span className="col-span-2 text-indigo-300 font-bold">{onboardingData.dreamRole}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Skills Input</span>
                        <div className="col-span-2 flex flex-wrap gap-1">
                          {onboardingData.skills.map(s => <Badge key={s} className="px-1.5 py-0.5">{s}</Badge>)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Resume</span>
                        <span className="col-span-2 text-emerald-400 font-medium truncate flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1.5 shrink-0" />
                          {onboardingData.resumeName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">GitHub Link</span>
                        <span className="col-span-2 text-slate-300 truncate font-mono text-xs">{onboardingData.githubUrl}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Weekly Hours</span>
                        <span className="col-span-2 text-white font-bold">{onboardingData.availableHoursPerWeek} Hours</span>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-white/5 mt-6 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className={onboardingStep === 1 ? 'opacity-0 pointer-events-none' : ''}
                  leftIcon={<ArrowLeft className="w-4.5 h-4.5" />}
                >
                  Back
                </Button>

                <Button
                  variant={onboardingStep === 8 ? 'premium' : 'default'}
                  disabled={!isStepValid()}
                  onClick={handleNext}
                  rightIcon={onboardingStep === 8 ? <Sparkles className="w-4.5 h-4.5" /> : <ArrowRight className="w-4.5 h-4.5" />}
                >
                  {onboardingStep === 8 ? 'Analyze My Profile' : 'Next Step'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Cockpit footer info */}
      <footer className="text-center text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-8">
        ProjectPilot AI Secure Cockpit &bull; Encryption Active
      </footer>
    </div>
  );
}
