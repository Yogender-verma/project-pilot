'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, careerScore, syncUserProfile } = useAppStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkTheme, setDarkTheme] = useState(true);

  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  // Auto-sync persistent profile from PostgreSQL on mount / refresh.
  // Clerk identity (name, email, avatar) is always used as the source of truth
  // for basic identity fields so the user never sees 'Dev User' or placeholder data.
  React.useEffect(() => {
    if (!clerkLoaded) return;

    const hydrateUser = async () => {
      try {
        const dbProfile = await getCurrentUserProfile();

        // Build Clerk identity fields — always real, always available once loaded
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
          // DB returned null (not yet synced) — use Clerk identity only
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
    <div className="flex min-h-screen bg-[#030014] text-slate-100 overflow-hidden">
      {/* Dynamic Background glowing canvas */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar (Left Panel) */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Workspace Frame (Right Panel) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative">
        {/* Mobile Header (Topbar for small viewports) */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-[#060417] border-b border-white/5 sticky top-0 z-40">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">PilotAI</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white cursor-pointer relative"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Global Desktop Workspace Topbar */}
        <header className="hidden md:flex items-center justify-between h-20 px-8 border-b border-white/5 sticky top-0 bg-[#030014]/60 backdrop-blur-md z-30">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-white">{getPageTitle()}</h1>
            <Badge variant="glow" className="text-[10px] font-bold uppercase tracking-wider">
              Ready Score: {careerScore.overallScore}%
            </Badge>
          </div>

          {/* Top Actions: Search, Theme, Notify, Profile */}
          <div className="flex items-center space-x-6">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cockpit services..."
                className="w-full bg-[#0a071a]/50 text-xs rounded-xl border border-white/5 px-4 py-2.5 pl-10 focus:outline-none focus:border-indigo-500/55 text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* AI Career readiness Quick Summary Widget */}
            <Link href="/dashboard/career" className="flex items-center space-x-2 p-1.5 px-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/15 transition-all">
              <Award className="w-4 h-4 animate-bounce" />
              <span>Career Score: {careerScore.overallScore}%</span>
            </Link>

            {/* Theme Switcher Toggle */}
            <button
              onClick={() => setDarkTheme(!darkTheme)}
              className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {darkTheme ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Notifications panel trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer relative"
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
                    className="absolute right-0 mt-3 w-80 bg-[#060417] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 glass-panel"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                      <button className="text-[10px] text-indigo-400 font-semibold hover:underline cursor-pointer">Clear All</button>
                    </div>
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl hover:bg-white/2 border border-transparent hover:border-white/5 transition-all text-xs">
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold ${n.unread ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {n.title}
                            </span>
                            {n.unread && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
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
              className="md:hidden w-full bg-[#060417] border-b border-white/5 p-4 z-40 relative flex flex-col space-y-2 glass-panel"
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
                  className={`px-4 py-3 rounded-xl text-xs font-semibold ${
                    pathname === m.href ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-300' : 'text-slate-300'
                  }`}
                >
                  {m.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Pages Slot (Children content) */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
