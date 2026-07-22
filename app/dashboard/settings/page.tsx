'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Settings,
  User as UserIcon,
  Bell,
  Eye,
  Sparkles,
  Trash2,
  RefreshCw,
  CheckCircle,
  Sun,
  Moon,
  Monitor,
  AlertCircle,
  Camera,
  Loader2,
  Plus,
  X,
  Globe,
  Copy,
  ExternalLink,
  Check,
  Download,
  Upload
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Github, Linkedin } from '@/components/ui/BrandIcons';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { Theme } from '@/lib/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/lib/ThemeProvider';
import { 
  getProfessionalLinks, 
  updateProfessionalLinks, 
  updateUserSkillsInDb, 
  updateProfileAvatar 
} from '@/app/actions/user';
import { extractSkillsFromResume } from '@/app/actions/extractSkills';
import { toast } from 'sonner'; // Core hook/utility for the global toast system

// Client API Handlers
export default function SettingsPage() {
  const { user, onboardingData, updateProfile, updateAvatar, updatePortfolioVisibility, resetOnboarding, githubAnalytics, connectGithub, disconnectGithub, updateUserSkills, updateLinksStore } = useAppStore();

  // Access the global theme state & setTheme so the user can pick directly
  const { theme, setTheme } = useTheme();

  // Local states for inputs
  const [profileName, setProfileName] = useState(user?.name || 'yogender verma');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'yogendarverma0268@gmail.com');
  const [profileGoal, setProfileGoal] = useState(user?.careerGoal || 'AI Engineer');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || '');

  const [linksLoading, setLinksLoading] = useState(false);
  const [linksSuccess, setLinksSuccess] = useState(false);
  const [linksError, setLinksError] = useState('');
  
  useEffect(() => {
    async function loadLinks(){
      try {
        const data = await getProfessionalLinks();
        if(!data) return;

        setGithubUrl(data.githubUrl || "");
        setLinkedinUrl(data.linkedinUrl || "");
        setResumeUrl(data.resumeUrl || "");
      } catch(err) {
        console.error(err);
      }
    }
    loadLinks();
  }, []);

  // Portfolio Visibility States
  const [isPortfolioPublic, setIsPortfolioPublic] = useState(user?.portfolioPublic ?? false);
  const [customHandle, setCustomHandle] = useState(user?.username || user?.name?.toLowerCase().replace(/\s+/g, '-') || 'yogender-verma');
  const [copiedLink, setCopiedLink] = useState(false);

  const portfolioUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/u/${customHandle}`
    : `https://projectpilot.dev/u/${customHandle}`;

  const handleTogglePortfolioPublic = async () => {
    const nextState = !isPortfolioPublic;
    setIsPortfolioPublic(nextState);
    updatePortfolioVisibility(nextState, customHandle);
    try {
      await fetch('/api/settings/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioPublic: nextState, username: customHandle }),
      });
    } catch (e) {}
  };

  const handleSaveHandle = async () => {
    updatePortfolioVisibility(isPortfolioPublic, customHandle);
    try {
      await fetch('/api/settings/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioPublic: isPortfolioPublic, username: customHandle }),
      });
    } catch (e) {}
  };

  const handleCopyPortfolioUrl = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(portfolioUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Skills management states
  const [localSkills, setLocalSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const [skillsSaveSuccess, setSkillsSaveSuccess] = useState(false);
  const [skillsSaveLoading, setSkillsSaveLoading] = useState(false);

  const handleAddSkill = () => {
    const clean = newSkill.trim();
    if (clean && !localSkills.includes(clean)) {
      setLocalSkills([...localSkills, clean]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setLocalSkills(localSkills.filter(s => s !== skill));
  };

  const handleExtractSkillsInSettings = async () => {
    if (!resumeText.trim()) {
      setExtractError('Please paste some resume text first.');
      return;
    }
    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(null);

    try {
      const result = await extractSkillsFromResume(resumeText);
      if (result.success && result.skills && result.skills.length > 0) {
        const currentSkills = new Set(localSkills);
        result.skills.forEach((skill) => currentSkills.add(skill));
        setLocalSkills(Array.from(currentSkills));
        setExtractSuccess(`Extracted and merged ${result.skills.length} skills!`);
        setResumeText('');
      } else {
        setExtractError(result.error || 'No tech skills could be identified in the text.');
      }
    } catch (err) {
      console.error(err);
      setExtractError('Failed to extract skills.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveSkills = async () => {
    setSkillsSaveLoading(true);
    setSkillsSaveSuccess(false);
    try {
      updateUserSkills(localSkills);
      await updateUserSkillsInDb(localSkills);
      setSkillsSaveSuccess(true);
      setTimeout(() => setSkillsSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSkillsSaveLoading(false);
    }
  };

  // Notification states
  const [notifyWeeklyPlan, setNotifyWeeklyPlan] = useState(true);
  const [notifyMentorReplied, setNotifyMentorReplied] = useState(true);
  const [notifyRecruiterScans, setNotifyRecruiterScans] = useState(false);

  // --- AVATAR UPLOAD STATE HOOKS ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>((user as any)?.imageUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const isUploading = false; // Mocking uploading state for compatibility

  const handleSaveAvatar = async () => {
    if (!previewUrl) return;

    updateAvatar(previewUrl);

    try {
      await updateProfileAvatar(previewUrl);
      toast.success("Avatar updated successfully.");
      setAvatarFile(null);
    } catch {
      toast.error("Failed to update avatar.");
    }
  };

  const handleAvatarSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME formats
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      toast.error("Format unsupported. Use JPG, PNG or WEBP.");
      return;
    }

    // Enforce 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image exceeds the 5MB limit.");
      return;
    }

    setAvatarFile(file);

    // Create client memory string preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  // ----------------------------------

  // Save profile information
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileName, profileEmail, profileGoal);
    toast.success("Profile updated successfully.");
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSaveLinks = async () => {
    if (
      !validateUrl(githubUrl) ||
      !validateUrl(linkedinUrl) ||
      !validateUrl(resumeUrl)
    ) {
      setLinksError("Please enter valid URLs.");
      return;
    }

    setLinksError("");
    setLinksLoading(true);

    try {
      await updateProfessionalLinks({
        githubUrl,
        linkedinUrl,
        resumeUrl,
      });

      updateLinksStore(
        githubUrl,
        linkedinUrl,
        resumeUrl
      );

      setLinksSuccess(true);
      setTimeout(() => {
        setLinksSuccess(false);
      }, 2000);
    } catch {
      setLinksError("Failed to save links.");
    } finally {
      setLinksLoading(false);
    }
  };

  // Reset Onboarding pathway
  const handleResetOnboarding = () => {
    resetOnboarding();
    toast.success("Onboarding reset successfully.");
  };

  const [gitUsername, setGitUsername] = useState(githubAnalytics.username || '');
  const [gitLoading, setGitLoading] = useState(false);

  // Data Management states
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/settings/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-pilot-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);

      const response = await fetch('/api/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Import failed');
      
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsImporting(false);
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  // Toggle Git Connection
  const handleToggleGithub = async () => {
    if (githubAnalytics.connected) {
      try {
        disconnectGithub();
        toast.success("GitHub disconnected.");
        setGitUsername("");
      } catch {
        toast.error("Failed to disconnect GitHub.");
      }
      return;
    }

    if (!gitUsername.trim()) return;

    setGitLoading(true);

    try {
      await connectGithub(gitUsername.trim());
      toast.success("GitHub connected successfully.");
    } catch {
      toast.error("Failed to connect GitHub.");
    } finally {
      setGitLoading(false);
    }
  };

  /** Theme option card definition */
  const themeOptions: { value: Theme; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: 'dark',
      label: 'Dark',
      description: 'Deep indigo canvas — easy on the eyes at night.',
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Crisp white surface — great for bright environments.',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div>
        <h2
          className="text-2xl font-bold flex items-center space-x-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>System Settings</span>
        </h2>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Configure profile options, connected repositories, notifications, and onboarding preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Form Settings (Appearance, Profile & Notification configs) */}
        <div className="lg:col-span-2 space-y-8">

          {/* ─── PROFILE SETTINGS FORM ───────────────────────────────────── */}
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle className="text-base font-bold">Profile Details</CardTitle>
              <CardDescription className="text-xs">Edit your public metadata and target career goals.</CardDescription>
            </CardHeader>
            <CardContent>

              {/* DYNAMIC AVATAR UPLOAD COMPONENT */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center gap-6 mb-6 text-xs sm:text-sm">
                <div className="relative w-20 h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0 group">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Profile Avatar Preview"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover transition duration-200 group-hover:opacity-75"
                      unoptimized={previewUrl.startsWith('data:') || previewUrl.startsWith('blob:')}
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 text-slate-500" />
                  )}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="space-y-2 w-full flex-1">
                  <h4 className="font-bold text-slate-200">Profile Image</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Update your public avatar image. JPG, PNG, or WEBP up to 5MB.</p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleAvatarSelection}
                    disabled={isUploading}
                  />

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-8 text-[11px] border-white/10 text-slate-300 hover:text-white"
                    >
                      Choose Image
                    </Button>

                    {avatarFile && (
                      <Button
                        type="button"
                        variant="premium"
                        size="sm"
                        onClick={handleSaveAvatar}
                        disabled={isUploading}
                        className="h-8 text-[11px] font-semibold flex items-center"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Save Image Changes"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                <Input
                  id="settings-name"
                  label="Display Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" aria-hidden="true" />}
                  required
                />

                <Input
                  id="settings-email"
                  label="Email Address"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" aria-hidden="true" />}
                  required
                />

                <Input
                  id="settings-goal"
                  label="Target Career Goal"
                  value={profileGoal}
                  onChange={(e) => setProfileGoal(e.target.value)}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" aria-hidden="true" />}
                />

                {/* ─── PUBLIC PORTFOLIO VISIBILITY SECTION ───────────────────────── */}
                <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4.5 h-4.5 text-indigo-400" />
                      <span className="font-bold text-xs sm:text-sm text-slate-200">Public Portfolio</span>
                      <Badge variant="glow" className="text-[9px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                        NEW
                      </Badge>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPortfolioPublic}
                      onClick={handleTogglePortfolioPublic}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isPortfolioPublic ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isPortfolioPublic ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Make your profile public and share your journey with the world.</p>

                  {isPortfolioPublic ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Your Public Portfolio Link</span>
                        {copiedLink && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Copied!
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="flex-1 flex items-center bg-[#0a071a]/80 rounded-xl border border-white/10 px-3 py-2 text-xs font-mono text-indigo-300 overflow-hidden">
                          <Globe className="w-3.5 h-3.5 text-indigo-400 mr-2 shrink-0" />
                          <span className="truncate">{portfolioUrl}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyPortfolioUrl}
                            className="h-9 text-[11px] border-white/10 text-slate-300 hover:text-white"
                          >
                            {copiedLink ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                            {copiedLink ? 'Copied' : 'Copy Link'}
                          </Button>

                          <a
                            href={`/u/${customHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              type="button"
                              variant="glow"
                              size="sm"
                              className="h-9 text-[11px] px-3"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              View Portfolio
                            </Button>
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                          <AlertCircle className="w-3 h-3 text-slate-500" />
                          Anyone with this link can view your public portfolio.
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Handle:</span>
                          <input
                            type="text"
                            value={customHandle}
                            onChange={(e) => setCustomHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                            onBlur={handleSaveHandle}
                            className="bg-black/40 border border-white/10 rounded-lg px-2 py-0.5 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500 w-28"
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Public portfolio disabled. Enable toggle to share your link.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="submit"
                    variant="premium"
                    className="h-11 px-6 ml-auto text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* ─── SKILLS PORTFOLIO & AI EXTRACTION ───────────────────────── */}
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>Skills Portfolio</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  AI Automated
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Manage your technical skills or paste your resume text to extract skills automatically using AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-1">
              
              {/* Removable Skills Badges */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Active Technical Skills
                </label>
                <div className="flex flex-wrap gap-1.5 border border-white/5 bg-white/2 rounded-xl p-3 min-h-12">
                  {localSkills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No skills added yet. Add custom skills or paste resume below.</span>
                  ) : (
                    localSkills.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="glow"
                        className="pr-1.5 flex items-center space-x-1.5"
                      >
                        <span>{skill}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveSkill(skill)} 
                          className="hover:text-rose-400 shrink-0 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Manual entry row */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter custom skill manually..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 bg-[#0a071a]/50 text-slate-100 placeholder-slate-500 text-xs rounded-xl border border-white/10 px-4 py-2.5 focus:outline-none focus:border-indigo-500/80"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddSkill}
                  className="h-10 px-3 rounded-xl flex items-center justify-center border-white/10 text-slate-300 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {/* AI Resume Skill Extractor Container */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Quick Extract from Resume</span>
                  </span>
                  <span className="text-[10px] text-slate-400">AI ATS Parser</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Paste the text of your resume below. Pilot AI will automatically extract technical skills (languages, frameworks, tools) and merge them into your portfolio.
                </p>

                <textarea
                  rows={4}
                  placeholder="Paste resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full bg-[#070517] text-xs text-white placeholder-slate-500 p-3 rounded-xl border border-indigo-500/20 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition resize-none"
                />

                <div className="flex items-center justify-between">
                  <div>
                    {extractError && <p className="text-xs text-rose-400 font-medium">{extractError}</p>}
                    {extractSuccess && <p className="text-xs text-emerald-400 font-medium">{extractSuccess}</p>}
                  </div>
                  <Button
                    type="button"
                    onClick={handleExtractSkillsInSettings}
                    disabled={isExtracting}
                    variant="premium"
                    size="sm"
                    className="h-9 px-4 text-xs font-semibold"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Extracting...
                      </>
                    ) : (
                      'Extract & Merge Skills'
                    )}
                  </Button>
                </div>
              </div>

              {/* Save Trigger */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                {skillsSaveSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1.5 animate-bounce" />
                    Skills portfolio saved successfully!
                  </span>
                )}
                <Button
                  type="button"
                  onClick={handleSaveSkills}
                  disabled={skillsSaveLoading}
                  variant="premium"
                  className="h-11 px-6 ml-auto text-xs font-semibold"
                >
                  {skillsSaveLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Skills Changes'
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* ─── PROFESSIONAL LINKS ──────────────────────────────────────── */}
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle>Professional Links</CardTitle>
              <CardDescription>Manage your GitHub, LinkedIn, and Resume URLs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="GitHub URL"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <Input
                label="LinkedIn URL"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
              <Input
                label="Resume URL"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}