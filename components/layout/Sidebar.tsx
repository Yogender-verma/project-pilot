'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  Compass,
  LayoutDashboard,
  FolderGit2,
  Map,
  MessageSquareCode,
  GitMerge,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const { user: storeUser, logout } = useAppStore();

  const displayUser = {
    name: storeUser?.name || clerkUser?.fullName || 'User',
    email: storeUser?.email || clerkUser?.primaryEmailAddress?.emailAddress || '',
    avatarUrl: storeUser?.avatarUrl || clerkUser?.imageUrl || ''
  };

  const handleSignOut = async () => {
    logout();
    try { await signOut(); } catch(e) {}
    router.push('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Projects', icon: FolderGit2, href: '/dashboard/projects' },
    { name: 'Roadmaps', icon: Map, href: '/dashboard/roadmaps' },
    { name: 'AI Mentor', icon: MessageSquareCode, href: '/dashboard/mentor' },
    { name: 'GitHub Analytics', icon: GitMerge, href: '/dashboard/github' },
    { name: 'Career Score', icon: Award, href: '/dashboard/career' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' }
  ];

  return (
    /*
     * All hard-coded hex colours replaced with CSS custom-property style
     * attributes so the sidebar surface flips automatically when the
     * data-theme attribute on <html> changes.
     */
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 border-r transition-all duration-300 z-30',
        collapsed ? 'w-20' : 'w-64'
      )}
      style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Brand Header */}
      <div
        className="flex items-center justify-between min-h-[88px] py-4 px-6 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <Link href="/dashboard" className="flex items-center space-x-3 group overflow-hidden">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          {!collapsed && (
            <span
              className="text-lg font-bold tracking-wider select-none transition-opacity duration-300"
              style={{ color: 'var(--text-primary)' }}
            >
              Pilot<span className="text-indigo-400">AI</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg border transition-colors cursor-pointer"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.05)]'
                  : 'border border-transparent'
              )}
              style={!isActive ? { color: 'var(--text-secondary)' } : {}}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105',
                  isActive ? 'text-indigo-400' : ''
                )}
                style={!isActive ? { color: 'var(--text-muted)' } : {}}
              />
              {!collapsed && (
                <span className="truncate transition-opacity duration-300">
                  {item.name}
                </span>
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div
                  className="absolute left-20 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-xl whitespace-nowrap z-50 border"
                  style={{
                    backgroundColor: 'var(--panel-bg)',
                    borderColor: 'var(--panel-border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Info & Action */}
      <div
        className="p-4 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div
          className={cn('flex items-center space-x-3 p-2 rounded-xl mb-3')}
          style={!collapsed ? { backgroundColor: 'var(--hover-bg)' } : {}}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-500/30 flex items-center justify-center bg-indigo-500/10 shrink-0">
            {displayUser.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-indigo-400" />
            )}
          </div>
          {!collapsed && (
            <div className="truncate flex-1">
              <h4
                className="text-sm font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {displayUser.name}
              </h4>
              <p
                className="text-xs truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                {displayUser.email}
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium hover:text-rose-300 hover:bg-rose-500/5 transition-all duration-200 w-full group cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
