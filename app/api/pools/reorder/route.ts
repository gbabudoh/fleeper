import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const ReorderSchema = z.object({
  order: z.array(z.string()), // pool IDs in new order
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ReorderSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.$transaction(
    parsed.data.order.map((id, index) =>
      prisma.incomePool.updateMany({
        where: { id, userId: session.user!.id },
        data: { order: index },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
