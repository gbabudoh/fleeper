/**
 * Stripe Webhook Handler
 *
 * This endpoint receives events from Stripe after each payment.
 * The signature is verified using STRIPE_WEBHOOK_SECRET to
 * ensure requests are genuinely from Stripe (not spoofed).
 *
 * On payment_intent.succeeded → triggers the Fleep Stream (Phase B+C).
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/stripe";
import { executeFleepStream } from "@/lib/fleep-stream";
import { logger } from "@/lib/logger";

// Stripe requires the raw body bytes — disable Next.js body parsing
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    logger.warn("Stripe webhook received without signature");
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // --- Phase A: Verify the webhook is genuinely from Stripe ---
  let event: ReturnType<typeof verifyWebhookSignature>;
  try {
    event = verifyWebhookSignature(body, signature);
  } catch (err) {
    logger.error({ err }, "Stripe webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  logger.info({ type: event.type, id: event.id }, "Stripe webhook verified");

  // --- Phase B+C: Handle events ---
  try {
    switch (event.type) {
      /**
       * payment_intent.succeeded
       * The customer's card was charged successfully.
       * Trigger the Fleep Stream to split and route the funds.
       */
      case "payment_intent.succeeded": {
        const pi = event.data.object as {
          id: string;
          amount: number;
          currency: string;
          description?: string;
          metadata: Record<string, string>;
          receipt_email?: string;
        };

        const sellerId = pi.metadata?.seller_id;
        if (!sellerId) {
          logger.error({ paymentIntentId: pi.id }, "No seller_id in PaymentIntent metadata");
          break;
        }

        await executeFleepStream({
          stripePaymentIntentId: pi.id,
          sellerId,
          grossAmountCents: pi.amount,
          currency: pi.currency,
          description: pi.description ?? pi.metadata?.description,
          customerEmail: pi.receipt_email ?? pi.metadata?.customer_email,
        });

        break;
      }

      /**
       * payment_intent.payment_failed
       * Log the failure for the seller's dashboard.
       */
      case "payment_intent.payment_failed": {
        const pi = event.data.object as { id: string; last_payment_error?: { message: string } };
        logger.warn(
          { paymentIntentId: pi.id, reason: pi.last_payment_error?.message },
          "Payment failed"
        );
        break;
      }

      /**
       * account.updated (Stripe Connect)
       * A seller's connected account changed status — e.g. verification completed.
       */
      case "account.updated": {
        const account = event.data.object as { id: string; charges_enabled: boolean; payouts_enabled: boolean };
        logger.info(
          { accountId: account.id, chargesEnabled: account.charges_enabled, payoutsEnabled: account.payouts_enabled },
          "Connected account updated"
        );
        break;
      }

      /**
       * transfer.created / transfer.failed
       * One of the three split transfers changed status.
       */
      case "transfer.created": {
        const transfer = event.data.object as { id: string; amount: number; metadata: Record<string, string> };
        logger.info(
          { transferId: transfer.id, poolId: transfer.metadata?.pool_id, amount: transfer.amount },
          "Split transfer created"
        );
        break;
      }

      case "transfer.reversed": {
        const transfer = event.data.object as { id: string; metadata: Record<string, string> };
        logger.error(
          { transferId: transfer.id, poolId: transfer.metadata?.pool_id },
          "Split transfer REVERSED — manual review required"
        );
        break;
      }

      default:
        logger.info({ type: event.type }, "Unhandled Stripe event — ignored");
    }
  } catch (err) {
    logger.error({ err, eventType: event.type }, "Fleep Stream execution error");
    // Return 500 so Stripe retries the webhook
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
