import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

// ── GET /api/pools — list all pools with lifetime balances ────────────────────
export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pools = await prisma.incomePool.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
    include: {
      splits: { where: { status: "settled" }, select: { amount: true } },
    },
  });

  return NextResponse.json({
    pools: pools.map((p) => ({
      id: p.id,
      name: p.name,
      percentage: Number(p.percentage),
      color: p.color,
      bankName: p.bankName,
      bankLastFour: p.bankLastFour,
      isActive: p.isActive,
      order: p.order,
      balance: p.splits.reduce((s, sp) => s + sp.amount, 0),
    })),
  });
}

// ── POST /api/pools — create new pool ────────────────────────────────────────
const CreateSchema = z.object({
  name: z.string().min(1).max(50),
  percentage: z.number().min(0).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const count = await prisma.incomePool.count({ where: { userId: session.user.id } });

  const pool = await prisma.incomePool.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      percentage: parsed.data.percentage,
      color: parsed.data.color,
      order: count,
      isActive: true,
    },
  });

  return NextResponse.json({ pool });
}
