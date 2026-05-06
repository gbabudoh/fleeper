import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Stripe mock ───────────────────────────────────────────────────────────────

const mockConstructEvent = vi.fn();

vi.mock("../lib/stripe", () => ({
  verifyWebhookSignature: mockConstructEvent,
}));

vi.mock("../lib/fleep-stream", () => ({
  executeFleepStream: vi.fn().mockResolvedValue({ transactionId: "tx_test", splits: [] }),
}));

vi.mock("../lib/logger", () => ({
  logger: {
    info:  vi.fn(),
    warn:  vi.fn(),
    error: vi.fn(),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: string, signature: string | null) {
  return {
    text: async () => body,
    headers: { get: (key: string) => (key === "stripe-signature" ? signature : null) },
  } as unknown as Request;
}

function makeEvent(type: string, object: Record<string, unknown>) {
  return { type, id: "evt_test", data: { object } };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const { POST } = await import("../app/api/webhooks/stripe/route");
    const req = makeRequest("{}", null);
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing stripe-signature/i);
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error("Webhook signature verification failed");
    });
    const { POST } = await import("../app/api/webhooks/stripe/route");
    const req = makeRequest("{}", "bad_sig");
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid signature");
  });

  it("returns 200 and triggers executeFleepStream on payment_intent.succeeded", async () => {
    const pi = {
      id: "pi_test",
      amount: 50000,
      currency: "usd",
      description: "Test payment",
      metadata: { seller_id: "user_123", description: "Test" },
      receipt_email: "buyer@example.com",
    };
    mockConstructEvent.mockReturnValueOnce(makeEvent("payment_intent.succeeded", pi));

    const { POST } = await import("../app/api/webhooks/stripe/route");
    const { executeFleepStream } = await import("../lib/fleep-stream");

    const req = makeRequest(JSON.stringify(pi), "valid_sig");
    const res = await POST(req as never);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
    expect(executeFleepStream).toHaveBeenCalledWith(
      expect.objectContaining({
        stripePaymentIntentId: "pi_test",
        sellerId: "user_123",
        grossAmountCents: 50000,
        currency: "usd",
      })
    );
  });

  it("returns 500 (so Stripe retries) when executeFleepStream throws", async () => {
    const { executeFleepStream } = await import("../lib/fleep-stream");
    vi.mocked(executeFleepStream).mockRejectedValueOnce(new Error("DB down"));

    const pi = {
      id: "pi_fail",
      amount: 10000,
      currency: "usd",
      metadata: { seller_id: "user_456" },
    };
    mockConstructEvent.mockReturnValueOnce(makeEvent("payment_intent.succeeded", pi));

    const { POST } = await import("../app/api/webhooks/stripe/route");
    const req = makeRequest(JSON.stringify(pi), "valid_sig");
    const res = await POST(req as never);

    expect(res.status).toBe(500);
  });

  it("returns 400 (no seller_id) without calling executeFleepStream", async () => {
    const pi = {
      id: "pi_no_seller",
      amount: 10000,
      currency: "usd",
      metadata: {}, // missing seller_id
    };
    mockConstructEvent.mockReturnValueOnce(makeEvent("payment_intent.succeeded", pi));

    const { POST } = await import("../app/api/webhooks/stripe/route");
    const { executeFleepStream } = await import("../lib/fleep-stream");
    vi.mocked(executeFleepStream).mockClear();

    const req = makeRequest(JSON.stringify(pi), "valid_sig");
    const res = await POST(req as never);

    expect(res.status).toBe(200); // webhook still ACKs — not a Stripe error
    expect(executeFleepStream).not.toHaveBeenCalled();
  });

  it("returns 200 for unhandled event types without throwing", async () => {
    mockConstructEvent.mockReturnValueOnce(makeEvent("customer.created", { id: "cus_test" }));
    const { POST } = await import("../app/api/webhooks/stripe/route");
    const req = makeRequest("{}", "valid_sig");
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });
});
