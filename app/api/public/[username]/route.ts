import { NextRequest, NextResponse } from "next/server";
import { getPublicPortfolioData } from "@/app/actions/user";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis & Rate Limiter (60 requests per minute per IP)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "projectpilot_public_api",
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> },
) {
  try {
    // Extract IP address for rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    const { username } = await context.params;
    if (!username) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    const publicProfile = await getPublicPortfolioData(username);

    if (!publicProfile) {
      return NextResponse.json(
        { error: "Public portfolio is disabled or does not exist." },
        { status: 404, headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() } },
      );
    }

    return NextResponse.json(publicProfile, {
      status: 200,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
      },
    });
  } catch (error) {
    console.error("GET /api/public/[username] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch public portfolio data." },
      { status: 500 },
    );
  }
}
