/**
 * Sliding-window in-memory rate limiter.
 * Works for single-instance deployments. For multi-instance, swap the
 * store for @upstash/ratelimit backed by Redis.
 *
 * Usage:
 *   const result = rateLimit("login", ip, { limit: 5, windowMs: 60_000 });
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();

// Purge stale keys every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of store.entries()) {
    if (win.timestamps.length === 0 || now - win.timestamps[win.timestamps.length - 1] > 3_600_000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // ms since epoch
}

export function rateLimit(
  namespace: string,
  identifier: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const key = `${namespace}:${identifier}`;
  const now = Date.now();
  const cutoff = now - windowMs;

  let win = store.get(key);
  if (!win) {
    win = { timestamps: [] };
    store.set(key, win);
  }

  // Drop timestamps outside the current window
  win.timestamps = win.timestamps.filter((t) => t > cutoff);

  if (win.timestamps.length >= limit) {
    const resetAt = win.timestamps[0] + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  win.timestamps.push(now);
  return { allowed: true, remaining: limit - win.timestamps.length, resetAt: now + windowMs };
}

/**
 * Extract a best-effort IP from a Next.js request.
 * Prefers x-forwarded-for (set by Vercel / proxies) over socket address.
 */
export function getIp(req: { headers: { get: (k: string) => string | null } }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
