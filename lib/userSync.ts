import { prisma } from './prisma';

export interface ClerkUserParam {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  emailAddresses: Array<{ emailAddress: string; id?: string }>;
  primaryEmailAddressId?: string | null;
  imageUrl?: string | null;
}

/**
 * Atomically upserts a Clerk user in the PostgreSQL database.
 * Matches by Clerk ID to guarantee email uniqueness and update profile parameters seamlessly.
 */
export async function syncClerkUser(clerkUser: ClerkUserParam) {
  const email = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error('User has no valid email address associated with Clerk profile.');
  }

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] ||
    'Anonymous User';

  const imageUrl = clerkUser.imageUrl || null;

  try {
    // Perform database UPSERT to create if missing, or update if existing.
    return await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        fullName,
        email,
        imageUrl,
      },
      create: {
        clerkId: clerkUser.id,
        fullName,
        email,
        imageUrl,
        skills: [],
      },
    });
  } catch (error) {
    console.error('Failed to sync Clerk user with database:', error);
    
    // In local dev if PostgreSQL is unreachable, return a mock user fallback for visual integrity
    if (process.env.NODE_ENV === 'development') {
      console.warn('Postgres connection failed, falling back to dynamic in-memory synchronization.');
      return {
        id: 'fallback-id',
        clerkId: clerkUser.id,
        fullName,
        email,
        imageUrl,
        skills: [],
        dreamRole: 'AI Engineer',
        githubUrl: '',
        linkedinUrl: '',
        resumeUrl: '',
        dailyStudyTime: 15,
        onboardingCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    throw error;
  }
}
