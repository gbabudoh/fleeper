import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, auditLog } from "@/lib/admin-auth";
import prisma from "@/lib/db";

const DEFAULTS = {
  platformFeePercent: 2.5,
  platformFeeCents: 20,
  registrationOpen: true,
  maintenanceMode: false,
  maxApiKeysPerUser: 5,
  supportEmail: "support@fleeper.com",
};

export async function GET() {
  const { error } = await requireAdmin("READ_ONLY");
  if (error) return error;

  const row = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ settings: row?.data ?? DEFAULTS });
}

export async function PUT(req: NextRequest) {
  const { admin, error } = await requireAdmin("SUPER_ADMIN");
  if (error) return error;

  const body = await req.json();
  const settings = await prisma.platformSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", data: body },
    update: { data: body },
  });

  await auditLog(admin!.id, "UPDATE_SETTINGS", "PlatformSettings", "singleton", body, req);
  return NextResponse.json({ settings: settings.data });
}
