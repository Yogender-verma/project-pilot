'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Compass,
  LayoutDashboard,
  FolderGit2,
  Map,
  MessageSquareCode,
  GitMerge,
  Award,
  Settings,
  X,
  LogOut,
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/lib/ThemeProvider';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const drawerVariants: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 28,
      stiffness: 300,
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 26,
    },
  },
};

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { user: storeUser, logout } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayUser = {
    name:
      storeUser?.fullName ||
      storeUser?.name ||
      clerkUser?.fullName ||
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') ||
      clerkUser?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
      'User Profile',
    email:
      storeUser?.email ||
      clerkUser?.primaryEmailAddress?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      '',
    avatarUrl:
      storeUser?.imageUrl ||
      storeUser?.avatarUrl ||
      clerkUser?.imageUrl ||
      ''
  };

  const handleSignOut = async () => {
    logout();
    onClose();
    try { await signOut(); } catch (e) {}
    router.push('/');
  };

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll safely when drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Projects', icon: FolderGit2, href: '/dashboard/projects' },
    { name: 'Roadmaps', icon: Map, href: '/dashboard/roadmaps' },
    { name: 'AI Mentor', icon: MessageSquareCode, href: '/dashboard/mentor' },
    { name: 'GitHub Analytics', icon: GitMerge, href: '/dashboard/github' },
    { name: 'Career Score', icon: Award, href: '/dashboard/career' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' }
  ];

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Locked Solid 100% Height Drawer Panel */}
          <motion.aside
            ref={drawerRef}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 left-0 w-[290px] sm:w-[330px] max-w-[85vw] h-full min-h-screen flex flex-col justify-between z-[10000] border-r shadow-2xl overflow-hidden select-none"
            style={{
              backgroundColor: 'var(--surface-primary)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {/* Top Brand Header */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between h-16 sm:h-20 px-5 sm:px-6 border-b shrink-0"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <Link href="/dashboard" onClick={onClose} className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/15 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-sm">
                  <Compass className="w-5.5 h-5.5" />
                </div>
                <span
                  className="text-lg sm:text-xl font-extrabold tracking-wider select-none"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Pilot<span className="text-indigo-400">AI</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation drawer"
                title="Close navigation drawer"
                className="p-2 rounded-2xl border transition-all cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--hover-bg)',
                }}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </motion.div>

            {/* Middle Navigation Links (Evenly Distributed Across Entire Height) */}
            <nav className="flex-1 px-4 py-4 flex flex-col justify-between overflow-y-auto overscroll-contain" aria-label="Mobile Drawer Navigation">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <motion.div key={item.name} variants={itemVariants} className="w-full">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl text-sm sm:text-base font-bold transition-all duration-200 group relative w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                        isActive
                          ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.12)]'
                          : 'border border-transparent hover:bg-indigo-500/10'
                      )}
                      style={!isActive ? { color: 'var(--text-secondary)' } : {}}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                          isActive ? 'text-indigo-400' : ''
                        )}
                        style={!isActive ? { color: 'var(--text-muted)' } : {}}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom Footer Section (Pinned at Bottom with Border Separator) */}
            <motion.div
              variants={itemVariants}
              className="p-4 border-t space-y-3 shrink-0"
              style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-primary)' }}
            >
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                className="flex items-center justify-between px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold w-full cursor-pointer transition-all hover:bg-indigo-500/5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--hover-bg)',
                }}
              >
                <span className="flex items-center space-x-2.5">
                  {theme === 'dark' ? (
                    <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                  ) : (
                    <Moon className="w-4.5 h-4.5 text-indigo-400" />
                  )}
                  <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                </span>
              </button>

              {/* User Profile Card */}
              <div
                className="flex items-center space-x-3 p-3 rounded-2xl border border-indigo-500/10"
                style={{ backgroundColor: 'var(--hover-bg)' }}
              >
                <div className="w-9.5 h-9.5 rounded-full overflow-hidden border border-indigo-500/30 flex items-center justify-center bg-indigo-500/10 shrink-0">
                  {displayUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4.5 h-4.5 text-indigo-400" />
                  )}
                </div>
                <div className="truncate flex-1">
                  <h4 className="text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {displayUser.name}
                  </h4>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {displayUser.email}
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 w-full cursor-pointer active:scale-95"
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogOut className="w-4.5 h-4.5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
