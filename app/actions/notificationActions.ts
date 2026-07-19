'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@/types';

type CreateNotificationInput = {
  title: string;
  message: string;
  type: NotificationType;
  dedupeKey: string;
  link?: string | null;
  projectId?: string | null;
};

async function getAuthenticatedDbUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('You must sign in to access notifications.');

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('Unable to load the signed-in Clerk user.');

  const email =
    clerkUser.emailAddresses.find((entry) => entry.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error('The signed-in account has no email address.');

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: {
      clerkId: userId,
      email,
      fullName:
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
        email.split('@')[0],
      imageUrl: clerkUser.imageUrl || null,
      skills: [],
    },
  });
}

export async function createUserNotification(
  clerkId: string,
  input: CreateNotificationInput,
) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return null;

  return prisma.notification.upsert({
    where: { dedupeKey: input.dedupeKey },
    update: {
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link || null,
      projectId: input.projectId || null,
    },
    create: {
      ...input,
      link: input.link || null,
      projectId: input.projectId || null,
      userId: user.id,
    },
  });
}

async function generateProjectNotifications(userId: string) {
  const projects = await prisma.project.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      progress: true,
      status: true,
      dueAt: true,
      updatedAt: true,
    },
  });

  const now = new Date();
  const approachingLimit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const stalledLimit = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const pending: CreateNotificationInput[] = [];
  for (const project of projects) {
    const link = `/dashboard/projects/${project.id}`;

    if (project.progress >= 100 || project.status.toLowerCase() === 'completed') {
      pending.push({
        title: 'Project completed',
        message: `${project.title} reached 100% progress.`,
        type: 'project_completed' as const,
        dedupeKey: `project-completed:${project.id}`,
        link,
        projectId: project.id,
      });
    }

    if (project.progress < 100 && project.updatedAt < stalledLimit) {
      pending.push({
        title: 'Project needs attention',
        message: `${project.title} has not been updated for more than 14 days.`,
        type: 'project_stalled' as const,
        dedupeKey: `project-stalled:${project.id}:${project.updatedAt.toISOString().slice(0, 10)}`,
        link,
        projectId: project.id,
      });
    }

    if (project.dueAt && project.progress < 100) {
      if (project.dueAt < now) {
        pending.push({
          title: 'Project deadline missed',
          message: `${project.title} passed its deadline.`,
          type: 'deadline_missed' as const,
          dedupeKey: `deadline-missed:${project.id}:${project.dueAt.toISOString()}`,
          link,
          projectId: project.id,
        });
      } else if (project.dueAt <= approachingLimit) {
        pending.push({
          title: 'Project deadline approaching',
          message: `${project.title} is due within the next 3 days.`,
          type: 'deadline_approaching' as const,
          dedupeKey: `deadline-approaching:${project.id}:${project.dueAt.toISOString()}`,
          link,
          projectId: project.id,
        });
      }
    }
  }

  if (pending.length) {
    await Promise.all(
      pending.map((item) =>
        prisma.notification.upsert({
          where: { dedupeKey: item.dedupeKey },
          update: {
            title: item.title,
            message: item.message,
            type: item.type,
            link: item.link,
            projectId: item.projectId,
          },
          create: { ...item, userId },
        }),
      ),
    );
  }
}

function getMockNotifications() {
  const now = Date.now();

  return [
    {
      id: 'mock-notification-1',
      title: 'Project deadline approaching',
      message: 'AI Chatbot is due within the next 3 days.',
      type: 'deadline_approaching' as const,
      isRead: false,
      link: '/dashboard/projects',
      projectId: null,
      dedupeKey: 'mock-deadline-1',
      userId: 'mock-user',
      createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-notification-2',
      title: 'Milestone completed',
      message: 'Authentication setup was completed successfully.',
      type: 'milestone_completed' as const,
      isRead: false,
      link: '/dashboard/projects',
      projectId: null,
      dedupeKey: 'mock-milestone-1',
      userId: 'mock-user',
      createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-notification-3',
      title: 'Project needs attention',
      message: 'Portfolio Builder has not been updated recently.',
      type: 'project_stalled' as const,
      isRead: true,
      link: '/dashboard/projects',
      projectId: null,
      dedupeKey: 'mock-stalled-1',
      userId: 'mock-user',
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export async function getNotifications() {
  try {
    const user = await getAuthenticatedDbUser();
    await generateProjectNotifications(user.id);

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      success: true as const,
      notifications: notifications.map((item) => ({
        ...item,
        type: item.type as NotificationType,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
  console.error('Failed to load notifications:', error);

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Using mock notifications because authenticated notification loading failed.',
    );

    return {
      success: true as const,
      notifications: getMockNotifications(),
    };
  }

  return {
    success: false as const,
    error:
      error instanceof Error
        ? error.message
        : 'Unable to load notifications.',
    notifications: [],
  };
}
}

export async function markNotificationRead(notificationId: string) {
  try {
    const user = await getAuthenticatedDbUser();
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true },
    });
    return { success: result.count === 1 };
  } catch (error) {
    console.error('Failed to mark notification read:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function markAllNotificationsRead() {
  try {
    const user = await getAuthenticatedDbUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return { success: true as const };
  } catch (error) {
    console.error('Failed to mark all notifications read:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const user = await getAuthenticatedDbUser();
    const result = await prisma.notification.deleteMany({
      where: { id: notificationId, userId: user.id },
    });
    return { success: result.count === 1 };
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
