import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getUserProjects } from '@/app/actions/projectActions';
import { prisma } from '@/lib/prisma';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => Promise.resolve({ userId: 'mock-clerk-user-id' })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/app/actions/notificationActions', () => ({
  createUserNotification: vi.fn(),
}));

describe('getUserProjects search, filtering, and pagination', () => {
  const mockProjects = [
    {
      id: 'project-1',
      title: 'Analytics Dashboard',
      status: 'In Progress',
      tags: ['nextjs', 'analytics'],
      deletedAt: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'db-user-id',
      clerkId: 'mock-clerk-user-id',
      projects: mockProjects,
    } as any);
  });

  it('supports title search, tag filtering, status filtering, skip, and take', async () => {
    const result = await getUserProjects({
      search: 'analytics',
      tags: ['nextjs'],
      status: 'In Progress',
      skip: 10,
      take: 5,
    });

    expect(result).toEqual(mockProjects);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: 'mock-clerk-user-id' },
      include: {
        projects: {
          where: {
            deletedAt: null,
            title: {
              contains: 'analytics',
              mode: 'insensitive',
            },
            tags: {
              hasSome: ['nextjs'],
            },
            status: 'In Progress',
          },
          take: 5,
          skip: 10,
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
            },
            milestones: {
              orderBy: {
                dueDate: 'asc',
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
  });

  it('supports comma-separated tag filters', async () => {
    await getUserProjects({
      tags: 'nextjs, analytics',
    });

    const call = vi.mocked(prisma.user.findUnique).mock.calls[0][0] as any;

    expect(call.include.projects.where.tags).toEqual({
      hasSome: ['nextjs', 'analytics'],
    });
  });

  it('provides default pagination values', async () => {
    await getUserProjects({ search: 'dashboard' });

    const call = vi.mocked(prisma.user.findUnique).mock.calls[0][0] as any;

    expect(call.include.projects.take).toBe(20);
    expect(call.include.projects.skip).toBe(0);
  });

  it('keeps the legacy take/skip signature working', async () => {
    await getUserProjects(8, 16);

    const call = vi.mocked(prisma.user.findUnique).mock.calls[0][0] as any;

    expect(call.include.projects.take).toBe(8);
    expect(call.include.projects.skip).toBe(16);
    expect(call.include.projects.where).toEqual({
      deletedAt: null,
    });
  });

  it('keeps the query scoped to the authenticated Clerk user', async () => {
    await getUserProjects({
      take: 10,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: 'mock-clerk-user-id' },
      })
    );
  });

  it('normalizes unsafe pagination values', async () => {
    await getUserProjects({
      take: 500,
      skip: -20,
    });

    const call = vi.mocked(prisma.user.findUnique).mock.calls[0][0] as any;

    expect(call.include.projects.take).toBe(100);
    expect(call.include.projects.skip).toBe(0);
  });
});
