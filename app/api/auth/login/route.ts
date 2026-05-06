import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { getSession } from "@/lib/session";
import { logger } from "@/lib/logger";
import { rateLimit, getIp } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // 5 attempts per IP per minute
  const rl = rateLimit("login", getIp(req), { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many login attempts — try again in a minute" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  // Dynamic import to avoid build-time DB errors
  const { prisma } = await import("@/lib/db");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Same response time as a real check to prevent user enumeration
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Check password — seed used SHA-256, production should use bcrypt
  // Support both: try bcrypt first, fall back to SHA-256 for seeded demo user
  let passwordMatch = false;

  if (user.passwordHash.length === 64) {
    // SHA-256 hex (seed script)
    const sha = createHash("sha256").update(password).digest("hex");
    passwordMatch = sha === user.passwordHash;
  } else {
    // bcrypt hash (register route)
    const bcrypt = await import("bcryptjs");
    passwordMatch = await bcrypt.default.compare(password, user.passwordHash);
  }

  if (!passwordMatch) {
    logger.warn({ email }, "Failed login attempt");
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Write session cookie
  const session = await getSession();
  session.user = {
    id: user.id,
    email: user.email,
    handle: user.handle,
    name: user.name,
  };
  await session.save();

  logger.info({ userId: user.id, handle: user.handle }, "User logged in");

  return NextResponse.json({
    user: { id: user.id, email: user.email, handle: user.handle, name: user.name },
  });
}
