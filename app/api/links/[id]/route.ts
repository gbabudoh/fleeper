import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  title:       z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  amount:      z.number().int().positive().nullable().optional(),
  isFlexible:  z.boolean().optional(),
  isActive:    z.boolean().optional(),
  slug:        z.string().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
});

// ── PATCH /api/links/[id] ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const existing = await prisma.paymentLink.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If slug is changing, check uniqueness
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.paymentLink.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
  }

  const link = await prisma.paymentLink.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ link });
}

// ── DELETE /api/links/[id] ────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const existing = await prisma.paymentLink.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.paymentLink.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
