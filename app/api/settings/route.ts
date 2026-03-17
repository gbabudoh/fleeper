import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

// ── GET /api/settings — full profile + stats ──────────────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id:         true,
      name:       true,
      email:      true,
      handle:     true,
      isVerified: true,
      createdAt:  true,
      _count: {
        select: {
          transactions: true,
          paymentLinks: true,
          apiKeys:      true,
          incomePools:  true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}
