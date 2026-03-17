import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

// ── GET /api/links — list all payment links ───────────────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.paymentLink.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ links });
}

// ── POST /api/links — create payment link ─────────────────────────────────────
const CreateSchema = z.object({
  title:       z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  amount:      z.number().int().positive().optional(),
  isFlexible:  z.boolean(),
  slug:        z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { title, description, amount, isFlexible, slug } = parsed.data;

  if (!isFlexible && !amount) {
    return NextResponse.json({ error: "Fixed-amount links require an amount" }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await prisma.paymentLink.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "That slug is already taken. Try another." }, { status: 409 });

  const link = await prisma.paymentLink.create({
    data: {
      userId: session.user.id,
      title,
      description: description ?? null,
      amount: isFlexible ? null : (amount ?? null),
      isFlexible,
      slug,
      isActive: true,
    },
  });

  return NextResponse.json({ link }, { status: 201 });
}
