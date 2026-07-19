'use client';

import React from 'react';
import { CheckCircle, ChevronDown, Download, FileText, XCircle } from 'lucide-react';
import { getOwnedProjectForExport } from '@/app/actions/projectActions';
import { Button } from '@/components/ui/Button';
import type { Project, Roadmap } from '@/types';
import {
  buildExportableProject,
  downloadTextFile,
  sanitizeFileName,
  serializeProjectJson,
  serializeProjectMarkdown,
} from '@/lib/projectExport';

type ExportFormat = 'markdown' | 'json';

type ProjectExportMenuProps = {
  project: Project;
  roadmap?: Roadmap;
};

type Feedback = { type: 'success' | 'error'; message: string } | null;

export function ProjectExportMenu({ project, roadmap }: ProjectExportMenuProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const feedbackTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState<ExportFormat | null>(null);
  const [feedback, setFeedback] = React.useState<Feedback>(null);

  React.useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const showFeedback = (nextFeedback: NonNullable<Feedback>) => {
    setFeedback(nextFeedback);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 4000);
  };

  const handleExport = async (format: ExportFormat) => {
    if (!project?.id) {
      showFeedback({ type: 'error', message: 'This project is unavailable and cannot be exported.' });
      return;
    }

    setExporting(format);
    setOpen(false);

    try {
      const result = await getOwnedProjectForExport(project.id);
      if (!result.success || !result.project) {
        throw new Error(result.error || 'You can only export projects saved to your account.');
      }

      const exportableProject = buildExportableProject(project, roadmap, result.project);
      const safeName = sanitizeFileName(exportableProject.title);

      if (format === 'markdown') {
        downloadTextFile(
          serializeProjectMarkdown(exportableProject),
          `${safeName}-summary.md`,
          'text/markdown',
        );
      } else {
        downloadTextFile(
          serializeProjectJson(exportableProject),
          `${safeName}-summary.json`,
          'application/json',
        );
      }

      showFeedback({
        type: 'success',
        message: `${format === 'markdown' ? 'Markdown' : 'JSON'} summary downloaded successfully.`,
      });
    } catch (error) {
      showFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Project export failed. Please try again.',
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full md:w-auto">
      <Button
        variant="glass"
        className="h-11 w-full text-xs md:w-auto"
        leftIcon={<Download className="h-4 w-4" />}
        rightIcon={<ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        isLoading={Boolean(exporting)}
      >
        {exporting ? 'Preparing export' : 'Export summary'}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-full min-w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0b0820] p-1.5 shadow-2xl md:w-64"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport('markdown')}
            className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-white/5"
          >
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
            <span>
              <span className="block text-xs font-semibold text-white">Markdown (.md)</span>
              <span className="mt-0.5 block text-[11px] text-slate-400">Best for README files and documentation.</span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport('json')}
            className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-white/5"
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center font-mono text-xs font-bold text-indigo-400">{'{}'}</span>
            <span>
              <span className="block text-xs font-semibold text-white">JSON (.json)</span>
              <span className="mt-0.5 block text-[11px] text-slate-400">Structured backup for tools and integrations.</span>
            </span>
          </button>
        </div>
      )}

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute right-0 top-full z-20 mt-2 flex w-full min-w-64 items-start gap-2 rounded-xl border px-3 py-2.5 text-xs shadow-xl md:w-80 ${
            feedback.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-950/95 text-emerald-200'
              : 'border-rose-500/20 bg-rose-950/95 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
