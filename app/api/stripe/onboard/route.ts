/**
 * POST /api/stripe/onboard
 *
 * Generates a Stripe Account Link URL for the logged-in seller to complete
 * their Connected Account verification (KYC, bank details, etc.).
 * After the seller finishes, Stripe redirects them back to the dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { stripe, createConnectedAccount } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, stripeAccountId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    let stripeAccountId = user.stripeAccountId;

    // Create a Connected Account if one doesn't exist yet
    if (!stripeAccountId) {
      stripeAccountId = await createConnectedAccount(user.email, user.name ?? user.email);
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId },
      });
      logger.info({ userId: user.id, stripeAccountId }, "Connected Account created on demand");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard/settings?stripe=refresh`,
      return_url: `${baseUrl}/dashboard/settings?stripe=success`,
      type: "account_onboarding",
    });

    logger.info({ userId: user.id, stripeAccountId }, "Stripe onboarding link generated");

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Failed to generate Stripe onboarding link");
    return NextResponse.json({ error: "Failed to generate onboarding link" }, { status: 500 });
  }
}

/**
 * GET /api/stripe/onboard
 * Returns the current Stripe account status for the logged-in user.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeAccountId: true },
  });

  if (!user?.stripeAccountId || !stripe) {
    return NextResponse.json({ connected: false, chargesEnabled: false, payoutsEnabled: false });
  }

  try {
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    return NextResponse.json({
      connected: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (err) {
    logger.error({ err, userId: session.user.id }, "Failed to retrieve Stripe account status");
    return NextResponse.json({ connected: false, chargesEnabled: false, payoutsEnabled: false });
  }
}
