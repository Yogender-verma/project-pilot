import { NextRequest, NextResponse } from "next/server";
import { getPublicPortfolioData } from "@/app/actions/user";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await context.params;
    if (!username) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    const publicProfile = await getPublicPortfolioData(username);

    if (!publicProfile) {
      return NextResponse.json(
        { error: "Public portfolio is disabled or does not exist." },
        { status: 404 },
      );
    }

    return NextResponse.json(publicProfile, { status: 200 });
  } catch (error) {
    console.error("GET /api/public/[username] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch public portfolio data." },
      { status: 500 },
    );
  }
}
