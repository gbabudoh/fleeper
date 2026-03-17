/**
 * iron-session configuration
 * Stores the logged-in user in an encrypted, httpOnly cookie.
 */
import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  email: string;
  handle: string;
  name: string | null;
}

export interface FleepSession {
  user?: SessionUser;
}

export const SESSION_OPTIONS: SessionOptions = {
  password: process.env.SESSION_SECRET || "fleeper-dev-secret-change-in-production-32chars",
  cookieName: "fleeper_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<FleepSession>(cookieStore, SESSION_OPTIONS);
}
