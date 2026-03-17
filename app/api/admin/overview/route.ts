import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin("READ_ONLY");
  if (error) return error;

  const [totalUsers, totalTransactions, totalLinks, totalApiKeys, recentTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.paymentLink.count(),
    prisma.apiKey.count(),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, handle: true } } },
    }),
  ]);

  const volumeResult = await prisma.transaction.aggregate({ _sum: { grossAmount: true } });
  const totalVolume = volumeResult._sum.grossAmount ?? 0;

  return NextResponse.json({ totalUsers, totalTransactions, totalLinks, totalApiKeys, totalVolume, recentTransactions });
}
