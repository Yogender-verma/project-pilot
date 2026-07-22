'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

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
        fullName: 'Dev User',
        email: `dev-${userId}@localhost`,
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
        fullName: 'Dev User',
        email: `dev-${userId}@localhost`,
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
      where: { clerkId: userId },
      include: {
        projects: {
          include: {
            activities: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    // Return null so callers can fall back to Clerk identity data.
    // Do NOT return a fake 'Dev User' object — that causes dummy data to appear on the dashboard.
    return null;
  }
}

//avatar update
export async function updateProfileAvatar(imageUrl: string) {
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const session = await auth();
    userId = session.userId;
  } else if (process.env.NODE_ENV === "development") {
    userId = "mock-developer-id";
  }

  if (!userId) {
    throw new Error("Unauthenticated user attempt.");
  }

  try {
    return await prisma.user.update({
      where: {
        clerkId: userId,
      },
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    console.error("Failed to update profile avatar:", error);

    if (process.env.NODE_ENV === "development") {
      return {
        clerkId: userId,
        imageUrl,
      };
    }

    throw error;
  }
}

/**
 * Persists the user's updated skills array to the PostgreSQL database.
 */
export async function updateUserSkillsInDb(skills: string[]) {
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const session = await auth();
    userId = session.userId;
  } else if (process.env.NODE_ENV === "development") {
    userId = "mock-developer-id";
  }

  if (!userId) {
    throw new Error("Unauthenticated user attempt to update skills.");
  }

  try {
    return await prisma.user.update({
      where: {
        clerkId: userId,
      },
      data: {
        skills,
      },
    });
  } catch (error) {
    console.error("Failed to update user skills in database:", error);

    if (process.env.NODE_ENV === "development") {
      return {
        clerkId: userId,
        skills,
      };
    }

    throw error;
  }
}

/**
 * Updates public portfolio visibility & custom username settings.
 */
export async function updatePortfolioSettings(portfolioPublic: boolean, customUsername?: string) {
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const session = await auth();
    userId = session.userId;
  } else if (process.env.NODE_ENV === "development") {
    userId = "mock-developer-id";
  }

  if (!userId) {
    throw new Error("Unauthenticated user attempt.");
  }

  const username = customUsername
    ? customUsername.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-")
    : undefined;

  try {
    return await prisma.user.update({
      where: { clerkId: userId },
      data: {
        portfolioPublic,
        ...(username ? { username } : {}),
      },
    });
  } catch (error) {
    console.error("Failed to update portfolio settings:", error);
    if (process.env.NODE_ENV === "development") {
      return {
        clerkId: userId,
        portfolioPublic,
        ...(username ? { username } : {}),
      };
    }
    throw error;
  }
}

/**
 * Fetches public portfolio data by username/handle or ID.
 * Returns null if user is not found or if portfolioPublic is false.
 */
export async function getPublicPortfolioData(usernameParam: string) {
  const cleanUsername = usernameParam.trim().toLowerCase();

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { clerkId: usernameParam },
          { id: usernameParam },
          { email: { startsWith: cleanUsername } },
        ],
      },
      include: {
        projects: {
          include: {
            activities: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!user || !user.portfolioPublic) {
      return null;
    }

    const { email, clerkId, ...publicProfile } = user;
    return publicProfile;
  } catch (error) {
    console.error("Failed to fetch public portfolio data:", error);
    return null;
  }
}

/**
 * Updates the current user's professional links (GitHub, LinkedIn, Resume URL).
 */
export async function updateProfessionalLinks(data: {
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
}) {
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const session = await auth();
    userId = session.userId;
  } else if (process.env.NODE_ENV === "development") {
    userId = "mock-developer-id";
  }

  if (!userId) {
    throw new Error("Unauthenticated user attempt.");
  }

  try {
    return await prisma.user.update({
      where: { clerkId: userId },
      data: {
        githubUrl: data.githubUrl ?? null,
        linkedinUrl: data.linkedinUrl ?? null,
        resumeUrl: data.resumeUrl ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to update professional links:", error);
    if (process.env.NODE_ENV === "development") {
      return {
        clerkId: userId,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        resumeUrl: data.resumeUrl,
      };
    }
    throw error;
  }
}

/**
 * Retrieves the current user's professional links from the database.
 */
export async function getProfessionalLinks() {
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const session = await auth();
    userId = session.userId;
  } else if (process.env.NODE_ENV === "development") {
    userId = "mock-developer-id";
  }

  if (!userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        githubUrl: true,
        linkedinUrl: true,
        resumeUrl: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch professional links:", error);
    return null;
  }
}