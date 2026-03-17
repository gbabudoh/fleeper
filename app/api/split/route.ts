import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateFleepSplit } from "@/lib/split-engine";

const SplitRequestSchema = z.object({
  amountCents: z.number().int().positive(),
  pools: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      percentage: z.number().min(0).max(100),
      color: z.string().default("#00FFCC"),
    })
  ).min(1).max(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = SplitRequestSchema.parse(body);

    const result = calculateFleepSplit(data.amountCents, data.pools);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
