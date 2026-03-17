import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes, createHash } from "node:crypto";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

// ── GET /api/settings/api-keys — list keys (masked) ──────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, prefix: true, isActive: true, lastUsed: true, createdAt: true },
  });

  return NextResponse.json({ keys });
}

const CreateKeySchema = z.object({
  name: z.string().min(1).max(60),
});

// ── POST /api/settings/api-keys — generate new key ────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = CreateKeySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // Enforce max 10 active keys
  const count = await prisma.apiKey.count({ where: { userId: session.user.id, isActive: true } });
  if (count >= 10) return NextResponse.json({ error: "Maximum of 10 active API keys allowed" }, { status: 409 });

  // Generate: flp_<32 hex chars>
  const rawKey = `flp_${randomBytes(20).toString("hex")}`;
  const prefix = rawKey.slice(0, 12); // "flp_" + first 8 chars shown later
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const key = await prisma.apiKey.create({
    data: {
      userId:  session.user.id,
      name:    parsed.data.name,
      keyHash,
      prefix,
      isActive: true,
    },
    select: { id: true, name: true, prefix: true, isActive: true, lastUsed: true, createdAt: true },
  });

  // Return full key ONCE — never stored, never shown again
  return NextResponse.json({ key, rawKey }, { status: 201 });
}
