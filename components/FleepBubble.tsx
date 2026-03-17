"use client";

/**
 * FleepBubble — The Checkout Modal
 *
 * Uses Stripe Elements to collect card details securely.
 * Card data goes DIRECTLY from the browser to Stripe's servers.
 * Fleeper's server never touches raw card numbers (PCI compliance).
 *
 * Flow:
 * 1. Client calls POST /api/checkout/create → gets client_secret
 * 2. Stripe Elements collects card details
 * 3. stripe.confirmPayment() charges the card
 * 4. Stripe fires payment_intent.succeeded webhook
 * 5. /api/webhooks/stripe triggers executeFleepStream (the split)
 */
import { useState, useEffect } from "react";
import {
  loadStripe,
  StripeElementsOptions,
} from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Zap, ShieldCheck, X, ArrowRight, Check, AlertCircle } from "lucide-react";

// Initialize Stripe (publishable key is safe to expose)
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export interface Service {
  id: string;
  title: string;
  description?: string | null;
  amount?: number | null;
  isFlexible: boolean;
}

export interface Seller {
  handle: string;
  name: string;
  isVerified: boolean;
  stripeConnectedAccountId?: string;
}

interface FleepBubbleProps {
  service: Service;
  seller: Seller;
  onClose: () => void;
}

// Inner form — rendered inside <Elements> provider
function CheckoutForm({
  amountCents,
  onSuccess,
}: {
  amountCents: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/payment-complete`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stripe's hosted payment UI — handles all card brands, Apple Pay, Google Pay */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: { applePay: "auto", googlePay: "auto" },
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="group w-full flex items-center justify-center gap-2 bg-[#00FFCC] text-[#0A0A0A] font-bold py-4 rounded-xl hover:bg-[#00FFCC]/90 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <div className="w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
            Processing fleep...
          </>
        ) : (
          <>
            Confirm & Fleep ${(amountCents / 100).toFixed(2)}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}

// Demo fallback form (when Stripe keys not configured)
function DemoCheckoutForm({
  amountCents,
  onSuccess,
}: {
  amountCents: number;
  onSuccess: () => void;
}) {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-white/15 text-center">
        <p className="text-xs text-white/40 mb-3">Demo mode — add Stripe keys to enable real payments</p>
        <input type="text" placeholder="4242 4242 4242 4242" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#00FFCC]/40 transition-colors mb-2" />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="MM / YY" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#00FFCC]/40 transition-colors" />
          <input type="text" placeholder="CVC" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-[#00FFCC]/40 transition-colors" />
        </div>
      </div>
      <button
        type="submit"
        disabled={processing}
        className="group w-full flex items-center justify-center gap-2 bg-[#00FFCC] text-[#0A0A0A] font-bold py-4 rounded-xl hover:bg-[#00FFCC]/90 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {processing ? (
          <div className="w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
        ) : (
          <>Confirm & Fleep ${(amountCents / 100).toFixed(2)} <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}

export function FleepBubble({ service, seller, onClose }: FleepBubbleProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const amountCents = service.isFlexible
    ? Math.round(parseFloat(customAmount || "0") * 100)
    : service.amount ?? 0;

  const provision = amountCents > 0 ? Math.round(amountCents * 0.029) + 30 : 0;

  // Create PaymentIntent when the amount is ready
  useEffect(() => {
    if (amountCents < 50 || !stripePromise) return;
    if (!seller.stripeConnectedAccountId) return;

    let cancelled = false;
    setLoadingIntent(true);
    setInitError(null);

    const init = async () => {
      try {
        const res = await fetch("/api/checkout/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sellerId: "demo", // In production: real seller ID from session
            sellerConnectedAccountId: seller.stripeConnectedAccountId,
            amountCents,
            description: service.title,
          }),
        });
        const data = await res.json();
        if (!cancelled) {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            setInitError("Could not initialize payment.");
          }
        }
      } catch {
        if (!cancelled) setInitError("Network error. Please try again.");
      } finally {
        if (!cancelled) setLoadingIntent(false);
      }
    };

    // Debounce for flexible amounts
    const timer = setTimeout(init, service.isFlexible ? 600 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amountCents, seller.stripeConnectedAccountId, service.isFlexible, service.title]);

  const elementsOptions: StripeElementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#00FFCC",
            colorBackground: "#161616",
            colorText: "#ffffff",
            colorDanger: "#EF4444",
            borderRadius: "12px",
            fontFamily: "system-ui, sans-serif",
          },
        },
      }
    : {};

  // Use real Stripe when keys are available
  const useRealStripe = !!stripePromise && !!clientSecret;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm glass-card p-6 shadow-2xl">
        {success ? (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#00FFCC]/20 border-2 border-[#00FFCC] flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-[#00FFCC]" />
            </div>
            <h3 className="text-xl font-black mb-2">Payment successful!</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              {seller.name}&apos;s income is being automatically routed to their Spend, Tax, and Savings accounts.
            </p>
            <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl bg-[#00FFCC]/10 border border-[#00FFCC]/20 text-[#00FFCC] font-medium text-sm hover:bg-[#00FFCC]/20 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFCC] to-[#8B5CF6]" />
                <div>
                  <p className="font-semibold text-sm">{seller.name}</p>
                  {seller.isVerified && (
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={10} className="text-[#00FFCC]" />
                      <span className="text-[10px] text-[#00FFCC]">Fleeper Verified</span>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/50 hover:text-white">
                <X size={14} />
              </button>
            </div>

            {/* Amount */}
            <div className="mb-5">
              <p className="text-white/50 text-sm mb-1">{service.title}</p>
              {service.isFlexible ? (
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#00FFCC]/40 transition-colors">
                  <span className="pl-4 text-white/40 text-xl">$</span>
                  <input
                    type="number"
                    min="0.50"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent py-3 px-2 text-2xl font-black text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
              ) : (
                <p className="text-3xl font-black">${((service.amount ?? 0) / 100).toFixed(2)}</p>
              )}

              {/* Fee preview */}
              {amountCents > 0 && provision > 0 && (
                <p className="text-xs text-white/30 mt-1.5">
                  Fleeper fee: ${(provision / 100).toFixed(2)} · Seller receives: ${((amountCents - provision) / 100).toFixed(2)}
                </p>
              )}
            </div>

            {/* Payment Form */}
            {loadingIntent ? (
              <div className="h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/10 border-t-[#00FFCC] rounded-full animate-spin" />
              </div>
            ) : initError ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-4">
                {initError}
              </div>
            ) : useRealStripe ? (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <CheckoutForm amountCents={amountCents} onSuccess={() => setSuccess(true)} />
              </Elements>
            ) : (
              <DemoCheckoutForm amountCents={amountCents} onSuccess={() => setSuccess(true)} />
            )}

            <div className="flex items-center justify-center gap-2 mt-4 text-white/20 text-[10px] font-medium uppercase tracking-wider">
              <div className="w-3.5 h-3.5 rounded-md overflow-hidden shrink-0 grayscale opacity-30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/fleeper.png" alt="" style={{ height: "14px", width: "auto" }} />
              </div>
              <span>Secured by Fleeper · Stripe · PCI DSS</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
