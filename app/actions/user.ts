'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export interface OnboardingPayload {
  dreamRole: string;
  skills: string[];
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  dailyStudyTime: number;
}

/**
 * Persists onboarding data to PostgreSQL.
 * Supports both real Clerk sessions and developer sandboxes.
 */
export async function saveOnboardingData(data: OnboardingPayload) {
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const session = await auth();
    userId = session.userId;
  } else if (process.env.NODE_ENV === 'development') {
    userId = 'mock-developer-id';
  }

  if (!userId) {
    throw new Error('Unauthenticated user attempt to save onboarding data.');
  }

  try {
    return await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        dreamRole: data.dreamRole,
        skills: data.skills,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        resumeUrl: data.resumeUrl || null,
        dailyStudyTime: data.dailyStudyTime,
        onboardingCompleted: true,
      },
      create: {
        clerkId: userId,
        fullName: 'Developer Sandbox User',
        email: 'sandbox@projectpilot.ai',
        dreamRole: data.dreamRole,
        skills: data.skills,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        resumeUrl: data.resumeUrl || null,
        dailyStudyTime: data.dailyStudyTime,
        onboardingCompleted: true,
      },
    });
  } catch (error) {
    console.error('Failed to save user onboarding details to database:', error);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Postgres offline. Proceeding with offline-mode mock bypass.');
      return {
        clerkId: userId,
        fullName: 'Developer Sandbox User',
        email: 'sandbox@projectpilot.ai',
        dreamRole: data.dreamRole,
        skills: data.skills,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        resumeUrl: data.resumeUrl,
        dailyStudyTime: data.dailyStudyTime,
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    throw error;
  }
}

/**
 * Retrieves the current user's profile from PostgreSQL database.
 */
export async function getCurrentUserProfile() {
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const session = await auth();
    userId = session.userId;
  } else if (process.env.NODE_ENV === 'development') {
    userId = 'mock-developer-id';
  }

  if (!userId) {
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: { clerkId: userId }
    });
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    if (process.env.NODE_ENV === 'development') {
      return {
        clerkId: userId,
        fullName: 'Developer Sandbox User',
        email: 'sandbox@projectpilot.ai',
        imageUrl: null,
        skills: ['React', 'TypeScript', 'Tailwind CSS'],
        dreamRole: 'AI Engineer',
        githubUrl: 'https://github.com/developer',
        linkedinUrl: 'https://linkedin.com/in/developer',
        resumeUrl: 'sandbox_resume.pdf',
        dailyStudyTime: 15,
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    return null;
  }
}
