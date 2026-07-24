import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Runs daily via Vercel Cron (see vercel.json).
// Permanently deletes any account whose 30-day recovery window has expired.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const result = await prisma.user.deleteMany({
      where: {
        deletedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({ success: true, purgedCount: result.count }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/cron/purge-deleted-accounts error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to purge deleted accounts." },
      { status: 500 },
    );
  }
}