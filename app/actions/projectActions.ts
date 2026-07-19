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

/**
 * Helper to get the current authenticated Clerk ID or fallback mock developer ID.
 */
async function getAuthenticatedUserId(): Promise<string> {
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const session = await auth();
    userId = session.userId;
  } else if (process.env.NODE_ENV === 'development') {
    userId = 'mock-developer-id';
  }

  if (!userId) {
    throw new Error('Unauthenticated user attempt.');
  }

  return userId;
}

/**
 * Fetches all projects associated with the current user.
 */
export async function getUserProjects() {
  try {
    const clerkId = await getAuthenticatedUserId();
    
    // First, find the user database ID using the Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        projects: {
          include: {
            activities: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
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
      where: { clerkId }
    });

    if (!dbUser) {
      throw new Error('User record not found in database.');
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

    return savedProject;
  } catch (error) {
    console.error('Failed to save project details to database:', error);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Postgres offline. Bypassing saveProjectToDb in offline-mode.');
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        progress: data.progress,
        tags: data.tags,
        roadmap: data.roadmap,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    throw error;
  }
}

/**
 * Updates step completion state in a project's roadmap and logs an activity.
 */
export async function toggleProjectMilestoneInDb(projectId: string, stepId: string, steps: any[], progress: number) {
  try {
    const clerkId = await getAuthenticatedUserId();

    const dbUser = await prisma.user.findUnique({
      where: { clerkId }
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
      }
    });

    const completedStep = steps.find((step) => step.id === stepId && step.completed);
    if (completedStep) {
      await createUserNotification(clerkId, {
        title: 'Milestone completed',
        message: `${completedStep.title} was completed in ${updatedProject.title}.`,
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
 * Logs a new activity entry in the database.
 */
export async function createActivityInDb(projectId: string, description: string, type: string = 'milestone') {
  try {
    const clerkId = await getAuthenticatedUserId();

    const dbUser = await prisma.user.findUnique({
      where: { clerkId }
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
      }
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
