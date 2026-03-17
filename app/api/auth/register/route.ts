import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { logger } from "@/lib/logger";

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  handle: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/, "Handle can only contain lowercase letters, numbers, and hyphens"),
  splits: z.object({
    spend: z.number().min(0).max(100),
    tax: z.number().min(0).max(100),
    growth: z.number().min(0).max(100),
  }).refine((s) => Math.abs(s.spend + s.tax + s.growth - 100) < 0.1, {
    message: "Splits must total 100%",
  }),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password, handle, splits } = parsed.data;

  const { prisma } = await import("@/lib/db");

  // Check uniqueness
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { handle }] },
  });
  if (existing) {
    const field = existing.email === email ? "email" : "handle";
    return NextResponse.json({ error: `That ${field} is already taken` }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await prisma.$transaction(async (tx: any) => {
    const newUser = await tx.user.create({
      data: { name, email, handle, passwordHash, isVerified: false },
    });

    // Create the three income pools from their chosen splits
    await tx.incomePool.createMany({
      data: [
        { userId: newUser.id, name: "Main Spend",  percentage: splits.spend,  color: "#00FFCC", order: 0 },
        { userId: newUser.id, name: "Tax Vault",   percentage: splits.tax,    color: "#FFB347", order: 1 },
        { userId: newUser.id, name: "Growth Pool", percentage: splits.growth, color: "#8B5CF6", order: 2 },
      ],
    });

    return newUser;
  });

  // Log them in immediately
  const session = await getSession();
  session.user = { id: user.id, email: user.email, handle: user.handle, name: user.name };
  await session.save();

  logger.info({ userId: user.id, handle }, "New user registered");

  return NextResponse.json({ user: { id: user.id, email: user.email, handle: user.handle, name: user.name } });
}
