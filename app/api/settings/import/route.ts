import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    let userId: string | null = null;
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      const session = await auth();
      userId = session.userId;
    } else if (process.env.NODE_ENV === 'development') {
      userId = 'mock-developer-id';
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    if (!body || !body.profile) {
      return NextResponse.json({ error: 'Invalid import format' }, { status: 400 });
    }

    // Upsert profile data
    const profile = body.profile;
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        fullName: profile.fullName || dbUser.fullName,
        dreamRole: profile.dreamRole || dbUser.dreamRole,
        skills: profile.skills || dbUser.skills,
        githubUrl: profile.githubUrl || dbUser.githubUrl,
        linkedinUrl: profile.linkedinUrl || dbUser.linkedinUrl,
        resumeUrl: profile.resumeUrl || dbUser.resumeUrl,
        dailyStudyTime: profile.dailyStudyTime || dbUser.dailyStudyTime,
        portfolioPublic: profile.portfolioPublic || dbUser.portfolioPublic,
      }
    });

    if (body.projects && Array.isArray(body.projects)) {
      for (const proj of body.projects) {
        // Use a unique ID for upsert, or fallback to cuid if new
        const projectId = proj.id || Math.random().toString(36).substring(7);
        
        await prisma.project.upsert({
          where: { id: projectId },
          update: {
            title: proj.title,
            description: proj.description,
            status: proj.status,
            progress: proj.progress,
            tags: proj.tags,
            roadmap: proj.roadmap,
          },
          create: {
            id: projectId,
            userId: dbUser.id,
            title: proj.title,
            description: proj.description,
            status: proj.status,
            progress: proj.progress,
            tags: proj.tags,
            roadmap: proj.roadmap,
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
