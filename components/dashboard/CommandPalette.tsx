'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  FolderGit2,
  Code2,
  LayoutDashboard,
  Map,
  MessageSquareCode,
  Search,
  Settings,
  X,
} from 'lucide-react';
import FocusTrap from 'focus-trap-react';

type SearchableProject = {
  id: string;
  title: string;
  description?: string;
};

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: SearchableProject[];
  onProjectSelect?: (projectId: string) => void;
}

type CommandItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  group: 'Pages' | 'Projects';
  icon: React.ComponentType<{ className?: string }>;
  projectId?: string;
};

const dashboardPages: CommandItem[] = [
  {
    id: 'page-dashboard',
    label: 'Dashboard',
    description: 'Open the main workspace overview',
    href: '/dashboard',
    group: 'Pages',
    icon: LayoutDashboard,
  },
  {
    id: 'page-projects',
    label: 'Projects',
    description: 'Browse recommended projects',
    href: '/dashboard/projects',
    group: 'Pages',
    icon: FolderGit2,
  },
  {
    id: 'page-roadmaps',
    label: 'Roadmaps',
    description: 'Open day-by-day project roadmaps',
    href: '/dashboard/roadmaps',
    group: 'Pages',
    icon: Map,
  },
  {
    id: 'page-mentor',
    label: 'AI Mentor',
    description: 'Open the AI mentor workspace',
    href: '/dashboard/mentor',
    group: 'Pages',
    icon: MessageSquareCode,
  },
  {
    id: 'page-github',
    label: 'GitHub Analytics',
    description: 'Review GitHub activity and analytics',
    href: '/dashboard/github',
    group: 'Pages',
    icon: Code2,
  },
  {
    id: 'page-career',
    label: 'Career Score',
    description: 'Review career readiness and skill gaps',
    href: '/dashboard/career',
    group: 'Pages',
    icon: Award,
  },
  {
    id: 'page-settings',
    label: 'Settings',
    description: 'Manage profile and system preferences',
    href: '/dashboard/settings',
    group: 'Pages',
    icon: Settings,
  },
];

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) return <>{text}</>;

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pieces = text.split(new RegExp(`(${safeQuery})`, 'ig'));

  return (
    <>
      {pieces.map((piece, index) =>
        piece.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={`${piece}-${index}`}
            className="rounded bg-indigo-500/25 px-0.5 text-indigo-200"
          >
            {piece}
          </mark>
        ) : (
          <React.Fragment key={`${piece}-${index}`}>{piece}</React.Fragment>
        ),
      )}
    </>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
  projects,
  onProjectSelect,
}: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);

  const projectItems = React.useMemo<CommandItem[]>(
    () =>
      projects.map((project) => ({
        id: `project-${project.id}`,
        label: project.title,
        description:
          project.description?.trim() || 'Open this recommended project',
        href: '/dashboard/projects',
        group: 'Projects',
        icon: FolderGit2,
        projectId: project.id,
      })),
    [projects],
  );

  const filteredItems = React.useMemo(() => {
    const allItems = [...dashboardPages, ...projectItems];
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return allItems;

    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.group.toLowerCase().includes(normalizedQuery),
    );
  }, [projectItems, query]);


  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  React.useEffect(() => {
    if (activeIndex >= filteredItems.length) {
      setActiveIndex(Math.max(filteredItems.length - 1, 0));
    }
  }, [activeIndex, filteredItems.length]);

  const navigateToItem = React.useCallback(
    (item: CommandItem) => {
      if (item.projectId) {
        onProjectSelect?.(item.projectId);
      }

      onOpenChange(false);
      router.push(item.href);
    },
    [onOpenChange, onProjectSelect, router],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) =>
        filteredItems.length ? (current + 1) % filteredItems.length : 0,
      );
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        filteredItems.length
          ? (current - 1 + filteredItems.length) % filteredItems.length
          : 0,
      );
    }

    if (event.key === 'Enter' && filteredItems[activeIndex]) {
      event.preventDefault();
      navigateToItem(filteredItems[activeIndex]);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  if (!open) return null;

  const groupedItems = filteredItems.reduce<Record<string, CommandItem[]>>(
    (groups, item) => {
      groups[item.group] ??= [];
      groups[item.group].push(item);
      return groups;
    },
    {},
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[#02010a]/80 px-3 pt-[10vh] backdrop-blur-sm sm:px-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <FocusTrap focusTrapOptions={{ initialFocus: false, clickOutsideDeactivates: true, escapeDeactivates: false }}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="command-palette-title"
          className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#090620] shadow-2xl shadow-indigo-950/50"
        >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 sm:px-5">
          <Search className="h-5 w-5 shrink-0 text-indigo-400" />
          <label htmlFor="global-command-search" className="sr-only">
            Search dashboard pages and projects
          </label>
          <input
            ref={inputRef}
            id="global-command-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages and projects..."
            autoComplete="off"
            className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 sm:h-16 sm:text-base focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-2"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Close global search"
            title="Close global search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div
          className="max-h-[60vh] overflow-y-auto p-2 sm:p-3"
          aria-live="polite"
        >
          <h2 id="command-palette-title" className="sr-only">
            Global search and quick navigation
          </h2>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <div className="mb-4 rounded-2xl bg-white/5 p-4">
                <Search className="h-6 w-6 text-slate-500" />
              </div>
              <p className="font-semibold text-white">No results found</p>
              <p className="mt-1 max-w-sm text-sm text-slate-400">
                Try a page name such as Projects, Roadmaps, Mentor, or part of a
                project title.
              </p>
            </div>
          ) : (
            (['Pages', 'Projects'] as const).map((group) => {
              const items = groupedItems[group];
              if (!items?.length) return null;

              return (
                <section key={group} className="mb-3 last:mb-0">
                  <h3 className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {group}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const absoluteIndex = filteredItems.findIndex(
                        (candidate) => candidate.id === item.id,
                      );
                      const active = absoluteIndex === activeIndex;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(absoluteIndex)}
                          onClick={() => navigateToItem(item)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                            active
                              ? 'bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/25'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <span
                            className={`rounded-xl p-2.5 ${
                              active
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-white">
                              <HighlightedText text={item.label} query={query} />
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-slate-400">
                              {item.description}
                            </span>
                          </span>
                          <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:block">
                            Enter
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 px-4 py-3 text-[11px] text-slate-500 sm:px-5">
          <span>↑↓ Navigate</span>
          <span>Enter Open</span>
          <span>Esc Close</span>
          <span className="ml-auto">Ctrl/⌘ + K</span>
        </div>
        </div>
      </FocusTrap>
    </div>
  );
}

