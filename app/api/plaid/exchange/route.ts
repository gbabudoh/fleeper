/**
 * POST /api/plaid/exchange
 *
 * Step 2 of the bank linking flow:
 * 1. Exchange the public_token Plaid Link returned for a permanent access_token.
 * 2. Create a Stripe processor_token from that access_token + account_id.
 * 3. Register the external bank account on the seller's Stripe Connected Account.
 * 4. Save pool metadata (bankName, bankLastFour, bankAccountToken) to the DB.
 *
 * Body: { poolId, publicToken, accountId, accountName, accountMask }
 * Auth: session cookie (userId and stripeAccountId resolved server-side)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { exchangeForProcessorToken } from "@/lib/plaid";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";
import { logger } from "@/lib/logger";

const ExchangeSchema = z.object({
  poolId: z.string().min(1),
  publicToken: z.string().min(1),
  accountId: z.string().min(1),
  accountName: z.string(),
  accountMask: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ExchangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const { poolId, publicToken, accountId, accountName, accountMask } = parsed.data;
  const userId = session.user.id;

  const { prisma } = await import("@/lib/db");

  // Verify the pool belongs to the authenticated user
  const pool = await prisma.incomePool.findFirst({
    where: { id: poolId, userId },
  });
  if (!pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }

  // Resolve the seller's Stripe Connected Account from the DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeAccountId: true },
  });

  try {
    const { processorToken } = await exchangeForProcessorToken(publicToken, accountId);

    let stripeExternalAccountId = "pending";
    if (stripe && user?.stripeAccountId) {
      const externalAccount = await stripe.accounts.createExternalAccount(
        user.stripeAccountId,
        {
          external_account: processorToken,
          metadata: { pool_id: poolId, plaid_account_name: accountName },
        }
      );
      stripeExternalAccountId = externalAccount.id;
    }

    await prisma.incomePool.update({
      where: { id: poolId },
      data: {
        bankAccountToken: stripeExternalAccountId,
        bankName: accountName,
        bankLastFour: accountMask,
      },
    });

    logger.info({ userId, poolId, accountName, accountMask }, "Bank account linked to pool");

    return NextResponse.json({
      success: true,
      bankName: accountName,
      bankLastFour: accountMask,
      stripeExternalAccountId,
    });
  } catch (err) {
    logger.error({ err, userId, poolId }, "Plaid token exchange failed");
    return NextResponse.json({ error: "Bank linking failed" }, { status: 500 });
  }
}
