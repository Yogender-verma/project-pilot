import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        projects: {
          include: {
            activities: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Scrub sensitive fields
    const { clerkId, id, ...safeUser } = user;
    
    // Create export payload
    const exportPayload = {
      profile: safeUser,
      projects: user.projects.map(p => {
         const { userId, ...safeProject } = p;
         return safeProject;
      }),
      exportedAt: new Date().toISOString()
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="project-pilot-export-${new Date().toISOString().split('T')[0]}.json"`,
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
