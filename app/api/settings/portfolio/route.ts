import { NextRequest, NextResponse } from "next/server";
import { updatePortfolioSettings } from "@/app/actions/user";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { portfolioPublic, username } = body;

    if (typeof portfolioPublic !== "boolean") {
      return NextResponse.json(
        { error: "portfolioPublic boolean parameter is required." },
        { status: 400 },
      );
    }

    const updatedUser = await updatePortfolioSettings(portfolioPublic, username);

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/settings/portfolio error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update portfolio settings." },
      { status: 500 },
    );
  }
}
