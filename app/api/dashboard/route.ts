import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [pools, stats, monthCount, recent] = await Promise.all([
    // Income pools with their total settled splits
    prisma.incomePool.findMany({
      where: { userId, isActive: true },
      orderBy: { order: "asc" },
      include: {
        splits: {
          where: { status: "settled" },
          select: { amount: true },
        },
      },
    }),

    // All-time totals from succeeded transactions
    prisma.transaction.aggregate({
      where: { userId, status: "succeeded" },
      _sum: { grossAmount: true, netAmount: true, platformFee: true },
      _count: { id: true },
    }),

    // This month's transaction count
    prisma.transaction.count({
      where: { userId, createdAt: { gte: monthStart } },
    }),

    // 5 most recent transactions
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, description: true, grossAmount: true,
        platformFee: true, netAmount: true, status: true, createdAt: true,
      },
    }),
  ]);

  // Calculate balance per pool from its settled splits
  const poolsWithBalance = pools.map((p) => ({
    id: p.id,
    name: p.name,
    percentage: Number(p.percentage),
    color: p.color,
    bankName: p.bankName,
    bankLastFour: p.bankLastFour,
    balance: p.splits.reduce((sum, s) => sum + s.amount, 0),
  }));

  // Growth pool total (for "auto-saved" stat)
  const growthPool = poolsWithBalance.find((p) => p.name === "Growth Pool");

  return NextResponse.json({
    pools: poolsWithBalance,
    stats: {
      totalGross: stats._sum.grossAmount ?? 0,
      totalNet:   stats._sum.netAmount   ?? 0,
      totalFees:  stats._sum.platformFee ?? 0,
      totalCount: stats._count.id,
      monthCount,
      autoSaved:  growthPool?.balance ?? 0,
    },
    recent,
    handle: session.user.handle,
    name: session.user.name,
  });
}
