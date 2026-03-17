import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, auditLog } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin("READ_ONLY");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 25;

  const [keys, total] = await Promise.all([
    prisma.apiKey.findMany({
      skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, handle: true } } },
    }),
    prisma.apiKey.count(),
  ]);

  return NextResponse.json({ keys, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireAdmin("ADMIN");
  if (error) return error;

  const { id, isActive } = await req.json();
  await prisma.apiKey.update({ where: { id }, data: { isActive } });
  await auditLog(admin!.id, isActive ? "ENABLE_API_KEY" : "REVOKE_API_KEY", "ApiKey", id, null, req);

  return NextResponse.json({ ok: true });
}
