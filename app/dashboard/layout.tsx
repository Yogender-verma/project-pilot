'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { 
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
          className="md:hidden flex items-center justify-between min-h-[84px] py-4 px-6 border-b sticky top-0 z-40 backdrop-blur-xl"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--surface-primary) 90%, transparent)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-indigo-500/15 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <span
              className="text-lg font-extrabold tracking-wider select-none"
              style={{ color: 'var(--text-primary)' }}
            >
              Pilot<span className="text-indigo-400">AI</span>
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            {/* Mobile theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="p-3 rounded-2xl border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--hover-bg)',
              }}
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-amber-400" />
                : <Moon className="w-5 h-5 text-indigo-400" />
              }
            </button>

            {/* Mobile Notifications button */}
            <NotificationCenter mobile={true} />

            {/* Mobile Menu (Hamburger) button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open navigation drawer"
              className="p-3 rounded-2xl border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--hover-bg)',
              }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Global Desktop Workspace Topbar */}
        <header
          className="hidden md:flex items-center justify-between min-h-[88px] py-4 px-8 border-b sticky top-0 backdrop-blur-xl z-30 shadow-sm"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--surface-primary) 90%, transparent)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {getPageTitle()}
            </h1>
            <Badge variant="glow" className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-500/30">
              Ready Score: {careerScore.overallScore}%
            </Badge>
          </div>

          {/* Top Actions: Search, Theme, Notify, Profile */}
          <div className="flex items-center space-x-4">
            {/* Functional global command search */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Open global search (Ctrl K)"
              title="Open global search (Ctrl K)"
              className="hidden sm:flex items-center gap-3.5 h-11 min-w-60 lg:min-w-72 px-4 rounded-2xl border transition-all cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--hover-bg)',
                color: 'var(--text-secondary)',
              }}
            >
              <Search className="w-4.5 h-4.5 text-indigo-400 shrink-0" aria-hidden="true" />
              <span className="text-xs font-medium flex-1 text-left">Search pages and projects...</span>
              <kbd className="hidden lg:inline-flex rounded-lg border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] font-mono text-slate-400">
                Ctrl K
              </kbd>
            </button>

            {/* AI Career readiness Quick Summary Widget */}
            <Link
              href="/dashboard/career"
              aria-label={`Career Score: ${careerScore.overallScore}% match rate`}
              title="View Career Readiness Score breakdown"
              className="flex items-center space-x-2.5 px-4 py-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/25 text-xs font-bold text-indigo-400 hover:bg-indigo-500/15 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Award className="w-4 h-4 animate-bounce" aria-hidden="true" />
              <span>Career Score: {careerScore.overallScore}%</span>
            </Link>

            {/* Theme Switcher Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="p-3 rounded-2xl border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--hover-bg)',
              }}
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" />
                : <Moon className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              }
            </button>

            {/* Notifications panel trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
                title="View notifications"
                aria-expanded={showNotifications}
                aria-haspopup="true"
                className="p-3 rounded-2xl border transition-all cursor-pointer relative hover:scale-105 active:scale-95 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--hover-bg)',
                }}
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-indigo-400/30" aria-hidden="true" />
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

        {/* Mobile Sidebar Navigation Drawer */}
        <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

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

