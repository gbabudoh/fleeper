import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const ProfileSchema = z.object({
  name:   z.string().min(1).max(100).optional(),
  handle: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/, "Handle: lowercase letters, numbers, hyphens only").optional(),
  email:  z.string().email().optional(),
});

// ── PATCH /api/settings/profile ───────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ProfileSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { name, handle, email } = parsed.data;

  // Check handle/email uniqueness against other users
  if (handle && handle !== session.user.handle) {
    const taken = await prisma.user.findFirst({ where: { handle, NOT: { id: session.user.id } } });
    if (taken) return NextResponse.json({ error: "That handle is already taken" }, { status: 409 });
  }
  if (email && email !== session.user.email) {
    const taken = await prisma.user.findFirst({ where: { email, NOT: { id: session.user.id } } });
    if (taken) return NextResponse.json({ error: "That email is already registered" }, { status: 409 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { ...(name !== undefined && { name }), ...(handle && { handle }), ...(email && { email }) },
    select: { id: true, name: true, email: true, handle: true, isVerified: true },
  });

  // Refresh session
  session.user = { id: user.id, email: user.email, handle: user.handle, name: user.name };
  await session.save();

  return NextResponse.json({ user });
}
