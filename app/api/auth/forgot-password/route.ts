import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // 3 reset emails per IP per hour
  const rl = rateLimit("forgot-password", getIp(req), { limit: 3, windowMs: 3_600_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests — try again later" }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always return success to prevent user enumeration
  if (!user) return NextResponse.json({ ok: true });

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

  // Execute actual email delivery securely via Resend
  // Fallbacks to graceful console.warn inside lib/email.ts if the API key is locally missing
  await sendPasswordResetEmail({
    toEmail: email,
    resetUrl
  });

  return NextResponse.json({ ok: true });
}
