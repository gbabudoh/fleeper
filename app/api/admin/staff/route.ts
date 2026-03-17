import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, auditLog } from "@/lib/admin-auth";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const { error } = await requireAdmin("ADMIN");
  if (error) return error;

  const staff = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, createdBy: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdmin("SUPER_ADMIN");
  if (error) return error;

  const { email, name, password, role } = await req.json();
  if (!email || !name || !password || !role) {
    return NextResponse.json({ error: "All fields required." }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Email already in use." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const newAdmin = await prisma.adminUser.create({
    data: { email: email.toLowerCase(), name, passwordHash, role, createdById: admin!.id },
  });

  await auditLog(admin!.id, "CREATE_STAFF", "AdminUser", newAdmin.id, { email, name, role }, req);
  return NextResponse.json({ ok: true, id: newAdmin.id }, { status: 201 });
}
