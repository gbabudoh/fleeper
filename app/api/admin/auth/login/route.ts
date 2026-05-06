import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { getAdminSession } from "@/lib/admin-session";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const rl = rateLimit("admin_login", getIp(req), { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many login attempts. Try again in a minute." }, { status: 429 });
  }

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Update last login
    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

    const session = await getAdminSession();
    session.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as "SUPER_ADMIN" | "ADMIN" | "STAFF" | "READ_ONLY",
    };
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Admin login error");
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
