import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { getAdminSession } from "@/lib/admin-session";

export async function POST(req: NextRequest) {
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
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
