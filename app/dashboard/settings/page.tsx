'use client';

import React, { useState } from 'react';
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
  Monitor
} from 'lucide-react';
import { Github, Linkedin } from '@/components/ui/BrandIcons';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/ThemeProvider';
import type { Theme } from '@/lib/ThemeProvider';

export default function SettingsPage() {
  const { user, onboardingData, login, resetOnboarding, githubAnalytics, connectGithub, disconnectGithub } = useAppStore();

  // Access the global theme state & setTheme so the user can pick directly
  const { theme, setTheme } = useTheme();

  // Local states for inputs
  const [profileName, setProfileName] = useState(user?.name || 'yogender verma');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'yogendarverma0268@gmail.com');
  const [profileGoal, setProfileGoal] = useState(user?.careerGoal || 'AI Engineer');

  // Notification states
  const [notifyWeeklyPlan, setNotifyWeeklyPlan] = useState(true);
  const [notifyMentorReplied, setNotifyMentorReplied] = useState(true);
  const [notifyRecruiterScans, setNotifyRecruiterScans] = useState(false);

  // Success toast helpers
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Save profile information
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    login(profileEmail, profileName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Reset Onboarding pathway
  const handleResetOnboarding = () => {
    resetOnboarding();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  // Toggle Git Connection
  const handleToggleGithub = () => {
    if (githubAnalytics.connected) {
      disconnectGithub();
    } else {
      connectGithub('devpilot-architect');
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
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
                <Input
                  label="Display Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" />}
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" />}
                />

                <Input
                  label="Target Career Goal"
                  value={profileGoal}
                  onChange={(e) => setProfileGoal(e.target.value)}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" />}
                />

                <div className="flex items-center justify-between pt-4">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1.5 animate-bounce" />
                      Changes saved successfully
                    </span>
                  )}
                  <Button
                    type="submit"
                    variant="premium"
                    className="h-11 px-6 ml-auto text-xs font-semibold"
                  >
                    Save Profile Changes
                  </Button>
                </div>
              </form>
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
                <div className="space-y-1">
                  <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>Weekly plan guides alerts</h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Receive automated email alerts summarizing checklist items for the week.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyWeeklyPlan}
                  onChange={() => setNotifyWeeklyPlan(!notifyWeeklyPlan)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div
                className="flex items-start justify-between p-3.5 rounded-xl border gap-4"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="space-y-1">
                  <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>AI Mentor replies stream alerts</h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Push notifications alert when AI mentor finishes vector parsing calculations.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyMentorReplied}
                  onChange={() => setNotifyMentorReplied(!notifyMentorReplied)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div
                className="flex items-start justify-between p-3.5 rounded-xl border gap-4"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)' }}
              >
                <div className="space-y-1">
                  <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>Recruiter search logs crawl alerts</h4>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Receive instant notifications when recruiters request access indices.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyRecruiterScans}
                  onChange={() => setNotifyRecruiterScans(!notifyRecruiterScans)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
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
                className="p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-subtle)' }}
              >
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
                <Button
                  variant={githubAnalytics.connected ? 'outline' : 'glow'}
                  size="sm"
                  onClick={handleToggleGithub}
                  className="h-9 text-xs"
                >
                  {githubAnalytics.connected ? 'Disconnect' : 'Connect'}
                </Button>
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
