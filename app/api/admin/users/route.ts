import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, auditLog } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { admin, error } = await requireAdmin("READ_ONLY");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit  = 20;
  const search = searchParams.get("q") ?? "";

  const where = search
    ? { OR: [{ email: { contains: search, mode: "insensitive" as const } }, { handle: { contains: search, mode: "insensitive" as const } }, { name: { contains: search, mode: "insensitive" as const } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { transactions: true, paymentLinks: true, apiKeys: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireAdmin("ADMIN");
  if (error) return error;

  const { id, isVerified } = await req.json();
  const user = await prisma.user.update({ where: { id }, data: { isVerified } });
  await auditLog(admin!.id, "UPDATE_USER", "User", id, { isVerified }, req);

  return NextResponse.json({ user });
}
