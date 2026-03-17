import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const tx = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
    include: {
      splits: {
        include: { pool: true },
        orderBy: { pool: { order: "asc" } },
      },
    },
  });

  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ transaction: tx });
}
