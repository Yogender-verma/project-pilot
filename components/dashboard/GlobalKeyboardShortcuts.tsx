'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { X, Command, Navigation2, Settings, FolderGit2 } from 'lucide-react';
import FocusTrap from 'focus-trap-react';

interface GlobalKeyboardShortcutsProps {
  onOpenCommandPalette: () => void;
}

export function GlobalKeyboardShortcuts({
  onOpenCommandPalette,
}: GlobalKeyboardShortcutsProps) {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);

  // Ctrl/Cmd + K -> Open Command Palette
  useHotkeys(
    ['meta+k', 'ctrl+k'],
    (e) => {
      e.preventDefault();
      onOpenCommandPalette();
    },
    { enableOnFormTags: false }
  );

  // G then P -> Go to Projects
  useHotkeys(
    'g p',
    () => {
      router.push('/dashboard/projects');
      setHelpOpen(false);
    },
    { enableOnFormTags: false }
  );

  // G then S -> Go to Settings
  useHotkeys(
    'g s',
    () => {
      router.push('/dashboard/settings');
      setHelpOpen(false);
    },
    { enableOnFormTags: false }
  );

  // ? -> Show Help Modal (shift+/)
  useHotkeys(
    'shift+/',
    (e) => {
      e.preventDefault();
      setHelpOpen(true);
    },
    { enableOnFormTags: false }
  );

  if (!helpOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#02010a]/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <FocusTrap focusTrapOptions={{ initialFocus: false, clickOutsideDeactivates: true, escapeDeactivates: true }}>
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#090620] shadow-2xl shadow-indigo-950/50">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 id="keyboard-shortcuts-title" className="text-lg font-bold text-white flex items-center gap-2">
              <Command className="w-5 h-5 text-indigo-400" />
              Keyboard Shortcuts
            </h2>
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Close shortcuts help"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">Global Actions</h3>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Command className="w-4 h-4 text-slate-400" />
                  <span>Command Palette</span>
                </div>
                <kbd className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-mono text-slate-300">
                  Ctrl K
                </kbd>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-4 h-4 flex items-center justify-center text-slate-400 text-sm font-bold">?</span>
                  <span>Show Keyboard Shortcuts</span>
                </div>
                <kbd className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-mono text-slate-300">
                  ?
                </kbd>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">Navigation</h3>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <FolderGit2 className="w-4 h-4 text-slate-400" />
                  <span>Go to Projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-mono text-slate-300">G</kbd>
                  <span className="text-slate-500 text-xs">then</span>
                  <kbd className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-mono text-slate-300">P</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Go to Settings</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-mono text-slate-300">G</kbd>
                  <span className="text-slate-500 text-xs">then</span>
                  <kbd className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-mono text-slate-300">S</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
