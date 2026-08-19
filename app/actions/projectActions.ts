'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createUserNotification } from '@/app/actions/notificationActions';

export interface ProjectPayload {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  tags: string[];
  roadmap?: any;
}

export interface ProjectQueryOptions {
  search?: string;
  tags?: string | string[];
  status?: string;
  skip?: number;
  take?: number;
}

/**
 * Helper to get the current authenticated Clerk ID or fallback mock developer ID.
 */
async function getAuthenticatedUserId(): Promise<string> {
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const session = await auth();
    userId = session.userId;
  } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    userId = 'mock-developer-id';
  }

  if (!userId) {
    throw new Error('Unauthenticated user attempt.');
  }
  return userId;
}

/**
 * Normalizes the current and legacy getUserProjects arguments.
 *
 * The legacy `(take, skip)` signature is intentionally retained so existing
 * callers do not need to change when search/filtering is introduced.
 */
function normalizeProjectQuery(
  optionsOrTake?: ProjectQueryOptions | number,
  legacySkip?: number
): Required<Pick<ProjectQueryOptions, 'skip' | 'take'>> &
  Omit<ProjectQueryOptions, 'skip' | 'take'> {
  if (typeof optionsOrTake === 'number') {
    return {
      search: undefined,
      tags: undefined,
      status: undefined,
      skip: Math.max(0, legacySkip ?? 0),
      take: Math.min(100, Math.max(1, optionsOrTake)),
    };
  }

  const options = optionsOrTake ?? {};
  const search = options.search?.trim();
  const status = options.status?.trim();

  const tags = Array.isArray(options.tags)
    ? options.tags.map((tag) => tag.trim()).filter(Boolean)
    : options.tags
      ?.split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

  return {
    search: search || undefined,
    tags: tags?.length ? tags : undefined,
    status: status || undefined,
    skip: Math.max(0, options.skip ?? 0),
    take: Math.min(100, Math.max(1, options.take ?? 20)),
  };
}

/**
 * Fetches projects associated with the current user.
 *
 * Supports title search, tag filtering, status filtering, and pagination.
 * Queries remain scoped to the authenticated user's database record.
 *
 * The legacy `(take, skip)` call signature is still supported.
 */
export async function getUserProjects(
  optionsOrTake?: ProjectQueryOptions | number,
  legacySkip?: number
) {
  try {
    const clerkId = await getAuthenticatedUserId();
    const { search, tags, status, skip, take } = normalizeProjectQuery(
      optionsOrTake,
      legacySkip
    );

    // First, find the user database ID using the Clerk ID.
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        projects: {
          where: {
            deletedAt: null,
            ...(search
              ? {
                  title: {
                    contains: search,
                    mode: 'insensitive',
                  },
                }
              : {}),
            ...(tags
              ? {
                  tags: {
                    hasSome: tags,
                  },
                }
              : {}),
            ...(status ? { status } : {}),
          },
          take,
          skip,
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

    return dbUser?.projects || [];
  } catch (error) {
    console.error('Failed to retrieve user projects from database:', error);
    return [];
  }
}

/**
 * Returns a project only when it belongs to the currently authenticated user.
 * The client uses this ownership-checked payload before generating an export.
 */
export async function getOwnedProjectForExport(projectId: string) {
  try {
    if (!projectId?.trim()) {
      return { success: false as const, error: 'A valid project ID is required.' };
    }
    const clerkId = await getAuthenticatedUserId();
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user: { clerkId },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        progress: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!project) {
      return {
        success: false as const,
        error: 'Project not found in your account. Initialize or save it before exporting.',
      };
    }
    return {
      success: true as const,
      project: {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Failed to authorize project export:', error);
    return {
      success: false as const,
      error: 'Unable to verify project ownership. Please try again.',
    };
  }
}

/**
 * Saves (upserts) a project and its associated roadmap to the database.
 */
export async function saveProjectToDb(data: ProjectPayload) {
  try {
    const clerkId = await getAuthenticatedUserId();

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return { success: false, errorType: 'AUTH', message: 'User record not found in database.' };
    }
    const savedProject = await prisma.project.upsert({
      where: { id: data.id },
      update: {
        title: data.title,
        description: data.description || null,
        status: data.status,
        progress: data.progress,
        tags: data.tags,
        roadmap: data.roadmap || null,
      },
      create: {
        id: data.id,
        title: data.title,
        description: data.description || null,
        status: data.status,
        progress: data.progress,
        tags: data.tags,
        roadmap: data.roadmap || null,
        userId: dbUser.id,
      },
    });
    if (savedProject.progress >= 100 || savedProject.status.toLowerCase() === 'completed') {
      await createUserNotification(clerkId, {
        title: 'Project completed',
        message: `${savedProject.title} reached 100% progress.`,
        type: 'project_completed',
        dedupeKey: `project-completed:${savedProject.id}`,
        link: `/dashboard/projects/${savedProject.id}`,
        projectId: savedProject.id,
      });
    }
    return { success: true, project: savedProject };
  } catch (error: any) {
    console.error('Failed to save project details to database:', error);

    if (process.env.NODE_ENV === 'development') {
      console.warn('Postgres offline. Bypassing saveProjectToDb in offline-mode.');
      return {
        success: true,
        project: {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          progress: data.progress,
          tags: data.tags,
          roadmap: data.roadmap,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    }
    let errorType = 'UNKNOWN';
    if (error.message?.includes('Unauthenticated')) {
      errorType = 'AUTH';
    } else if (error.code && error.code.startsWith('P2')) {
      errorType = 'VALIDATION';
    } else {
      errorType = 'SERVER';
    }

    return { success: false, errorType, message: error.message || 'An unknown error occurred.' };
  }
}

/**
 * Updates step completion state in a project's roadmap and logs an activity.
 */
export async function toggleProjectMilestoneInDb(
  projectId: string,
  stepId: string,
  steps: any[],
  progress: number
) {
  try {
    const clerkId = await getAuthenticatedUserId();

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      throw new Error('User record not found.');
    }
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        roadmap: steps,
        progress,
        status: progress === 100 ? 'Completed' : 'In Progress',
      },
    });
    const completedStep = steps.find((step) => step.id === stepId && step.completed);
    if (completedStep) {
      await createUserNotification(clerkId, {
        title: 'Milestone completed',
        message: `${completedStep.title} was completed in ${updatedProject.title}. (+2 Career Score)`,
        type: 'milestone_completed',
        dedupeKey: `milestone-completed:${projectId}:${stepId}`,
        link: `/dashboard/projects/${projectId}`,
        projectId,
      });
    }
    if (progress === 100) {
      await createUserNotification(clerkId, {
        title: 'Project completed',
        message: `${updatedProject.title} reached 100% progress.`,
        type: 'project_completed',
        dedupeKey: `project-completed:${projectId}`,
        link: `/dashboard/projects/${projectId}`,
        projectId,
      });
    }

    return updatedProject;
  } catch (error) {
    console.error('Failed to update project milestone in database:', error);
    if (process.env.NODE_ENV === 'development') {
      console.warn('Postgres offline. Bypassing toggleProjectMilestoneInDb in offline-mode.');
      return null;
    }
    throw error;
  }
}

/**
 * Reorders the steps/milestones in a project's roadmap and persists the new order.
 */
export async function reorderProjectMilestonesInDb(projectId: string, steps: any[]) {
  try {
    const clerkId = await getAuthenticatedUserId();
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      throw new Error('User record not found.');
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { roadmap: steps },
    });

    return { success: true as const };
  } catch (error) {
    console.error('Failed to reorder project milestones in database:', error);
    if (process.env.NODE_ENV === 'development') {
      console.warn('Postgres offline. Bypassing reorderProjectMilestonesInDb in offline-mode.');
      return { success: false as const };
    }
    throw error;
  }
}

/**
 * Logs a new activity entry in the database.
 */
export async function createActivityInDb(
  projectId: string,
  description: string,
  type: string = 'milestone'
) {
  try {
    const clerkId = await getAuthenticatedUserId();
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      throw new Error('User record not found.');
    }

    return await prisma.activity.create({
      data: {
        type,
        description,
        projectId,
        userId: dbUser.id,
      },
    });
  } catch (error) {
    console.error('Failed to create activity log in database:', error);
    if (process.env.NODE_ENV === 'development') {
      console.warn('Postgres offline. Bypassing createActivityInDb in offline-mode.');
      return null;
    }
    throw error;
  }
}

/**
 * Returns activity entries owned by the authenticated user. Supplying a
 * project ID scopes the feed to one project; otherwise it returns recent
 * activity across all of the user's projects.
 */
export async function getProjectActivities(projectId?: string, limit: number = 30) {
  try {
    const clerkId = await getAuthenticatedUserId();
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!dbUser) return [];
    return await prisma.activity.findMany({
      where: {
        userId: dbUser.id,
        ...(projectId ? { projectId } : {}),
      },
      include: { project: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
    });
  } catch (error) {
    console.error('Failed to retrieve project activity:', error);
    return [];
  }
}

export async function createMilestone(
  projectId: string,
  title: string,
  description?: string,
  dueDate?: Date
) {
  return prisma.milestone.create({
    data: {
      title,
      description,
      dueDate,
      projectId,
    },
  });
}

export async function updateMilestoneStatus(milestoneId: string, status: string) {
  return prisma.milestone.update({
    where: {
      id: milestoneId,
    },
    data: {
      status,
    },
  });
}

export async function deleteMilestone(milestoneId: string) {
  return prisma.milestone.delete({
    where: {
      id: milestoneId,
    },
  });
}

export async function deleteProject(projectId: string) {
  try {
    const clerkId = await getAuthenticatedUserId();
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return { success: false, errorType: 'AUTH', message: 'User record not found.' };
    }
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: dbUser.id,
        deletedAt: null,
      },
    });

    if (!project) {
      return { success: false, errorType: 'AUTH', message: 'Unauthorized or project not found.' };
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });
    return { success: true, project: updated };
  } catch (error: any) {
    console.error('Failed to soft delete project:', error);
    return { success: false, errorType: 'SERVER', message: error.message || 'Internal server error.' };
  }
}
