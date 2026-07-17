'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    return await prisma.project.upsert({
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
