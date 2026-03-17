import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, auditLog } from "@/lib/admin-auth";
import prisma from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin("SUPER_ADMIN");
  if (error) return error;

  const { id } = await params;
  const { role, isActive } = await req.json();

  if (id === admin!.id) {
    return NextResponse.json({ error: "Cannot modify your own account." }, { status: 400 });
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data: { ...(role !== undefined && { role }), ...(isActive !== undefined && { isActive }) },
  });

  await auditLog(admin!.id, "UPDATE_STAFF", "AdminUser", id, { role, isActive }, req);
  return NextResponse.json({ ok: true, admin: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdmin("SUPER_ADMIN");
  if (error) return error;

  const { id } = await params;
  if (id === admin!.id) return NextResponse.json({ error: "Cannot delete your own account." }, { status: 400 });

  await prisma.adminUser.delete({ where: { id } });
  await auditLog(admin!.id, "DELETE_STAFF", "AdminUser", id, null, req);

  return NextResponse.json({ ok: true });
}
