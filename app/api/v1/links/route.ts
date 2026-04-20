import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey } from "@/lib/auth-api";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const PoolSchema = z.object({
  label: z.string().min(1).max(50),
  percent: z.number().min(0).max(100),
});

const CreateLinkSchema = z.object({
  title:       z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  amount:      z.number().int().positive().optional(), // In Cents
  isFlexible:  z.boolean().default(false),
  slug:        z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  pools:       z.array(PoolSchema).optional(),
});

/**
 * Public V1 API: /v1/links
 */

export async function GET(req: NextRequest) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const links = await prisma.paymentLink.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ links });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const parsed = CreateLinkSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, description, amount, isFlexible, slug, pools } = parsed.data;

    // Basic validation
    if (!isFlexible && !amount) {
      return NextResponse.json({ error: "Fixed-amount links require an amount" }, { status: 400 });
    }

    if (pools) {
      const total = pools.reduce((sum, p) => sum + p.percent, 0);
      if (Math.abs(total - 100) > 0.1) {
        return NextResponse.json({ error: "Pool percentages must total 100%" }, { status: 400 });
      }
    }

    // Check slug uniqueness
    const existing = await prisma.paymentLink.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "That slug is already taken" }, { status: 409 });
    }

    const link = await prisma.paymentLink.create({
      data: {
        userId: user.id,
        title,
        description: description ?? null,
        amount: isFlexible ? null : (amount ?? null),
        isFlexible,
        slug,
        isActive: true,
        customSplits: pools ? (pools as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    return NextResponse.json({
      id:     link.id,
      url:    `https://fleeper.com/${user.handle}/${link.slug}`,
      status: link.isActive ? "active" : "inactive",
      pools:  pools?.length || "default",
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
