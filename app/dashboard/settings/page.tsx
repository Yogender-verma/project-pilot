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
  Loader2
} from 'lucide-react';
import { Github, Linkedin } from '@/components/ui/BrandIcons';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/lib/ThemeProvider';
import type { Theme } from '@/lib/ThemeProvider';

// UploadThing Integrations
import {
    updateProfileAvatar,
    updateProfessionalLinks,
    getProfessionalLinks,
} from '@/app/actions/user';

export default function SettingsPage() {
  const { user, onboardingData, updateProfile, updateAvatar, updateProfessionalLinks: updateLinksStore, resetOnboarding, githubAnalytics, connectGithub, disconnectGithub } = useAppStore();

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

        try{

            const data = await getProfessionalLinks();

            if(!data) return;

            setGithubUrl(data.githubUrl || "");
            setLinkedinUrl(data.linkedinUrl || "");
            setResumeUrl(data.resumeUrl || "");

        }catch(err){
            console.error(err);
        }

    }

    loadLinks();

},[]);

  // Notification states
  const [notifyWeeklyPlan, setNotifyWeeklyPlan] = useState(true);
  const [notifyMentorReplied, setNotifyMentorReplied] = useState(true);
  const [notifyRecruiterScans, setNotifyRecruiterScans] = useState(false);

  // Success toast helpers
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // --- AVATAR UPLOAD STATE HOOKS ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>((user as any)?.imageUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);

  const isUploading = false; // Mocking uploading state for compatibility

  const handleSaveAvatar = async () => {
    if (!previewUrl) return;
    
    // Save to global state instantly as base64
    updateAvatar(previewUrl);
    
    try {
      // Attempt to persist to DB (optional fallback)
      await updateProfileAvatar(previewUrl);
    } catch(e) {}
    
    setAvatarSuccess("Avatar updated locally successfully!");
    setAvatarFile(null);
  };

  const handleAvatarSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    setAvatarSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME formats
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      setAvatarError("Format unsupported. Use JPG, JPEG, PNG, or WEBP.");
      return;
    }

    // Enforce 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image file size exceeds the 5MB limit.");
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
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
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
        },2000);

    } catch {

        setLinksError("Failed to save links.");

    } finally {

        setLinksLoading(false);

    }

  };

  // Reset Onboarding pathway
  const handleResetOnboarding = () => {
    resetOnboarding();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  const [gitUsername, setGitUsername] = useState(githubAnalytics.username || '');
  const [gitLoading, setGitLoading] = useState(false);

  // Toggle Git Connection
  const handleToggleGithub = async () => {
    if (githubAnalytics.connected) {
      disconnectGithub();
      setGitUsername('');
    } else {
      if (!gitUsername.trim()) return;
      setGitLoading(true);
      await connectGithub(gitUsername.trim());
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

                  {avatarError && (
                    <p className="text-[11px] text-rose-400 font-medium flex items-center mt-1">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      {avatarError}
                    </p>
                  )}
                  {avatarSuccess && (
                    <p className="text-[11px] text-emerald-400 font-medium flex items-center mt-1">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      {avatarSuccess}
                    </p>
                  )}
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

                <div className="flex items-center justify-between pt-4">
                  {saveSuccess && (
                    <span
                      role="status"
                      aria-live="polite"
                      className="text-xs text-emerald-400 font-semibold flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5 animate-bounce" aria-hidden="true" />
                      Changes saved successfully
                    </span>
                  )}
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

          <Card hoverEffect={false}>
    <CardHeader>
        <CardTitle>
            Professional Links
        </CardTitle>

        <CardDescription>
            Manage your GitHub, LinkedIn and Resume URLs.
        </CardDescription>
    </CardHeader>

    <CardContent className="space-y-4">

        <Input
            label="GitHub URL"
            value={githubUrl}
            onChange={(e)=>setGithubUrl(e.target.value)}
        />

        <Input
            label="LinkedIn URL"
            value={linkedinUrl}
            onChange={(e)=>setLinkedinUrl(e.target.value)}
        />

        <Input
            label="Resume URL"
            value={resumeUrl}
            onChange={(e)=>setResumeUrl(e.target.value)}
        />

        {linksError && (
            <p className="text-xs text-red-500">
                {linksError}
            </p>
        )}

        {linksSuccess && (
            <p className="text-xs text-green-500">
                Links updated successfully.
            </p>
        )}

        <Button
            onClick={handleSaveLinks}
            disabled={linksLoading}
            variant="premium"
            className="mt-2"
        >
            {linksLoading
                ? "Saving..."
                : "Save Professional Links"}
        </Button>

    </CardContent>
</Card>


          {/* ─── NOTIFICATION PREFERENCES ────────────────────────────────── */}
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle className="text-base font-bold">Notification Controls</CardTitle>
              <CardDescription className="text-xs">Manage how and when you receive system alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div
                className="flex items-start justify-between p-3.5 rounded-xl border gap-4"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <label htmlFor="notify-weekly-plan" className="space-y-1 cursor-pointer flex-1">
                  <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>Weekly plan guides alerts</h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Receive automated email alerts summarizing checklist items for the week.
                  </p>
                </label>
                <input
                  id="notify-weekly-plan"
                  type="checkbox"
                  checked={notifyWeeklyPlan}
                  onChange={() => setNotifyWeeklyPlan(!notifyWeeklyPlan)}
                  aria-label="Weekly plan guides alerts"
                  className="w-5 h-5 accent-indigo-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div
                className="flex items-start justify-between p-3.5 rounded-xl border gap-4"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <label htmlFor="notify-mentor-replied" className="space-y-1 cursor-pointer flex-1">
                  <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>AI Mentor replies stream alerts</h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Push notifications alert when AI mentor finishes vector parsing calculations.
                  </p>
                </label>
                <input
                  id="notify-mentor-replied"
                  type="checkbox"
                  checked={notifyMentorReplied}
                  onChange={() => setNotifyMentorReplied(!notifyMentorReplied)}
                  aria-label="AI Mentor replies stream alerts"
                  className="w-5 h-5 accent-indigo-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div
                className="flex items-start justify-between p-3.5 rounded-xl border gap-4"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <label htmlFor="notify-recruiter-scans" className="space-y-1 cursor-pointer flex-1">
                  <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>Recruiter search logs crawl alerts</h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Receive instant notifications when recruiters request access indices.
                  </p>
                </label>
                <input
                  id="notify-recruiter-scans"
                  type="checkbox"
                  checked={notifyRecruiterScans}
                  onChange={() => setNotifyRecruiterScans(!notifyRecruiterScans)}
                  aria-label="Recruiter search logs crawl alerts"
                  className="w-5 h-5 accent-indigo-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Connection accounts & Operations configs */}
        <div className="space-y-8">

          {/* ─── CONNECTED ACCOUNTS ──────────────────────────────────────── */}
          <Card hoverEffect={false}>
            <CardHeader>
              <CardTitle className="text-base font-bold">Connected Integrations</CardTitle>
              <CardDescription className="text-xs">Connect credentials to sync active files.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">

              {/* GitHub integration status */}
              <div
                className="p-4 rounded-xl border flex flex-col gap-4 text-xs sm:text-sm"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>GitHub Crawlers</h4>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {githubAnalytics.connected ? `Synced: @${githubAnalytics.username}` : 'Disconnected'}
                      </p>
                    </div>
                  </div>
                  {githubAnalytics.connected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleGithub}
                      className="h-9 text-xs"
                    >
                      Disconnect
                    </Button>
                  )}
                </div>

                {!githubAnalytics.connected && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter GitHub Username..."
                      value={gitUsername}
                      onChange={(e) => setGitUsername(e.target.value)}
                      disabled={gitLoading}
                      className="flex-1 bg-[#0a071a]/50 text-xs rounded-xl border border-white/10 px-3 py-2 focus:outline-none focus:border-indigo-500/55 text-slate-200"
                    />
                    <Button
                      variant="glow"
                      size="sm"
                      onClick={handleToggleGithub}
                      disabled={gitLoading || !gitUsername.trim()}
                      className="h-9 text-xs px-4"
                    >
                      {gitLoading ? 'Connecting...' : 'Connect'}
                    </Button>
                  </div>
                )}
              </div>

              {/* LinkedIn integration status */}
              <div
                className="p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>LinkedIn Endorsements</h4>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Synced & parsed</p>
                  </div>
                </div>
                <Badge variant="glow">Active</Badge>
              </div>

            </CardContent>
          </Card>

          {/* ─── DANGER ZONES: RESET & DELETE ACCOUNTS ───────────────────── */}
          <Card hoverEffect={false} className="border-rose-500/20">
            <CardHeader>
              <CardTitle className="text-base font-bold text-rose-300">Danger Operations</CardTitle>
              <CardDescription className="text-xs">Destructive changes that erase technical indices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">

              {/* Reset Onboarding pathway */}
              <div className="p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/10 flex flex-col space-y-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div>
                  <h4 className="font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <RefreshCw className="w-4 h-4 mr-1 text-rose-400" />
                    Reset Onboarding Wizard
                  </h4>
                  <p className="text-[10px] leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>
                    Erase your active profile metrics, resume attachments, and GitHub mappings to rerun the cinematic AI blueprint engine from start.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  {resetSuccess && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Erased. Go to navbar CTAs.
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetOnboarding}
                    className="h-9 text-[10px] border-rose-500/30 hover:bg-rose-500/10 hover:text-white"
                  >
                    Reset Onboarding State
                  </Button>
                </div>
              </div>

              {/* Delete Account */}
              <Button
                variant="outline"
                className="w-full h-11 border-rose-500/20 hover:bg-rose-500/10 text-rose-400 hover:text-white text-xs font-semibold"
                leftIcon={<Trash2 className="w-4 h-4 shrink-0" />}
              >
                Delete Account & Cockpit
              </Button>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}