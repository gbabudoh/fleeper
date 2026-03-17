import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, auditLog } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin("READ_ONLY");
  if (error) return error;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 10 },
      paymentLinks: { orderBy: { createdAt: "desc" }, take: 10 },
      apiKeys:      { orderBy: { createdAt: "desc" } },
      incomePools:  { orderBy: { order: "asc" } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin("SUPER_ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  await auditLog(admin!.id, "DELETE_USER", "User", id, null, req);

  return NextResponse.json({ ok: true });
}
