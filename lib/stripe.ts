/**
 * Stripe server-side client
 * Only import this in server components / API routes — never in client code.
 */
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[Fleeper] STRIPE_SECRET_KEY not set — Stripe features disabled");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      appInfo: {
        name: "Fleeper Gateway",
        version: "1.0.0",
        url: "https://fleeper.com",
      },
    })
  : null;

/**
 * Create a Stripe Connected Account for a new seller.
 * Returns the account ID to store on the User record.
 */
export async function createConnectedAccount(email: string, name: string) {
  if (!stripe) throw new Error("Stripe not configured");
  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_profile: {
      name,
      mcc: "7372", // Software services
    },
  });
  return account.id;
}

/**
 * Create an External Bank Account on a Connected Account
 * using a bank account token (from Plaid or Stripe.js).
 */
export async function addBankToConnectedAccount(
  connectedAccountId: string,
  bankToken: string,
  label: string
) {
  if (!stripe) throw new Error("Stripe not configured");
  const bankAccount = await stripe.accounts.createExternalAccount(
    connectedAccountId,
    { external_account: bankToken, metadata: { label } }
  );
  return bankAccount.id;
}

/**
 * Create a PaymentIntent — called when the customer hits "Confirm & Fleep".
 * The amount is in cents. The application_fee_amount is Fleeper's provision.
 */
export async function createPaymentIntent({
  amountCents,
  provisionCents,
  currency,
  connectedAccountId,
  description,
  metadata,
}: {
  amountCents: number;
  provisionCents: number;
  currency: string;
  connectedAccountId: string;
  description: string;
  metadata: Record<string, string>;
}) {
  if (!stripe) throw new Error("Stripe not configured");

  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: currency.toLowerCase(),
    application_fee_amount: provisionCents, // Fleeper keeps this
    transfer_data: {
      destination: connectedAccountId, // Goes to seller's Stripe account
    },
    description,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

/**
 * Execute the three-way split by issuing Stripe Transfers
 * from the seller's Connected Account to their external bank accounts.
 *
 * Called AFTER payment_intent.succeeded webhook fires.
 */
export async function executeSplitTransfers(
  connectedAccountId: string,
  currency: string,
  splits: Array<{
    poolId: string;
    poolName: string;
    amountCents: number;
    externalAccountId: string; // Stripe external bank account ID
  }>
) {
  if (!stripe) throw new Error("Stripe not configured");

  const results = await Promise.allSettled(
    splits.map((split) =>
      stripe!.transfers.create({
        amount: split.amountCents,
        currency: currency.toLowerCase(),
        destination: connectedAccountId,
        metadata: {
          pool_id: split.poolId,
          pool_name: split.poolName,
          destination_bank: split.externalAccountId,
        },
      })
    )
  );

  return results.map((r, i) => ({
    poolId: splits[i].poolId,
    success: r.status === "fulfilled",
    transferId: r.status === "fulfilled" ? r.value.id : null,
    error: r.status === "rejected" ? String(r.reason) : null,
  }));
}

/**
 * Verify a Stripe webhook signature.
 * Returns the parsed event or throws on invalid signature.
 */
export function verifyWebhookSignature(payload: string, signature: string) {
  if (!stripe) throw new Error("Stripe not configured");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not set");
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
