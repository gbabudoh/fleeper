import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// ── PATCH /api/pools/[id] — update name, percentage, color, bankName ─────────
const UpdateSchema = z.object({
  name:        z.string().min(1).max(50).optional(),
  percentage:  z.number().min(0).max(100).optional(),
  color:       z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  bankName:    z.string().nullable().optional(),
  bankLastFour:z.string().nullable().optional(),
  isActive:    z.boolean().optional(),
  order:       z.number().int().optional(),
});

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // Ensure pool belongs to this user
  const existing = await prisma.incomePool.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pool = await prisma.incomePool.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ pool });
}

// ── DELETE /api/pools/[id] — delete pool (only if no settled splits) ──────────
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const existing = await prisma.incomePool.findFirst({
    where: { id, userId: session.user.id },
    include: { _count: { select: { splits: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing._count.splits > 0) {
    return NextResponse.json(
      { error: "Cannot delete a pool that has transaction history. Deactivate it instead." },
      { status: 409 }
    );
  }

  await prisma.incomePool.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
