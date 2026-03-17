import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status"); // all | succeeded | pending | failed
  const search = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId: session.user.id };
  if (status && status !== "all") where.status = status;
  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { paymentRef: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        splits: {
          include: { pool: { select: { name: true, color: true, percentage: true } } },
          orderBy: { pool: { order: "asc" } },
        },
      },
    }),
  ]);

  // Compute summary stats (all time, no filter)
  const stats = await prisma.transaction.aggregate({
    where: { userId: session.user.id, status: "succeeded" },
    _sum: { grossAmount: true, platformFee: true, netAmount: true },
    _count: { id: true },
  });

  return NextResponse.json({
    transactions,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    stats: {
      totalGross: stats._sum.grossAmount ?? 0,
      totalFees: stats._sum.platformFee ?? 0,
      totalNet: stats._sum.netAmount ?? 0,
      count: stats._count.id,
    },
  });
}
