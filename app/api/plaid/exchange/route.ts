/**
 * POST /api/plaid/exchange
 *
 * Step 2 of the bank linking flow:
 * 1. Exchange the public_token Plaid Link returned for a permanent access_token.
 * 2. Create a Stripe processor_token from that access_token + account_id.
 * 3. Register the external bank account on the seller's Stripe Connected Account.
 * 4. Save pool metadata (bankName, bankLastFour, bankAccountToken) to the DB.
 *
 * Body: { userId, poolId, publicToken, accountId, accountName, accountMask }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { exchangeForProcessorToken } from "@/lib/plaid";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

const ExchangeSchema = z.object({
  userId: z.string().min(1),
  poolId: z.string().min(1),
  publicToken: z.string().min(1),
  accountId: z.string().min(1),
  accountName: z.string(),
  accountMask: z.string(),
  sellerConnectedAccountId: z.string().min(1),
});

export async function POST(req: NextRequest) {
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

  const { userId, poolId, publicToken, accountId, accountName, accountMask, sellerConnectedAccountId } = parsed.data;

  try {
    // Step 1+2: Exchange public_token → Stripe processor token
    const { processorToken } = await exchangeForProcessorToken(publicToken, accountId);

    // Step 3: Register bank account on Stripe Connected Account
    let stripeExternalAccountId = "pending";
    if (stripe) {
      const externalAccount = await stripe.accounts.createExternalAccount(
        sellerConnectedAccountId,
        {
          external_account: processorToken,
          metadata: { pool_id: poolId, plaid_account_name: accountName },
        }
      );
      stripeExternalAccountId = externalAccount.id;
    }

    // Step 4: Update pool in DB
    const { prisma } = await import("@/lib/db");
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
