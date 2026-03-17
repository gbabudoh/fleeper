import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin("READ_ONLY");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit  = 25;
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { description: { contains: search, mode: "insensitive" } },
    { customerEmail: { contains: search, mode: "insensitive" } },
    { paymentRef: { contains: search, mode: "insensitive" } },
  ];

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, handle: true } } },
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({ transactions, total, page, pages: Math.ceil(total / limit) });
}
