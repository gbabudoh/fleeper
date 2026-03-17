import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin("ADMIN");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 30;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, email: true, role: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}
