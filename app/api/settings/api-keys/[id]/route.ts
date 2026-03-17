import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// ── DELETE /api/settings/api-keys/[id] — revoke key ──────────────────────────
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const key = await prisma.apiKey.findFirst({ where: { id, userId: session.user.id } });
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.apiKey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// ── PATCH /api/settings/api-keys/[id] — toggle active ────────────────────────
export async function PATCH(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const key = await prisma.apiKey.findFirst({ where: { id, userId: session.user.id } });
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.apiKey.update({
    where: { id },
    data: { isActive: !key.isActive },
    select: { id: true, name: true, prefix: true, isActive: true, lastUsed: true, createdAt: true },
  });

  return NextResponse.json({ key: updated });
}
