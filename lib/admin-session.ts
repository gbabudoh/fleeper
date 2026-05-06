import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "READ_ONLY";
}

export interface AdminSession {
  admin?: AdminSessionUser;
}

const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;
if (!adminSessionSecret) {
  throw new Error("ADMIN_SESSION_SECRET environment variable is not set");
}

export const ADMIN_SESSION_OPTIONS: SessionOptions = {
  password: adminSessionSecret,
  cookieName: "fleeper_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export async function getAdminSession() {
  const cookieStore = await cookies();
  return getIronSession<AdminSession>(cookieStore, ADMIN_SESSION_OPTIONS);
}
