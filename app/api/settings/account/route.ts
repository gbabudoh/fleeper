import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const DeleteSchema = z.object({
  password:    z.string().min(1),
  confirmation: z.literal("DELETE MY ACCOUNT"),
});

// ── DELETE /api/settings/account — close account ─────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = DeleteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify password
  let valid = false;
  if (user.passwordHash.length === 64) {
    const sha = createHash("sha256").update(password).digest("hex");
    valid = sha === user.passwordHash;
  } else {
    valid = await bcrypt.compare(password, user.passwordHash);
  }

  if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

  // Delete user — cascade deletes pools, transactions, links, API keys
  await prisma.user.delete({ where: { id: session.user.id } });

  // Destroy session
  session.destroy();
  await session.save();

  return NextResponse.json({ ok: true });
}

// ── GET /api/settings/account — export account data ──────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      incomePools:  { orderBy: { order: "asc" } },
      transactions: {
        orderBy: { createdAt: "desc" },
        include: { splits: { include: { pool: { select: { name: true } } } } },
      },
      paymentLinks: { orderBy: { createdAt: "desc" } },
      apiKeys:      { select: { id: true, name: true, prefix: true, isActive: true, createdAt: true, lastUsed: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Never export sensitive fields
  const { passwordHash: _, ...safeUser } = user;

  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), ...safeUser }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="fleeper-export-${session.user.handle}.json"`,
    },
  });
}
