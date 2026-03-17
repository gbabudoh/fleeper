import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, auditLog } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin("READ_ONLY");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 25;
  const q     = searchParams.get("q") ?? "";

  const where = q ? { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { slug: { contains: q, mode: "insensitive" as const } }] } : {};

  const [links, total] = await Promise.all([
    prisma.paymentLink.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, handle: true } } },
    }),
    prisma.paymentLink.count({ where }),
  ]);

  return NextResponse.json({ links, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireAdmin("ADMIN");
  if (error) return error;

  const { id, isActive } = await req.json();
  const link = await prisma.paymentLink.update({ where: { id }, data: { isActive } });
  await auditLog(admin!.id, isActive ? "ENABLE_LINK" : "DISABLE_LINK", "PaymentLink", id, null, req);

  return NextResponse.json({ link });
}
