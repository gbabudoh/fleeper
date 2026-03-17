import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
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

  // In production, send via email (Resend / SendGrid / etc.)
  // For now, log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[FORGOT PASSWORD] Reset link for ${email}:\n${resetUrl}\n`);
  }

  return NextResponse.json({ ok: true });
}
