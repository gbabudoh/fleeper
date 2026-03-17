import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ slug: string }> };

// ── GET /api/pay/[slug] — public link lookup + view increment ─────────────────
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;

  const link = await prisma.paymentLink.findUnique({
    where: { slug },
    include: {
      user: { select: { handle: true, name: true, isVerified: true } },
    },
  });

  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

  // Increment view count (fire-and-forget, don't block response)
  prisma.paymentLink.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});

  return NextResponse.json({
    title:      link.title,
    description: link.description,
    amount:     link.amount,
    isFlexible: link.isFlexible,
    isActive:   link.isActive,
    slug:       link.slug,
    seller: {
      handle:                  link.user.handle,
      name:                    link.user.name,
      isVerified:              link.user.isVerified,
      stripeConnectedAccountId: null, // set from user.stripeAccountId when implemented
    },
  });
}
