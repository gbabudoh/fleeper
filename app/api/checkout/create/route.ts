/**
 * POST /api/checkout/create
 *
 * Creates a Stripe PaymentIntent server-side.
 * The client uses the returned client_secret with Stripe.js
 * to securely collect card details — Fleeper's server NEVER
 * sees raw card numbers (PCI compliance).
 *
 * Body: { sellerId, serviceId, amountCents?, customerEmail?, description? }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateFleepSplit } from "@/lib/split-engine";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

const CreateCheckoutSchema = z.object({
  sellerId: z.string().min(1),
  sellerConnectedAccountId: z.string().min(1),
  amountCents: z.number().int().positive().min(50), // min $0.50
  currency: z.string().length(3).default("usd"),
  description: z.string().max(500).optional(),
  customerEmail: z.string().email().optional(),
  serviceId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Payment processing not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const {
    sellerId,
    sellerConnectedAccountId,
    amountCents,
    currency,
    description,
    customerEmail,
    serviceId,
  } = parsed.data;

  try {
    // Calculate Fleeper's provision — this becomes the application_fee
    // so it stays in the Fleeper platform account
    const { provision } = calculateFleepSplit(amountCents, [
      { id: "dummy", name: "dummy", percentage: 100, color: "#000" },
    ]);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      application_fee_amount: provision,
      transfer_data: {
        destination: sellerConnectedAccountId,
      },
      description: description ?? "Fleeper payment",
      receipt_email: customerEmail,
      automatic_payment_methods: { enabled: true },
      metadata: {
        seller_id: sellerId,
        service_id: serviceId ?? "",
        description: description ?? "",
        customer_email: customerEmail ?? "",
        platform: "fleeper",
      },
    });

    logger.info(
      { paymentIntentId: paymentIntent.id, sellerId, amountCents, provision },
      "PaymentIntent created"
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      provision,
      net: amountCents - provision,
    });
  } catch (err) {
    logger.error({ err, sellerId, amountCents }, "PaymentIntent creation failed");
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
