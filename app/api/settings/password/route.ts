import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const PasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8, "Password must be at least 8 characters"),
});

// ── PATCH /api/settings/password ──────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = PasswordSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify current password — supports SHA-256 (seed) and bcrypt (registered)
  let valid = false;
  if (user.passwordHash.length === 64) {
    const sha = createHash("sha256").update(currentPassword).digest("hex");
    valid = sha === user.passwordHash;
  } else {
    valid = await bcrypt.compare(currentPassword, user.passwordHash);
  }

  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
