import { getAdminSession, AdminSessionUser } from "./admin-session";
import { NextResponse } from "next/server";
import prisma from "./db";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "STAFF" | "READ_ONLY";

const ROLE_RANK: Record<AdminRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  STAFF: 2,
  READ_ONLY: 1,
};

export function hasRole(admin: AdminSessionUser, minRole: AdminRole): boolean {
  return ROLE_RANK[admin.role] >= ROLE_RANK[minRole];
}

/** For use in Route Handlers — returns admin or a 401/403 NextResponse */
export async function requireAdmin(minRole: AdminRole = "READ_ONLY") {
  const session = await getAdminSession();
  if (!session.admin) {
    return { admin: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!hasRole(session.admin, minRole)) {
    return { admin: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { admin: session.admin, error: null };
}

/** Write an audit log entry */
export async function auditLog(
  adminId: string,
  action: string,
  resource: string,
  resourceId?: string | null,
  detail?: object | null,
  req?: Request,
) {
  const ipAddress = req ? (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined) : undefined;
  const userAgent = req ? (req.headers.get("user-agent") ?? undefined) : undefined;
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      resource,
      resourceId: resourceId ?? undefined,
      detail: detail ? (detail as object) : undefined,
      ipAddress,
      userAgent,
    },
  });
}
