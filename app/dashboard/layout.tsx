'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  Compass, 
  Sun, 
  Moon, 
  ChevronDown,
  Sparkles,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useUser } from '@clerk/nextjs';
import { getCurrentUserProfile } from '@/app/actions/user';
import { useTheme } from '@/lib/ThemeProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, careerScore, projects, selectProject, syncUserProfile } = useAppStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Real theme state from the global ThemeProvider (persisted in localStorage)
  const { theme, toggleTheme } = useTheme();

  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  // Auto-sync persistent profile from PostgreSQL on mount / refresh.
  // Clerk identity (name, email, avatar) is always used as the source of truth
  // for basic identity fields so the user never sees 'Dev User' or placeholder data.
  React.useEffect(() => {
    if (!clerkLoaded) return;

    const hydrateUser = async () => {
      try {
        const dbProfile = await getCurrentUserProfile();

        // Build Clerk identity fields â€” always real, always available once loaded
        const clerkIdentity = clerkUser ? {
          fullName:
            clerkUser.fullName ||
            [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
            clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] ||
            '',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          imageUrl: clerkUser.imageUrl || null,
        } : null;

        if (dbProfile) {
          // Merge: prefer DB fields for skills/dreamRole, prefer Clerk for identity
          syncUserProfile({
            ...dbProfile,
            fullName: clerkIdentity?.fullName || dbProfile.fullName,
            email: clerkIdentity?.email || dbProfile.email,
            imageUrl: clerkIdentity?.imageUrl || dbProfile.imageUrl,
          });
        } else if (clerkIdentity) {
          // DB returned null (not yet synced) â€” use Clerk identity only
          syncUserProfile({
            fullName: clerkIdentity.fullName,
            email: clerkIdentity.email,
            imageUrl: clerkIdentity.imageUrl,
            skills: [],
            dreamRole: '',
          });
        }
      } catch (err) {
        console.error('Failed to sync user profile in dashboard layout:', err);
        // Even on error, show the Clerk user's real identity
        if (clerkUser) {
          syncUserProfile({
            fullName:
              clerkUser.fullName ||
              [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
              clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] ||
              '',
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            imageUrl: clerkUser.imageUrl || null,
            skills: [],
            dreamRole: '',
          });
        }
      }
    };
    hydrateUser();
  }, [clerkLoaded, clerkUser, syncUserProfile]);

  // Derive page name from route path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/dashboard/projects')) return 'Recommended Projects';
    if (pathname.startsWith('/dashboard/roadmaps')) return 'Day-by-Day Roadmaps';
    if (pathname.startsWith('/dashboard/mentor')) return 'AI Mentor Workspace';
    if (pathname.startsWith('/dashboard/github')) return 'GitHub Deep Analytics';
    if (pathname.startsWith('/dashboard/career')) return 'Career Readiness Score';
    if (pathname.startsWith('/dashboard/settings')) return 'System Settings';
    return 'Dashboard';
  };

  const notifications = [
    { id: 1, title: 'GitHub crawler finished scan', time: '10 min ago', unread: true },
    { id: 2, title: 'Mentor generated new connector code', time: '1 hr ago', unread: true },
    { id: 3, title: 'Resume scored at 72% overall readiness', time: '2 hr ago', unread: false }
  ];

  return (
    /*
     * bg-[var(--background)] and text-[var(--foreground)] pick up the CSS
     * custom property values from globals.css, which flip when data-theme
     * changes on <html>.  All hard-coded hex colours have been replaced.
     */
    <div
      className="flex min-h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Dynamic Background glowing canvas */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar (Left Panel) */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Workspace Frame (Right Panel) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative">
        {/* Mobile Header (Topbar for small viewports) */}
        <header
          className="md:hidden flex items-center justify-between h-16 px-4 border-b sticky top-0 z-40"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>PilotAI</span>
          </Link>

          <div className="flex items-center space-x-2">
            {/* Mobile theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
              }}
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-indigo-400" />
              }
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg transition-colors cursor-pointer relative"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Global Desktop Workspace Topbar */}
        <header
          className="hidden md:flex items-center justify-between h-20 px-8 border-b sticky top-0 backdrop-blur-md z-30"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--background) 60%, transparent)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {getPageTitle()}
            </h1>
            <Badge variant="glow" className="text-[10px] font-bold uppercase tracking-wider">
              Ready Score: {careerScore.overallScore}%
            </Badge>
          </div>

          {/* Top Actions: Search, Theme, Notify, Profile */}
          <div className="flex items-center space-x-6">
            {/* Search Input */}
{/* Functional global command search */}
<button
  type="button"
  onClick={() => setCommandPaletteOpen(true)}
  className="hidden sm:flex items-center gap-3 h-10 min-w-52 lg:min-w-64 px-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:border-indigo-400/30 hover:bg-indigo-500/5 transition-colors"
  aria-label="Open global search"
>
  <Search className="w-4 h-4" />
  <span className="text-xs flex-1 text-left">Search pages and projects...</span>
  <kbd className="hidden lg:inline-flex rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">
    Ctrl K
  </kbd>
</button>
            <div className="relative w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search cockpit services..."
                className="w-full text-xs rounded-xl px-4 py-2.5 pl-10 focus:outline-none"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-secondary)',
                }}
              />
            </div>

            {/* AI Career readiness Quick Summary Widget */}
            <Link
              href="/dashboard/career"
              className="flex items-center space-x-2 p-1.5 px-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/15 transition-all"
            >
              <Award className="w-4 h-4 animate-bounce" />
              <span>Career Score: {careerScore.overallScore}%</span>
            </Link>

            {/*
             * Theme Switcher Toggle
             * Wired to useTheme().toggleTheme() — every click persists to
             * localStorage and flips the data-theme attribute on <html>.
             */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="p-2 rounded-xl border transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-indigo-400" />
              }
            </button>

            {/* Notifications panel trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl border transition-colors cursor-pointer relative"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 rounded-2xl p-4 shadow-2xl z-50 glass-panel"
                    style={{
                      backgroundColor: 'var(--panel-bg)',
                      borderColor: 'var(--panel-border)',
                    }}
                  >
                    <div
                      className="flex items-center justify-between pb-3 mb-3"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <h4
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Notifications
                      </h4>
                      <button
                        className="text-[10px] text-indigo-400 font-semibold hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl border border-transparent hover:border-indigo-500/10 transition-all text-xs"
                          style={{ backgroundColor: 'var(--hover-bg)' }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-semibold ${n.unread ? 'text-indigo-400' : ''}`}
                              style={!n.unread ? { color: 'var(--text-secondary)' } : {}}
                            >
                              {n.title}
                            </span>
                            {n.unread && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                          </div>
                          <span
                            className="text-[10px] mt-1 block"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {n.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile Dropdown Menu Drawer Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden w-full border-b p-4 z-40 relative flex flex-col space-y-2 glass-panel"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {[
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Projects', href: '/dashboard/projects' },
                { name: 'Roadmaps', href: '/dashboard/roadmaps' },
                { name: 'AI Mentor', href: '/dashboard/mentor' },
                { name: 'GitHub Analytics', href: '/dashboard/github' },
                { name: 'Career Score', href: '/dashboard/career' },
                { name: 'Settings', href: '/dashboard/settings' }
              ].map((m) => (
                <Link
                  key={m.name}
                  href={m.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-xs font-semibold ${pathname === m.href
                      ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400'
                      : ''
                    }`}
                  style={pathname !== m.href ? { color: 'var(--text-secondary)' } : {}}
                >
                  {m.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Pages Slot (Children content) */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto relative z-10">
          <CommandPalette
  open={commandPaletteOpen}
  onOpenChange={setCommandPaletteOpen}
  projects={projects}
  onProjectSelect={selectProject}
/>
{children}
        </div>
      </div>
    </div>
  );
}

