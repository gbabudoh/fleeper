/**
 * Fleep Stream Engine
 *
 * This is the "Brain" — Phase B + Phase C of the payment flow.
 * It is called by the Stripe webhook after payment_intent.succeeded.
 *
 * Steps:
 * 1. Load the transaction and seller's pool configuration from the DB.
 * 2. Run calculateFleepSplit to get exact cent amounts per pool.
 * 3. Record each split in the DB (transaction_splits).
 * 4. Execute Stripe Transfers to move money to each external bank account.
 * 5. Update split statuses and log everything.
 */
import { Prisma, IncomePool } from "@prisma/client";
import { calculateFleepSplit, PoolRule } from "./split-engine";
import { logTransaction } from "./logger";

// These imports are dynamic to avoid errors when DB/Stripe are not configured
async function getDb() {
  const { prisma } = await import("./db");
  return prisma;
}

async function getStripe() {
  const { executeSplitTransfers } = await import("./stripe");
  return { executeSplitTransfers };
}

export interface FleepStreamPayload {
  stripePaymentIntentId: string;
  sellerId: string;
  grossAmountCents: number;
  currency: string;
  description?: string;
  customerEmail?: string;
  paymentLinkId?: string;
}

interface SellerStripeAccount {
  stripeAccountId: string | null;
}

export async function executeFleepStream(payload: FleepStreamPayload) {
  const db = await getDb();
  const { executeSplitTransfers } = await getStripe();

  const {
    stripePaymentIntentId,
    sellerId,
    grossAmountCents,
    currency,
    description,
    customerEmail,
    paymentLinkId,
  } = payload;

  logTransaction("fleep_stream.started", {
    paymentIntentId: stripePaymentIntentId,
    sellerId,
    grossAmountCents,
  });

  // 1. Load seller and active pools
  const user = await (db.user as unknown as {
    findUnique: (args: {
      where: { id: string };
      select: { stripeAccountId: boolean };
    }) => Promise<SellerStripeAccount | null>;
  }).findUnique({
    where: { id: sellerId },
    select: { stripeAccountId: true }
  });

  const pools = await db.incomePool.findMany({
    where: { userId: sellerId, isActive: true },
    orderBy: { order: "asc" },
  });

  if (pools.length === 0) {
    throw new Error(`Seller ${sellerId} has no active income pools`);
  }

  // 1.5 Handle custom splits from PaymentLink if provided
  let poolRules: PoolRule[] = [];
  let linkCustomSplits: { label: string; percent: number }[] | null = null;

  if (paymentLinkId) {
    const link = await db.paymentLink.findUnique({
      where: { id: paymentLinkId },
    });
    if (link && link.customSplits) {
      linkCustomSplits = link.customSplits as { label: string; percent: number }[];
    }
  }

  if (linkCustomSplits && Array.isArray(linkCustomSplits)) {
    // If custom splits are provided, map them to the user's existing pools by label
    // or just use them as virtual rules (advanced logic: using existing pool bank tokens if labels match)
    poolRules = linkCustomSplits.map((split) => {
      // Find matching pool by name to get real bank details
      const matchedPool = pools.find((p) => p.name.toLowerCase() === split.label.toLowerCase());

      return {
        id: matchedPool?.id || `virtual-${split.label}`, // fallback ID for tracking
        name: split.label,
        percentage: Number(split.percent),
        color: matchedPool?.color || "#8B5CF6",
        bankName: matchedPool?.bankName ?? undefined,
        bankLastFour: matchedPool?.bankLastFour ?? undefined,
      };
    });
  } else {
    // Default logic: use all active pools
    poolRules = pools.map((p: IncomePool) => ({
      id: p.id,
      name: p.name,
      percentage: Number(p.percentage),
      color: p.color,
      bankName: p.bankName ?? undefined,
      bankLastFour: p.bankLastFour ?? undefined,
    }));
  }

  const splitResult = calculateFleepSplit(grossAmountCents, poolRules);

  logTransaction("fleep_stream.split_calculated", {
    paymentIntentId: stripePaymentIntentId,
    gross: splitResult.gross,
    provision: splitResult.provision,
    net: splitResult.net,
    splits: splitResult.splits.map((s) => ({ pool: s.poolName, cents: s.amountCents })),
  });

  // 3. Write transaction + splits atomically to DB
  const transaction = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const mainTx = await tx.transaction.create({
      data: {
        userId: sellerId,
        grossAmount: splitResult.gross,
        platformFee: splitResult.provision,
        netAmount: splitResult.net,
        currency,
        status: "processing",
        description,
        customerEmail,
        stripePaymentId: stripePaymentIntentId,
        linkId: paymentLinkId ?? null,
      },
    });

    for (const split of splitResult.splits) {
      await tx.transactionSplit.create({
        data: {
          transactionId: mainTx.id,
          poolId: split.poolId,
          amount: split.amountCents,
          status: "pending",
        },
      });
    }

    return mainTx;
  });

  logTransaction("fleep_stream.db_recorded", { transactionId: transaction.id });

  // 4. Execute Stripe Transfers (best-effort — failures are logged but don't rollback DB)
  // In production, the seller's stripeConnectedAccountId and externalAccountId
  // are stored on User and IncomePool records respectively.
  // For now we log what we would transfer.
  const transferPayloads = splitResult.splits.map((split) => {
    const pool = pools.find((p: { id: string }) => p.id === split.poolId);
    return {
      poolId: split.poolId,
      poolName: split.poolName,
      amountCents: split.amountCents,
      externalAccountId: (pool as { bankAccountToken?: string | null })?.bankAccountToken ?? "pending",
    };
  });

  logTransaction("fleep_stream.transfers_queued", {
    transactionId: transaction.id,
    transfers: transferPayloads.map((t) => ({
      pool: t.poolName,
      cents: t.amountCents,
      destination: t.externalAccountId,
    })),
  });

  // 4.5 Actually execute the transfers via Stripe
  if (user?.stripeAccountId) {
    try {
      const transferResults = await executeSplitTransfers(
        user.stripeAccountId as string,
        currency,
        transferPayloads
      );
      logTransaction("fleep_stream.transfers_executed", {
        transactionId: transaction.id,
        results: transferResults,
      });
    } catch (err) {
      logTransaction("fleep_stream.transfers_failed", {
        transactionId: transaction.id,
        error: String(err),
      });
    }
  } else {
    logTransaction("fleep_stream.transfers_skipped", {
      transactionId: transaction.id,
      reason: "No stripeAccountId found for seller",
    });
  }

  // Mark transaction as succeeded
  await db.transaction.update({
    where: { id: transaction.id },
    data: { status: "succeeded" },
  });

  // Update all splits to settled
  await db.transactionSplit.updateMany({
    where: { transactionId: transaction.id },
    data: { status: "settled" },
  });

  logTransaction("fleep_stream.completed", {
    transactionId: transaction.id,
    paymentIntentId: stripePaymentIntentId,
  });

  return {
    transactionId: transaction.id,
    splits: splitResult.splits,
  };
}
