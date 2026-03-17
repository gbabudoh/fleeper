/**
 * Fleeper Split Engine
 * Handles Gross-to-Net-to-Pool logic with integer precision.
 * All amounts are in CENTS to avoid floating-point errors.
 */

export interface PoolRule {
  id: string;
  name: string;
  percentage: number; // e.g., 70 means 70%
  color: string;
  bankName?: string;
  bankLastFour?: string;
}

export interface SplitResult {
  gross: number;
  provision: number;
  net: number;
  splits: Array<{
    poolId: string;
    poolName: string;
    color: string;
    percentage: number;
    amountCents: number;
    bankName?: string;
    bankLastFour?: string;
  }>;
  provisionBreakdown: {
    percentagePart: number;
    flatPart: number;
  };
}

const PLATFORM_PERCENTAGE = 0.029; // 2.9%
const PLATFORM_FLAT_CENTS = 30; // $0.30

export function calculateFleepSplit(
  grossAmountCents: number,
  pools: PoolRule[]
): SplitResult {
  // Validate inputs
  if (grossAmountCents <= 0) throw new Error("Amount must be positive");
  if (pools.length === 0) throw new Error("At least one pool required");

  const totalPercentage = pools.reduce((sum, p) => sum + p.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Pool percentages must total 100%, got ${totalPercentage}%`);
  }

  // 1. Calculate Platform Provision
  const percentagePart = Math.round(grossAmountCents * PLATFORM_PERCENTAGE);
  const flatPart = PLATFORM_FLAT_CENTS;
  const provision = percentagePart + flatPart;

  // 2. Net amount for seller
  const net = grossAmountCents - provision;

  if (net <= 0) throw new Error("Transaction amount too small to cover platform fee");

  // 3. Split net into pools (handle rounding with largest-remainder method)
  const rawSplits = pools.map((pool) => ({
    ...pool,
    rawAmount: (net * pool.percentage) / 100,
  }));

  // Apply floor to all, track remainders
  let distributed = 0;
  const splits = rawSplits.map((pool) => {
    const floored = Math.floor(pool.rawAmount);
    distributed += floored;
    return {
      poolId: pool.id,
      poolName: pool.name,
      color: pool.color,
      percentage: pool.percentage,
      amountCents: floored,
      remainder: pool.rawAmount - floored,
      bankName: pool.bankName,
      bankLastFour: pool.bankLastFour,
    };
  });

  // Distribute remaining cents to pools with highest remainders
  let remaining = net - distributed;
  const sortedByRemainder = [...splits]
    .sort((a, b) => (b as any).remainder - (a as any).remainder)
    .map((s) => s.poolId);

  for (let i = 0; i < remaining; i++) {
    const poolId = sortedByRemainder[i % sortedByRemainder.length];
    const split = splits.find((s) => s.poolId === poolId);
    if (split) split.amountCents += 1;
  }

  return {
    gross: grossAmountCents,
    provision,
    net,
    splits: splits.map(({ remainder: _, ...s }) => s),
    provisionBreakdown: { percentagePart, flatPart },
  };
}

export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function centsToFloat(cents: number): number {
  return cents / 100;
}

export function floatToCents(amount: number): number {
  return Math.round(amount * 100);
}
