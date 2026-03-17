/**
 * GET /api/plaid/link-token?userId=xxx
 *
 * Creates a short-lived Plaid Link token.
 * The front-end passes this to usePlaidLink() to open the Plaid Link modal,
 * where the seller logs into their bank without exposing credentials to Fleeper.
 */
import { NextRequest, NextResponse } from "next/server";
import { createLinkToken } from "@/lib/plaid";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const linkToken = await createLinkToken(userId);
    return NextResponse.json({ linkToken });
  } catch (err) {
    logger.error({ err, userId }, "Plaid link token creation failed");
    return NextResponse.json({ error: "Failed to create Plaid link token" }, { status: 500 });
  }
}
