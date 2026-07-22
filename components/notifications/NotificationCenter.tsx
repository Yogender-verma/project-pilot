'use client';

import React from 'react';
import Link from 'next/link';
import FocusTrap from 'focus-trap-react';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Flag,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import type { AppNotification, NotificationType } from '@/types';
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/app/actions/notificationActions';

const iconByType: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  deadline_approaching: Clock3,
  deadline_missed: AlertTriangle,
  project_stalled: Flag,
  milestone_completed: Check,
  project_completed: CheckCircle2,
  career_milestone_due: Clock3,
};

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(value).toLocaleDateString();
}

export function NotificationCenter({ mobile = false }: { mobile?: boolean }) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getNotifications();
    if (result.success) setNotifications(result.notifications);
    else setError(result.error);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const openPanel = async () => {
    const next = !open;
    setOpen(next);
    if (next) await load();
  };

  const markRead = async (id: string) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item));
    await markNotificationRead(id);
  };

  const markAll = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    await markAllNotificationsRead();
  };

  const remove = async (id: string) => {
    setNotifications((items) => items.filter((item) => item.id !== id));
    await deleteNotification(id);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={openPanel}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-controls="notification-dialog"
        className={mobile ? 'p-1.5 rounded-lg relative' : 'p-2 rounded-xl border relative'}
        style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}
      >
        <Bell className={mobile ? 'w-4.5 h-4.5' : 'w-4 h-4'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true, escapeDeactivates: false }}>
          <div
            id="notification-dialog"
            role="dialog"
            aria-label="Notifications"
            className={`fixed left-3 right-3 top-16 z-[80] max-h-[75vh] overflow-hidden rounded-2xl border shadow-2xl md:absolute md:left-auto md:right-0 md:top-auto md:mt-3 md:w-[390px] ${mobile ? '' : ''}`}
            style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
          >
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button type="button" onClick={markAll} className="text-[11px] font-semibold text-indigo-400 hover:underline">
                  Mark all read
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="p-1 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
                <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications…
              </div>
            ) : error ? (
              <div className="px-4 py-10 text-center">
                <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-amber-400" />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Unable to load notifications</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{error}</p>
                <button type="button" onClick={load} className="mt-4 rounded-lg bg-indigo-500/15 px-3 py-2 text-xs font-semibold text-indigo-300">Try again</button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell className="mx-auto mb-3 h-7 w-7 opacity-40" />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>You are all caught up</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Deadline, progress, and milestone updates will appear here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((item) => {
                  const Icon = iconByType[item.type] || Bell;
                  const content = (
                    <div className="flex min-w-0 flex-1 gap-3">
                      <span className="mt-0.5 rounded-xl bg-indigo-500/10 p-2 text-indigo-400"><Icon className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start gap-2">
                          <span className="flex-1 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                          {!item.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.message}</span>
                        <span className="mt-1.5 block text-[10px]" style={{ color: 'var(--text-muted)' }}>{relativeTime(item.createdAt)}</span>
                      </span>
                    </div>
                  );

                  return (
                    <div key={item.id} className={`group flex items-start gap-1 rounded-xl p-2 transition ${item.isRead ? '' : 'bg-indigo-500/[0.06]'}`}>
                      {item.link ? (
                        <Link href={item.link} onClick={() => { void markRead(item.id); setOpen(false); }} className="min-w-0 flex-1 rounded-lg p-1.5 hover:bg-white/[0.03]">
                          {content}
                        </Link>
                      ) : (
                        <button type="button" onClick={() => void markRead(item.id)} className="min-w-0 flex-1 rounded-lg p-1.5 text-left hover:bg-white/[0.03]">{content}</button>
                      )}
                      <button type="button" onClick={() => void remove(item.id)} aria-label={`Delete ${item.title}`} className="mt-1 rounded-lg p-2 opacity-60 hover:bg-red-500/10 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </FocusTrap>
      )}
    </div>
  );
}
