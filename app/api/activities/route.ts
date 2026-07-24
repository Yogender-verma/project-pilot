import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = 10;

    const activities = await db.activity.findMany({
      where: { userId },
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: {
              id: cursor,
            },
          }
        : {}),
      orderBy: {
        createdAt: "desc",
      },
    });

    let nextCursor: string | null = null;
    if (activities.length > limit) {
      const nextItem = activities.pop();
      nextCursor = nextItem ? nextItem.id : null;
    }

    return NextResponse.json({
      activities,
      nextCursor,
    });
  } catch (error) {
    console.error("[ACTIVITIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
